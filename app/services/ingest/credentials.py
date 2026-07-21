"""Encrypted credential vault for the ingest pipeline.

When a file needs a password the system doesn't have, it asks the owner (via
Telegram + the inbox) and stores the answer ENCRYPTED, keyed by source (usually
the sender's domain) so every future file from that source opens automatically.
Reuses the app's crypt_service (same at-rest encryption as API keys).
"""
from __future__ import annotations

import logging
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

_KEY_PREFIX = "ingest_cred:"


def source_key_for(sender_or_addr: Optional[str]) -> str:
    """Normalise a sender to a stable key — the email domain, so all files from
    e.g. @emiratesnbd.com share one stored password."""
    s = (sender_or_addr or "").lower()
    if "@" in s:
        s = s.rsplit("@", 1)[-1].strip(">").strip()
    return s or "unknown"


async def store_password(db: AsyncSession, *, source_key: str, password: str) -> None:
    from app.models.global_setting import GlobalSetting
    from app.services.crypt_service import encrypt_data

    key = _KEY_PREFIX + source_key
    enc = encrypt_data(password)
    row = (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == key))
    ).scalar_one_or_none()
    if row is None:
        db.add(GlobalSetting(key=key, value=enc))
    else:
        row.value = enc
    await db.commit()


async def get_password(db: AsyncSession, *, source_key: str) -> Optional[str]:
    """Return the decrypted password for a source, or None. Never raises."""
    try:
        from app.models.global_setting import GlobalSetting
        from app.services.crypt_service import decrypt_data

        row = (
            await db.execute(select(GlobalSetting).where(GlobalSetting.key == _KEY_PREFIX + source_key))
        ).scalar_one_or_none()
        if row is None or not row.value:
            return None
        return decrypt_data(row.value)
    except Exception as exc:
        logger.debug("credential read failed (%s): %r", source_key, exc)
        return None
