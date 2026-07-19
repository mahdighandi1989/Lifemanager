"""Google Calendar sync — rolling window of upcoming events (REST,
injectable fetcher). Cancelled events are kept with status='cancelled'
(quarantine rule) so a vanished meeting is visible, not silently gone.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Callable, Dict, List, Optional
from urllib.parse import quote

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.personal_sync import PersonalEvent
from app.services.google_sync.gmail_service import _default_fetcher, _headers, get_access_token

logger = logging.getLogger(__name__)

CALENDAR_API = "https://www.googleapis.com/calendar/v3"


def parse_gcal_time(value: Optional[dict]) -> tuple[Optional[datetime], bool]:
    """Google event time: {"dateTime": iso} (timed) or {"date": "YYYY-MM-DD"}
    (all-day). Returns (utc_datetime, all_day)."""
    if not value:
        return None, False
    if value.get("dateTime"):
        try:
            ts = datetime.fromisoformat(str(value["dateTime"]).replace("Z", "+00:00"))
            return ts.astimezone(timezone.utc), False
        except Exception:
            return None, False
    if value.get("date"):
        try:
            day = datetime.fromisoformat(value["date"])
            return day.replace(tzinfo=timezone.utc), True
        except Exception:
            return None, True
    return None, False


def normalize_event(raw: Dict[str, Any], calendar_id: str = "primary") -> Optional[Dict[str, Any]]:
    eid = (raw or {}).get("id")
    if not eid:
        return None
    start, all_day = parse_gcal_time(raw.get("start"))
    end, _ = parse_gcal_time(raw.get("end"))
    return {
        "id": str(eid)[:128],
        "calendar_id": calendar_id,
        "summary": (raw.get("summary") or "(بدون عنوان)")[:512],
        "description": (raw.get("description") or "")[:4000] or None,
        "location": (raw.get("location") or "")[:512] or None,
        "start_at": start,
        "end_at": end,
        "all_day": all_day,
        "status": raw.get("status"),
        "html_link": (raw.get("htmlLink") or "")[:1024] or None,
    }


async def fetch_upcoming(
    access_token: str,
    days: int = 14,
    fetcher: Optional[Callable] = None,
    now: Optional[datetime] = None,
) -> List[Dict[str, Any]]:
    fetch = fetcher or _default_fetcher
    now = now or datetime.now(timezone.utc)
    time_min = quote((now - timedelta(days=1)).isoformat())
    time_max = quote((now + timedelta(days=max(int(days), 1))).isoformat())
    data = await fetch(
        "GET",
        f"{CALENDAR_API}/calendars/primary/events?timeMin={time_min}&timeMax={time_max}"
        "&singleEvents=true&orderBy=startTime&maxResults=100",
        _headers(access_token),
    )
    items = (data or {}).get("items", []) or []
    return [e for e in (normalize_event(i) for i in items) if e]


async def sync_calendar(
    db: AsyncSession,
    days: int = 14,
    fetcher: Optional[Callable] = None,
    access_token: Optional[str] = None,
    now: Optional[datetime] = None,
) -> Dict[str, Any]:
    """Upsert the upcoming window into personal_events. Never raises."""
    token = access_token or await get_access_token(db)
    if not token:
        return {"ok": False, "error": "not_connected", "fetched": 0, "new": 0}
    try:
        events = await fetch_upcoming(token, days=days, fetcher=fetcher, now=now)
    except Exception as exc:
        from app.services.google_sync.gmail_service import diagnose_google_error

        diagnosis = diagnose_google_error(exc)
        logger.warning("calendar fetch failed: %s", diagnosis)
        return {"ok": False, "error": diagnosis["detail"], "reason": diagnosis["reason"], "fetched": 0, "new": 0}

    new_count = 0
    sync_ts = datetime.now(timezone.utc)
    try:
        ids = [e["id"] for e in events]
        existing = {
            row.id: row
            for row in (
                (await db.execute(select(PersonalEvent).where(PersonalEvent.id.in_(ids))))
                .scalars()
                .all()
            )
        }
        for e in events:
            row = existing.get(e["id"])
            if row is None:
                row = PersonalEvent(**e)
                db.add(row)
                new_count += 1
            else:
                for field, value in e.items():
                    setattr(row, field, value)
            row.synced_at = sync_ts
        await db.commit()
    except Exception as exc:
        await db.rollback()
        return {"ok": False, "error": f"db: {type(exc).__name__}", "fetched": len(events), "new": 0}
    return {"ok": True, "fetched": len(events), "new": new_count}
