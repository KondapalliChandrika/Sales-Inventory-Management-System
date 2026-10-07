import logging
import re
from pathlib import Path

from alembic import command
from alembic.config import Config
from alembic.runtime.migration import MigrationContext
from alembic.script import ScriptDirectory
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import OperationalError

from app.core.config import settings

logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parents[2]
_SAFE_DB_NAME = re.compile(r"^[A-Za-z0-9_$]+$")


class DatabaseSetupError(RuntimeError):
    pass


def ensure_database_exists(database_url: str = settings.DATABASE_URL) -> None:
    url = make_url(database_url)
    if url.get_backend_name() != "mysql":
        return

    db_name = url.database
    if not db_name or not _SAFE_DB_NAME.match(db_name):
        raise DatabaseSetupError(f"Invalid database name in DATABASE_URL: {db_name!r}")

    server_engine = create_engine(url.set(database="information_schema"), isolation_level="AUTOCOMMIT")
    try:
        with server_engine.connect() as conn:
            exists = conn.execute(
                text("SELECT 1 FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = :name"), {"name": db_name}
            ).scalar()
            if exists:
                logger.info("Database '%s' already exists — skipping creation", db_name)
                return
            conn.execute(
                text(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            )
            logger.info("Database '%s' created", db_name)
    except OperationalError as exc:
        raise DatabaseSetupError(
            f"Cannot connect to MySQL at {url.host}:{url.port or 3306} as '{url.username}'. "
            "Check that MySQL is running and DATABASE_URL in backend/.env has the right user/password. "
            f"Original error: {exc.orig}"
        ) from exc
    finally:
        server_engine.dispose()


def _alembic_config(database_url: str) -> Config:
    config = Config(str(BACKEND_DIR / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    config.set_main_option("sqlalchemy.url", database_url.replace("%", "%%"))
    config.attributes["configure_logger"] = False
    return config


def run_migrations(database_url: str = settings.DATABASE_URL) -> None:
    config = _alembic_config(database_url)
    head = ScriptDirectory.from_config(config).get_current_head()

    engine = create_engine(database_url)
    try:
        with engine.connect() as conn:
            current = MigrationContext.configure(conn).get_current_revision()
    finally:
        engine.dispose()

    if current == head:
        logger.info("Database tables are up to date (revision %s) — skipping migrations", head)
        return

    logger.info("Applying migrations: %s -> %s", current or "empty database", head)
    command.upgrade(config, "head")
    logger.info("Database tables are ready (revision %s)", head)


def init_database() -> None:
    if settings.AUTO_MIGRATE:
        ensure_database_exists()
        run_migrations()
    if settings.AUTO_SEED:
        from app.core.demo_data import seed_if_empty

        seed_if_empty()
