"""پشتیبان‌گیری خودکار — nightly JSON export of EVERY table, pushed to Drive.

The owner's life data must never be single-copy again (audit 2026-07-20
PROPOSAL «backup روزانه به Drive»). This service:

  * ``export_all_tables``   — SELECT * every table in ``Base.metadata`` and
    serialize the rows to JSON-safe values (datetime/date → isoformat,
    Decimal → str, bytes → base64).
  * ``run_backup``          — gzip the export and upload it to Google Drive
    under ``LifeManagerData/Backups/`` (same ``google_drive_service.upload_file``
    seam every other Drive caller uses). When Drive is not connected or the
    upload fails, it degrades to a local file under ``data/backups/`` (at most
    ``MAX_LOCAL_BACKUPS`` files kept) — degraded but never lost. NEVER raises.
  * status blob             — ONE GlobalSetting JSON blob (key
    ``backup_status``), the same pattern as the google-sync/attention engines'
    settings+stamps blobs (see ``app/services/google_sync/engine.py``).
  * ``backup_tick``         — at most one attempt per UTC calendar day; driven
    by ``backup_loop`` which ``app/main.py`` starts like the other engines
    (own SessionLocal sessions, fail-open, stop-event lifecycle).
"""
from __future__ import annotations

import base64
import gzip
import json
import logging
from datetime import date, datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any, Dict, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

# GlobalSetting key holding the status blob (single source of truth).
STATUS_KEY = "backup_status"

# Drive subfolder under the LifeManagerData app root (upload_file's data_type).
BACKUP_SUBFOLDER = "Backups"

# Local fallback directory. Module-level on purpose so tests can monkeypatch it
# to tmp_path; always re-read at call time (``Path(BACKUPS_DIR)``).
BACKUPS_DIR = Path("data") / "backups"

# Keep at most this many local fallback files (oldest pruned first).
MAX_LOCAL_BACKUPS = 14

# A nightly backup older than this is stale (26h = one missed night + slack).
STALE_AFTER_HOURS = 26

_STATUS_DEFAULTS: Dict[str, Any] = {
    "last_ok_at": None,
    "last_attempt_at": None,
    "last_error": None,
    "last_file_name": None,
    "last_size_bytes": None,
    "last_drive_file_id": None,
    "last_counts_total": None,
    "last_local_at": None,
}


# ── JSON-safe serialization ──────────────────────────────────────────────────
def _json_safe(value: Any) -> Any:
    """Coerce a DB value into something ``json.dumps`` accepts losslessly."""
    if value is None or isinstance(value, (bool, int, float, str)):
        return value
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, Decimal):
        return str(value)
    if isinstance(value, (bytes, bytearray)):
        return base64.b64encode(bytes(value)).decode("ascii")
    if isinstance(value, dict):
        return {str(k): _json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [_json_safe(v) for v in value]
    return str(value)  # UUID, Enum, anything exotic — never let dumps blow up


# Columns that are credentials, not content. Kept in the automated Drive
# backup (goes to the owner's private Drive), but REDACTED from the manual
# HTTP /export download so a pre-lockdown anonymous fetch can't walk away
# with password hashes / encrypted keys (2026-07-20 review, critical).
_SENSITIVE_COLUMNS = {
    "hashed_password", "password", "api_key_encrypted", "api_key",
    "refresh_token", "access_token", "token", "client_secret",
    "encrypted_value", "secret",
}


async def export_all_tables(
    db: AsyncSession, *, redact_secrets: bool = False
) -> Dict[str, Any]:
    """SELECT * every table registered on ``Base.metadata`` and return
    ``{"exported_at", "tables": {name: [rows...]}, "counts": {name: n}}``
    with every value JSON-safe. With ``redact_secrets`` the credential
    columns are masked (used by the manual HTTP download)."""
    import app.models  # noqa: F401 — registers every model on Base.metadata

    from app.database import Base

    tables: Dict[str, list] = {}
    counts: Dict[str, int] = {}
    for table in Base.metadata.sorted_tables:
        rows = (await db.execute(select(table))).mappings().all()
        out = []
        for row in rows:
            d = {str(k): _json_safe(v) for k, v in dict(row).items()}
            if redact_secrets:
                for col in list(d.keys()):
                    if col.lower() in _SENSITIVE_COLUMNS and d[col] is not None:
                        d[col] = "***redacted***"
            out.append(d)
        tables[table.name] = out
        counts[table.name] = len(out)
    return {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "tables": tables,
        "counts": counts,
        "secrets_redacted": redact_secrets,
    }


# ── Status blob (same shape as the sibling engines' GlobalSetting blobs) ─────
async def _load_status_blob(db: AsyncSession) -> Dict[str, Any]:
    from app.models.global_setting import GlobalSetting

    try:
        row = (
            await db.execute(select(GlobalSetting).where(GlobalSetting.key == STATUS_KEY))
        ).scalar_one_or_none()
        if row and row.value:
            stored = json.loads(row.value)
            if isinstance(stored, dict):
                return stored
    except Exception as exc:
        logger.debug("backup status load failed: %r", exc)
    return {}


async def _save_status_blob(db: AsyncSession, blob: Dict[str, Any]) -> None:
    from app.models.global_setting import GlobalSetting

    row = (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == STATUS_KEY))
    ).scalar_one_or_none()
    payload = json.dumps(blob, ensure_ascii=False)
    if row is None:
        db.add(GlobalSetting(key=STATUS_KEY, value=payload))
    else:
        row.value = payload
    await db.commit()


async def _patch_status(db: AsyncSession, patch: Dict[str, Any]) -> None:
    blob = await _load_status_blob(db)
    blob.update(patch)
    await _save_status_blob(db, blob)


async def get_status(db: AsyncSession) -> Dict[str, Any]:
    """Stored status blob merged over defaults + ``is_stale`` (no successful
    backup within ``STALE_AFTER_HOURS``) + ``drive_configured`` (a usable
    refresh_token is on file — DB or env fallback)."""
    status: Dict[str, Any] = dict(_STATUS_DEFAULTS)
    stored = await _load_status_blob(db)
    status.update({k: stored[k] for k in _STATUS_DEFAULTS if k in stored})

    is_stale = True
    if status.get("last_ok_at"):
        try:
            last_ok = datetime.fromisoformat(status["last_ok_at"])
            if last_ok.tzinfo is None:
                last_ok = last_ok.replace(tzinfo=timezone.utc)
            age_hours = (datetime.now(timezone.utc) - last_ok).total_seconds() / 3600
            is_stale = age_hours > STALE_AFTER_HOURS
        except Exception:
            is_stale = True
    status["is_stale"] = is_stale

    try:
        from app.services import drive_settings_service as dss

        status["drive_configured"] = bool(await dss.is_connected(db))
    except Exception as exc:
        logger.debug("backup drive_configured probe failed: %r", exc)
        status["drive_configured"] = False

    # A durable (off-box) backup exists only when the last run reached Drive.
    status["has_durable_backup"] = bool(status.get("last_drive_file_id"))
    return status


# ── The backup itself ────────────────────────────────────────────────────────
def _prune_local(directory: Path) -> None:
    """Keep at most ``MAX_LOCAL_BACKUPS`` files (names embed the UTC timestamp,
    so lexicographic order == chronological order). Best-effort."""
    try:
        files = sorted(directory.glob("lifemanager-backup-*.json.gz"))
        for old in files[:-MAX_LOCAL_BACKUPS] if len(files) > MAX_LOCAL_BACKUPS else []:
            try:
                old.unlink()
            except Exception as exc:
                logger.debug("backup prune: could not delete %s: %r", old, exc)
    except Exception as exc:
        logger.debug("backup prune skipped: %r", exc)


async def run_backup(db: AsyncSession, now: Optional[datetime] = None) -> Dict[str, Any]:
    """Build the full export, gzip it, and put it somewhere safe.

    Drive first (``LifeManagerData/Backups/``); local ``BACKUPS_DIR`` fallback
    when Drive is unavailable (result marked ``degraded``). NEVER raises —
    every failure collapses to ``{"ok": False, ...}`` and the status blob
    records the attempt either way.
    """
    now = now or datetime.now(timezone.utc)
    result: Dict[str, Any] = {
        "ok": False,
        "success": False,  # both keys — repo response convention
        "detail_fa": "",
        "file_name": None,
        "drive_file_id": None,
        "local_path": None,
        "size_bytes": 0,
        "counts": {},
        "degraded": False,
    }
    status_patch: Dict[str, Any] = {"last_attempt_at": now.isoformat()}
    try:
        export = await export_all_tables(db)
        payload = json.dumps(export, ensure_ascii=False).encode("utf-8")
        gz = gzip.compress(payload)
        file_name = f"lifemanager-backup-{now:%Y%m%d-%H%M%S}.json.gz"
        result["file_name"] = file_name
        result["size_bytes"] = len(gz)
        result["counts"] = export["counts"]

        drive_error: Optional[str] = None
        try:
            from app.services import drive_settings_service as dss
            from app.services import google_drive_service
            from app.services.google_api_client import build_drive_client

            drive_client = await build_drive_client(db)
            if drive_client is not None:
                refresh_token = await dss.resolve_refresh_token(db)
                info = await google_drive_service.upload_file(
                    refresh_token=refresh_token,
                    file_name=file_name,
                    data_type=BACKUP_SUBFOLDER,
                    media=gz,
                    client=drive_client,
                )
                result["drive_file_id"] = info.get("drive_file_id")
        except Exception as exc:  # Drive down ≠ backup lost — degrade to local
            drive_error = repr(exc)[:300]
            logger.warning("backup: Drive upload failed, falling back local: %r", exc)

        if result["drive_file_id"]:
            result["ok"] = result["success"] = True
            result["detail_fa"] = "پشتیبان‌گیری کامل شد و روی گوگل درایو ذخیره شد."
        else:
            directory = Path(BACKUPS_DIR)
            directory.mkdir(parents=True, exist_ok=True)
            local_path = directory / file_name
            local_path.write_bytes(gz)
            _prune_local(directory)
            result["ok"] = result["success"] = True
            result["degraded"] = True
            result["local_path"] = str(local_path)
            result["detail_fa"] = (
                "گوگل درایو در دسترس نبود — نسخهٔ پشتیبان به‌صورت محلی ذخیره شد."
            )
            if drive_error:
                result["drive_error"] = drive_error

        # 2026-07-20 review: last_ok_at (which drives is_stale + the green
        # owner-action tick) means "a DURABLE off-box backup exists" — only
        # a Drive upload qualifies. A local file on Render's ephemeral disk
        # gets its own stamp so the panel can show "local only, not durable".
        status_patch.update(
            {
                "last_error": drive_error if result["degraded"] else None,
                "last_file_name": file_name,
                "last_size_bytes": len(gz),
                "last_drive_file_id": result["drive_file_id"],
                "last_counts_total": sum(export["counts"].values()),
            }
        )
        if result["drive_file_id"]:
            status_patch["last_ok_at"] = now.isoformat()
        else:
            status_patch["last_local_at"] = now.isoformat()
    except Exception as exc:
        try:
            await db.rollback()
        except Exception:
            pass
        err = repr(exc)[:300]
        logger.warning("backup run failed: %r", exc)
        result["detail_fa"] = f"پشتیبان‌گیری ناموفق بود: {err}"
        status_patch["last_error"] = err

    try:
        await _patch_status(db, status_patch)
    except Exception as exc:
        try:
            await db.rollback()
            await _patch_status(db, status_patch)
        except Exception:
            logger.warning("backup status save failed: %r", exc)
    return result


# ── Daily tick + loop (same lifecycle shape as google_sync_loop) ─────────────
async def backup_tick(db: AsyncSession, now: Optional[datetime] = None) -> Dict[str, Any]:
    """Run the backup at most once per UTC calendar day (compare the stored
    ``last_attempt_at`` day — failures also count as the day's attempt, so a
    broken Drive doesn't hammer the DB export every 15 minutes)."""
    now = now or datetime.now(timezone.utc)
    stored = await _load_status_blob(db)
    last_attempt = stored.get("last_attempt_at")
    if last_attempt:
        try:
            last = datetime.fromisoformat(last_attempt)
            if last.tzinfo is None:
                last = last.replace(tzinfo=timezone.utc)
            if last.astimezone(timezone.utc).date() == now.astimezone(timezone.utc).date():
                return {"ok": True, "success": True, "skipped": "already_ran_today"}
        except Exception:
            pass  # unparseable stamp → just run
    return await run_backup(db, now=now)


async def backup_loop(stop_event) -> None:
    """Background loop (15-min cadence, 120s initial grace so boot work —
    create_all, seeds, the other engines' first ticks — settles first).
    Mirrors ``google_sync_loop``: own SessionLocal sessions, fail-open."""
    import asyncio

    try:
        await asyncio.wait_for(stop_event.wait(), timeout=120)
        return
    except asyncio.TimeoutError:
        pass
    while not stop_event.is_set():
        try:
            from app.database import SessionLocal

            async with SessionLocal() as session:
                await backup_tick(session)
        except Exception as exc:
            logger.debug("backup cycle skipped: %r", exc)
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=900)
        except asyncio.TimeoutError:
            continue
