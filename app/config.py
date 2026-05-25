"""Application settings — single source of truth.

All secret material is sourced from environment variables. The dev defaults
intentionally do NOT include a real SECRET_KEY; if the app is started with
ENVIRONMENT=production while SECRET_KEY is missing or matches the dev sentinel,
startup raises so we fail loudly instead of running with a guessable key.
"""
import secrets

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings


# Sentinel: any deployment that ships with this exact value is misconfigured.
# We refuse to start in production with this default so a real env var must
# be provided.
_DEV_SECRET_SENTINEL = "dev-only-change-me-in-production"


class Settings(BaseSettings):
    # --- Environment ---------------------------------------------------------
    ENVIRONMENT: str = "development"  # development | staging | production
    DEBUG: bool = False

    # --- Database ------------------------------------------------------------
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost:5432/lifemanager"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 80
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 3600

    # --- JWT / auth ----------------------------------------------------------
    # JWT signing key. Read from JWT_SECRET_KEY (preferred) or SECRET_KEY.
    # Falls back to a dev sentinel that we explicitly refuse in production.
    SECRET_KEY: str = Field(
        default=_DEV_SECRET_SENTINEL,
        validation_alias=AliasChoices("JWT_SECRET_KEY", "SECRET_KEY"),
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # --- Rate limiting -------------------------------------------------------
    # Per-IP limits for sensitive auth endpoints. Format follows slowapi's
    # "<count>/<period>" syntax (e.g. "5/minute", "3/hour").
    RATE_LIMIT_LOGIN: str = "5/minute"
    RATE_LIMIT_REGISTER: str = "3/hour"
    # Disabling makes tests deterministic; production should leave this False.
    RATE_LIMIT_DISABLED: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


def _validate(s: Settings) -> Settings:
    """Refuse to start in production with the dev SECRET_KEY sentinel."""
    if s.ENVIRONMENT.lower() == "production" and s.SECRET_KEY == _DEV_SECRET_SENTINEL:
        raise RuntimeError(
            "ENVIRONMENT=production but JWT_SECRET_KEY is not set. "
            "Generate one with `python -c \"import secrets; print(secrets.token_urlsafe(64))\"` "
            "and set it via the deployment platform's secret manager."
        )
    return s


settings = _validate(Settings())


def generate_secret_key() -> str:
    """Helper exposed for ops scripts / setup docs."""
    return secrets.token_urlsafe(64)
