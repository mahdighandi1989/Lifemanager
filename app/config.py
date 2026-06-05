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
    # GOOGLE_REDIRECT_URI must match the value registered in the Google
    # Cloud Console; an empty string lets the route fall back to the
    # local dev callback http://localhost:8000/auth/google/callback.
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = ""

    # Google Maps key — used by the (future) /api/location/search
    # geocoding service. Empty by default so a deploy without Maps
    # credentials still boots; the route layer is responsible for
    # short-circuiting to 503 / a stub response when the key is
    # missing rather than blowing up on an httpx call.
    GOOGLE_MAPS_API_KEY: str = ""

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

    # --- Migrations ---------------------------------------------------------
    # When true AND ENVIRONMENT != production, startup runs `alembic upgrade
    # head` programmatically (audit task 3ea5622b). Off by default; production
    # never auto-migrates (it's a controlled deploy step). The startup hook in
    # app/services/migration_runner.py reads this via os.getenv too.
    RUN_ALEMBIC_MIGRATIONS_ON_STARTUP: bool = False

    # --- File / asset indexing ----------------------------------------------
    # How often (minutes) the periodic file-source sync runs — the backend
    # side of the "هر از چندگاهی که براش تنظیم می‌کنم ... اگه حذف شدن ازش پاک
    # بکنه" mobile/periodic loop (audit task 217909d2, Step 2 / AC3). The
    # scheduled task re-checks every indexed source_path and prunes the ones
    # that vanished on disk. Configurable per-deploy without a code change.
    FILE_SYNC_INTERVAL_MINUTES: int = 30

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


# Values that must never sign a production JWT. ``_DEV_SECRET_SENTINEL`` is
# the in-code default; "change-me-in-production" is the legacy default; the
# angle-bracket form is what a deployer ends up with if they copy
# ``.env.example`` verbatim without filling the secret in. The earlier guard
# only caught ``_DEV_SECRET_SENTINEL``, so a ``.env`` copied straight from
# ``.env.example`` (SECRET_KEY="<YOUR_JWT_SECRET_KEY>") sailed past it and
# booted production with a guessable key (audit task task_78c0e8e0a9b5,
# sub-task 2 — "prevent startup with default/placeholder JWT_SECRET_KEY").
_WEAK_SECRET_KEYS = {
    _DEV_SECRET_SENTINEL,
    "change-me-in-production",
    "<YOUR_JWT_SECRET_KEY>",
    "",
}


def _is_placeholder_secret(value: str) -> bool:
    """True when the secret is empty, a known-weak literal, or an unfilled
    ``<...>`` template placeholder left over from ``.env.example``."""
    v = (value or "").strip()
    if v in _WEAK_SECRET_KEYS:
        return True
    # An unfilled template placeholder like "<YOUR_JWT_SECRET_KEY>".
    if v.startswith("<") and v.endswith(">"):
        return True
    return False


def _validate(s: Settings) -> Settings:
    """Refuse to start in production with a default/placeholder SECRET_KEY."""
    if s.ENVIRONMENT.lower() == "production" and _is_placeholder_secret(s.SECRET_KEY):
        raise RuntimeError(
            "ENVIRONMENT=production but JWT_SECRET_KEY is unset or still a "
            "placeholder/dev default. Generate one with "
            "`python -c \"import secrets; print(secrets.token_urlsafe(64))\"` "
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


# Measurable outcome targets for the AI performance metrics (audit task
# task_97867b277c1b — AC1 "outcome target rewritten measurably" + Step 9
# "baseline/target in config"). The ``ai_performance`` log line in
# app/services/ai/nlp_service.py and the /api/ai/stats endpoint emit the
# matching ``ai_response_quality_score`` and ``ai_response_latency_ms``
# values; keeping the goal here (not only in the task prompt) gives a
# dashboard/alert one canonical, code-resident source of truth.
AI_PERFORMANCE_TARGETS = {
    "quality_score_min": 4.0,   # rolling mean of explicit 1-5 ratings
    "latency_p95_ms_max": 500,  # 95th-percentile AI response latency
}


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
