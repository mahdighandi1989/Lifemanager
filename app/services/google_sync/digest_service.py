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

from sqlalchemy import func, select
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

    # قطعی موبایل — اگر همین حالا هم ادامه دارد، موضوعِ اولِ گزارش است.
    try:
        from app.services.mobile_watchdog_service import silent_devices

        for d in await silent_devices(db, now):
            lines.append(
                f"⛔ قطعی موبایل: گوشی «{d['device']}» از {d['minutes']} دقیقه پیش ساکت است — اپ همراه/اینترنت را چک کن."
            )
    except Exception:
        pass

    # مکان‌ها و رفت‌وآمد — تا این داده هم مثل بقیه واقعاً به‌کار برود.
    try:
        from app.services.place_service import summary_lines as _places

        lines.extend(await _places(db, 0, days=7))
    except Exception:
        pass

    # خلاصهٔ زندگیِ موبایل (کارکرد/تماس/پیامک) — دادهٔ گوشی دیگر هرز نمی‌رود.
    try:
        from app.services.mobile_insights_service import build_mobile_summary, summary_to_fa_lines

        lines.extend(summary_to_fa_lines(await build_mobile_summary(db, days=7)))
    except Exception:
        pass

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


# ── rich data collector (از ریز تا درشتِ برنامه، همه fail-open) ──────────────
async def collect_digest_data(
    db: AsyncSession, now: Optional[datetime] = None, tz_offset_minutes: int = 240
) -> Dict[str, Any]:
    now = now or datetime.now(timezone.utc)
    local_now = now + timedelta(minutes=tz_offset_minutes)
    today = local_now.date()
    day_start = datetime(today.year, today.month, today.day, tzinfo=timezone.utc) - timedelta(
        minutes=tz_offset_minutes
    )
    data: Dict[str, Any] = {
        "date_local": today.isoformat(),
        "events_today": [],
        "events_tomorrow": [],
        "action_emails": [],
        "emails_today_total": 0,
        "emails_today_by_category": {},
        "attention": {},
        "tasks": {"open": 0, "done_today": 0},
        "inbox_pending": 0,
        "dev": {"open_errors": 0, "error_titles": [], "summaries": []},
        "activity_7d": [],
    }

    try:  # calendar
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
        for e in events:
            item = {
                "summary": e.summary,
                "time": "تمام‌روز" if e.all_day else _fmt_hour(e.start_at, tz_offset_minutes),
                "location": e.location,
            }
            if e.start_at is not None and _in_day(e.start_at, day_start, 0):
                data["events_today"].append(item)
            elif e.start_at is not None and _in_day(e.start_at, day_start, 1):
                data["events_tomorrow"].append(item)
    except Exception as exc:
        logger.debug("digest data: calendar skipped: %r", exc)

    try:  # emails
        rows = (
            (
                await db.execute(
                    select(PersonalEmail).where(PersonalEmail.received_at >= day_start)
                )
            )
            .scalars()
            .all()
        )
        data["emails_today_total"] = len(rows)
        for e in rows:
            cat = e.ai_category or "other"
            data["emails_today_by_category"][cat] = data["emails_today_by_category"].get(cat, 0) + 1
        actions = (
            (
                await db.execute(
                    select(PersonalEmail)
                    .where(PersonalEmail.needs_action.is_(True), PersonalEmail.task_id.is_(None))
                    .order_by(PersonalEmail.received_at.desc())
                    .limit(6)
                )
            )
            .scalars()
            .all()
        )
        data["action_emails"] = [
            {
                "subject": (e.subject or "بدون موضوع")[:90],
                "summary": e.ai_summary,
                "suggested_task": e.suggested_task,
            }
            for e in actions
        ]
    except Exception as exc:
        logger.debug("digest data: emails skipped: %r", exc)

    try:  # موتور توجه — یک اسکن خشک، همهٔ قواعد (تسک/مدرک/اشتراک/لیست/صندوق/…)
        from app.services.attention_service import RULE_TITLES_FA, scan_findings

        findings = await scan_findings(db, user_id=0, now=now)
        grouped: Dict[str, Dict[str, Any]] = {}
        for f in findings:
            slot = grouped.setdefault(
                f["rule"],
                {"count": 0, "title": RULE_TITLES_FA.get(f["rule"], f["rule"]), "labels": []},
            )
            slot["count"] += 1
            if len(slot["labels"]) < 3:
                slot["labels"].append(f["label"])
        data["attention"] = grouped
    except Exception as exc:
        logger.debug("digest data: attention skipped: %r", exc)

    try:  # tasks
        from app.models.task import Task, TaskStatus

        open_count = (
            await db.execute(
                select(func.count(Task.id)).where(
                    Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS]),
                    Task.merged_into_id.is_(None),
                )
            )
        ).scalar() or 0
        done_today = (
            await db.execute(
                select(func.count(Task.id)).where(
                    Task.status == TaskStatus.DONE, Task.updated_at >= day_start
                )
            )
        ).scalar() or 0
        data["tasks"] = {"open": int(open_count), "done_today": int(done_today)}
    except Exception as exc:
        logger.debug("digest data: tasks skipped: %r", exc)

    try:  # inbox
        from app.models.inbox_item import InboxItem

        data["inbox_pending"] = int(
            (
                await db.execute(
                    select(func.count(InboxItem.id)).where(InboxItem.status == "pending")
                )
            ).scalar()
            or 0
        )
    except Exception as exc:
        logger.debug("digest data: inbox skipped: %r", exc)

    try:  # dev center
        from app.models.dev_sync import DevErrorIssue, DevLogSummary

        open_issues = (
            (
                await db.execute(
                    select(DevErrorIssue)
                    .where(DevErrorIssue.status == "open")
                    .order_by(DevErrorIssue.last_seen_at.desc())
                    .limit(5)
                )
            )
            .scalars()
            .all()
        )
        total_open = (
            await db.execute(
                select(func.count(DevErrorIssue.id)).where(DevErrorIssue.status == "open")
            )
        ).scalar() or 0
        summaries = (
            (
                await db.execute(
                    select(DevLogSummary)
                    .where(DevLogSummary.summary_date == today)
                    .limit(4)
                )
            )
            .scalars()
            .all()
        )
        data["dev"] = {
            "open_errors": int(total_open),
            "error_titles": [i.title[:80] for i in open_issues[:3]],
            "summaries": [
                {"service": s.service_name or s.service_id, "text": (s.summary or "")[:400]}
                for s in summaries
            ],
        }
    except Exception as exc:
        logger.debug("digest data: dev skipped: %r", exc)

    try:  # 7-day activity bars (activity log rows per LOCAL day)
        from app.models.activity_log import ActivityLog

        week_start = day_start - timedelta(days=6)
        rows = (
            await db.execute(
                select(ActivityLog.created_at).where(ActivityLog.created_at >= week_start)
            )
        ).all()
        buckets = {i: 0 for i in range(7)}
        for (ts,) in rows:
            if ts is None:
                continue
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            idx = int((ts - week_start).total_seconds() // 86400)
            if 0 <= idx <= 6:
                buckets[idx] += 1
        data["activity_7d"] = [
            {
                "day": (week_start + timedelta(days=i, minutes=tz_offset_minutes)).strftime("%m-%d"),
                "count": buckets[i],
            }
            for i in range(7)
        ]
    except Exception as exc:
        logger.debug("digest data: activity skipped: %r", exc)

    # مالی + افراد (phase 2, audit #5): the nightly report finally covers
    # money and relationships — reusing the command-center bucket
    # builders so داشبورد/بریف/گزارش همه از یک منبع بخوانند.
    try:
        from app.services.command_center_service import (
            _finance_bucket,
            _people_bucket,
        )

        data["finance"] = await _finance_bucket(db, 0)
        data["people"] = await _people_bucket(db)
    except Exception as exc:
        logger.debug("digest data: finance/people skipped: %r", exc)
        data["finance"] = {"balances_by_currency": [], "subscriptions": []}
        data["people"] = {"reminders": [], "reminders_count": 0}

    try:
        from app.services.mobile_watchdog_service import silent_devices

        data["mobile_silent"] = await silent_devices(db)
    except Exception:
        data["mobile_silent"] = []

    try:
        from app.services.mobile_insights_service import build_mobile_summary

        data["mobile_summary"] = await build_mobile_summary(db, days=7)
    except Exception:
        data["mobile_summary"] = {}

    return data


def build_todo_list_fa(data: Dict[str, Any]) -> List[Dict[str, str]]:
    """«تکلیف امروز تو» — concrete, prioritized, with an app link per item."""
    todos: List[Dict[str, str]] = []
    attention = data.get("attention", {})

    def rule(name):
        return attention.get(name) or {}

    if rule("task_overdue").get("count"):
        r = rule("task_overdue")
        todos.append({
            "text": f"{r['count']} تسک عقب‌افتاده را تعیین‌تکلیف کن (مثل: {'، '.join(r['labels'][:2])})",
            "link": "/tasks",
        })
    if data.get("action_emails"):
        first = data["action_emails"][0]["subject"]
        todos.append({
            "text": f"{len(data['action_emails'])} ایمیل منتظر پاسخ/اقدام توست (اولی: {first})",
            "link": "/settings?tab=drive",
        })
    if data.get("dev", {}).get("open_errors"):
        todos.append({
            "text": f"{data['dev']['open_errors']} خطای باز در پروژه‌های توسعه — بررسی یا «رفع شد» بزن",
            "link": "/dev-center?tab=errors",
        })
    for name in ("license_expiry", "document_expiry", "subscription_renewal"):
        r = rule(name)
        if r.get("count"):
            todos.append({
                "text": f"{r['title']}: {'، '.join(r['labels'][:2])}",
                "link": "/attention",
            })
    if data.get("inbox_pending"):
        todos.append({
            "text": f"{data['inbox_pending']} مورد در صندوق ورودی منتظر تصمیم است",
            "link": "/",
        })
    if data.get("events_today"):
        first = data["events_today"][0]
        todos.append({
            "text": f"امروز {len(data['events_today'])} رویداد داری (اولی: {first['time']} — {first['summary']})",
            "link": None,
        })
    if not todos:
        todos.append({"text": "همه‌چیز مرتب است — چیزی از تو عقب نیست ✓", "link": None})
    return todos


async def _ai_advice(db: AsyncSession, data: Dict[str, Any]) -> tuple[Optional[str], Optional[str]]:
    try:
        import json as _json

        from app.services.ai.inference_gateway import complete

        prompt = (
            "تو مربی شخصی من هستی. با نگاه به آمار امروزِ زندگی من، ۲ تا ۳ جملهٔ فارسیِ "
            "صمیمی و مشخص بنویس: مهم‌ترین کاری که امروز باید انجام دهم و یک جمع‌بندی کوتاه. "
            "هیچ عددی از خودت نساز.\n\nداده‌ها:\n"
            + _json.dumps(data, ensure_ascii=False, default=str)[:4000]
        )
        res = await complete(db, prompt, task="personal_digest", max_tokens=250)
        if res.get("ok") and res.get("text", "").strip():
            return res["text"].strip()[:800], res.get("model")
    except Exception as exc:
        logger.debug("digest AI advice skipped: %r", exc)
    return None, None


def _esc(value) -> str:
    import html as _html

    return _html.escape(str(value if value is not None else ""), quote=True)


def render_digest_html(
    data: Dict[str, Any], advice: Optional[str] = None, base_url: Optional[str] = None
) -> str:
    """Email-safe HTML (Gmail-compatible): RTL, inline styles, tables, and
    div-based bars — no JS, no external assets."""
    base = (base_url or "").rstrip("/")

    def link(path: Optional[str], label: str) -> str:
        if not path or not base:
            return ""
        return (
            f'&nbsp;<a href="{_esc(base + path)}" style="color:#2563eb;font-size:12px;'
            f'text-decoration:none">{_esc(label)} ↗</a>'
        )

    def section(title: str, inner: str, color: str = "#1f2937") -> str:
        return (
            f'<div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;'
            f'padding:14px 16px;margin:0 0 12px 0">'
            f'<div style="font-weight:bold;font-size:14px;color:{color};margin-bottom:8px">'
            f"{title}</div>{inner}</div>"
        )

    def tile(number, label, color="#111827") -> str:
        return (
            f'<td align="center" style="background:#ffffff;border:1px solid #e5e7eb;'
            f'border-radius:12px;padding:10px 6px">'
            f'<div style="font-size:22px;font-weight:bold;color:{color}">{_esc(number)}</div>'
            f'<div style="font-size:11px;color:#6b7280;margin-top:2px">{_esc(label)}</div></td>'
        )

    todos = build_todo_list_fa(data)
    todo_rows = "".join(
        f'<div style="padding:6px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111827">'
        f"{i + 1}. {_esc(t['text'])}{link(t.get('link'), 'باز کن')}</div>"
        for i, t in enumerate(todos)
    )

    # قطعی موبایل — موضوع برجسته: تا وقتی گوشی ساکت است، بالای گزارش می‌نشیند.
    outage_html = ""
    for d in data.get("mobile_silent", []) or []:
        outage_html += (
            f'<div style="font-size:13px;color:#991b1b">📵 گوشی «{_esc(d.get("device"))}» از '
            f'{_esc(d.get("minutes"))} دقیقه پیش هیچ سیگنالی نفرستاده است — اپ همراه یا اینترنت آن را چک کن.</div>'
        )
    if outage_html:
        outage_html = section("⛔ قطعی اتصال موبایل", outage_html, color="#dc2626")

    tiles = (
        '<table role="presentation" width="100%" cellspacing="6" cellpadding="0" dir="rtl">'
        "<tr>"
        + tile(data["tasks"]["open"], "تسک باز")
        + tile(data["tasks"]["done_today"], "انجام‌شدهٔ امروز", "#059669")
        + tile(len(data.get("action_emails", [])), "ایمیل منتظر اقدام",
               "#d97706" if data.get("action_emails") else "#059669")
        + tile(data.get("dev", {}).get("open_errors", 0), "خطای باز پروژه‌ها",
               "#dc2626" if data.get("dev", {}).get("open_errors") else "#059669")
        + tile(data.get("inbox_pending", 0), "صندوق ورودی")
        + "</tr></table>"
    )
    tiles = outage_html + tiles

    events_html = ""
    for title, key in (("امروز", "events_today"), ("فردا", "events_tomorrow")):
        items = data.get(key) or []
        if items:
            rows = "".join(
                f'<div style="font-size:13px;padding:3px 0;color:#111827">'
                f'<span style="color:#6b7280;font-size:12px">{_esc(e["time"])}</span> — '
                f"{_esc(e['summary'])}"
                + (f' <span style="color:#9ca3af;font-size:11px">({_esc(e["location"])})</span>' if e.get("location") else "")
                + "</div>"
                for e in items[:8]
            )
            events_html += f'<div style="font-size:12px;color:#6b7280;margin:6px 0 2px">{title}:</div>{rows}'
    if not events_html:
        events_html = '<div style="font-size:13px;color:#6b7280">تقویم امروز و فردا خالی است.</div>'

    emails_inner = ""
    if data.get("action_emails"):
        emails_inner += "".join(
            f'<div style="font-size:13px;padding:4px 0;border-bottom:1px solid #f9fafb">'
            f'<span dir="ltr" style="color:#111827">{_esc(e["subject"])}</span>'
            + (f'<div style="font-size:12px;color:#6b7280">{_esc(e["summary"])}</div>' if e.get("summary") else "")
            + "</div>"
            for e in data["action_emails"]
        )
    else:
        emails_inner = '<div style="font-size:13px;color:#059669">ایمیل معطل اقدامی نداری ✓</div>'
    cats = data.get("emails_today_by_category") or {}
    if cats:
        cat_fa = {"action": "اقدام", "important": "مهم", "receipt": "رسید", "newsletter": "خبرنامه", "otp": "کد", "other": "سایر"}
        emails_inner += (
            f'<div style="font-size:11px;color:#9ca3af;margin-top:8px">امروز '
            f"{_esc(data.get('emails_today_total', 0))} ایمیل: "
            + "، ".join(f"{cat_fa.get(k, k)} {v}" for k, v in sorted(cats.items(), key=lambda x: -x[1]))
            + "</div>"
        )

    attention_inner = ""
    for rule_key, slot in (data.get("attention") or {}).items():
        if rule_key in ("calendar_event_soon", "email_needs_action"):
            continue  # already shown in their own sections
        attention_inner += (
            f'<div style="font-size:13px;padding:3px 0;color:#111827">{_esc(slot["title"])} — '
            f'<b>{_esc(slot["count"])}</b> مورد'
            f'<span style="color:#6b7280;font-size:12px"> ({_esc("، ".join(slot["labels"]))})</span></div>'
        )
    if not attention_inner:
        attention_inner = '<div style="font-size:13px;color:#059669">هیچ هشدار بازی نیست ✓</div>'

    dev = data.get("dev") or {}
    dev_inner = ""
    if dev.get("open_errors"):
        dev_inner += (
            f'<div style="font-size:13px;color:#dc2626">{_esc(dev["open_errors"])} خطای باز حل‌نشده</div>'
            + "".join(
                f'<div dir="ltr" style="font-family:monospace;font-size:11px;color:#991b1b;'
                f'padding:2px 0;text-align:left">{_esc(t)}</div>'
                for t in dev.get("error_titles", [])
            )
        )
    else:
        dev_inner += '<div style="font-size:13px;color:#059669">خطای باز نداری ✓</div>'
    for s in dev.get("summaries", [])[:3]:
        dev_inner += (
            f'<div style="font-size:12px;color:#374151;margin-top:6px;background:#f9fafb;'
            f'border-radius:8px;padding:6px 8px"><b dir="ltr">{_esc(s["service"])}</b>: {_esc(s["text"])}</div>'
        )

    bars = ""
    activity = data.get("activity_7d") or []
    if activity:
        max_count = max((d["count"] for d in activity), default=1) or 1
        bar_rows = ""
        for d in activity:
            width = max(3, round(d["count"] / max_count * 100))
            bar_rows += (
                f'<tr><td style="font-size:11px;color:#6b7280;padding:2px 0 2px 8px;'
                f'white-space:nowrap" dir="ltr">{_esc(d["day"])}</td>'
                f'<td width="70%" style="padding:2px 0">'
                f'<div style="background:#eff6ff;border-radius:4px">'
                f'<div style="height:10px;width:{width}%;background:#3b82f6;border-radius:4px"></div>'
                f'</div></td>'
                f'<td style="font-size:11px;color:#111827;padding:2px 8px 2px 0">{_esc(d["count"])}</td></tr>'
            )
        bars = (
            '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" dir="rtl">'
            + bar_rows
            + "</table>"
            + '<div style="font-size:11px;color:#9ca3af;margin-top:4px">تعداد فعالیت‌های ثبت‌شده در برنامه، ۷ روز اخیر</div>'
        )

    # مالی + افراد (phase 2, audit #5) — money and relationships in the
    # same nightly report. Balances stay strictly per-currency (audit #20).
    fin = data.get("finance") or {}
    fin_inner = ""
    for b in (fin.get("balances_by_currency") or [])[:5]:
        total_fmt = f"{float(b.get('total') or 0):,.0f}"
        fin_inner += (
            f'<div style="font-size:13px;padding:2px 0;color:#111827">'
            f'<b dir="ltr">{_esc(total_fmt)} {_esc(b.get("currency"))}</b>'
            f'<span style="color:#6b7280;font-size:12px"> ({_esc(b.get("accounts", 0))} حساب)</span></div>'
        )
    for s in (fin.get("subscriptions") or [])[:4]:
        if s.get("next_payment_date"):
            fin_inner += (
                f'<div style="font-size:12px;color:#92400e;padding:2px 0">🔁 '
                f'{_esc(s.get("provider") or "")} — پرداخت بعدی: '
                f'<span dir="ltr">{_esc(s["next_payment_date"])}</span></div>'
            )
    if not fin_inner:
        fin_inner = '<div style="font-size:13px;color:#9ca3af">حسابی ثبت نشده است.</div>'
    ppl = data.get("people") or {}
    ppl_inner = ""
    for r in (ppl.get("reminders") or [])[:4]:
        ppl_inner += (
            f'<div style="font-size:13px;padding:2px 0;color:#111827">'
            f'<b>{_esc(r.get("person_name") or "")}</b>: {_esc(r.get("note") or "")}</div>'
        )
    if ppl.get("reminders_count", 0) > 4:
        ppl_inner += (
            f'<div style="font-size:11px;color:#9ca3af">و '
            f'{_esc(ppl["reminders_count"] - 4)} یادآور دیگر…</div>'
        )
    people_section = (
        section("🧑‍🤝‍🧑 یادآور افراد", ppl_inner, "#7c3aed") if ppl_inner else ""
    )

    advice_html = ""
    if advice:
        advice_html = section(
            "🧭 جمع‌بندی و توصیه",
            f'<div style="font-size:13px;color:#1e3a8a;line-height:1.9">{_esc(advice)}</div>',
            "#1e40af",
        )

    return (
        '<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#f3f4f6;'
        'padding:16px;max-width:640px;margin:0 auto">'
        f'<div style="font-size:18px;font-weight:bold;color:#111827;margin-bottom:2px">'
        f"📒 گزارش روز</div>"
        f'<div dir="ltr" style="font-size:12px;color:#6b7280;text-align:right;margin-bottom:12px">'
        f"{_esc(data.get('date_local', ''))}</div>"
        + advice_html
        + section("✅ تکلیف امروز تو", todo_rows, "#047857")
        + tiles
        + '<div style="height:12px"></div>'
        + section("🗓 تقویم", events_html)
        + section("📧 ایمیل‌ها", emails_inner)
        + section("⏰ هشدارهای موتور توجه", attention_inner, "#b45309")
        + section("🛠 پروژه‌های توسعه", dev_inner)
        + section("💰 مالی", fin_inner, "#0f766e")
        + people_section
        + (section("📊 روند فعالیت هفته", bars) if bars else "")
        + '<div style="font-size:11px;color:#9ca3af;text-align:center;margin-top:8px">'
        "این گزارش هر شب به‌صورت خودکار از Lifemanager ارسال می‌شود.</div></div>"
    )


async def send_digest(
    db: AsyncSession,
    now: Optional[datetime] = None,
    tz_offset_minutes: int = 240,
    email_enabled: bool = True,
    user_id: int = 0,
) -> Dict[str, Any]:
    """Compose + deliver the digest. Never raises. The in-app/Telegram copy
    stays short text; the EMAIL gets the rich HTML report (whole-app stats,
    bars, and the «تکلیف امروز» action list)."""
    text = await compose_digest(db, now=now, tz_offset_minutes=tz_offset_minutes)
    delivered: Dict[str, Any] = {"ok": True, "email": None}

    data: Optional[Dict[str, Any]] = None
    html: Optional[str] = None
    try:
        import os as _os

        data = await collect_digest_data(db, now=now, tz_offset_minutes=tz_offset_minutes)
        advice, _model = await _ai_advice(db, data)
        base_url = _os.environ.get("TELEGRAM_APP_BASE_URL") or _os.environ.get(
            "BACKEND_PUBLIC_URL"
        )
        html = render_digest_html(data, advice=advice, base_url=base_url)
        # the Telegram/in-app text also gets the action list — the «تکلیفم
        # چیه» answer must reach every channel, not just email.
        todo_lines = "\n".join(
            f"{i + 1}. {t['text']}" for i, t in enumerate(build_todo_list_fa(data)[:6])
        )
        text = f"{text}\n\n✅ تکلیف امروز:\n{todo_lines}"
        if advice:
            text = f"{text}\n\n🧭 {advice}"
    except Exception as exc:
        logger.debug("rich digest degraded to plain text: %r", exc)

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
                    db, to, f"گزارش روز — {local_day.isoformat()}", text, html=html
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
