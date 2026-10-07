from decimal import Decimal
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Sales & Inventory API"
    DEBUG: bool = False
    API_PREFIX: str = "/api/v1"
    FRONTEND_URL: str = "http://localhost:5173"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/sales_inventory"
    AUTO_MIGRATE: bool = True
    AUTO_SEED: bool = True

    JWT_SECRET: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    EMAIL_ENABLED: bool = False
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "no-reply@salesinventory.local"
    SMTP_USE_TLS: bool = True

    DEFAULT_APPROVAL_THRESHOLD: Decimal = Decimal("50000")
    DEFAULT_TAX_RATE_PERCENT: Decimal = Decimal("18")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
