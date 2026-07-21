"""Google personal-sync engine — the periodic loop the owner asked for:
«هر چند وقت یک بار همه‌چیز را فراخوانی کن، تحلیل کن، ثبت کن، یادآوری بده».

Same binding pattern as the dev-sync/attention engines: settings + stamps
in ONE GlobalSetting JSON blob (raw blob ≠ merged view, so env values are
never frozen in), pure decision helpers, short tick with per-concern
cadence, per-concern rollback, loop started from main.py.

Concerns: gmail poll → triage new mail; calendar poll; nightly digest
(in-app + Telegram + a real email via Gmail API). Reminders themselves ride
the attention engine (rules calendar_event_soon / email_needs_action) so
cooldown dedup comes free.
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

SETTINGS_KEY = "google_sync_engine"

DEFAULT_SETTINGS: Dict[str, Any] = {
    "enabled": True,
    "tz_offset_minutes": 240,
    "gmail_poll_minutes": 30,
    "gmail_fetch_limit": 25,
    "calendar_poll_minutes": 60,
    "calendar_window_days": 14,
    "drive_poll_minutes": 360,     # Drive changes slower than mail — scan every 6h
    "drive_scan_limit": 30,
    "triage_batch": 10,
    "digest_enabled": True,
    "digest_hour": 21,            # local hour the daily digest goes out
    "digest_email_enabled": True,  # send a REAL email (Gmail API / SMTP fallback)
    "event_remind_hours": 24,     # attention rule horizon
    "email_action_days": 7,       # how far back action emails keep nagging
    # stamps (never editable from the UI):
    "last_gmail_poll_at": None,
    "last_calendar_poll_at": None,
    "last_drive_poll_at": None,
    "last_digest_date": None,
}

_ENV_KEYS = {
    "enabled": ("GOOGLE_SYNC_ENABLED", "bool"),
    "tz_offset_minutes": ("GOOGLE_SYNC_TZ_OFFSET_MINUTES", "int"),
    "gmail_poll_minutes": ("GMAIL_POLL_MINUTES", "int"),
    "gmail_fetch_limit": ("GMAIL_FETCH_LIMIT", "int"),
    "calendar_poll_minutes": ("CALENDAR_POLL_MINUTES", "int"),
    "calendar_window_days": ("CALENDAR_WINDOW_DAYS", "int"),
    "digest_enabled": ("PERSONAL_DIGEST_ENABLED", "bool"),
    "digest_hour": ("PERSONAL_DIGEST_HOUR", "int"),
    "digest_email_enabled": ("PERSONAL_DIGEST_EMAIL", "bool"),
    "event_remind_hours": ("CALENDAR_REMIND_HOURS", "int"),
}

EDITABLE_FIELDS = (
    "enabled",
    "tz_offset_minutes",
    "gmail_poll_minutes",
    "gmail_fetch_limit",
    "calendar_poll_minutes",
    "calendar_window_days",
    "drive_poll_minutes",
    "drive_scan_limit",
    "triage_batch",
    "digest_enabled",
    "digest_hour",
    "digest_email_enabled",
    "event_remind_hours",
    "email_action_days",
)

_BOOL_FIELDS = {"enabled", "digest_enabled", "digest_email_enabled"}


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
    if field in _BOOL_FIELDS:
        return value if isinstance(value, bool) else None
    if isinstance(value, bool):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


async def _load_blob(db: AsyncSession) -> Dict[str, Any]:
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
        logger.debug("google_sync settings load failed: %r", exc)
    return {}


async def _save_blob(db: AsyncSession, blob: Dict[str, Any]) -> None:
    from app.models.global_setting import GlobalSetting

    row = (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == SETTINGS_KEY))
    ).scalar_one_or_none()
    payload = json.dumps(blob, ensure_ascii=False)
    if row is None:
        db.add(GlobalSetting(key=SETTINGS_KEY, value=payload))
    else:
        row.value = payload
    await db.commit()


async def load_settings(db: AsyncSession) -> Dict[str, Any]:
    cfg: Dict[str, Any] = dict(DEFAULT_SETTINGS)
    cfg.update(_env_overrides())
    cfg.update(await _load_blob(db))
    return cfg


async def _write_stamps(db: AsyncSession, stamps: Dict[str, Any]) -> None:
    blob = await _load_blob(db)
    blob.update(stamps)
    await _save_blob(db, blob)


async def update_settings(db: AsyncSession, changes: Dict[str, Any]) -> Dict[str, Any]:
    blob = await _load_blob(db)
    for field in EDITABLE_FIELDS:
        if field in changes:
            coerced = _coerce(field, changes[field])
            if coerced is not None:
                blob[field] = coerced
    await _save_blob(db, blob)
    return await load_settings(db)


# ── PURE decisions (shared shapes with the sibling engines) ──────────────────
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


def digest_decision(cfg: Dict[str, Any], now_utc: datetime) -> bool:
    if not cfg.get("digest_enabled", True):
        return False
    offset = int(cfg.get("tz_offset_minutes", 240) or 0)
    local = now_utc + timedelta(minutes=offset)
    if local.hour < int(cfg.get("digest_hour", 21) or 0):
        return False
    return cfg.get("last_digest_date") != local.date().isoformat()


def connection_decision(
    prev_state: Optional[str],
    probe_state: str,
    last_notified_iso: Optional[str],
    now_utc: datetime,
    cooldown_seconds: int = 86400,
) -> Dict[str, Any]:
    """PURE edge-trigger for the «اتصال گوگل قطع شد» alert (testable matrix).

    ``probe_state`` ∈ {connected, not_connected, token_revoked}:
      * ``not_connected`` — no refresh token at all (never linked, or the owner
        disconnected on purpose). Never alert — that's not a *drop*.
      * ``connected`` — token still works. No alert; flag reconnection when the
        previous state was disconnected (so an all-clear can fire).
      * ``token_revoked`` — a token IS stored but Google rejected it
        (invalid_grant/expired). Alert on the connected→disconnected edge, then
        stay quiet until ``cooldown_seconds`` passes (durable cooldown, so a
        persistently-revoked token doesn't nag every poll — and it survives a
        Render restart because the timestamp lives in the settings blob).
    """
    if probe_state != "token_revoked":
        return {
            "alert": False,
            "new_state": probe_state,
            "reconnected": probe_state == "connected" and prev_state == "disconnected",
        }
    if prev_state != "disconnected":
        return {"alert": True, "new_state": "disconnected", "reconnected": False}
    stale = (not last_notified_iso) or due(last_notified_iso, cooldown_seconds, now_utc)
    return {"alert": stale, "new_state": "disconnected", "reconnected": False}


# ── tick + loop ──────────────────────────────────────────────────────────────
async def _run_concern(db, result: Dict[str, Any], key: str, coro) -> None:
    try:
        result[key] = await coro
    except Exception as exc:
        result[key] = {"ok": False, "error": repr(exc)[:500]}
        try:
            await db.rollback()
        except Exception:
            pass
    result["ran"].append(key)


async def _check_connection(
    db: AsyncSession, cfg: Dict[str, Any], now: datetime, now_iso: str
) -> Dict[str, Any]:
    """Probe the Google connection three-ways and, on the connected→disconnected
    edge, fire a Telegram-fanned «اتصال گوگل قطع شد» alert so the owner learns of
    a revoked token WITHOUT visiting any page. Writes durable state into the
    settings blob. Never raises (runs as a sync concern)."""
    import os

    from app.services.drive_settings_service import resolve_refresh_token
    from app.services.google_api_client import refresh_access_token_details

    rt = await resolve_refresh_token(db)
    if not rt:
        probe_state, reason = "not_connected", None
    else:
        token, reason = await refresh_access_token_details(rt)
        probe_state = "connected" if token else "token_revoked"

    prev = cfg.get("google_conn_state")
    dec = connection_decision(
        prev, probe_state, cfg.get("google_disconnect_notified_at"), now
    )
    stamps: Dict[str, Any] = {"google_conn_state": dec["new_state"]}
    if probe_state == "connected":
        stamps["last_gmail_success_at"] = now_iso

    uid = int(os.environ.get("TELEGRAM_TASK_USER_ID", "0") or 0)
    if dec.get("alert"):
        stamps["google_disconnect_notified_at"] = now_iso
        try:
            from app.services.notification_service import notify_event

            await notify_event(
                "google_disconnected",
                user_id=uid,
                db=db,
                title="⚠️ اتصال گوگل قطع شد",
                message=(
                    "گوگل توکنِ ذخیره‌شده را رد کرد؛ Gmail/تقویم/Drive تا اتصالِ دوباره "
                    "کار نمی‌کنند. در تنظیمات «اتصال به گوگل» را دوباره بزن."
                    + (f" (جزئیات: {reason[:120]})" if reason else "")
                ),
                priority="high",
            )
        except Exception as exc:  # notification must never break the loop
            logger.debug("google_disconnected notify failed: %r", exc)
    elif dec.get("reconnected"):
        try:
            from app.services.notification_service import notify_event

            await notify_event(
                "google_reconnected",
                user_id=uid,
                db=db,
                title="✅ اتصال گوگل برقرار شد",
                message="Gmail/تقویم/Drive دوباره وصل شد.",
            )
        except Exception as exc:
            logger.debug("google_reconnected notify failed: %r", exc)

    await _write_stamps(db, stamps)
    return {"ok": True, "state": dec["new_state"], "probe": probe_state}


async def google_sync_tick(db: AsyncSession, now: Optional[datetime] = None) -> Dict[str, Any]:
    from app.services.google_sync import (
        calendar_service,
        digest_service,
        gmail_service,
        triage_service,
    )

    now = now or datetime.now(timezone.utc)
    cfg = await load_settings(db)
    result: Dict[str, Any] = {"ran": []}
    if not cfg.get("enabled", True):
        result["skipped"] = "disabled"
        return result
    now_iso = now.isoformat()
    stamps: Dict[str, Any] = {}

    if due(cfg.get("last_gmail_poll_at"), int(cfg["gmail_poll_minutes"]) * 60, now):
        stamps["last_gmail_poll_at"] = now_iso

        async def _gmail():
            sync = await gmail_service.sync_gmail(
                db, max_results=int(cfg.get("gmail_fetch_limit", 25))
            )
            triage = await triage_service.analyze_new_emails(
                db, limit=int(cfg.get("triage_batch", 10))
            )
            return {"sync": sync, "triage": triage, "ok": sync.get("ok", False)}

        await _run_concern(db, result, "gmail", _gmail())

        # Connection health rides the Gmail cadence: on the connected→disconnected
        # edge it alerts (Telegram) so a revoked token surfaces without the owner
        # visiting any page. Its own durable state/stamps, so it's isolated.
        await _run_concern(db, result, "connection", _check_connection(db, cfg, now, now_iso))

    if due(cfg.get("last_calendar_poll_at"), int(cfg["calendar_poll_minutes"]) * 60, now):
        stamps["last_calendar_poll_at"] = now_iso
        await _run_concern(
            db,
            result,
            "calendar",
            calendar_service.sync_calendar(db, days=int(cfg.get("calendar_window_days", 14))),
        )

    # Drive feeding source: on its own (slow) cadence, list the Drive and turn
    # each new readable file into a review candidate — «از گوگل درایو همه‌چیز را
    # ببیند». Opt-in + a clean no-op when Drive isn't connected.
    if due(cfg.get("last_drive_poll_at"), int(cfg.get("drive_poll_minutes", 360)) * 60, now):
        stamps["last_drive_poll_at"] = now_iso

        async def _drive():
            from app.services.ingest import drive_ingest

            if not await drive_ingest.is_enabled(db):
                return {"ok": True, "skipped": "disabled"}
            return await drive_ingest.scan_drive(
                db, user_id=0, limit=int(cfg.get("drive_scan_limit", 30))
            )

        await _run_concern(db, result, "drive", _drive())

    if digest_decision(cfg, now):
        local = now + timedelta(minutes=int(cfg.get("tz_offset_minutes", 240) or 0))
        stamps["last_digest_date"] = local.date().isoformat()
        await _run_concern(
            db,
            result,
            "digest",
            digest_service.send_digest(
                db,
                now=now,
                tz_offset_minutes=int(cfg.get("tz_offset_minutes", 240) or 0),
                email_enabled=bool(cfg.get("digest_email_enabled", True)),
            ),
        )

    if stamps:
        try:
            await _write_stamps(db, stamps)
        except Exception as exc:
            try:
                await db.rollback()
                await _write_stamps(db, stamps)
            except Exception:
                logger.warning("google_sync stamp save failed: %r", exc)
    return result


async def google_sync_loop(stop_event) -> None:
    """Background loop (60s cadence, 60s initial grace — third loop after
    attention/dev-sync, staggered so boot work doesn't pile up)."""
    import asyncio

    try:
        await asyncio.wait_for(stop_event.wait(), timeout=60)
        return
    except asyncio.TimeoutError:
        pass
    while not stop_event.is_set():
        try:
            from app.database import SessionLocal

            async with SessionLocal() as session:
                await google_sync_tick(session)
        except Exception as exc:
            logger.debug("google_sync cycle skipped: %r", exc)
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=60)
        except asyncio.TimeoutError:
            continue
