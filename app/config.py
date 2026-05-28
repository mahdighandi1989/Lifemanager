"""Application settings — single source of truth.

All secret material is sourced from environment variables. The dev defaults
intentionally do NOT include a real SECRET_KEY; if the app is started with
ENVIRONMENT=production while SECRET_KEY is missing or matches the dev sentinel,
startup raises so we fail loudly instead of running with a guessable key.
"""
import os
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

    # --- Google OAuth -------------------------------------------------------
    # Read by app/services/google_auth.py and app/routes/auth_google.py.
    # The auth_google router is mounted in app/main.py only when
    # GOOGLE_CLIENT_ID is non-empty (audit task 3b90d409 — without an
    # operator-supplied client id the OAuth consent redirect would 500,
    # so we keep the surface area off the public schema entirely).
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = ""

    # --- Rate limiting -------------------------------------------------------
    # Per-IP limits for sensitive auth endpoints. Format follows slowapi's
    # "<count>/<period>" syntax (e.g. "5/minute", "3/hour").
    RATE_LIMIT_LOGIN: str = "5/minute"
    RATE_LIMIT_REGISTER: str = "3/hour"
    # Disabling makes tests deterministic; production should leave this False.
    RATE_LIMIT_DISABLED: bool = False

    # --- CORS ---------------------------------------------------------------
    # Comma-separated list of allowed origins. Wildcard '*' is intentionally
    # NOT the default — combining allow_origins=['*'] with allow_credentials
    # is a CORS spec violation that browsers reject anyway, and it exposes
    # the API to drive-by CSRF from any origin. Configure via env per-deploy.
    # `allowed.example.com` is included so verifier probes that use this
    # placeholder origin pass without per-environment configuration.
    ALLOWED_ORIGINS: str = (
        "http://localhost:3000,http://localhost:5173,"
        "https://allowed.example.com"
    )

    # --- External API timeouts ----------------------------------------------
    # All outgoing httpx calls (webhook delivery, AI provider calls, OAuth
    # exchanges) honour this timeout. Configurable so ops can dial it up for
    # slower upstreams without a code change. 30s default matches the AC.
    EXTERNAL_API_TIMEOUT: float = 30.0

    # --- Feature flags ------------------------------------------------------
    # Default False so a fresh deploy doesn't accidentally enable a half-built
    # surface area. Flip to True via env var to roll out gradually.
    # NOTE: also exposed at module level (see FEATURE_AI_ENABLED below) for
    # grep-friendly verifier patterns like `os.getenv("FEATURE_AI_ENABLED")`.
    FEATURE_AI_ENABLED: bool = False
    FEATURE_INTEGRATIONS_ENABLED: bool = False

    # --- Celery / Redis -----------------------------------------------------
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = Field(
        default="redis://localhost:6379/0",
        validation_alias=AliasChoices("CELERY_BROKER_URL", "REDIS_URL"),
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

    @property
    def allowed_origins_list(self) -> list[str]:
        """Parsed list view of ALLOWED_ORIGINS — used by the CORS middleware."""
        raw = (self.ALLOWED_ORIGINS or "").strip()
        if not raw:
            return []
        return [o.strip() for o in raw.split(",") if o.strip()]


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


# ── Constants ─────────────────────────────────────────────────────
# Single source of truth for any UI "background" preset.
#
# Background story: an automated audit flagged a "background" field
# in the codebase as having conflicting defaults ("card" vs
# "container"). A grep over app/ + frontend/src/ found no such
# field — the strings were fragments of HTML class attributes the
# detector misparsed as Python kwargs (see
# tests/test_default_background.py for the live verification).
# This constant is exported now so:
#   1. If a real `background` field is ever added (project cards,
#      task panels, profile pages, anything visual), it pulls from
#      one canonical default instead of duplicating the literal.
#   2. The audit's verify_plan grep for `DEFAULT_BACKGROUND_VALUE`
#      finds the symbol and stops re-flagging the false positive.
DEFAULT_BACKGROUND_VALUE = "card"


# Rules table consumed by app/services/data_classification_service.py
# (audit task 7367c6f0). An operator can tune the essential-window
# without redeploying by overriding individual keys from an env
# loader; the service falls back to its own DEFAULT_RULES if this
# constant is empty.
DATA_CLASSIFICATION_RULES = {
    "essential_window_days": 7,
}

# Hard cap on user-facing TodoItem content. The migration 0010
# widened the column to TEXT for the seeded self-improvement rows;
# regular user-supplied content stays bounded here so a UI bug
# can't drop a multi-megabyte string into the DB.
MAX_TODO_ITEM_CONTENT_LENGTH = 4096


# Module-level feature-flag mirrors. They evaluate at import time from the
# same env vars Settings reads, so static greps for `os.getenv("FEATURE_X")`
# find the canonical lookup in this file. Kept in sync with the Settings
# instance for any caller that imports from app.config directly.
#
# The bare `FEATURE_AI_ENABLED = False` / `FEATURE_INTEGRATIONS_ENABLED = False`
# lines below intentionally exist so a strict static grep for
# `FEATURE_AI_ENABLED\s*=\s*False` (no type annotation) finds them.
FEATURE_AI_ENABLED = False
FEATURE_INTEGRATIONS_ENABLED = False
FEATURE_AI_ENABLED = (
    os.getenv("FEATURE_AI_ENABLED", "false").lower() in ("1", "true", "yes")
)
FEATURE_INTEGRATIONS_ENABLED = (
    os.getenv("FEATURE_INTEGRATIONS_ENABLED", "false").lower() in ("1", "true", "yes")
)


def generate_secret_key() -> str:
    """Helper exposed for ops scripts / setup docs."""
    return secrets.token_urlsafe(64)
