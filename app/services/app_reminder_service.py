"""Delivery of «یادآورهای برنامه» (app_reminders) by Telegram and e-mail.

Contract (owner 2026-10-12, «گره‌گشا»): the page upserts a reminder by key with a local due date,
an hour and an IANA time zone; the server computes the UTC send time, sends ONCE on the chosen
channels, and records each channel honestly:
  * ``sent``                 — the transport confirmed it;
  * ``failed``               — the transport errored (retried with backoff, at most 5 attempts);
  * ``skipped_unconfigured`` — the channel isn't configured on this server (no bot token / no
    connected Gmail and no SMTP_HOST). The legacy ``send_email``/``send_telegram`` return True
    when unconfigured (a dev convenience); this module never reports that as «sent».
At most ``DAILY_CAP`` reminders per user/app are delivered per local day; the rest move to the
next day at the same hour, oldest first. Times outside the page's hour are never used.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
from datetime import date, datetime, time, timedelta, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.app_reminder import AppReminder

logger = logging.getLogger(__name__)

DAILY_CAP = 3
MAX_ATTEMPTS = 5
CHANNELS = ("telegram", "email")


def _zone(tz: str):
    try:
        from zoneinfo import ZoneInfo

        return ZoneInfo(tz or "Asia/Dubai")
    except Exception:  # noqa: BLE001 — unknown zone ⇒ Dubai (the owner's)
        from zoneinfo import ZoneInfo

        return ZoneInfo("Asia/Dubai")


def send_time_utc(due_date: str, hour: int, tz: str) -> datetime:
    d = date.fromisoformat(due_date)
    h = max(0, min(23, int(hour if hour is not None else 9)))
    return datetime.combine(d, time(h, 0), tzinfo=_zone(tz)).astimezone(timezone.utc)


def _clean_channels(ch: Any) -> str:
    if isinstance(ch, dict):
        ch = [k for k, v in ch.items() if v]
    if isinstance(ch, str):
        ch = [c.strip() for c in ch.split(",")]
    return ",".join(c for c in CHANNELS if c in (ch or []))


async def upsert(db: AsyncSession, *, user_id, app: str, items: List[dict]) -> Dict[str, int]:
    n = 0
    for it in items:
        key = str(it.get("key") or "").strip()[:160]
        due = str(it.get("due_date") or "")[:10]
        if not key:
            raise ValueError("کلیدِ یادآور لازم است")
        try:
            date.fromisoformat(due)
        except ValueError as exc:
            raise ValueError("تاریخِ موعد باید YYYY-MM-DD باشد") from exc
        hour = int(it.get("hour") if it.get("hour") is not None else 9)
        tz = str(it.get("tz") or "Asia/Dubai")[:64]
        row = (await db.execute(select(AppReminder).where(AppReminder.user_id == user_id, AppReminder.app == app,
                                                          AppReminder.rkey == key))).scalar_one_or_none()
        if row is None:
            row = AppReminder(user_id=user_id, app=app, rkey=key, attempts=0, result="")
            db.add(row)
        changed = (row.due_date != due or row.hour != hour or row.tz != tz)
        row.due_date, row.hour, row.tz = due, hour, tz
        row.send_at = send_time_utc(due, hour, tz)
        row.title = str(it.get("title") or "")[:200]
        row.body = str(it.get("body") or "")[:2000]
        row.detail = (str(it["detail"])[:2000] if it.get("detail") else None)
        row.link = str(it.get("link") or "")[:500]
        row.channels = _clean_channels(it.get("channels") if it.get("channels") is not None else list(CHANNELS))
        if changed or row.status in (None, "", "cancelled", "muted"):  # muted = event was off at due time; re-armed by the next upsert (audit 2026-10-13)
            row.status, row.attempts, row.sent_at = "pending", 0, None
        n += 1
    await db.commit()
    return {"saved": n}


async def cancel(db: AsyncSession, *, user_id, app: str, key: str) -> bool:
    row = (await db.execute(select(AppReminder).where(AppReminder.user_id == user_id, AppReminder.app == app,
                                                      AppReminder.rkey == key))).scalar_one_or_none()
    if row is None:
        return False
    row.status = "cancelled"
    await db.commit()
    return True


def _view(r: AppReminder) -> dict:
    try:
        res = json.loads(r.result or "{}")
    except ValueError:
        res = {}
    return {"key": r.rkey, "due_date": r.due_date, "hour": r.hour, "tz": r.tz, "status": r.status,
            "channels": (r.channels or "").split(",") if r.channels else [], "result": res,
            "sent_at": r.sent_at.isoformat() if r.sent_at else None, "attempts": r.attempts or 0}


async def channel_status(db: AsyncSession) -> Dict[str, Any]:
    """Which channels this server can actually deliver on (no secrets)."""
    tg = bool((os.environ.get("TELEGRAM_BOT_TOKEN") or "").strip() and (os.environ.get("TELEGRAM_CHAT_ID") or "").strip())
    gmail = False
    try:
        from app.services import drive_settings_service as dss

        gmail = bool(await dss.is_connected(db))
    except Exception:  # noqa: BLE001
        gmail = False
    smtp = bool((os.environ.get("SMTP_HOST") or "").strip())
    return {"telegram": tg, "email": gmail or smtp, "email_via": "gmail" if gmail else ("smtp" if smtp else None)}


async def listing(db: AsyncSession, *, user_id, app: str) -> Dict[str, Any]:
    rows = (await db.execute(select(AppReminder).where(AppReminder.user_id == user_id, AppReminder.app == app)
                             .order_by(AppReminder.send_at))).scalars().all()
    return {"channels": await channel_status(db), "items": [_view(r) for r in rows]}


def _public_link(link: str) -> str:
    base = ""
    for k in ("TELEGRAM_APP_BASE_URL", "BACKEND_PUBLIC_URL", "RENDER_EXTERNAL_URL", "PUBLIC_URL"):
        v = (os.environ.get(k) or "").strip().rstrip("/")
        if v:
            base = v
            break
    path = "/apps/learning-architecture" + (link if link.startswith("?") else ("?" + link if link else ""))
    return (base + path) if base else path


def _text(r: AppReminder) -> str:
    parts = [r.title or "یادآور", (r.detail or r.body or "").strip(), _public_link(r.link or "")]
    return "\n".join(p for p in parts if p)


async def _send_telegram(text: str) -> str:
    if not ((os.environ.get("TELEGRAM_BOT_TOKEN") or "").strip() and (os.environ.get("TELEGRAM_CHAT_ID") or "").strip()):
        return "skipped_unconfigured"
    from app.services.notification_service import send_telegram

    ok = await asyncio.to_thread(send_telegram, body=text)
    return "sent" if ok else "failed"


async def _send_email(db: AsyncSession, subject: str, text: str) -> str:
    to = (os.environ.get("NOTIFICATION_EMAIL_TO") or "").strip()
    if not to:
        try:
            from app.services import drive_settings_service as dss

            to = (await dss.get_account_email(db)) or ""
        except Exception:  # noqa: BLE001
            to = ""
    if not to:
        return "skipped_unconfigured"
    gmail_err = None
    try:
        from app.services.google_sync.gmail_service import send_email_gmail

        res = await send_email_gmail(db, to, subject, text)
        if res.get("ok"):
            return "sent"
        if res.get("error") != "not_connected":
            gmail_err = res.get("error") or "error"
    except Exception as exc:  # noqa: BLE001
        gmail_err = type(exc).__name__
        logger.warning("reminder gmail failed: %s", gmail_err)
    if (os.environ.get("SMTP_HOST") or "").strip():
        from app.services.notification_service import send_email

        ok = await asyncio.to_thread(send_email, to=to, subject=subject, body=text)
        return "sent" if ok else "failed"
    # Gmail IS connected but errored ⇒ a real failure (retried), not «unconfigured»
    return "failed" if gmail_err else "skipped_unconfigured"


WINDOW_HOURS = 12  # never send outside [hour, hour+12) local — no 23:30 or 04:30 messages


def _in_window(now: datetime, hour: int, tz: str) -> bool:
    loc = now.astimezone(_zone(tz))
    start = datetime.combine(loc.date(), time(max(0, min(23, hour)), 0), tzinfo=_zone(tz))
    return start <= loc < start + timedelta(hours=WINDOW_HOURS)


def _next_window(now: datetime, hour: int, tz: str) -> datetime:
    """The next moment ≥ now that is inside the local send window (today's hour or tomorrow's)."""
    if _in_window(now, hour, tz):
        return now
    loc = now.astimezone(_zone(tz))
    today = send_time_utc(loc.date().isoformat(), hour, tz)
    return today if today > now else send_time_utc((loc.date() + timedelta(days=1)).isoformat(), hour, tz)


EVENT = "knot_practice"  # the row in «تنظیمات › اعلان‌ها» that switches these reminders on/off


def _prefs():
    try:
        from app.services import notification_prefs as np

        return np
    except Exception:  # noqa: BLE001
        return None


async def _send_in_app(db: AsyncSession, r: AppReminder) -> str:
    try:
        from app.services.notification_service import notify_event

        n = await notify_event(EVENT, user_id=int(r.user_id or 0), db=db, title=r.title or "ورزشِ گره‌گشا",
                               message=(r.detail or r.body or "").strip() or "یک ورزشِ گره موعد است",
                               action_link=_public_link(r.link or ""), action_text="باز کن")
        return "sent" if n is not None else "failed"
    except Exception as exc:  # noqa: BLE001
        logger.warning("reminder in-app failed: %s", type(exc).__name__)
        return "failed"


async def deliver_due(db: AsyncSession, *, now: Optional[datetime] = None, senders=None) -> Dict[str, Any]:
    """Send every pending reminder whose time has come (the ``app_reminders`` job).

    * only inside the local window [hour, hour+12h); a late upsert or a retry outside it waits;
    * at most DAILY_CAP deliveries per user/app per LOCAL day, counted from the send log;
    * a channel that already got the message is never re-sent; only failed channels are retried."""
    from app.models.app_reminder import AppReminderSend

    now = now or datetime.now(timezone.utc)
    tg_send, mail_send = senders or (_send_telegram, lambda subj, txt: _send_email(db, subj, txt))
    rows = (await db.execute(select(AppReminder).where(AppReminder.status.in_(["pending", "retry"]),
                                                       AppReminder.send_at <= now)
                             .order_by(AppReminder.send_at, AppReminder.id).limit(50))).scalars().all()
    out = {"due": len(rows), "sent": 0, "deferred": 0, "failed": 0, "unconfigured": 0}
    for r in rows:
        if not _in_window(now, r.hour if r.hour is not None else 9, r.tz):
            r.send_at = _next_window(now, r.hour if r.hour is not None else 9, r.tz)
            out["deferred"] += 1
            await db.commit()
            continue
        zone = _zone(r.tz)
        local_day = now.astimezone(zone).date()
        start = datetime.combine(local_day, time(0, 0), tzinfo=zone).astimezone(timezone.utc)
        sent_today = (await db.execute(select(func.count(AppReminderSend.id)).where(
            AppReminderSend.user_id == r.user_id, AppReminderSend.app == r.app, AppReminderSend.at >= start))).scalar() or 0
        try:
            prev = json.loads(r.result or "{}") if r.status == "retry" else {}
        except ValueError:
            prev = {}
        chans = [c for c in (r.channels or "").split(",") if c and prev.get(c) != "sent"]
        if sent_today >= DAILY_CAP and not any(v == "sent" for v in prev.values()):
            r.send_at = send_time_utc((local_day + timedelta(days=1)).isoformat(), r.hour, r.tz)
            out["deferred"] += 1
            await db.commit()
            continue
        # the owner's notification settings (Settings › اعلان‌ها) rule: event off ⇒ nothing is sent;
        # a channel switched off there ⇒ «off_in_settings» (honest, not a failure, not «sent»)
        np = _prefs()
        if np is not None and not np.event_enabled(EVENT):
            r.status, r.result = "muted", json.dumps({"event": "off_in_settings"}, ensure_ascii=False)
            await db.commit()
            continue
        text = _text(r)
        res = dict(prev)
        if "in_app" not in res and senders is None:
            res["in_app"] = await _send_in_app(db, r)
        for c in chans:
            if np is not None and not np.channel_enabled(c):
                res[c] = "off_in_settings"
                continue
            try:
                res[c] = await (tg_send(text) if c == "telegram" else mail_send(r.title or "یادآور", text))
            except Exception as exc:  # noqa: BLE001
                logger.warning("reminder %s failed: %s", c, type(exc).__name__)
                res[c] = "failed"
        vals = set(res.values())
        r.attempts = (r.attempts or 0) + 1
        r.result = json.dumps(res, ensure_ascii=False)
        newly = [c for c in list(chans) + ["in_app"] if res.get(c) == "sent" and prev.get(c) != "sent"]
        if newly and not any(v == "sent" for v in prev.values()):
            db.add(AppReminderSend(user_id=r.user_id, app=r.app, rkey=r.rkey, at=now, result=r.result))
        if "failed" in vals and r.attempts < MAX_ATTEMPTS:
            r.status = "retry"
            r.send_at = _next_window(now + timedelta(minutes=min(15 * (2 ** r.attempts), 360)), r.hour if r.hour is not None else 9, r.tz)
            if "sent" in vals:
                r.sent_at = r.sent_at or now
            out["failed"] += 1
        elif "sent" in vals:
            r.status, r.sent_at = ("partial" if "failed" in vals else "sent"), (r.sent_at or now)
            out["sent"] += 1
        elif "failed" in vals:
            r.status = "failed"
            out["failed"] += 1
        else:  # nothing chosen, or every chosen channel is unconfigured — honest, not «sent»
            r.status = "unconfigured"
            out["unconfigured"] += 1
        await db.commit()
    return out
