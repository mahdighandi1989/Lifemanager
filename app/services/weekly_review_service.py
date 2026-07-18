"""مرور هفتگی (weekly AI review) — phase 4 of the daily-flow roadmap.

Once a week (default جمعه, local evening) — or on demand — the service
looks back over the last 7 days across the whole app (activity log,
tasks, صندوق ورودی funnel, writings, notifications), stores a
``WeeklyReview`` row (stats JSON + Persian narrative + model
provenance), and delivers it (Telegram + in-app bell).

Narrative is fail-open: with a configured text model it is generated via
the inference gateway (AI task ``weekly_review``); without one, a
deterministic stats summary is stored and ``ai_model`` stays NULL —
the same provenance rule the inbox triage and brain dashboard follow.

Design mirrors the brain reminder / attention engine: settings in a
GlobalSetting JSON blob, a PURE ``review_decision`` helper, and a
``weekly_tick`` driven by the attention loop. No FastAPI imports.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.weekly_review import WeeklyReview

logger = logging.getLogger(__name__)

SETTINGS_KEY = "weekly_review"

# weekday uses Python's convention (Mon=0 … Fri=4=جمعه, Sat=5=شنبه).
DEFAULT_SETTINGS: Dict[str, Any] = {
    "enabled": True,
    "weekday": 4,
    "hour": 17,                 # local hour (see tz_offset_minutes)
    "tz_offset_minutes": 240,   # UTC+4 (UAE) by default, like the attention engine
    "last_run_at": None,        # ISO datetime (UTC) of the last auto run
}

WEEKDAY_FA = ["دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه", "یکشنبه"]


def _scope(col, uid: int):
    from sqlalchemy import or_

    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


# ── settings ─────────────────────────────────────────────────────────────────
async def get_settings(db: AsyncSession) -> Dict[str, Any]:
    from app.models.global_setting import GlobalSetting

    row = (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == SETTINGS_KEY))
    ).scalars().first()
    cfg = dict(DEFAULT_SETTINGS)
    if row and row.value:
        try:
            cfg.update(json.loads(row.value))
        except Exception:
            pass
    return cfg


async def update_settings(db: AsyncSession, partial: Dict[str, Any]) -> Dict[str, Any]:
    from app.models.global_setting import GlobalSetting
    from app.services.attention_service import _coerce_setting

    cfg = await get_settings(db)
    for k, v in (partial or {}).items():
        if k in DEFAULT_SETTINGS:
            ok, coerced = _coerce_setting(DEFAULT_SETTINGS[k], v)
            if ok:
                cfg[k] = coerced
    row = (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == SETTINGS_KEY))
    ).scalars().first()
    if row is None:
        row = GlobalSetting(key=SETTINGS_KEY, value=json.dumps(cfg, ensure_ascii=False))
        db.add(row)
    else:
        row.value = json.dumps(cfg, ensure_ascii=False)
    await db.commit()
    return cfg


def review_decision(cfg: Dict[str, Any], now_utc: datetime) -> bool:
    """Pure decision: the weekly slot (local weekday+hour) has arrived and
    no auto run has happened in the last 6 days."""
    if not cfg.get("enabled", True):
        return False
    local = now_utc + timedelta(minutes=int(cfg.get("tz_offset_minutes", 240)))
    if local.weekday() != int(cfg.get("weekday", 4)) or local.hour < int(cfg.get("hour", 17)):
        return False
    last = cfg.get("last_run_at")
    if not last:
        return True
    try:
        last_dt = datetime.fromisoformat(last)
        if last_dt.tzinfo is None:
            last_dt = last_dt.replace(tzinfo=timezone.utc)
    except ValueError:
        return True
    return (now_utc - last_dt) >= timedelta(days=6)


# ── stats gathering ──────────────────────────────────────────────────────────
async def gather_stats(
    db: AsyncSession, user_id: int, start: datetime, end: datetime
) -> Dict[str, Any]:
    """Collect the week's numbers. Each block fail-opens alone so one broken
    table never blanks the whole report."""
    stats: Dict[str, Any] = {
        "window": {"start": start.date().isoformat(), "end": end.date().isoformat()},
    }

    # activity log — the week as (entity_type, action) counts
    try:
        from app.models.activity_log import ActivityLog

        rows = (
            await db.execute(
                select(ActivityLog.entity_type, ActivityLog.action, func.count())
                .where(
                    _scope(ActivityLog.user_id, user_id),
                    ActivityLog.created_at >= start,
                    ActivityLog.created_at < end,
                )
                .group_by(ActivityLog.entity_type, ActivityLog.action)
            )
        ).all()
        activity: Dict[str, Dict[str, int]] = {}
        total = 0
        for entity_type, action, count in rows:
            activity.setdefault(entity_type or "other", {})[action] = int(count)
            total += int(count)
        stats["activity"] = activity
        stats["activity_total"] = total
    except Exception as exc:
        logger.warning("weekly stats: activity block skipped: %r", exc)

    # tasks — completed this week (activity lens) + current open/overdue
    try:
        from app.models.task import Task, TaskStatus

        activity = stats.get("activity", {})
        task_acts = activity.get("task", {})
        stats["tasks"] = {
            "created": task_acts.get("create", 0),
            "completed": task_acts.get("complete", 0),
            "open_now": int(
                (
                    await db.execute(
                        select(func.count()).select_from(Task).where(
                            _scope(Task.user_id, user_id),
                            Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS]),
                            Task.merged_into_id.is_(None),
                        )
                    )
                ).scalar()
                or 0
            ),
        }
        overdue_rows = (
            await db.execute(
                select(Task.title).where(
                    _scope(Task.user_id, user_id),
                    Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS]),
                    Task.merged_into_id.is_(None),
                    Task.due_date.isnot(None),
                    Task.due_date < end.date(),
                ).limit(5)
            )
        ).scalars().all()
        stats["tasks"]["overdue_titles"] = list(overdue_rows)
    except Exception as exc:
        logger.warning("weekly stats: tasks block skipped: %r", exc)

    # صندوق ورودی funnel
    try:
        from app.models.inbox_item import InboxItem

        captured = int(
            (
                await db.execute(
                    select(func.count()).select_from(InboxItem).where(
                        _scope(InboxItem.user_id, user_id),
                        InboxItem.created_at >= start,
                        InboxItem.created_at < end,
                    )
                )
            ).scalar()
            or 0
        )
        inbox_acts = stats.get("activity", {}).get("inbox_item", {})
        pending_now = int(
            (
                await db.execute(
                    select(func.count()).select_from(InboxItem).where(
                        _scope(InboxItem.user_id, user_id), InboxItem.status == "pending"
                    )
                )
            ).scalar()
            or 0
        )
        stats["inbox"] = {
            "captured": captured,
            "filed": inbox_acts.get("file", 0),
            "dismissed": inbox_acts.get("dismiss", 0),
            "pending_now": pending_now,
        }
    except Exception as exc:
        logger.warning("weekly stats: inbox block skipped: %r", exc)

    # writings + notifications volume
    try:
        from app.models.personal_writing import PersonalWriting

        stats["writings_created"] = int(
            (
                await db.execute(
                    select(func.count()).select_from(PersonalWriting).where(
                        _scope(PersonalWriting.user_id, user_id),
                        PersonalWriting.created_at >= start,
                        PersonalWriting.created_at < end,
                    )
                )
            ).scalar()
            or 0
        )
    except Exception as exc:
        logger.warning("weekly stats: writings block skipped: %r", exc)
    try:
        from app.models.notification import Notification

        stats["notifications_received"] = int(
            (
                await db.execute(
                    select(func.count()).select_from(Notification).where(
                        Notification.user_id == user_id,
                        Notification.created_at >= start,
                        Notification.created_at < end,
                    )
                )
            ).scalar()
            or 0
        )
    except Exception as exc:
        logger.warning("weekly stats: notifications block skipped: %r", exc)

    return stats


# ── narrative ────────────────────────────────────────────────────────────────
def fallback_narrative(stats: Dict[str, Any]) -> str:
    """Deterministic Persian summary used when no text model is configured."""
    tasks = stats.get("tasks", {})
    inbox = stats.get("inbox", {})
    window = stats.get("window", {})
    lines = [
        f"مرور هفته ({window.get('start', '?')} تا {window.get('end', '?')}):",
        f"• فعالیت ثبت‌شده: {stats.get('activity_total', 0)} مورد",
        f"• تسک: {tasks.get('created', 0)} ساخته، {tasks.get('completed', 0)} تکمیل، "
        f"{tasks.get('open_now', 0)} باز",
        f"• صندوق ورودی: {inbox.get('captured', 0)} ثبت، {inbox.get('filed', 0)} بایگانی، "
        f"{inbox.get('pending_now', 0)} در انتظار",
    ]
    if stats.get("writings_created"):
        lines.append(f"• نوشته‌های جدید: {stats['writings_created']}")
    overdue = tasks.get("overdue_titles") or []
    if overdue:
        lines.append("• عقب‌افتاده‌های فعلی: " + "، ".join(overdue[:5]))
    lines.append("(تحلیل هوشمند در دسترس نبود — مدل متنی پیکربندی نشده است.)")
    return "\n".join(lines)


_NARRATIVE_PROMPT = """تو مربی و مدیر برنامهٔ زندگی کاربر هستی. آمار هفتهٔ گذشته‌اش از سیستم مدیریت زندگی این است:

{stats}

یک «مرور هفتگی» فارسی بنویس (حداکثر ۱۲ خط، بدون مقدمهٔ اضافه) با این ساختار:
۱. این هفته چه شد (دستاوردها با عدد)
۲. چه چیزهایی عقب ماند یا رها شد (صریح ولی مهربان)
۳. سه پیشنهاد مشخص و عملی برای هفتهٔ بعد
"""


async def _ai_narrative(db: AsyncSession, stats: Dict[str, Any]) -> tuple[Optional[str], Optional[str]]:
    try:
        from app.services.ai.inference_gateway import complete

        payload = json.dumps(stats, ensure_ascii=False)[:5000]
        res = await complete(
            db, _NARRATIVE_PROMPT.format(stats=payload), task="weekly_review", max_tokens=900
        )
        if res.get("ok") and res.get("text", "").strip():
            return res["text"].strip()[:8000], res.get("model")
    except Exception as exc:
        logger.debug("weekly review AI narrative skipped: %r", exc)
    return None, None


# ── generation + delivery ────────────────────────────────────────────────────
def serialize(row: WeeklyReview) -> Dict[str, Any]:
    return {
        "id": row.id,
        "user_id": row.user_id,
        "week_start": row.week_start.isoformat() if row.week_start else None,
        "week_end": row.week_end.isoformat() if row.week_end else None,
        "stats": row.stats,
        "narrative": row.narrative,
        "ai_model": row.ai_model,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


async def generate_review(
    db: AsyncSession,
    *,
    user_id: int = 0,
    now: Optional[datetime] = None,
    deliver: bool = True,
    manual: bool = True,
) -> WeeklyReview:
    """Build + store this week's review (window = the trailing 7 days) and
    deliver it. Never raises out of the delivery step.

    Delivery honours the notification-preference toggles the catalog
    advertises for ``weekly_review`` (the scheduled path skips Telegram when
    the event is switched off; a ``manual`` run-now still sends unless the
    telegram CHANNEL itself is off) — mirroring the morning brief.
    """
    now = now or datetime.now(timezone.utc)
    start = now - timedelta(days=7)
    stats = await gather_stats(db, user_id, start, now)
    narrative, model = await _ai_narrative(db, stats)
    if not narrative:
        narrative = fallback_narrative(stats)
        model = None
    row = WeeklyReview(
        user_id=user_id,
        week_start=start.date(),
        week_end=now.date(),
        stats=stats,
        narrative=narrative,
        ai_model=model,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)

    if deliver:
        try:
            from app.services import notification_prefs as _prefs

            event_on = _prefs.event_enabled("weekly_review")
            telegram_on = _prefs.channel_enabled("telegram")
        except Exception:
            event_on, telegram_on = True, True
        try:
            from app.services.telegram_service import get_telegram_bot

            bot = get_telegram_bot()
            if telegram_on and (manual or event_on) and bot.is_configured():
                await bot.send(f"📒 *مرور هفتگی*\n\n{narrative}", silent=True)
        except Exception as exc:
            logger.warning("weekly review telegram send failed: %r", exc)
        try:
            from app.services.notification_service import notify_event

            await notify_event(
                "weekly_review",
                user_id=user_id,
                db=db,
                title="📒 مرور هفتگی آماده است",
                message=narrative[:1000],
                priority="normal",
                silent=True,
            )
        except Exception as exc:
            logger.warning("weekly review notification failed: %r", exc)
    return row


async def weekly_tick(db: AsyncSession, now: Optional[datetime] = None) -> Optional[WeeklyReview]:
    """One scheduler cycle: run the review when its weekly slot arrives."""
    import os

    now = now or datetime.now(timezone.utc)
    cfg = await get_settings(db)
    if not review_decision(cfg, now):
        return None
    try:
        uid = int(os.environ.get("TELEGRAM_TASK_USER_ID", "0") or "0")
    except (TypeError, ValueError):
        uid = 0
    row = await generate_review(db, user_id=uid, now=now, manual=False)
    await update_settings(db, {"last_run_at": now.isoformat()})
    return row


async def list_reviews(
    db: AsyncSession, user_id: int = 0, limit: int = 20
) -> List[WeeklyReview]:
    return (
        await db.execute(
            select(WeeklyReview)
            .where(_scope(WeeklyReview.user_id, user_id))
            .order_by(WeeklyReview.id.desc())
            .limit(limit)
        )
    ).scalars().all()
