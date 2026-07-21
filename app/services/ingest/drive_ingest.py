"""Google Drive as a feeding source — «از گوگل درایو همه‌چیز را ببیند».

Lists the user's Drive, downloads each readable file (PDF / image / scan), and
runs it through the SAME universal extract → propose → approve → file loop the
email attachments use. Nothing is written blindly: every file becomes a review
candidate the owner approves.

Design guarantees (mirror subscription_ingest / person_ingest):
  * **Opt-in** — gated by the ``auto_ingest_drive`` GlobalSetting flag (default
    ON; a toggle turns it off).
  * **Idempotent, twice over** — a per-file ``source_ref`` (``drive:{id}``)
    blocks a second candidate for the same file in ANY status, and a durable
    "seen file ids" stamp skips re-DOWNLOADING files already processed (each
    download is a network round-trip).
  * **Bounded** — only readable binaries (PDF/image), capped per scan, size-cap
    reused from the attachment path via ``prepare_bytes``.
  * **Never raises** — Drive offline (no client) is a clean no-op.
"""
from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

_FLAG_KEY = "auto_ingest_drive"
_SEEN_KEY = "ingest_drive_seen"
_SEEN_CAP = 5000

# Only files a vision model can actually read. Google-native docs/sheets/slides
# (application/vnd.google-apps.*) can't be fetched with get_media — they need an
# export — so they're skipped here (kept out of scope, not silently mishandled).
_READABLE_PREFIXES = ("image/",)
_READABLE_EXACT = {
    "application/pdf",
    "text/plain",
    "text/csv",
}


async def is_enabled(db: AsyncSession) -> bool:
    """Opt-in flag; default ON (owner consented: «گوگلم وصل است»). Never raises."""
    try:
        from app.models.global_setting import GlobalSetting

        row = (
            await db.execute(select(GlobalSetting).where(GlobalSetting.key == _FLAG_KEY))
        ).scalar_one_or_none()
        if row is None or row.value is None:
            return True
        return str(row.value).strip() not in ("0", "false", "off", '"0"')
    except Exception:
        return True


async def set_enabled(db: AsyncSession, enabled: bool) -> bool:
    from app.models.global_setting import GlobalSetting

    value = "1" if enabled else "0"
    row = (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == _FLAG_KEY))
    ).scalar_one_or_none()
    if row is None:
        db.add(GlobalSetting(key=_FLAG_KEY, value=value))
    else:
        row.value = value
    await db.commit()
    return enabled


def _is_readable(mime: Optional[str]) -> bool:
    m = (mime or "").lower()
    return m in _READABLE_EXACT or any(m.startswith(p) for p in _READABLE_PREFIXES)


async def _load_seen(db: AsyncSession) -> set:
    from app.models.global_setting import GlobalSetting

    try:
        row = (
            await db.execute(select(GlobalSetting).where(GlobalSetting.key == _SEEN_KEY))
        ).scalar_one_or_none()
        if row and row.value:
            data = json.loads(row.value)
            if isinstance(data, list):
                return set(str(x) for x in data)
    except Exception as exc:
        logger.debug("drive seen-set load failed: %r", exc)
    return set()


async def _save_seen(db: AsyncSession, seen: set) -> None:
    from app.models.global_setting import GlobalSetting

    # keep the newest _SEEN_CAP ids (a plain set has no order, so this is a
    # coarse trim — fine, since correctness rests on the inbox source_ref dedup)
    trimmed = list(seen)[-_SEEN_CAP:]
    payload = json.dumps(trimmed)
    row = (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == _SEEN_KEY))
    ).scalar_one_or_none()
    if row is None:
        db.add(GlobalSetting(key=_SEEN_KEY, value=payload))
    else:
        row.value = payload


async def scan_drive(db: AsyncSession, *, user_id: int = 0, limit: int = 50) -> Dict[str, Any]:
    """List the connected Drive, extract each new readable file → review
    candidate. No-op (clean) when Drive isn't connected. Never raises."""
    try:
        from app.services.google_api_client import build_drive_client
        from app.services.ingest.universal_ingest import extract_from_file

        client = await build_drive_client(db)
        if client is None:
            return {"ok": False, "reason": "drive_offline", "proposed": 0, "scanned": 0}

        try:
            files: List[dict] = await client.list_files()
        except Exception as exc:
            logger.debug("drive list_files failed: %r", exc)
            return {"ok": False, "reason": "list_failed", "proposed": 0, "scanned": 0}

        seen = await _load_seen(db)
        proposed = 0
        needs = 0
        scanned = 0
        for f in files:
            fid = str(f.get("id") or "")
            if not fid or fid in seen:
                continue
            if not _is_readable(f.get("mime_type")):
                seen.add(fid)  # remember so we don't re-list-check it forever
                continue
            if scanned >= limit:
                break
            scanned += 1
            seen.add(fid)
            try:
                data = await client.download(fid)
            except Exception as exc:
                logger.debug("drive download failed (%s): %r", fid, exc)
                continue
            if not data:
                continue
            res = await extract_from_file(
                db,
                filename=f.get("name") or fid,
                mimetype=f.get("mime_type"),
                data=data,
                source_ref=f"drive:{fid}",
                user_id=user_id,
            )
            st = res.get("status")
            if st in ("proposed", "unreadable"):
                proposed += 1
            elif st == "needs_password":
                needs += 1
        await _save_seen(db, seen)
        await db.commit()
        return {
            "ok": True,
            "scanned": scanned,
            "proposed": proposed,
            "needs_password": needs,
            "total_files": len(files),
        }
    except Exception as exc:
        logger.debug("drive scan skipped: %r", exc)
        try:
            await db.rollback()
        except Exception:
            pass
        return {"ok": False, "reason": "error", "proposed": 0, "scanned": 0}
