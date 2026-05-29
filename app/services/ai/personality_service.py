"""Personality analysis (audit task 14e65214, Step 6).

``analyze_user_personality`` derives the Big-Five dimensions from the user's
*actual behaviour* — how much they finish, how overdue they run, the breadth
of their interests, their social interaction volume, their mood — rather than a
canned template. That groundedness is the point: the memo demanded "خیلی دقیق،
نه به صورت کلیشه‌ای". Results persist as a ``PersonalityAssessment`` plus one
``PersonalityTrait`` row per dimension, and are mirrored onto the User cache.
"""
from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.personality import PersonalityAssessment, PersonalityTrait
from app.services.ai import profile_analysis as pa

_TRAIT_BLURB = {
    "openness": "گشودگی به تجربه و ایده‌های نو",
    "conscientiousness": "وظیفه‌شناسی و پایبندی به انجام کارها",
    "extraversion": "برون‌گرایی و انرژی در تعاملات اجتماعی",
    "agreeableness": "سازگاری و همکاری با دیگران",
    "neuroticism": "حساسیت به فشار و نوسان هیجانی",
}


class PersonalityService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _collect_signals(self, user_id: int) -> tuple[list[str], dict]:
        from app.models.user_interest import UserInterest
        from app.services.ai.ai_data_access_service import get_user_tasks
        from app.services.ai.sentiment_personality_service import (
            SentimentPersonalityService,
        )
        from app.services.task_analysis import get_task_context

        tasks = await get_user_tasks(self.db, user_id=user_id)
        texts = [(t.title or "") for t in tasks]
        ctx = await get_task_context(self.db, user_id=user_id)
        total = max(1, ctx["total"])

        cats = await self.db.execute(
            select(func.count(func.distinct(UserInterest.category))).where(
                UserInterest.user_id == user_id
            )
        )
        distinct_categories = cats.scalar() or 0

        social_count = await self._social_count(user_id)
        sentiment = await SentimentPersonalityService(self.db).get_latest_sentiment_profile(
            user_id
        )
        signals = {
            "completion_rate": ctx["completed"] / total,
            "overdue_ratio": ctx["overdue"] / total,
            "interest_categories": distinct_categories,
            "social_count": social_count,
            "sentiment_score": sentiment.get("sentiment_score") or 0.0,
        }
        return texts, signals

    async def _social_count(self, user_id: int) -> int:
        """Best-effort count of the user's people network (interaction proxy)."""
        try:
            from app.models.person import Person

            res = await self.db.execute(
                select(func.count(Person.id)).where(Person.user_id == user_id)
            )
            return int(res.scalar() or 0)
        except Exception:
            return 0

    async def analyze_user_personality(self, user_id: int) -> dict:
        texts, signals = await self._collect_signals(user_id)
        scores = pa.infer_big_five(texts=texts, signals=signals)
        summary = self._summarize(scores)

        assessment = PersonalityAssessment(
            user_id=user_id,
            summary=summary,
            traits=scores,
            model_used="heuristic-v1",
        )
        self.db.add(assessment)
        await self.db.flush()  # need assessment.id for the trait rows
        for name, score in scores.items():
            self.db.add(
                PersonalityTrait(
                    user_id=user_id,
                    assessment_id=assessment.id,
                    name=name,
                    score=score,
                    description=_TRAIT_BLURB.get(name),
                )
            )

        await self._mirror_to_user(user_id, scores)
        await self.db.commit()
        return self._profile(user_id, scores, summary)

    async def get_personality_profile(self, user_id: int) -> dict:
        row = (
            await self.db.execute(
                select(PersonalityAssessment)
                .where(PersonalityAssessment.user_id == user_id)
                .order_by(PersonalityAssessment.id.desc())
                .limit(1)
            )
        ).scalars().first()
        if row is None:
            return {"user_id": user_id, "summary": "هنوز تحلیل شخصیتی انجام نشده است.", "traits": []}
        return self._profile(user_id, dict(row.traits or {}), row.summary)

    @staticmethod
    def _summarize(scores: dict) -> str:
        top = sorted(scores.items(), key=lambda kv: -kv[1])[:2]
        labels = "، ".join(_TRAIT_BLURB.get(n, n) for n, _ in top)
        return f"برجسته‌ترین ویژگی‌های شخصیتی شما: {labels}."

    async def _mirror_to_user(self, user_id: int, scores: dict) -> None:
        from app.models.user import User

        user = (
            await self.db.execute(select(User).where(User.id == user_id))
        ).scalar_one_or_none()
        if user is not None:
            user.personality_traits = scores

    @staticmethod
    def _profile(user_id: int, scores: dict, summary: str) -> dict:
        return {
            "user_id": user_id,
            "openness": scores.get("openness"),
            "conscientiousness": scores.get("conscientiousness"),
            "extraversion": scores.get("extraversion"),
            "agreeableness": scores.get("agreeableness"),
            "neuroticism": scores.get("neuroticism"),
            "summary": summary,
            "traits": [
                {"name": n, "score": s, "description": _TRAIT_BLURB.get(n)}
                for n, s in scores.items()
            ],
        }
