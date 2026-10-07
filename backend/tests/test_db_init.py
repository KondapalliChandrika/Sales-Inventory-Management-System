from sqlalchemy import create_engine, inspect

from app.core.db_init import ensure_database_exists, run_migrations


def test_migrations_create_tables_and_are_safe_to_rerun(tmp_path):
    url = f"sqlite:///{tmp_path / 'app.db'}"
    ensure_database_exists(url)

    run_migrations(url)
    run_migrations(url)

    tables = set(inspect(create_engine(url)).get_table_names())
    assert {"users", "products", "sales_orders", "order_approvals", "alembic_version"} <= tables


def test_demo_data_is_added_only_to_an_empty_database(session_factory, db):
    from sqlalchemy import func, select

    from app.core.demo_data import seed_if_empty
    from app.models import Customer, Product, User

    seed_if_empty(session_factory)
    counts = lambda: tuple(db.scalar(select(func.count(m.id))) for m in (User, Product, Customer))
    first = counts()
    assert first[0] == 3 and first[1] > 0 and first[2] > 0

    seed_if_empty(session_factory)
    assert counts() == first
