"""Dev-sync engine — the periodic loop driving repo/service/log sync,
retention cleanup and the nightly Persian summary.

Design mirrors the attention engine (the repo's binding pattern for
periodic work — no worker/broker needed on the free tier):

* settings + stamps live in ONE GlobalSetting JSON blob (key
  ``dev_sync_engine``) — ephemeral hosts wipe files, the DB survives;
* precedence DEFAULTS < env vars < blob (env lets the owner configure
  everything from Render's dashboard; the UI writes the blob);
* PURE decision helpers (``due``/``summary_decision``) so cadence logic is
  matrix-testable without sleeps;
* ``dev_sync_tick`` runs at a fixed short cadence and each concern decides
  for itself whether it is due; fail-open per concern;
* ``dev_sync_loop(stop_event)`` started/stopped from app/main.py.
"""
from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

SETTINGS_KEY = "dev_sync_engine"

DEFAULT_SETTINGS: Dict[str, Any] = {
    "enabled": True,
    "tz_offset_minutes": 240,          # same default as the attention engine
    "repo_sync_interval_minutes": 60,  # GitHub repo inventory
    "service_sync_interval_minutes": 30,
    "log_poll_seconds": 120,           # background poll (the UI live tab polls faster itself)
    "log_fetch_limit": 100,
    "retention_hours": 72,
    "cleanup_interval_minutes": 360,
    "summary_enabled": True,
    "summary_hour": 22,                # local hour the daily digest is written
    "error_attention_threshold": 20,   # errors/24h that flag a project as needs-attention
    "stale_repo_days": 14,
    # stamps (never editable from the UI):
    "last_repo_sync_at": None,
    "last_service_sync_at": None,
    "last_log_poll_at": None,
    "last_cleanup_at": None,
    "last_summary_date": None,
}

_ENV_KEYS = {
    "enabled": ("DEV_SYNC_ENABLED", "bool"),
    "tz_offset_minutes": ("DEV_TZ_OFFSET_MINUTES", "int"),
    "repo_sync_interval_minutes": ("DEV_REPO_SYNC_INTERVAL_MINUTES", "int"),
    "service_sync_interval_minutes": ("DEV_SERVICE_SYNC_INTERVAL_MINUTES", "int"),
    "log_poll_seconds": ("DEV_LOG_POLL_SECONDS", "int"),
    "log_fetch_limit": ("DEV_LOG_FETCH_LIMIT", "int"),
    "retention_hours": ("DEV_LOG_RETENTION_HOURS", "int"),
    "summary_enabled": ("DEV_SUMMARY_ENABLED", "bool"),
    "summary_hour": ("DEV_SUMMARY_HOUR", "int"),
}

# Fields the PUT /api/dev/settings endpoint may change. Stamps are excluded on
# purpose — echoing them back from a settings form must never rewind the
# scheduler (repo lesson: settings-form echo double-send).
EDITABLE_FIELDS = (
    "enabled",
    "tz_offset_minutes",
    "repo_sync_interval_minutes",
    "service_sync_interval_minutes",
    "log_poll_seconds",
    "log_fetch_limit",
    "retention_hours",
    "cleanup_interval_minutes",
    "summary_enabled",
    "summary_hour",
    "error_attention_threshold",
    "stale_repo_days",
)

_BOOL_FIELDS = {"enabled", "summary_enabled"}


def _env_overrides() -> Dict[str, Any]:
    out: Dict[str, Any] = {}
    for field, (env_key, kind) in _ENV_KEYS.items():
        raw = os.environ.get(env_key)
        if raw is None or raw == "":
            continue
        try:
            if kind == "bool":
                out[field] = raw.strip().lower() not in ("0", "false", "no", "off")
            else:
                out[field] = int(raw)
        except Exception:
            continue
    return out


def _coerce(field: str, value: Any) -> Optional[Any]:
    """Type-guard a settings write (repo lesson: '' must never land in an int
    field — int('') killed a scheduler silently). None ⇒ reject."""
    if field in _BOOL_FIELDS:
        if isinstance(value, bool):
            return value
        return None
    if isinstance(value, bool):  # bools are ints in Python — reject for int fields
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


async def _load_blob(db: AsyncSession) -> Dict[str, Any]:
    """The RAW stored blob — only what the UI saved + engine stamps. Env
    values and defaults are merged at read time (load_settings) and must
    never be written back, or the blob would permanently freeze them."""
    from app.models.global_setting import GlobalSetting

    try:
        row = (
            await db.execute(select(GlobalSetting).where(GlobalSetting.key == SETTINGS_KEY))
        ).scalar_one_or_none()
        if row and row.value:
            stored = json.loads(row.value)
            if isinstance(stored, dict):
                return stored
    except Exception as exc:
        logger.debug("dev_sync settings load failed: %r", exc)
    return {}


async def _save_blob(db: AsyncSession, blob: Dict[str, Any]) -> None:
    from app.models.global_setting import GlobalSetting

    row = (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == SETTINGS_KEY))
    ).scalar_one_or_none()
    payload = json.dumps(blob, ensure_ascii=False)
    if row is None:
        row = GlobalSetting(key=SETTINGS_KEY, value=payload)
        db.add(row)
    else:
        row.value = payload
    await db.commit()


async def load_settings(db: AsyncSession) -> Dict[str, Any]:
    """Merged view: DEFAULTS < env vars < stored blob."""
    cfg: Dict[str, Any] = dict(DEFAULT_SETTINGS)
    cfg.update(_env_overrides())
    cfg.update(await _load_blob(db))
    return cfg


async def save_settings(db: AsyncSession, cfg: Dict[str, Any]) -> None:
    """Back-compat full-blob write. Prefer update_settings/_write_stamps —
    persisting a MERGED config bakes env/default values into the blob."""
    await _save_blob(db, cfg)


async def _write_stamps(db: AsyncSession, stamps: Dict[str, Any]) -> None:
    """Persist ONLY the given stamp keys via a fresh read-modify-write of the
    raw blob, so a PUT /api/dev/settings landing mid-tick isn't clobbered by
    the tick's stale view."""
    blob = await _load_blob(db)
    blob.update(stamps)
    await _save_blob(db, blob)


async def update_settings(db: AsyncSession, changes: Dict[str, Any]) -> Dict[str, Any]:
    """Apply ONLY editable, type-valid fields to the RAW blob; returns the
    merged config."""
    blob = await _load_blob(db)
    for field in EDITABLE_FIELDS:
        if field in changes:
            coerced = _coerce(field, changes[field])
            if coerced is not None:
                blob[field] = coerced
    await _save_blob(db, blob)
    return await load_settings(db)


# ── PURE decisions ───────────────────────────────────────────────────────────
def due(last_iso: Optional[str], interval_seconds: int, now_utc: datetime) -> bool:
    if not last_iso:
        return True
    try:
        last = datetime.fromisoformat(last_iso)
        if last.tzinfo is None:
            last = last.replace(tzinfo=timezone.utc)
    except Exception:
        return True
    return (now_utc - last).total_seconds() >= max(int(interval_seconds), 1)


def summary_decision(cfg: Dict[str, Any], now_utc: datetime) -> bool:
    """Once per LOCAL day, after summary_hour."""
    if not cfg.get("summary_enabled", True):
        return False
    offset = int(cfg.get("tz_offset_minutes", 240) or 0)
    local = now_utc + timedelta(minutes=offset)
    if local.hour < int(cfg.get("summary_hour", 22) or 0):
        return False
    return cfg.get("last_summary_date") != local.date().isoformat()


# ── tick + loop ──────────────────────────────────────────────────────────────
async def _run_concern(db, result: Dict[str, Any], key: str, coro) -> None:
    """Run one concern fail-open AND roll the shared session back on failure —
    otherwise a poisoned session (PendingRollbackError) would break every
    later concern and the stamp save, re-running everything each 30s tick."""
    try:
        result[key] = await coro
    except Exception as exc:
        result[key] = {"ok": False, "error": repr(exc)[:500]}
        try:
            await db.rollback()
        except Exception:
            pass
    result["ran"].append(key)


async def dev_sync_tick(db: AsyncSession, now: Optional[datetime] = None) -> Dict[str, Any]:
    """One cycle: each concern checks its own cadence. Fail-open per concern;
    stamps advance even on failure so a broken token can't hot-loop."""
    from app.services.dev_sync import github_sync_service, log_summary_service, render_sync_service

    now = now or datetime.now(timezone.utc)
    cfg = await load_settings(db)
    result: Dict[str, Any] = {"ran": []}
    if not cfg.get("enabled", True):
        result["skipped"] = "disabled"
        return result
    now_iso = now.isoformat()
    stamps: Dict[str, Any] = {}

    if due(cfg.get("last_repo_sync_at"), int(cfg["repo_sync_interval_minutes"]) * 60, now):
        stamps["last_repo_sync_at"] = now_iso
        await _run_concern(db, result, "github", github_sync_service.sync_repos(db))

    if due(cfg.get("last_service_sync_at"), int(cfg["service_sync_interval_minutes"]) * 60, now):
        stamps["last_service_sync_at"] = now_iso
        await _run_concern(db, result, "services", render_sync_service.sync_services(db))

    if due(cfg.get("last_log_poll_at"), int(cfg["log_poll_seconds"]), now):
        stamps["last_log_poll_at"] = now_iso
        await _run_concern(
            db,
            result,
            "logs",
            render_sync_service.sync_logs(db, limit=int(cfg.get("log_fetch_limit", 100))),
        )

    if due(cfg.get("last_cleanup_at"), int(cfg.get("cleanup_interval_minutes", 360)) * 60, now):
        stamps["last_cleanup_at"] = now_iso

        async def _cleanup():
            removed = await render_sync_service.cleanup_old_logs(
                db, int(cfg.get("retention_hours", 72))
            )
            return {"ok": True, "removed": removed}

        await _run_concern(db, result, "cleanup", _cleanup())

    if summary_decision(cfg, now):
        local = now + timedelta(minutes=int(cfg.get("tz_offset_minutes", 240) or 0))
        stamps["last_summary_date"] = local.date().isoformat()

        async def _summaries():
            summaries = await log_summary_service.generate_daily_summaries(
                db,
                tz_offset_minutes=int(cfg.get("tz_offset_minutes", 240) or 0),
                now=now,
            )
            return {"ok": True, "count": len(summaries)}

        await _run_concern(db, result, "summaries", _summaries())

    if stamps:
        try:
            await _write_stamps(db, stamps)
        except Exception as exc:
            try:
                await db.rollback()
                await _write_stamps(db, stamps)
            except Exception:
                logger.warning("dev_sync stamp save failed: %r", exc)
    return result


async def dev_sync_loop(stop_event) -> None:
    """Background loop (30s cadence, 45s initial grace — after the attention
    engine's 30s so boot work doesn't pile up). Fail-open per cycle."""
    import asyncio

    try:
        await asyncio.wait_for(stop_event.wait(), timeout=45)
        return
    except asyncio.TimeoutError:
        pass
    while not stop_event.is_set():
        try:
            from app.database import SessionLocal

            async with SessionLocal() as session:
                await dev_sync_tick(session)
        except Exception as exc:
            logger.debug("dev_sync cycle skipped: %r", exc)
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=30)
        except asyncio.TimeoutError:
            continue
