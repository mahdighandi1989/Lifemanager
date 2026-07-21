"""پشتیبان‌گیری خودکار — nightly JSON export of EVERY table, pushed to Drive.

The owner's life data must never be single-copy again (audit 2026-07-20
PROPOSAL «backup روزانه به Drive»). This service:

  * ``iter_export_bytes``   — the streaming heart: SELECT * every table in
    ``Base.metadata`` and yield the whole export as a JSON document in UTF-8
    chunks, ONE ROW AT A TIME. Peak memory stays bounded to a single row +
    the gzip/HTTP buffer, never the whole DB. Values are JSON-safe
    (datetime/date → isoformat, Decimal → str, bytes → base64).
  * ``export_all_tables``   — convenience wrapper that materializes the
    streamed export into a dict (used by tests / small callers only; the
    production paths stream instead so they never hold the DB in RAM).
  * ``run_backup``          — stream-gzip the export to a temp file on disk,
    then upload that file to Google Drive under ``LifeManagerData/Backups/``
    (same ``google_drive_service.upload_file`` seam every other Drive caller
    uses). When Drive is not connected or the upload fails, it keeps the file
    locally under ``data/backups/`` (at most ``MAX_LOCAL_BACKUPS`` files) —
    degraded but never lost. NEVER raises.
  * status blob             — ONE GlobalSetting JSON blob (key
    ``backup_status``), the same pattern as the google-sync/attention engines'
    settings+stamps blobs (see ``app/services/google_sync/engine.py``).
  * ``backup_tick``         — at most one attempt per UTC calendar day; driven
    by ``backup_loop`` which ``app/main.py`` starts like the other engines
    (own SessionLocal sessions, fail-open, stop-event lifecycle).

2026-07-21 memory fix: the old path built the ENTIRE export as a Python dict,
then a full JSON string, then a gzip copy = three full copies of the database
in RAM (plus the per-row dict object overhead). On a DB with months of
append-only logs that blew past Render's 512MB cap and the instance was
OOM-killed the moment «بکاپ فوری» was pressed. Everything now streams
row-by-row straight into gzip-on-disk, and the unbounded append-only LOG
tables are capped to their most-recent rows (recorded transparently under
``capped_tables`` — content tables are NEVER capped).
"""
from __future__ import annotations

import base64
import gzip
import json
import logging
import os
import tempfile
from datetime import date, datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any, AsyncIterator, Dict, Optional

from sqlalchemy import select, text
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

# Append-only operational/telemetry tables that grow without bound over time.
# The backup keeps only their most-recent rows so a year of logs can't blow
# the 512MB box (the 2026-07-21 OOM). These are NOT user content — they are
# audit/usage/webhook traces. CONTENT tables (tasks, todo_items, writings,
# persons, transactions, assets, documents, …) are deliberately absent here
# and always exported in full ("نه کم بشه"). Truncation is recorded under
# the export's ``capped_tables`` key so it is transparent, never silent.
_CAPPED_LOG_TABLES: Dict[str, int] = {
    "activity_logs": 25000,
    "ai_usage_logs": 25000,
    "behavior_logs": 25000,
    "dev_logs": 25000,
    "webhook_events": 10000,
    "notifications": 10000,
}

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


async def iter_export_bytes(
    db: AsyncSession,
    *,
    redact_secrets: bool = False,
    sink: Optional[Dict[str, Any]] = None,
) -> AsyncIterator[bytes]:
    """Yield the full export as a JSON document in UTF-8 chunks, streaming
    each table ROW BY ROW so peak memory stays bounded to a single row + the
    gzip/HTTP buffer — never the whole DB (the 2026-07-21 OOM).

    Shape (unchanged): ``{"exported_at", "tables": {name: [rows…]}, "counts":
    {name: n}, "secrets_redacted": bool, "capped_tables"?: {name: cap},
    "table_errors"?: {name: repr}}``. ``counts`` / ``capped_tables`` /
    ``table_errors`` are emitted AFTER the ``tables`` object (JSON key order
    is irrelevant) because they are only known once every table has streamed.

    Drift-immune: a raw ``SELECT *`` reflects the live table's ACTUAL columns
    (a model column the DB lacks can't raise UndefinedColumn the way an ORM
    ``select(table)`` did — the original 2026-07-21 incident). Each table is
    fail-open: a broken/locked table records a ``table_errors`` note (and
    rolls the session back so the next table starts clean) while the rest of
    the backup still completes.

    ``sink`` — when provided, is populated in place with the final ``counts``,
    ``capped_tables`` and ``table_errors`` dicts so a caller streaming to a
    file can read them once the stream is drained (no re-parse of the JSON).
    """
    import app.models  # noqa: F401 — registers every model on Base.metadata

    from app.database import Base

    bind = db.get_bind()
    preparer = getattr(getattr(bind, "dialect", None), "identifier_preparer", None)

    def _q(ident: str) -> str:
        return preparer.quote(ident) if preparer is not None else f'"{ident}"'

    counts: Dict[str, int] = {}
    errors: Dict[str, str] = {}
    capped: Dict[str, int] = {}
    if sink is not None:
        sink["counts"] = counts
        sink["table_errors"] = errors
        sink["capped_tables"] = capped

    exported_at = datetime.now(timezone.utc).isoformat()
    yield b'{"exported_at": ' + json.dumps(exported_at).encode("utf-8") + b', "tables": {'

    first_table = True
    for table in Base.metadata.sorted_tables:
        name = table.name
        if not first_table:
            yield b", "
        first_table = False
        yield json.dumps(name).encode("utf-8") + b": ["

        n = 0
        cap = _CAPPED_LOG_TABLES.get(name)
        try:
            # Cap = keep the most-recent rows (append-only logs carry an
            # ``id``; newest-first is fine for a restore, order is irrelevant).
            if cap is not None and "id" in table.columns:
                sql = f"SELECT * FROM {_q(name)} ORDER BY {_q('id')} DESC LIMIT {cap}"
            else:
                sql = f"SELECT * FROM {_q(name)}"
            result = await db.stream(text(sql))
            async for row in result.mappings():
                d = {str(k): _json_safe(v) for k, v in row.items()}
                if redact_secrets:
                    for col in list(d.keys()):
                        if col.lower() in _SENSITIVE_COLUMNS and d[col] is not None:
                            d[col] = "***redacted***"
                if n:
                    yield b", "
                yield json.dumps(d, ensure_ascii=False).encode("utf-8")
                n += 1
            if cap is not None and n >= cap:
                capped[name] = cap
        except Exception as exc:
            # One drifted/locked table must never lose the whole backup. Roll
            # the session back so a poisoned (aborted) transaction on Postgres
            # doesn't cascade into every remaining table.
            errors[name] = repr(exc)[:300]
            logger.warning("backup: table %s skipped: %r", name, exc)
            try:
                await db.rollback()
            except Exception:
                pass
        counts[name] = n
        yield b"]"

    yield b"}"  # close "tables"
    yield b', "counts": ' + json.dumps(counts).encode("utf-8")
    yield b', "secrets_redacted": ' + (b"true" if redact_secrets else b"false")
    if capped:
        yield b', "capped_tables": ' + json.dumps(capped).encode("utf-8")
    if errors:
        yield b', "table_errors": ' + json.dumps(errors, ensure_ascii=False).encode("utf-8")
    yield b"}"


async def export_all_tables(
    db: AsyncSession, *, redact_secrets: bool = False
) -> Dict[str, Any]:
    """Materialize the full export into a dict by draining
    ``iter_export_bytes`` (ONE serialization code path). Kept for the direct
    unit test and any small/ad-hoc caller.

    NOTE: this holds the whole export in memory — the production paths
    (``run_backup``, the HTTP ``/export``) stream instead and must NOT call
    this on a large DB.
    """
    buf = bytearray()
    async for chunk in iter_export_bytes(db, redact_secrets=redact_secrets):
        buf.extend(chunk)
    return json.loads(bytes(buf).decode("utf-8"))


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


async def _stream_gzip_to_file(db: AsyncSession, dest: Path) -> Dict[str, Any]:
    """Stream the full export into a gzip file at ``dest`` and return the
    ``sink`` (counts / capped_tables / table_errors). Peak RAM is one row +
    the gzip window — the DB is never held whole."""
    sink: Dict[str, Any] = {}
    # compresslevel=6: solid ratio without the CPU spikes of 9 on the free tier.
    with gzip.open(dest, "wb", compresslevel=6) as gz_out:
        async for chunk in iter_export_bytes(db, sink=sink):
            gz_out.write(chunk)
    return sink


async def run_backup(db: AsyncSession, now: Optional[datetime] = None) -> Dict[str, Any]:
    """Build the full export, gzip it to disk, and put it somewhere safe.

    Drive first (``LifeManagerData/Backups/``); local ``BACKUPS_DIR`` fallback
    when Drive is unavailable (result marked ``degraded``). NEVER raises —
    every failure collapses to ``{"ok": False, ...}`` and the status blob
    records the attempt either way.

    Memory-safe (2026-07-21): the export streams row-by-row straight into a
    gzip temp file on disk; only the (small, log-capped) compressed file is
    ever read back into RAM for the Drive upload.
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
    tmp_path: Optional[Path] = None
    try:
        directory = Path(BACKUPS_DIR)
        directory.mkdir(parents=True, exist_ok=True)
        # Stream-gzip to a temp file in the SAME directory so the final move is
        # an atomic rename (no cross-filesystem copy, no partial file ever
        # matching the "lifemanager-backup-*" glob the pruner walks).
        fd, tmp_name = tempfile.mkstemp(prefix=".backup-tmp-", suffix=".json.gz", dir=str(directory))
        os.close(fd)
        tmp_path = Path(tmp_name)

        sink = await _stream_gzip_to_file(db, tmp_path)
        counts = sink.get("counts", {})
        size_bytes = tmp_path.stat().st_size

        file_name = f"lifemanager-backup-{now:%Y%m%d-%H%M%S}.json.gz"
        result["file_name"] = file_name
        result["size_bytes"] = size_bytes
        result["counts"] = counts
        if sink.get("capped_tables"):
            result["capped_tables"] = sink["capped_tables"]
        if sink.get("table_errors"):
            result["table_errors"] = sink["table_errors"]

        drive_error: Optional[str] = None
        try:
            from app.services import drive_settings_service as dss
            from app.services import google_drive_service
            from app.services.google_api_client import build_drive_client

            drive_client = await build_drive_client(db)
            if drive_client is not None:
                refresh_token = await dss.resolve_refresh_token(db)
                # The file is small (content + capped logs); read it back once
                # for the upload seam that expects an in-memory media blob.
                gz_media = tmp_path.read_bytes()
                info = await google_drive_service.upload_file(
                    refresh_token=refresh_token,
                    file_name=file_name,
                    data_type=BACKUP_SUBFOLDER,
                    media=gz_media,
                    client=drive_client,
                )
                result["drive_file_id"] = info.get("drive_file_id")
        except Exception as exc:  # Drive down ≠ backup lost — degrade to local
            drive_error = repr(exc)[:300]
            logger.warning("backup: Drive upload failed, falling back local: %r", exc)

        if result["drive_file_id"]:
            # Drive holds the durable copy — the temp file is no longer needed.
            result["ok"] = result["success"] = True
            result["detail_fa"] = "پشتیبان‌گیری کامل شد و روی گوگل درایو ذخیره شد."
            try:
                tmp_path.unlink()
            except Exception:
                pass
            tmp_path = None
        else:
            # Keep it as the local fallback: atomic rename temp → final name.
            local_path = directory / file_name
            tmp_path.replace(local_path)
            tmp_path = None
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
                "last_size_bytes": size_bytes,
                "last_drive_file_id": result["drive_file_id"],
                "last_counts_total": sum(counts.values()),
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
    finally:
        # Never leave a half-written temp file behind (error path, or a Drive
        # success that already unlinked sets tmp_path=None so this is a no-op).
        if tmp_path is not None:
            try:
                tmp_path.unlink()
            except Exception:
                pass

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
