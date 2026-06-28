"""Contextual recommendation engine (audit task 2165524b AC 7).

``generate_contextual_recommendations`` fuses the three signal families the
user's voice memo described — location-based (near a place where an item from
your lists can be done), physiological (heart-rate / physical state), and
behavioral (idle / bored) — into a single ranked list and persists each as a
``ContextualRecommendation``. Degrades gracefully: missing signals just drop
their family.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.recommendation import ContextualRecommendation
from app.services.google_maps_service import find_nearby_places

logger = logging.getLogger(__name__)


def _idle_threshold_minutes() -> int:
    try:
        from app.config import settings

        return int(getattr(settings, "CONTEXT_IDLE_MINUTES", 60))
    except Exception:
        return 60


def _parse_dt(value) -> Optional[datetime]:
    """Coerce a datetime or ISO string into an aware datetime, else None."""
    if value is None:
        return None
    dt = value
    if isinstance(value, str):
        try:
            dt = datetime.fromisoformat(value)
        except ValueError:
            return None
    if not isinstance(dt, datetime):
        return None
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt


def _is_idle(context: dict) -> bool:
    """True when activity_status is explicitly 'idle', OR when last_activity_time
    is older than the configured idle threshold (auto-detection — "ببینه مدتی
    کار نکردم، حدس بزنه بیکارم"). An empty context is never idle."""
    if context.get("activity_status") == "idle":
        return True
    last = _parse_dt(context.get("last_activity_time"))
    if last is None:
        return False
    age_min = (datetime.now(timezone.utc) - last).total_seconds() / 60.0
    return age_min >= _idle_threshold_minutes()


async def _open_tasks(db: AsyncSession, user_id: int) -> list:
    """The caller's actionable (not done/cancelled) tasks — the "items on my
    lists" the location matcher correlates against nearby places."""
    from app.models.task import Task

    rows = (
        await db.execute(select(Task).where(Task.user_id == user_id))
    ).scalars().all()
    open_states = {"todo", "in_progress"}
    out = []
    for t in rows:
        status = getattr(t, "status", None)
        status = getattr(status, "value", status)
        if status is None or status in open_states:
            out.append(t)
    return out


def _match_task_to_place(tasks: list, place: dict):
    """Pick the registered task most relevant to a nearby place. Tries, in order:
    a geographic match (a task pinned within ~300m of the place), then a keyword
    overlap between the task title and the place name. Returns the Task or None."""
    plat, plng = place.get("lat"), place.get("lng")
    if plat is not None and plng is not None:
        for t in tasks:
            tlat, tlng = getattr(t, "location_lat", None), getattr(t, "location_lng", None)
            if tlat is not None and tlng is not None:
                # ~0.003 deg ≈ 300m — a coarse "same spot" check (no haversine
                # needed at this radius).
                if abs(float(tlat) - float(plat)) < 0.003 and abs(float(tlng) - float(plng)) < 0.003:
                    return t
    name = (place.get("name") or "").lower()
    if name:
        name_tokens = {w for w in name.replace("،", " ").split() if len(w) >= 3}
        for t in tasks:
            title = (getattr(t, "title", "") or "").lower()
            title_tokens = {w for w in title.replace("،", " ").split() if len(w) >= 3}
            if title_tokens & name_tokens:
                return t
            # substring either direction (handles single-word items like "نان")
            if title and (title in name or any(tok in name for tok in title_tokens)):
                return t
    return None


async def generate_contextual_recommendations(
    db: AsyncSession,
    *,
    user_id: int,
    context: Optional[dict] = None,
    persist: bool = True,
) -> List[dict]:
    """Return recommendations combining location/physiological/behavioral
    signals from ``context`` ({current_location, heart_rate, activity_status,
    mood, last_activity_time}). Each is persisted as a ContextualRecommendation
    when ``persist``.
    """
    context = context or {}
    recs: List[dict] = []

    # ── Behavioral: idle/bored → nudge a pending item ────────────────
    # Idle is either explicit (activity_status="idle") or inferred from a stale
    # last_activity_time (auto-detection).
    if _is_idle(context):
        recs.append(
            {
                "recommendation_type": "behavioral",
                "text": "به نظر بیکارید — یکی از کارهای باز لیست‌تان را شروع کنید.",
            }
        )

    # ── Physiological: heart-rate aware ──────────────────────────────
    hr = context.get("heart_rate")
    if hr is not None:
        if hr > 100:
            recs.append(
                {
                    "recommendation_type": "physiological",
                    "text": "ضربان قلب بالاست — یک تمرین آرام‌سازی کوتاه مناسب است.",
                }
            )
        else:
            recs.append(
                {
                    "recommendation_type": "physiological",
                    "text": "وضعیت جسمی پایدار است — زمان خوبی برای یک کار فعال.",
                }
            )

    # ── Location-based: near a place where a registered item can be done ──
    # Correlate the user's OPEN tasks with nearby Google Maps places so the
    # nudge names the actual item ("فلان چیزو تو اون مغازه می‌تونی پیدا کنی"),
    # not just the place. Falls back to a generic nudge when nothing matches.
    loc = context.get("current_location") or {}
    if loc.get("lat") is not None and loc.get("lng") is not None:
        places = await find_nearby_places(loc["lat"], loc["lng"])
        if places:
            open_tasks = await _open_tasks(db, user_id)
            for place in places[:3]:
                matched = _match_task_to_place(open_tasks, place) if open_tasks else None
                if matched is not None:
                    recs.append(
                        {
                            "recommendation_type": "location",
                            "text": (
                                f"نزدیک «{place.get('name')}» هستید — می‌توانید "
                                f"«{getattr(matched, 'title', '')}» را همین‌جا انجام دهید."
                            ),
                            "task_id": getattr(matched, "id", None),
                        }
                    )
                else:
                    recs.append(
                        {
                            "recommendation_type": "location",
                            "text": f"نزدیک «{place.get('name')}» هستید — موردی از لیست‌تان همین‌جا قابل انجام است.",
                        }
                    )

    if persist and recs:
        for rec in recs:
            db.add(
                ContextualRecommendation(
                    user_id=user_id,
                    recommendation_type=rec["recommendation_type"],
                    text=rec["text"],
                    task_id=rec.get("task_id"),
                    context_snapshot=context,
                )
            )
        await db.commit()

    return recs
