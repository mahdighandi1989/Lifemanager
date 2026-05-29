"""Mood / sentiment analysis (audit task 14e65214, Step 5).

Turns a text / audio-reference / behavior signal into a sentiment snapshot,
persists it on ``AIAssessment`` (user-scoped) and appends it to the user's
rolling ``UserContext.mood_history`` so the recommendation engine can react to
mood *changes*, not just a single reading. Offline + deterministic.
"""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_assessment import AIAssessment
from app.models.context import UserContext
from app.services.ai import profile_analysis as pa

# Behavior-type → a proxy phrase we can run the lexical analyzer over, so a
# caller who only sends ``behavior_type`` still gets a sentiment reading.
_BEHAVIOR_PROXY = {
    "procrastinating": "tired stress worried",
    "productive": "good success energy",
    "idle": "neutral",
    "social": "happy enjoy",
}


class SentimentPersonalityService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _resolve_text(
        self, user_id: int, text, behavior_type
    ) -> str:
        if text:
            return text
        if behavior_type and behavior_type in _BEHAVIOR_PROXY:
            return _BEHAVIOR_PROXY[behavior_type]
        # Fall back to the user's recent task titles so a bare call still
        # has something grounded to read.
        from app.services.ai.ai_data_access_service import get_user_tasks

        tasks = await get_user_tasks(self.db, user_id=user_id)
        return " ".join((t.title or "") for t in tasks[-10:])

    async def analyze_and_save_sentiment(
        self, user_id: int, *, text=None, audio_url=None, behavior_type=None
    ) -> dict:
        """Analyze the signal, persist the snapshot, return the profile dict."""
        resolved = await self._resolve_text(user_id, text, behavior_type)
        result = pa.analyze_sentiment(resolved)
        now = datetime.now(timezone.utc)

        assessment = AIAssessment(
            user_id=user_id,
            assessment_type="sentiment",
            sentiment=result["label"],
            sentiment_score=result["sentiment_score"],
            dominant_emotion=result["dominant_emotion"],
            mood_timestamp=now,
            analysis_text=resolved[:500] if resolved else None,
        )
        self.db.add(assessment)

        # Append to the rolling mood history on UserContext.
        ctx = (
            await self.db.execute(
                select(UserContext).where(UserContext.user_id == user_id)
            )
        ).scalars().first()
        if ctx is None:
            ctx = UserContext(user_id=user_id)
            self.db.add(ctx)
        history = list(ctx.mood_history or [])
        history.append(
            {
                "emotion": result["dominant_emotion"],
                "score": result["sentiment_score"],
                "at": now.isoformat(),
            }
        )
        ctx.mood_history = history[-50:]  # keep the last 50 readings
        ctx.mood = result["dominant_emotion"]

        await self.db.commit()
        await self.db.refresh(assessment)
        return self._to_profile(assessment)

    async def get_latest_sentiment_profile(self, user_id: int) -> dict:
        row = (
            await self.db.execute(
                select(AIAssessment)
                .where(
                    AIAssessment.user_id == user_id,
                    AIAssessment.sentiment_score.isnot(None),
                )
                .order_by(AIAssessment.id.desc())
                .limit(1)
            )
        ).scalars().first()
        if row is None:
            return {
                "user_id": user_id,
                "sentiment_score": None,
                "dominant_emotion": None,
                "mood_timestamp": None,
                "summary": "هنوز تحلیلی از روحیات ثبت نشده است.",
            }
        return self._to_profile(row)

    @staticmethod
    def _to_profile(a: AIAssessment) -> dict:
        return {
            "user_id": a.user_id,
            "sentiment_score": a.sentiment_score,
            "dominant_emotion": a.dominant_emotion,
            "mood_timestamp": a.mood_timestamp,
            "summary": f"حال‌وهوای غالب: {a.dominant_emotion} (امتیاز {a.sentiment_score}).",
        }
