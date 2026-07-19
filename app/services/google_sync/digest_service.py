"""Daily personal digest — «گزارش روز من»: امروز/فردا در تقویم، ایمیل‌های
نیازمند اقدام، و وضعیت پروژه‌های توسعه — یک‌جا، هر شب.

Delivery: notify_event("personal_digest") → in-app bell + Telegram (per
prefs), plus a REAL email to the owner via the Gmail API (gmail.send —
no SMTP needed; falls back to the SMTP channel when Gmail isn't
connected). Also mirrored into the activity log.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.personal_sync import PersonalEmail, PersonalEvent

logger = logging.getLogger(__name__)


def _fmt_hour(ts: Optional[datetime], tz_offset_minutes: int) -> str:
    if ts is None:
        return "—"
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)
    local = ts + timedelta(minutes=tz_offset_minutes)
    return local.strftime("%H:%M")


async def compose_digest(
    db: AsyncSession, now: Optional[datetime] = None, tz_offset_minutes: int = 240
) -> str:
    """Deterministic Persian digest text (works with zero AI)."""
    now = now or datetime.now(timezone.utc)
    local_now = now + timedelta(minutes=tz_offset_minutes)
    today = local_now.date()
    day_start = datetime(today.year, today.month, today.day, tzinfo=timezone.utc) - timedelta(
        minutes=tz_offset_minutes
    )
    lines: List[str] = [f"📒 گزارش روز — {today.isoformat()}"]

    # تقویم: امروز باقی‌مانده + فردا
    try:
        events = (
            (
                await db.execute(
                    select(PersonalEvent)
                    .where(
                        PersonalEvent.start_at >= day_start,
                        PersonalEvent.start_at < day_start + timedelta(days=2),
                        PersonalEvent.status != "cancelled",
                    )
                    .order_by(PersonalEvent.start_at)
                )
            )
            .scalars()
            .all()
        )
        today_ev = [e for e in events if e.start_at and _in_day(e.start_at, day_start, 0)]
        tomorrow_ev = [e for e in events if e.start_at and _in_day(e.start_at, day_start, 1)]
        if today_ev:
            lines.append("\n🗓 امروز در تقویم:")
            lines += [
                f"• {_fmt_hour(e.start_at, tz_offset_minutes) if not e.all_day else 'تمام‌روز'} — {e.summary}"
                for e in today_ev[:8]
            ]
        if tomorrow_ev:
            lines.append("\n🗓 فردا:")
            lines += [
                f"• {_fmt_hour(e.start_at, tz_offset_minutes) if not e.all_day else 'تمام‌روز'} — {e.summary}"
                for e in tomorrow_ev[:8]
            ]
        if not today_ev and not tomorrow_ev:
            lines.append("\n🗓 تقویم امروز و فردا خالی است.")
    except Exception as exc:
        logger.debug("digest calendar section skipped: %r", exc)

    # ایمیل‌های نیازمند اقدام (هنوز وظیفه نشده)
    try:
        actions = (
            (
                await db.execute(
                    select(PersonalEmail)
                    .where(
                        PersonalEmail.needs_action.is_(True),
                        PersonalEmail.task_id.is_(None),
                    )
                    .order_by(PersonalEmail.received_at.desc())
                    .limit(6)
                )
            )
            .scalars()
            .all()
        )
        if actions:
            lines.append(f"\n📧 {len(actions)} ایمیل منتظر اقدام توست:")
            lines += [f"• {(e.subject or 'بدون موضوع')[:70]} — {e.ai_summary or ''}" for e in actions]
        else:
            lines.append("\n📧 ایمیل معطل اقدامی نداری.")
    except Exception as exc:
        logger.debug("digest email section skipped: %r", exc)

    # پروژه‌های توسعه: خطاهای باز
    try:
        from sqlalchemy import func as sa_func

        from app.models.dev_sync import DevErrorIssue

        open_errors = (
            await db.execute(
                select(sa_func.count(DevErrorIssue.id)).where(DevErrorIssue.status == "open")
            )
        ).scalar() or 0
        if open_errors:
            lines.append(f"\n🛠 پروژه‌های توسعه: {open_errors} خطای باز حل‌نشده — سری به «مرکز توسعه» بزن.")
        else:
            lines.append("\n🛠 پروژه‌های توسعه: خطای باز نداری ✓")
    except Exception as exc:
        logger.debug("digest dev section skipped: %r", exc)

    return "\n".join(lines)


def _in_day(ts: datetime, day_start_utc: datetime, offset_days: int) -> bool:
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)
    start = day_start_utc + timedelta(days=offset_days)
    return start <= ts < start + timedelta(days=1)


async def send_digest(
    db: AsyncSession,
    now: Optional[datetime] = None,
    tz_offset_minutes: int = 240,
    email_enabled: bool = True,
    user_id: int = 0,
) -> Dict[str, Any]:
    """Compose + deliver the digest. Never raises."""
    text = await compose_digest(db, now=now, tz_offset_minutes=tz_offset_minutes)
    delivered: Dict[str, Any] = {"ok": True, "email": None}

    try:
        from app.services.notification_service import notify_event

        await notify_event(
            "personal_digest",
            user_id=user_id,
            db=db,
            title="📒 گزارش روز",
            message=text[:1500],
            priority="normal",
        )
    except Exception as exc:
        logger.debug("digest notify skipped: %r", exc)

    if email_enabled:
        try:
            import os

            from app.services import drive_settings_service as dss
            from app.services.google_sync.gmail_service import send_email_gmail

            local_day = ((now or datetime.now(timezone.utc)) + timedelta(minutes=tz_offset_minutes)).date()
            to = os.environ.get("NOTIFICATION_EMAIL_TO") or await dss.get_account_email(db)
            if to:
                result = await send_email_gmail(
                    db, to, f"گزارش روز — {local_day.isoformat()}", text
                )
                if not result.get("ok"):
                    # Gmail unavailable → SMTP channel (dev no-op without SMTP_HOST)
                    from app.services.notification_service import send_email as smtp_send

                    smtp_ok = smtp_send(to=to, subject="گزارش روز", body=text)
                    delivered["email"] = {"via": "smtp", "ok": bool(smtp_ok)}
                else:
                    delivered["email"] = {"via": "gmail", "ok": True}
            else:
                delivered["email"] = {"via": None, "ok": False, "error": "no_recipient"}
        except Exception as exc:
            logger.debug("digest email skipped: %r", exc)
            delivered["email"] = {"via": None, "ok": False, "error": repr(exc)[:120]}

    try:
        from app.services.activity_log_service import record_activity

        await record_activity(
            action="personal_digest",
            entity_type="personal_digest",
            entity_label="گزارش روز",
            detail=text[:1800],
            user_id=user_id,
            db=db,
        )
    except Exception as exc:
        logger.debug("digest activity mirror skipped: %r", exc)
    return delivered
