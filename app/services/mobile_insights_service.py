"""بینشِ موبایل — turn the raw mobile activity trail into USED knowledge.

The audit found the phone feed was a «product island»: written to activity_logs,
never read. This service is the missing consumer — it aggregates the last N days
of mobile_* rows into a compact, human/AI-readable summary:

  * screen time per app + total, phone unlocks
  * call count + most-contacted people (from the person-linked call rows)
  * counts by category ([finance]/[otp]/[promo]/[message]) from SMS/notifications

Consumed by: the daily digest (a «موبایل» section), the weekly review, and the
AI data-access layer (so «چقدر با گوشی‌ام کار کردم؟» / «با کی بیشتر تماس داشتم؟»
have real answers). Read-only, never raises — a bad row must not break a report.
"""
from __future__ import annotations

import json
import logging
import re
from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

_CAT_RE = re.compile(r"^\[(\w+)\]")

# فروشگاهی → فارسیِ خوانا برای پرمصرف‌ترین اپ‌ها (fallback: خودِ نام بسته).
_APP_FA = {
    "org.telegram.messenger": "تلگرام", "com.whatsapp": "واتساپ",
    "com.instagram.android": "اینستاگرام", "com.google.android.youtube": "یوتیوب",
    "com.google.android.gm": "جیمیل", "com.android.chrome": "کروم",
    "com.google.android.apps.maps": "نقشه", "com.twitter.android": "توییتر (X)",
    "com.zhiliaoapp.musically": "تیک‌تاک", "ir.divar": "دیوار", "com.snapptrip": "اسنپ",
}


def _app_fa(pkg: str) -> str:
    return _APP_FA.get(pkg, pkg)


async def build_mobile_summary(db: AsyncSession, *, days: int = 7) -> Dict[str, Any]:
    """Compact summary of the owner's phone life over the trailing ``days``.

    Ordered by the EVENT time (occurred_at) when present, so a month-old call
    imported today doesn't distort «this week». Empty/degraded → zeros."""
    from app.models.activity_log import ActivityLog

    out: Dict[str, Any] = {
        "days": days, "calls": 0, "top_contacts": [],
        "screen_minutes": 0, "unlocks": 0, "top_apps": [],
        "sms": 0, "notifications": 0, "by_category": {}, "has_data": False,
    }
    try:
        now = datetime.now(timezone.utc)
        since = now - timedelta(days=days)
        when = func.coalesce(ActivityLog.occurred_at, ActivityLog.created_at)
        rows = (
            await db.execute(
                select(
                    ActivityLog.action, ActivityLog.detail, ActivityLog.entity_label,
                    ActivityLog.context_type, ActivityLog.context_id,
                ).where(ActivityLog.action.like("mobile_%"), when >= since)
            )
        ).all()
        if not rows:
            return out

        out["has_data"] = True
        cats: Counter = Counter()
        contacts: Counter = Counter()
        apps: Counter = Counter()

        for action, detail, label, ctype, cid in rows:
            detail = detail or ""
            m = _CAT_RE.match(detail)
            if m:
                cats[m.group(1)] += 1
            if action == "mobile_call":
                out["calls"] += 1
                if ctype == "person" and label:
                    contacts[label] += 1
            elif action == "mobile_sms":
                out["sms"] += 1
            elif action == "mobile_notification":
                out["notifications"] += 1
            elif action == "mobile_usage":
                # detail is a JSON blob {apps:[{app,minutes}], unlocks, sessions}
                try:
                    payload = json.loads(detail)
                    out["unlocks"] += int(payload.get("unlocks") or 0)
                    for a in payload.get("apps") or []:
                        mins = int(a.get("minutes") or 0)
                        out["screen_minutes"] += mins
                        if a.get("app"):
                            apps[a["app"]] += mins
                except Exception:
                    pass

        out["by_category"] = dict(cats)
        out["top_contacts"] = [
            {"name": n, "calls": c} for n, c in contacts.most_common(5)
        ]
        out["top_apps"] = [
            {"app": _app_fa(a), "minutes": m} for a, m in apps.most_common(6)
        ]
        return out
    except Exception as exc:
        logger.debug("mobile summary skipped: %r", exc)
        return out


def summary_to_fa_lines(s: Dict[str, Any]) -> list[str]:
    """Human Persian bullet lines for the digest / AI prompt."""
    if not s.get("has_data"):
        return []
    lines = [f"📱 موبایل ({s['days']} روز اخیر):"]
    if s.get("screen_minutes"):
        hrs = round(s["screen_minutes"] / 60.0, 1)
        top = "، ".join(f"{a['app']} {round(a['minutes']/60.0,1)}س" for a in s["top_apps"][:3])
        lines.append(f"  کارکرد صفحه ~{hrs} ساعت" + (f" (بیشترین: {top})" if top else ""))
    if s.get("unlocks"):
        lines.append(f"  {s['unlocks']} بار باز کردن قفل گوشی")
    if s.get("calls"):
        who = "، ".join(f"{c['name']} ({c['calls']})" for c in s["top_contacts"][:3])
        lines.append(f"  {s['calls']} تماس" + (f" — بیشترین با: {who}" if who else ""))
    if s.get("sms") or s.get("notifications"):
        lines.append(f"  {s.get('sms',0)} پیامک، {s.get('notifications',0)} اعلان")
    return lines
