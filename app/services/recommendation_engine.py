"""Contextual recommendation engine (audit task 2165524b AC 7).

``generate_contextual_recommendations`` fuses the three signal families the
user's voice memo described — location-based (near a place from your lists),
physiological (heart-rate / physical state), and behavioral (idle / bored) —
into a single ranked list and persists each as a ``ContextualRecommendation``.
Degrades gracefully: missing signals just drop their family.
"""
from __future__ import annotations

import logging
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.recommendation import ContextualRecommendation
from app.services.google_maps_service import find_nearby_places

logger = logging.getLogger(__name__)


async def generate_contextual_recommendations(
    db: AsyncSession,
    *,
    user_id: int,
    context: Optional[dict] = None,
    persist: bool = True,
) -> List[dict]:
    """Return recommendations combining location/physiological/behavioral
    signals from ``context`` ({current_location, heart_rate, activity_status,
    mood}). Each is persisted as a ContextualRecommendation when ``persist``.
    """
    context = context or {}
    recs: List[dict] = []

    # ── Behavioral: idle/bored → nudge a pending item ────────────────
    if context.get("activity_status") == "idle":
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

    # ── Location-based: near a place (needs a Maps key) ──────────────
    loc = context.get("current_location") or {}
    if loc.get("lat") is not None and loc.get("lng") is not None:
        places = await find_nearby_places(loc["lat"], loc["lng"])
        for place in places[:3]:
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
                    context_snapshot=context,
                )
            )
        await db.commit()

    return recs
