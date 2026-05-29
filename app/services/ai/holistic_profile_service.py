"""Holistic profile assembly (audit task 14e65214, Step 7).

Persists/reads the combined personality + mood snapshot on ``AIAssessment``
(the ``assessment_type='holistic_profile'`` rows). This is the single record
the career-path engine and the recommendation engine read to reason over the
*whole* person — interests, stable traits, and current mood together.
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_assessment import AIAssessment
from app.schemas.ai_schema import HolisticAssessmentCreate

_FIELDS = (
    "openness", "conscientiousness", "extraversion", "agreeableness",
    "neuroticism", "sentiment_score", "dominant_emotion", "mood_timestamp",
)


class HolisticProfileService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_or_update_assessment(
        self, data: HolisticAssessmentCreate
    ) -> AIAssessment:
        """Upsert the holistic profile row for ``data.user_id``."""
        existing = await self._latest(data.user_id, data.assessment_type)
        if existing is None:
            existing = AIAssessment(
                user_id=data.user_id, assessment_type=data.assessment_type
            )
            self.db.add(existing)
        for field in _FIELDS:
            setattr(existing, field, getattr(data, field))
        await self.db.commit()
        await self.db.refresh(existing)
        return existing

    async def get_holistic_profile(self, user_id: int) -> AIAssessment | None:
        return await self._latest(user_id, "holistic_profile")

    async def build_from_components(self, user_id: int) -> AIAssessment:
        """Compose the holistic row from the stored personality + sentiment
        analyses — the integration the memo described ("همین چیزا رو تحلیل
        کنن"). Falls back to whatever components exist."""
        from app.services.ai.personality_service import PersonalityService
        from app.services.ai.sentiment_personality_service import (
            SentimentPersonalityService,
        )

        personality = await PersonalityService(self.db).get_personality_profile(user_id)
        sentiment = await SentimentPersonalityService(
            self.db
        ).get_latest_sentiment_profile(user_id)
        payload = HolisticAssessmentCreate(
            user_id=user_id,
            openness=personality.get("openness"),
            conscientiousness=personality.get("conscientiousness"),
            extraversion=personality.get("extraversion"),
            agreeableness=personality.get("agreeableness"),
            neuroticism=personality.get("neuroticism"),
            sentiment_score=sentiment.get("sentiment_score"),
            dominant_emotion=sentiment.get("dominant_emotion"),
            mood_timestamp=sentiment.get("mood_timestamp"),
        )
        return await self.create_or_update_assessment(payload)

    async def _latest(self, user_id: int, assessment_type: str) -> AIAssessment | None:
        row = (
            await self.db.execute(
                select(AIAssessment)
                .where(
                    AIAssessment.user_id == user_id,
                    AIAssessment.assessment_type == assessment_type,
                )
                .order_by(AIAssessment.id.desc())
                .limit(1)
            )
        ).scalars().first()
        return row
