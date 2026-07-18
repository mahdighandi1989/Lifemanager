"""Token storage/resolution for the dev-sync integrations (GitHub / Render).

Contract (repo convention, same as ai_providers):
* tokens are stored encrypted at rest (crypt_service Fernet) and NEVER
  returned to the client — status responses expose ``has_api_key`` + a
  masked hint only;
* resolution order is DB first, env-var fallback (``GITHUB_TOKEN`` /
  ``GH_TOKEN`` for GitHub, ``RENDER_API_KEY`` for Render) so the owner can
  configure everything from Render's dashboard without touching the UI.
"""
from __future__ import annotations

import logging
import os
from typing import Any, Dict, Optional, Tuple

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dev_sync import DevIntegration

logger = logging.getLogger(__name__)

PROVIDERS = ("github", "render")

ENV_KEYS = {
    "github": ("GITHUB_TOKEN", "GH_TOKEN"),
    "render": ("RENDER_API_KEY",),
}


def _owned_or_unowned(user_id: Optional[int]):
    if user_id is None:
        return DevIntegration.user_id.is_(None)
    return or_(DevIntegration.user_id == user_id, DevIntegration.user_id.is_(None))


def sanitize_error(exc: Exception, *secrets: Optional[str]) -> str:
    """Render an exception for storage/response WITHOUT leaking a token.
    h11/httpx embed the raw Authorization header value in some errors (e.g.
    LocalProtocolError shows the value via repr, so a newline appears as a
    literal ``\\n``) — redact the secret, its repr-escaped form and any long
    fragment of it, collapse whitespace, truncate."""
    text = f"{type(exc).__name__}: {exc}"
    variants = set()
    for secret in secrets:
        if not secret:
            continue
        for candidate in (secret, secret.strip()):
            if candidate:
                variants.add(candidate)
                variants.add(candidate.encode("unicode_escape").decode("ascii", "replace"))
        for part in secret.split():
            if len(part) >= 6:
                variants.add(part)
    for variant in sorted(variants, key=len, reverse=True):
        text = text.replace(variant, "***")
    return " ".join(text.split())[:300]


def env_token(provider: str) -> Optional[str]:
    for key in ENV_KEYS.get(provider, ()):  # first non-empty env var wins
        value = os.environ.get(key)
        if value and value.strip():
            return value.strip()
    return None


async def get_integration(
    db: AsyncSession, provider: str, user_id: Optional[int] = None
) -> Optional[DevIntegration]:
    result = await db.execute(
        select(DevIntegration)
        .where(DevIntegration.provider == provider, _owned_or_unowned(user_id))
        .order_by(DevIntegration.id)
    )
    return result.scalars().first()


async def get_token(
    db: AsyncSession, provider: str, user_id: Optional[int] = None
) -> Tuple[Optional[str], Optional[str]]:
    """Resolve the usable token → ``(token, source)`` where source is
    ``'db'`` / ``'env'`` / ``None``. DB (decrypted) first, env fallback.
    Never raises — an undecryptable blob degrades to the env path."""
    row = await get_integration(db, provider, user_id)
    if row is not None and row.is_enabled and row.api_key_encrypted:
        try:
            from app.services.crypt_service import decrypt_data

            raw = decrypt_data(row.api_key_encrypted)
            if raw:
                return raw, "db"
        except Exception as exc:
            logger.warning("dev token decrypt failed for %s: %r", provider, exc)
    raw = env_token(provider)
    if raw:
        return raw, "env"
    return None, None


async def set_token(
    db: AsyncSession,
    provider: str,
    raw: Optional[str],
    user_id: Optional[int] = None,
    is_enabled: Optional[bool] = None,
) -> DevIntegration:
    """Upsert the integration row. Empty/None ``raw`` clears the stored key
    (env fallback still applies). Commits."""
    row = await get_integration(db, provider, user_id)
    if row is None:
        row = DevIntegration(provider=provider, user_id=user_id)
        db.add(row)
    if raw is not None:
        raw = raw.strip()
        if raw:
            from app.services.crypt_service import encrypt_data

            row.api_key_encrypted = encrypt_data(raw)
        else:
            row.api_key_encrypted = None
    if is_enabled is not None:
        row.is_enabled = bool(is_enabled)
    await db.commit()
    await db.refresh(row)
    return row


async def record_sync_result(
    db: AsyncSession,
    provider: str,
    ok: bool,
    error: Optional[str] = None,
    user_id: Optional[int] = None,
) -> None:
    """Best-effort bookkeeping on the integration row. Never raises."""
    try:
        from datetime import datetime, timezone

        row = await get_integration(db, provider, user_id)
        if row is None:
            row = DevIntegration(provider=provider, user_id=user_id)
            db.add(row)
        row.last_sync_at = datetime.now(timezone.utc)
        row.last_sync_ok = ok
        row.last_sync_error = (error or "")[:2000] if not ok else None
        await db.commit()
    except Exception as exc:
        logger.debug("dev sync bookkeeping skipped: %r", exc)


async def integration_status(
    db: AsyncSession, provider: str, user_id: Optional[int] = None
) -> Dict[str, Any]:
    """Status payload for the settings UI — no key material, ever."""
    row = await get_integration(db, provider, user_id)
    has_db_key = bool(row and row.api_key_encrypted)
    env_available = env_token(provider) is not None
    source = "db" if (has_db_key and (row.is_enabled if row else False)) else (
        "env" if env_available else None
    )
    return {
        "provider": provider,
        "has_api_key": has_db_key,
        "env_available": env_available,
        "source": source,
        "is_enabled": row.is_enabled if row else True,
        "last_sync_at": row.last_sync_at.isoformat() if row and row.last_sync_at else None,
        "last_sync_ok": row.last_sync_ok if row else None,
        "last_sync_error": row.last_sync_error if row else None,
    }
