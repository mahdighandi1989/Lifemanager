"""Google Drive connection settings — the single source of truth for the
operator's Drive link (audit task: complete Google Drive integration).

The operator completes a one-time OAuth consent (offline access, ``drive.file``
scope — see ``app/routes/auth_google.py``); the resulting **refresh_token** is
stored ENCRYPTED at rest (``crypt_service.encrypt_data``) alongside the
connected Google account email and the cached app-root folder id. Everything
Drive-related resolves its credentials through here, so connect / disconnect is
one switch.

Storage reuses the existing ``GlobalSetting`` key/value table (the lifemanager
equivalent of ALLIN1's ``system_settings``) — no new table, so no migration is
needed. Degrades gracefully: with no stored token AND no env fallback,
``is_connected`` is False and every Drive helper stays a clean no-op.
"""
from __future__ import annotations

import logging
import os
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.global_setting import GlobalSetting
from app.services.crypt_service import decrypt_data, encrypt_data

logger = logging.getLogger(__name__)

# GlobalSetting keys (single source of truth).
KEY_REFRESH_TOKEN = "google_drive_refresh_token"   # ENCRYPTED at rest
KEY_ACCOUNT_EMAIL = "google_drive_account_email"
KEY_ROOT_FOLDER_ID = "google_drive_root_folder_id"

# Env fallbacks, so an operator can wire a token without the interactive UI flow
# (e.g. a server-side script). GOOGLE_SHEETS_REFRESH_TOKEN predates this module
# and is honoured for backward compatibility (it powered the Sheets ledger).
_ENV_REFRESH_TOKENS = ("GOOGLE_DRIVE_REFRESH_TOKEN", "GOOGLE_SHEETS_REFRESH_TOKEN")


async def _get_row(db: AsyncSession, key: str) -> Optional[GlobalSetting]:
    return (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == key))
    ).scalar_one_or_none()


async def _set(db: AsyncSession, key: str, value: str) -> None:
    row = await _get_row(db, key)
    if row is None:
        db.add(GlobalSetting(key=key, value=value))
    else:
        row.value = value
    await db.commit()


async def _delete(db: AsyncSession, key: str) -> None:
    row = await _get_row(db, key)
    if row is not None:
        await db.delete(row)
        await db.commit()


async def store_connection(
    db: AsyncSession, *, refresh_token: Optional[str], account_email: Optional[str] = None
) -> None:
    """Persist a freshly-obtained Drive connection. The refresh_token is
    encrypted before it touches the DB; the account email is stored as-is so the
    UI can show *which* Google account is linked."""
    if refresh_token:
        await _set(db, KEY_REFRESH_TOKEN, encrypt_data(refresh_token))
    if account_email:
        await _set(db, KEY_ACCOUNT_EMAIL, account_email)


async def resolve_refresh_token(db: AsyncSession) -> Optional[str]:
    """Return the decrypted refresh_token, or None when not connected.

    Order: the encrypted DB value first (the UI flow), then the env fallbacks.
    A value that fails to decrypt (key rotated, corruption) is treated as
    'not connected' rather than raising."""
    row = await _get_row(db, KEY_REFRESH_TOKEN)
    if row and row.value:
        try:
            return decrypt_data(row.value)
        except Exception:
            logger.warning("stored Drive refresh_token failed to decrypt — ignoring")
    for env in _ENV_REFRESH_TOKENS:
        val = os.getenv(env)
        if val:
            return val
    return None


async def get_account_email(db: AsyncSession) -> Optional[str]:
    row = await _get_row(db, KEY_ACCOUNT_EMAIL)
    return row.value if row else None


async def get_root_folder_id(db: AsyncSession) -> Optional[str]:
    row = await _get_row(db, KEY_ROOT_FOLDER_ID)
    return row.value if row else None


async def store_root_folder_id(db: AsyncSession, folder_id: str) -> None:
    await _set(db, KEY_ROOT_FOLDER_ID, folder_id)


async def is_connected(db: AsyncSession) -> bool:
    """True when a usable refresh_token is on file (DB or env)."""
    return bool(await resolve_refresh_token(db))


async def disconnect(db: AsyncSession) -> None:
    """Forget the Drive connection (token + email + cached folder id). The env
    fallbacks are NOT touched — they are operator-managed."""
    for key in (KEY_REFRESH_TOKEN, KEY_ACCOUNT_EMAIL, KEY_ROOT_FOLDER_ID):
        await _delete(db, key)


async def get_status(db: AsyncSession) -> dict:
    """Connection status for the frontend management panel.

    ``configured`` = OAuth client credentials present (the operator filled
    GOOGLE_CLIENT_ID / SECRET / REDIRECT_URI); ``connected`` = a refresh_token
    is on file. The two are distinct so the UI can say *"set the env vars
    first"* vs *"click Connect"* vs *"connected as x@gmail.com"*."""
    from app.config import settings
    from app.services.google_drive_service import (
        APP_ROOT_FOLDER_NAME,
        DEFAULT_SUBFOLDERS,
    )

    configured = bool(
        settings.GOOGLE_CLIENT_ID
        and settings.GOOGLE_CLIENT_SECRET
        and settings.GOOGLE_REDIRECT_URI
    )
    return {
        "configured": configured,
        # `enabled` kept as an alias of `configured` to mirror ALLIN1's status shape.
        "enabled": configured,
        "connected": await is_connected(db),
        "account_email": await get_account_email(db),
        "root_folder_id": await get_root_folder_id(db),
        "root_folder_name": APP_ROOT_FOLDER_NAME,
        "subfolders": list(DEFAULT_SUBFOLDERS),
    }
