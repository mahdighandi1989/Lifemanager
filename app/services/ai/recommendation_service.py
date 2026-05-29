"""Recommendation engine driven by user-need intent + keywords
(audit task 217909d2 ACs 38-42).

Audit task 14e65214 adds the personalized layer: ``RecommendationService``
turns the analyzed profile (interests + tastes + Big-Five personality + mood)
into ranked, typed suggestions — including career/long-term ones built from
the holistic profile.
"""
from __future__ import annotations

import re
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.local_file_entry import LocalFileEntry
from app.models.task import Task
from app.models.todo_item import TodoItem
from app.models.todo_list import TodoList, todo_list_items
from app.models.user_interest import UserInterest
from app.models.user_taste import UserTaste


# Intent keyword map — a tiny stand-in for a real NLP pipeline.
INTENT_KEYWORDS = {
    "watch_movie": ["movie", "film", "watch", "فیلم", "تماشا"],
    "read_book": ["book", "read", "کتاب", "خواندن"],
    "shopping": ["buy", "shop", "خرید"],
}


def _normalise(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip().lower()


def extract_intent_and_keywords(query: str) -> dict:
    """AC 42 — extract intent + keywords from a free-form user query."""
    normalised = _normalise(query)
    detected_intent: str | None = None
    matched_keywords: List[str] = []
    for intent, kws in INTENT_KEYWORDS.items():
        for kw in kws:
            if kw.lower() in normalised:
                detected_intent = intent
                matched_keywords.append(kw)
    return {
        "intent": detected_intent,
        "keywords": list(dict.fromkeys(matched_keywords)),  # de-dup, preserve order
    }


async def get_recommendations(
    db: AsyncSession, *, user_id: int, query: str
) -> List[dict]:
    """Return a list of {id, title, type} recommendations for ``user_id``
    that match the intent/keywords pulled from ``query``."""
    parsed = extract_intent_and_keywords(query)
    keywords = parsed["keywords"]
    if not keywords:
        return []
    out: List[dict] = []

    # Tasks
    tasks = await db.execute(select(Task).where(Task.user_id == user_id))
    for t in tasks.scalars().all():
        if any(kw.lower() in _normalise(t.title) for kw in keywords):
            out.append({"id": t.id, "title": t.title, "type": "task"})

    # Todo items via the user's lists
    todos = await db.execute(
        select(TodoItem)
        .join(todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id)
        .join(TodoList, TodoList.id == todo_list_items.c.todo_list_id)
        .where(TodoList.user_id == user_id)
    )
    for it in todos.scalars().all():
        if any(kw.lower() in _normalise(it.content) for kw in keywords):
            out.append({"id": it.id, "title": it.content, "type": "todo_item"})

    # Local files
    files = await db.execute(
        select(LocalFileEntry).where(LocalFileEntry.user_id == user_id)
    )
    for f in files.scalars().all():
        haystack = " ".join(filter(None, [f.source_path, f.summary, f.keywords]))
        if any(kw.lower() in _normalise(haystack) for kw in keywords):
            out.append({"id": f.id, "title": f.source_path, "type": "local_file"})

    return out


class RecommendationService:
    """Profile-aware recommendation generation (audit task 14e65214).

    Consumes the identified interests/tastes + the holistic personality/mood
    profile to produce ranked, typed suggestions. Each suggestion is a dict
    ``{id, content, type, score}`` — the shape GET /ai/personalized_recommendations
    returns (Step 3 AC16).
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_personalized_recommendations(self, user_id: int) -> List[dict]:
        """Rank suggestions from the user's verified interests/tastes, lifted by
        their current mood + personality. Higher-confidence interests rank first."""
        interests = (
            await self.db.execute(
                select(UserInterest).where(UserInterest.user_id == user_id)
            )
        ).scalars().all()
        tastes = (
            await self.db.execute(
                select(UserTaste).where(UserTaste.user_id == user_id)
            )
        ).scalars().all()

        recs: List[dict] = []
        next_id = 1
        for it in sorted(interests, key=lambda r: -(r.confidence_score or 0)):
            recs.append(
                {
                    "id": next_id,
                    "content": f"بر اساس علاقهٔ شما به «{it.value}»، یک گام تازه در حوزهٔ {it.category or 'عمومی'} بردارید.",
                    "type": it.category or "interest",
                    "score": round(it.confidence_score or 0.5, 3),
                    "reason": "interest" + ("·verified" if it.is_verified else ""),
                }
            )
            next_id += 1
        for ts in tastes:
            recs.append(
                {
                    "id": next_id,
                    "content": f"سلیقهٔ شما به «{ts.value}» را در انتخاب‌های روزمره لحاظ کنید.",
                    "type": "taste",
                    "score": round((ts.confidence_score or 0.4) * 0.9, 3),
                    "reason": "taste",
                }
            )
            next_id += 1

        # Mood/personality-aware additions (Step 5 AC28).
        career = await self.generate_recommendations_for_user(user_id)
        for c in career:
            c["id"] = next_id
            next_id += 1
            recs.append(c)

        if not recs:
            recs.append(
                {
                    "id": 1,
                    "content": "برای دریافت پیشنهادهای شخصی، ابتدا علایق خود را ثبت کنید یا اجازه دهید سیستم آن‌ها را شناسایی کند.",
                    "type": "general",
                    "score": 0.3,
                    "reason": "cold_start",
                }
            )
        recs.sort(key=lambda r: -r["score"])
        return recs

    async def generate_recommendations_for_user(self, user_id: int) -> List[dict]:
        """Mood + personality-driven suggestions (Step 5/7). Pulls the holistic
        profile and turns it into career/wellness nudges."""
        from app.services.ai.holistic_profile_service import HolisticProfileService

        profile = await HolisticProfileService(self.db).get_holistic_profile(user_id)
        out: List[dict] = []
        if profile is None:
            return out
        if profile.sentiment_score is not None and profile.sentiment_score < -0.15:
            out.append(
                {
                    "content": "به‌نظر می‌رسد این روزها تحت فشار هستید — یک کار کوتاه و رضایت‌بخش را زودتر انجام دهید.",
                    "type": "wellness",
                    "score": 0.7,
                    "reason": "mood",
                }
            )
        if profile.openness is not None and profile.openness > 0.6:
            out.append(
                {
                    "content": "گشودگی بالای شما فرصت خوبی برای یادگیری یک مهارت جدید مرتبط با علایق‌تان است.",
                    "type": "career",
                    "score": round(profile.openness, 3),
                    "reason": "personality",
                }
            )
        return out

    async def generate_recommendations(self, user, context: dict) -> List[dict]:
        """Holistic-profile-aware recommendations (Step 7 AC40). Retrieves the
        user's combined personality + mood profile and produces career/long-term
        suggestions grounded in it — never a flat template."""
        user_id = getattr(user, "id", user)
        from app.services.ai.career_path_service import CareerPathService
        from app.schemas.ai_schema import CareerPathRequest

        result = await CareerPathService(self.db).generate_career_paths(
            user_id, CareerPathRequest()
        )
        out: List[dict] = []
        for p in result.get("paths", []):
            out.append(
                {
                    "type": "career_path",
                    "recommendation": p["title"],
                    "reason": p["rationale"],
                    "score": p.get("fit_score", 0.0),
                }
            )
        return out
