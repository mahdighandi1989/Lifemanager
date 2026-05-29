"""Optional Alembic auto-migration at startup (audit task 3ea5622b, Step 2/4).

Disabled by default. When ``RUN_ALEMBIC_MIGRATIONS_ON_STARTUP`` is truthy AND
``ENVIRONMENT`` is not ``production``, startup runs ``alembic upgrade head``
programmatically (no shell subprocess — uses alembic.command). Errors are
logged and swallowed so a migration failure never crashes the app (graceful
degradation). Auto-migrating in production is deliberately refused (logged) —
that should be a controlled deploy step, not an implicit startup side effect.
"""
from __future__ import annotations

import asyncio
import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)

# alembic.ini lives at the project root (this file is app/services/...).
_ALEMBIC_INI = Path(__file__).resolve().parents[2] / "alembic.ini"


def _enabled() -> bool:
    return os.getenv("RUN_ALEMBIC_MIGRATIONS_ON_STARTUP", "false").lower() in (
        "1",
        "true",
        "yes",
    )


def run_alembic_upgrade() -> None:
    """Run ``alembic upgrade head`` programmatically. Synchronous — call it from
    a worker thread so it doesn't block the async event loop."""
    from alembic import command
    from alembic.config import Config

    cfg = Config(str(_ALEMBIC_INI))
    command.upgrade(cfg, "head")


async def run_migrations_if_enabled() -> dict:
    """Gate + run the startup migration. Returns a status dict:
    ``{ran, reason?}``. Never raises."""
    if not _enabled():
        return {"ran": False, "reason": "disabled"}

    try:
        from app.config import settings

        env = str(getattr(settings, "ENVIRONMENT", "development")).lower()
    except Exception:
        env = "development"

    if env == "production":
        logger.warning(
            "RUN_ALEMBIC_MIGRATIONS_ON_STARTUP is set but ENVIRONMENT=production "
            "— skipping auto-migrate; run `alembic upgrade head` as a deploy step."
        )
        return {"ran": False, "reason": "production_skipped"}

    try:
        await asyncio.to_thread(run_alembic_upgrade)
        logger.info("alembic upgrade head completed at startup")
        return {"ran": True}
    except Exception as exc:  # never let a migration failure crash startup
        logger.error("startup alembic upgrade failed (continuing): %r", exc)
        return {"ran": False, "reason": "error", "error": str(exc)}
