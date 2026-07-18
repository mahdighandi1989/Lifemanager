"""موتور توجه و یادآوری (attention engine) — phase 3 of the daily-flow roadmap.

Periodically scans EVERY module that carries a date and turns what needs
the owner's attention into notifications (in-app bell + Telegram via the
existing ``notify_event`` channel routing), plus a daily «صبح‌بخیر»
morning brief with the day's agenda.

v1 rules (only columns that actually exist — no speculation):

* ``task_overdue`` / ``task_due_today`` — open tasks by due_date/deadline
  (same bucket logic as the command center).
* ``todo_overdue``          — incomplete list items past their due_date.
* ``license_expiry``        — UAEDrivingLicenseRecord.expiry_date (real Date)
  within ``expiry_days`` (or already past).
* ``document_expiry``       — IdentityDocument.expiry_date (string "14 Aug
  2027" as shown on the card) — parsed best-effort, unparseable → skipped.
* ``subscription_renewal``  — SubscriptionAccount.next_payment_date (string
  "June 25, 2026") within ``subscription_days``.
* ``inbox_stale``           — pending صندوق ورودی captures older than
  ``inbox_stale_hours`` (one aggregate finding).

Dedup: ``attention_marks`` remembers what was already alerted
(``{rule}:{entity_id}``); each rule has a cooldown so the nag cadence is
sane (daily for overdue tasks, weekly for expiring documents) instead of
every cycle. Design mirrors the brain reminder: settings in a
GlobalSetting JSON blob, a PURE decision helper for the brief, a
``*_tick`` per cycle, and an ``attention_loop(stop_event)`` started from
main.py. Fail-open everywhere; no FastAPI imports.
"""
from __future__ import annotations

import json
import logging
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attention_mark import AttentionMark

logger = logging.getLogger(__name__)

SETTINGS_KEY = "attention_engine"

# tz_offset_minutes: the brief/scan hours are LOCAL to the owner; default
# +240 = UTC+4 (UAE). Stored per-install in the settings blob, editable
# from the «مراقبت و مرور» page.
DEFAULT_SETTINGS: Dict[str, Any] = {
    "enabled": True,
    "tz_offset_minutes": 240,
    "brief_enabled": True,
    "brief_hour": 7,             # local hour the morning brief goes out
    "last_brief_date": None,     # ISO date (local) of the last brief
    "expiry_days": 30,           # docs/license lookahead horizon
    "subscription_days": 14,
    "inbox_stale_hours": 48,
    "scan_interval_minutes": 30,
    "last_scan_at": None,        # ISO datetime (UTC) of the last rule scan
}

# Per-rule re-alert cooldown (hours). An entity stays quiet for this long
# after its alert, then may fire again if still matching.
RULE_COOLDOWN_HOURS: Dict[str, int] = {
    "task_overdue": 24,
    "task_due_today": 24,
    "todo_overdue": 24,
    "license_expiry": 168,
    "document_expiry": 168,
    "subscription_renewal": 72,
    "inbox_stale": 24,
}

RULE_TITLES_FA: Dict[str, str] = {
    "task_overdue": "⏰ تسک‌های عقب‌افتاده",
    "task_due_today": "📅 موعد امروز",
    "todo_overdue": "☑️ آیتم‌های لیستیِ عقب‌افتاده",
    "license_expiry": "🪪 انقضای گواهینامه",
    "document_expiry": "📄 انقضای مدرک هویتی",
    "subscription_renewal": "💳 موعد پرداخت اشتراک",
    "inbox_stale": "📥 صندوق ورودی منتظر توست",
}

RULE_PRIORITIES: Dict[str, str] = {
    "task_overdue": "high",
    "task_due_today": "normal",
    "todo_overdue": "normal",
    "license_expiry": "high",
    "document_expiry": "high",
    "subscription_renewal": "normal",
    "inbox_stale": "normal",
}

_STRING_DATE_FORMATS = ("%d %b %Y", "%B %d, %Y", "%d %B %Y", "%b %d, %Y", "%Y-%m-%d")


def parse_string_date(value: Any) -> Optional[date]:
    """Best-effort parse of the as-shown date strings stored on identity
    documents ("14 Aug 2027") and subscriptions ("June 25, 2026")."""
    if not value:
        return None
    text = str(value).strip()
    for fmt in _STRING_DATE_FORMATS:
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    try:
        return date.fromisoformat(text[:10])
    except ValueError:
        return None


def _scope(col, uid: int):
    from sqlalchemy import or_

    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


# ── settings (GlobalSetting JSON blob — same pattern as the brain reminder) ──
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


def _coerce_setting(default: Any, value: Any) -> tuple[bool, Any]:
    """Type-check a settings value against its default: bools stay bools,
    ints parse-or-reject (an empty string from a cleared number input must
    NOT be persisted — int('') would then crash every scheduler tick),
    None-defaults (stamps) accept str/None."""
    if isinstance(default, bool):
        return (isinstance(value, bool), value)
    if isinstance(default, int):
        try:
            return (True, int(value))
        except (TypeError, ValueError):
            return (False, None)
    if value is None or isinstance(value, str):
        return (True, value)
    return (False, None)


async def update_settings(db: AsyncSession, partial: Dict[str, Any]) -> Dict[str, Any]:
    from app.models.global_setting import GlobalSetting

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


# ── rule scan ────────────────────────────────────────────────────────────────
def _finding(rule: str, entity_type: str, entity_id, label: str, detail: str,
             when: Optional[date] = None) -> Dict[str, Any]:
    return {
        "rule": rule,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "label": label,
        "detail": detail,
        "date": when.isoformat() if when else None,
        "priority": RULE_PRIORITIES.get(rule, "normal"),
    }


async def scan_findings(
    db: AsyncSession,
    *,
    user_id: int = 0,
    now: Optional[datetime] = None,
    settings: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """Run every rule and return the raw findings (no dedup, no sending —
    this is also the dry-run the UI shows). Each rule fail-opens alone so
    one broken table never blanks the whole scan."""
    now = now or datetime.now(timezone.utc)
    today = now.date()
    cfg = settings or await get_settings(db)
    findings: List[Dict[str, Any]] = []

    # tasks — overdue / due today (due_date ∧ deadline, like the command center)
    try:
        from app.models.task import Task, TaskStatus

        open_tasks = (
            await db.execute(
                select(Task).where(
                    _scope(Task.user_id, user_id),
                    Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS]),
                    Task.merged_into_id.is_(None),
                )
            )
        ).scalars().all()
        for t in open_tasks:
            dates = [d for d in (t.due_date, t.deadline.date() if t.deadline else None) if d]
            if not dates:
                continue
            effective = min(dates)
            if effective < today:
                days = (today - effective).days
                findings.append(_finding(
                    "task_overdue", "task", t.id, t.title,
                    f"{days} روز عقب‌افتاده", effective,
                ))
            elif effective == today:
                findings.append(_finding(
                    "task_due_today", "task", t.id, t.title, "موعد امروز است", effective,
                ))
    except Exception as exc:
        logger.warning("attention task rule skipped: %r", exc)

    # todo items — overdue
    try:
        from app.models.todo_item import TodoItem

        rows = (
            await db.execute(
                select(TodoItem).where(
                    _scope(TodoItem.owner_id, user_id),
                    TodoItem.is_completed.is_(False),
                    TodoItem.due_date.isnot(None),
                    TodoItem.due_date < today,
                ).limit(50)
            )
        ).scalars().all()
        for i in rows:
            findings.append(_finding(
                "todo_overdue", "todo_item", i.id, i.content,
                f"{(today - i.due_date).days} روز عقب‌افتاده", i.due_date,
            ))
    except Exception as exc:
        logger.warning("attention todo rule skipped: %r", exc)

    horizon = today + timedelta(days=int(cfg.get("expiry_days", 30)))

    # UAE driving licence — real Date column
    try:
        from app.models.uae_license import UAEDrivingLicenseRecord

        rows = (
            await db.execute(
                select(UAEDrivingLicenseRecord).where(
                    _scope(UAEDrivingLicenseRecord.user_id, user_id),
                    UAEDrivingLicenseRecord.expiry_date.isnot(None),
                    UAEDrivingLicenseRecord.expiry_date <= horizon,
                )
            )
        ).scalars().all()
        for r in rows:
            days = (r.expiry_date - today).days
            detail = f"{-days} روز از انقضا گذشته" if days < 0 else f"{days} روز تا انقضا"
            findings.append(_finding(
                "license_expiry", "uae_license", r.id,
                r.name_en or "گواهینامه رانندگی", detail, r.expiry_date,
            ))
    except Exception as exc:
        logger.warning("attention license rule skipped: %r", exc)

    # identity documents — string dates, parsed best-effort
    try:
        from app.models.identity_document import IdentityDocument

        rows = (
            await db.execute(
                select(IdentityDocument).where(
                    _scope(IdentityDocument.user_id, user_id),
                    IdentityDocument.expiry_date.isnot(None),
                )
            )
        ).scalars().all()
        for r in rows:
            expiry = parse_string_date(r.expiry_date)
            if expiry is None or expiry > horizon:
                continue
            days = (expiry - today).days
            detail = f"{-days} روز از انقضا گذشته" if days < 0 else f"{days} روز تا انقضا"
            label = r.full_name or r.emirates_id_number or "مدرک هویتی"
            findings.append(_finding(
                "document_expiry", "identity_document", r.id, label, detail, expiry,
            ))
    except Exception as exc:
        logger.warning("attention document rule skipped: %r", exc)

    # subscriptions — string next_payment_date
    try:
        from app.models.subscription_account import SubscriptionAccount

        sub_horizon = today + timedelta(days=int(cfg.get("subscription_days", 14)))
        rows = (
            await db.execute(
                select(SubscriptionAccount).where(
                    _scope(SubscriptionAccount.user_id, user_id),
                    SubscriptionAccount.next_payment_date.isnot(None),
                )
            )
        ).scalars().all()
        for r in rows:
            due = parse_string_date(r.next_payment_date)
            if due is None or due > sub_horizon:
                continue
            days = (due - today).days
            detail = (
                f"{-days} روز از موعد پرداخت گذشته" if days < 0 else f"{days} روز تا پرداخت بعدی"
            )
            findings.append(_finding(
                "subscription_renewal", "subscription", r.id, r.provider, detail, due,
            ))
    except Exception as exc:
        logger.warning("attention subscription rule skipped: %r", exc)

    # inbox — pending captures growing stale (one aggregate finding)
    try:
        from app.models.inbox_item import InboxItem

        stale_before = now - timedelta(hours=int(cfg.get("inbox_stale_hours", 48)))
        count = int(
            (
                await db.execute(
                    select(func.count()).select_from(InboxItem).where(
                        _scope(InboxItem.user_id, user_id),
                        InboxItem.status == "pending",
                        InboxItem.created_at < stale_before,
                    )
                )
            ).scalar()
            or 0
        )
        if count:
            findings.append(_finding(
                "inbox_stale", "inbox", None,
                f"{count} مورد منتظر تصمیم",
                "از میز فرمان تعیین‌تکلیفشان کن", None,
            ))
    except Exception as exc:
        logger.warning("attention inbox rule skipped: %r", exc)

    return findings


# ── dedup marks ──────────────────────────────────────────────────────────────
def _dedup_key(f: Dict[str, Any]) -> str:
    return f"{f['rule']}:{f['entity_id'] if f['entity_id'] is not None else 'all'}"


async def _filter_fresh(
    db: AsyncSession, findings: List[Dict[str, Any]], user_id: int, now: datetime
) -> List[Dict[str, Any]]:
    if not findings:
        return []
    keys = [_dedup_key(f) for f in findings]
    rows = (
        await db.execute(
            select(AttentionMark).where(
                _scope(AttentionMark.user_id, user_id),
                AttentionMark.dedup_key.in_(keys),
            )
        )
    ).scalars().all()
    last_by_key: Dict[str, datetime] = {}
    for m in rows:
        ts = m.last_sent_at
        if ts is not None and ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        if ts is not None:
            prev = last_by_key.get(m.dedup_key)
            last_by_key[m.dedup_key] = max(prev, ts) if prev else ts
    fresh = []
    for f in findings:
        cooldown = timedelta(hours=RULE_COOLDOWN_HOURS.get(f["rule"], 24))
        last = last_by_key.get(_dedup_key(f))
        if last is None or (now - last) >= cooldown:
            fresh.append(f)
    return fresh


async def _mark_sent(
    db: AsyncSession, findings: List[Dict[str, Any]], user_id: int, now: datetime
) -> None:
    keys = {_dedup_key(f): f["rule"] for f in findings}
    if not keys:
        return
    rows = (
        await db.execute(
            select(AttentionMark).where(
                _scope(AttentionMark.user_id, user_id),
                AttentionMark.dedup_key.in_(list(keys)),
            )
        )
    ).scalars().all()
    existing = {m.dedup_key: m for m in rows}
    for key, rule in keys.items():
        mark = existing.get(key)
        if mark is None:
            db.add(AttentionMark(user_id=user_id, dedup_key=key, rule=rule, last_sent_at=now))
        else:
            mark.last_sent_at = now
    await db.commit()


# ── alert sending ────────────────────────────────────────────────────────────
# Serialises the check-then-act window between the 10-min loop tick and the
# UI's «ارسال هشدارها» button: both run in THIS process (single-replica, like
# the compose buffer), so an asyncio lock is enough to stop a race from
# double-sending every fresh finding.
_send_lock: Optional[Any] = None


def _get_send_lock():
    import asyncio

    global _send_lock
    if _send_lock is None:
        _send_lock = asyncio.Lock()
    return _send_lock


async def send_alerts(
    db: AsyncSession, *, user_id: int = 0, now: Optional[datetime] = None
) -> Dict[str, Any]:
    """Scan, drop findings still inside their cooldown, then send ONE
    aggregated notification per rule (bell + Telegram via notify_event's
    registered channels) and remember what was sent."""
    async with _get_send_lock():
        return await _send_alerts_locked(db, user_id=user_id, now=now)


async def _send_alerts_locked(
    db: AsyncSession, *, user_id: int = 0, now: Optional[datetime] = None
) -> Dict[str, Any]:
    now = now or datetime.now(timezone.utc)
    cfg = await get_settings(db)
    findings = await scan_findings(db, user_id=user_id, now=now, settings=cfg)
    fresh = await _filter_fresh(db, findings, user_id, now)

    sent_rules: List[str] = []
    if fresh:
        from app.services.notification_service import notify_event

        by_rule: Dict[str, List[Dict[str, Any]]] = {}
        for f in fresh:
            by_rule.setdefault(f["rule"], []).append(f)
        for rule, items in by_rule.items():
            lines = [
                f"• {f['label']}" + (f" — {f['detail']}" if f.get("detail") else "")
                for f in items[:10]
            ]
            if len(items) > 10:
                lines.append(f"… و {len(items) - 10} مورد دیگر")
            await notify_event(
                "attention_alert",
                user_id=user_id,
                db=db,
                title=RULE_TITLES_FA.get(rule, rule),
                message="\n".join(lines),
                priority=RULE_PRIORITIES.get(rule, "normal"),
            )
            sent_rules.append(rule)
        await _mark_sent(db, fresh, user_id, now)

    return {"findings": findings, "fresh": fresh, "sent_rules": sent_rules}


# ── morning brief ────────────────────────────────────────────────────────────
def local_now(cfg: Dict[str, Any], now_utc: datetime) -> datetime:
    return now_utc + timedelta(minutes=int(cfg.get("tz_offset_minutes", 240)))


def brief_decision(cfg: Dict[str, Any], now_utc: datetime) -> bool:
    """Pure decision: is it time for today's brief? (local hour reached and
    not sent for today's local date yet.)"""
    if not cfg.get("enabled", True) or not cfg.get("brief_enabled", True):
        return False
    local = local_now(cfg, now_utc)
    if local.hour < int(cfg.get("brief_hour", 7)):
        return False
    return cfg.get("last_brief_date") != local.date().isoformat()


def _brief_text(today_payload: Dict[str, Any], local: datetime) -> str:
    tasks = today_payload.get("tasks", {})
    inbox = today_payload.get("inbox", {})
    notifications = today_payload.get("notifications", {})
    lines = [f"☀️ *صبح بخیر!* برنامهٔ امروز ({local.date().isoformat()}):", ""]
    overdue = tasks.get("overdue", [])
    due_today = tasks.get("due_today", [])
    upcoming = tasks.get("upcoming", [])
    if overdue:
        lines.append(f"⏰ عقب‌افتاده ({tasks.get('overdue_count', len(overdue))}):")
        lines += [f"  • {t['title']}" for t in overdue[:5]]
    if due_today:
        lines.append(f"📅 امروز ({tasks.get('due_today_count', len(due_today))}):")
        lines += [f"  • {t['title']}" for t in due_today[:5]]
    if upcoming:
        lines.append(f"🔜 هفت روز آینده: {tasks.get('upcoming_count', len(upcoming))} مورد")
    if not (overdue or due_today):
        lines.append("🌿 امروز موعد فوری نداری.")
    pending = inbox.get("pending_count", 0)
    if pending:
        lines.append(f"📥 صندوق ورودی: {pending} مورد منتظر تصمیم")
    unread = notifications.get("unread_count", 0)
    if unread:
        lines.append(f"🔔 اعلان خوانده‌نشده: {unread}")
    return "\n".join(lines)


async def _brief_ai_line(db: AsyncSession, brief: str) -> Optional[str]:
    """One motivating Persian line from the routed model — pure garnish,
    skipped silently when no model is configured."""
    try:
        from app.services.ai.inference_gateway import complete

        res = await complete(
            db,
            "این برنامهٔ امروز کاربر است:\n" + brief +
            "\n\nفقط یک جملهٔ کوتاه انگیزشی فارسی متناسب با این روز بنویس (بدون مقدمه).",
            task="morning_brief",
            max_tokens=120,
        )
        if res.get("ok") and res.get("text", "").strip():
            return res["text"].strip().splitlines()[0][:200]
    except Exception as exc:
        logger.debug("morning brief AI line skipped: %r", exc)
    return None


async def send_morning_brief(
    db: AsyncSession, *, user_id: int = 0, now: Optional[datetime] = None, force: bool = False
) -> Dict[str, Any]:
    """Compose + deliver the daily brief (Telegram pretty text + one in-app
    notification), then stamp today's local date so it fires once a day."""
    now = now or datetime.now(timezone.utc)
    cfg = await get_settings(db)
    if not force and not brief_decision(cfg, now):
        return {"sent": False, "reason": "not_due"}
    # The prefs catalog lists morning_brief with a Telegram channel, so the
    # direct pretty-text send below must honour the SAME toggles the event
    # fan-out honours (the UI switch must actually switch something).
    # force=True (the explicit UI button) bypasses the event toggle but
    # still respects the channel toggle. Fail-open like notify_event.
    try:
        from app.services import notification_prefs as _prefs

        event_on = _prefs.event_enabled("morning_brief")
        telegram_on = _prefs.channel_enabled("telegram")
    except Exception:
        event_on, telegram_on = True, True
    if not force and not event_on:
        return {"sent": False, "reason": "disabled_by_prefs"}
    local = local_now(cfg, now)

    from app.services.command_center_service import build_today

    today_payload = await build_today(db, user_id)
    text = _brief_text(today_payload, local)
    ai_line = await _brief_ai_line(db, text)
    if ai_line:
        text = f"{text}\n\n💬 {ai_line}"

    telegram_sent = False
    try:
        from app.services.telegram_service import get_telegram_bot

        bot = get_telegram_bot()
        if telegram_on and bot.is_configured():
            await bot.send(text, silent=True)
            telegram_sent = True
    except Exception as exc:
        logger.warning("morning brief telegram send failed: %r", exc)

    # In-app bell record (registered with in_app channel only, so the
    # pretty Telegram text above isn't doubled by the event fan-out).
    from app.services.notification_service import notify_event

    await notify_event(
        "morning_brief",
        user_id=user_id,
        db=db,
        title="☀️ برنامهٔ امروز",
        message=text.replace("*", ""),
        priority="normal",
        silent=True,
    )
    await update_settings(db, {"last_brief_date": local.date().isoformat()})
    return {"sent": True, "telegram": telegram_sent, "text": text}


# ── tick + loop (mirrors brain_reminder_loop) ───────────────────────────────
def _task_user_id() -> int:
    import os

    try:
        return int(os.environ.get("TELEGRAM_TASK_USER_ID", "0") or "0")
    except (TypeError, ValueError):
        return 0


async def attention_tick(db: AsyncSession, now: Optional[datetime] = None) -> Dict[str, Any]:
    """One scheduler cycle: rule scan (on its interval) + morning brief (once
    per local day) + the weekly review tick. Each part fail-opens alone."""
    now = now or datetime.now(timezone.utc)
    cfg = await get_settings(db)
    actions: Dict[str, Any] = {}
    if not cfg.get("enabled", True):
        return actions
    uid = _task_user_id()

    # rule scan on its own cadence
    try:
        last_scan = None
        if cfg.get("last_scan_at"):
            try:
                last_scan = datetime.fromisoformat(cfg["last_scan_at"])
                if last_scan.tzinfo is None:
                    last_scan = last_scan.replace(tzinfo=timezone.utc)
            except ValueError:
                last_scan = None
        interval = timedelta(minutes=int(cfg.get("scan_interval_minutes", 30)))
        if last_scan is None or (now - last_scan) >= interval:
            result = await send_alerts(db, user_id=uid, now=now)
            actions["scan"] = {"sent_rules": result["sent_rules"], "fresh": len(result["fresh"])}
            await update_settings(db, {"last_scan_at": now.isoformat()})
    except Exception as exc:
        logger.warning("attention scan cycle skipped: %r", exc)

    # morning brief
    try:
        if brief_decision(cfg, now):
            brief = await send_morning_brief(db, user_id=uid, now=now)
            actions["brief"] = brief.get("sent", False)
    except Exception as exc:
        logger.warning("morning brief cycle skipped: %r", exc)

    # weekly review (phase 4) rides the same loop
    try:
        from app.services.weekly_review_service import weekly_tick

        review = await weekly_tick(db, now=now)
        if review is not None:
            actions["weekly_review"] = review.id
    except Exception as exc:
        logger.warning("weekly review cycle skipped: %r", exc)

    return actions


async def attention_loop(stop_event) -> None:
    """Background loop (10-min cadence, 30s initial grace) driving
    attention_tick. Started at app startup; cancelled via stop_event on
    shutdown. Fail-open per cycle."""
    import asyncio

    try:
        await asyncio.wait_for(stop_event.wait(), timeout=30)
        return
    except asyncio.TimeoutError:
        pass
    while not stop_event.is_set():
        try:
            from app.database import SessionLocal

            async with SessionLocal() as session:
                await attention_tick(session)
        except Exception as exc:
            logger.debug("attention cycle skipped: %r", exc)
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=600)
        except asyncio.TimeoutError:
            continue
