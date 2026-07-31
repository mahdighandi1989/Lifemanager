"""نگهبان اتصال موبایل — is every paired phone still reporting?

The companion app heartbeats every ~30 minutes. A phone that has EVER
reported and has now been silent longer than the threshold is «قطع»:

  * the watchdog job (jobs_engine, every ~15 min) sends a Telegram/critical
    notification the moment a device crosses the threshold, and REPEATS the
    alert on a cooldown while the silence continues («اگر وصل نشد پیام مجدد»);
    reconnection sends a one-time «وصل شد» all-clear.
  * the daily digest asks :func:`silent_devices` and puts the outage at the
    TOP of the report while it is still ongoing.

State (last-alert times) lives in global_settings — no new table.
"""
from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

_STATE_KEY = "mobile_watchdog_state"
_MOBILE_ACTIONS = ("mobile_heartbeat", "mobile_sms", "mobile_notification", "mobile_usage")


def _threshold_minutes() -> float:
    try:
        return float(os.getenv("MOBILE_SILENCE_THRESHOLD_MINUTES", "90"))
    except Exception:
        return 90.0


def _realert_minutes() -> float:
    try:
        return float(os.getenv("MOBILE_SILENCE_REALERT_MINUTES", "360"))
    except Exception:
        return 360.0


async def device_last_seen(db: AsyncSession) -> Dict[str, datetime]:
    """Newest mobile signal per device (devices that ever reported)."""
    from app.models.activity_log import ActivityLog

    rows = (
        await db.execute(
            select(ActivityLog.context_id, ActivityLog.created_at)
            .where(
                ActivityLog.action.in_(_MOBILE_ACTIONS),
                ActivityLog.context_type == "device",
            )
            .order_by(ActivityLog.created_at.desc(), ActivityLog.id.desc())
            .limit(500)
        )
    ).all()
    seen: Dict[str, datetime] = {}
    for device, at in rows:
        if device and at is not None and device not in seen:
            seen[device] = at if at.tzinfo else at.replace(tzinfo=timezone.utc)
    return seen


async def silent_devices(db: AsyncSession, now: datetime | None = None) -> List[Dict[str, Any]]:
    """Devices past the silence threshold: [{device, last_seen, minutes}]."""
    now = now or datetime.now(timezone.utc)
    threshold = _threshold_minutes()
    out: List[Dict[str, Any]] = []
    try:
        for device, last in (await device_last_seen(db)).items():
            minutes = (now - last).total_seconds() / 60.0
            if minutes >= threshold:
                out.append({
                    "device": device,
                    "last_seen": last.isoformat(),
                    "minutes": round(minutes),
                })
    except Exception as exc:  # the digest must never die on the watchdog
        logger.debug("silent_devices skipped: %r", exc)
    return out


async def _load_state(db: AsyncSession) -> dict:
    from app.models.global_setting import GlobalSetting

    row = (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == _STATE_KEY))
    ).scalar_one_or_none()
    try:
        return json.loads(row.value) if row and row.value else {}
    except Exception:
        return {}


async def _save_state(db: AsyncSession, state: dict) -> None:
    from app.models.global_setting import GlobalSetting

    row = (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == _STATE_KEY))
    ).scalar_one_or_none()
    payload = json.dumps(state, ensure_ascii=False)
    if row is None:
        db.add(GlobalSetting(key=_STATE_KEY, value=payload))
    else:
        row.value = payload


async def watchdog_tick(db: AsyncSession) -> Dict[str, Any]:
    """One pass: alert on newly-silent devices, re-alert on a cooldown while
    the silence lasts, send the all-clear on reconnection. Returns a summary
    (the jobs engine records it in the job stamp)."""
    from app.services.notification_service import notify_event

    now = datetime.now(timezone.utc)
    silent = await silent_devices(db, now)
    silent_names = {d["device"] for d in silent}
    state = await _load_state(db)
    alerted: dict = state.get("alerted", {})
    sent = cleared = 0

    for item in silent:
        device = item["device"]
        last_alert_iso = alerted.get(device)
        due = True
        if last_alert_iso:
            try:
                last_alert = datetime.fromisoformat(last_alert_iso)
                due = (now - last_alert).total_seconds() / 60.0 >= _realert_minutes()
            except Exception:
                due = True
        if due:
            try:
                await notify_event(
                    "mobile_offline",
                    user_id=0,
                    db=db,
                    title="📵 اتصال موبایل قطع است",
                    message=(
                        f"گوشی «{device}» از {item['minutes']} دقیقه پیش هیچ سیگنالی "
                        f"نفرستاده (آخرین نبض: {item['last_seen'][:16]}). اپ همراه یا "
                        f"اینترنت گوشی را چک کن — تا وصل نشود این پیام تکرار می‌شود."
                    ),
                    priority="high",
                )
                alerted[device] = now.isoformat()
                sent += 1
            except Exception as exc:
                logger.debug("mobile watchdog alert failed for %s: %r", device, exc)

    # reconnected devices → one all-clear, then forget them.
    for device in [d for d in list(alerted.keys()) if d not in silent_names]:
        try:
            await notify_event(
                "mobile_online",
                user_id=0,
                db=db,
                title="✅ اتصال موبایل برگشت",
                message=f"گوشی «{device}» دوباره سیگنال می‌فرستد.",
                priority="normal",
            )
            cleared += 1
        except Exception:
            pass
        alerted.pop(device, None)

    state["alerted"] = alerted
    await _save_state(db, state)
    await db.commit()  # the cooldown memory must survive this tick's session
    return {"silent": len(silent), "alerts_sent": sent, "all_clear": cleared}
