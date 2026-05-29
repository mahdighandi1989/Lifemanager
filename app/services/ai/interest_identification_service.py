"""Interest + taste identification (audit task 14e65214, Step 2).

``identify_and_verify_interests`` reads the signals the user has already given
the app — their task titles, todo-item content, project names — and distils
recurring themes into ``UserInterest`` / ``UserTaste`` rows. The voice memo's
key demand was certainty ("مطمئن بشن که این علاقه است ... تشخیص می‌دن این علاقه
است یا چیز دیگه است"): a theme is only ``is_verified`` when it recurs (appears
≥ 2× across the user's data), which is how we separate a real interest from a
one-off mention. Confidence scales with frequency.

Deterministic + offline; a configured model can enrich later.
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_interest import UserInterest
from app.models.user_taste import UserTaste
from app.services.ai import profile_analysis as pa
from app.services.ai.ai_data_access_service import get_user_data_context

# A theme must recur this many times before we mark it verified.
_VERIFY_THRESHOLD = 2


class InterestIdentificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _gather_texts(self, user_id: int) -> list[str]:
        ctx = await get_user_data_context(self.db, user_id=user_id)
        texts: list[str] = []
        texts += [t.get("title") or "" for t in ctx.get("tasks", [])]
        texts += [i.get("content") or "" for i in ctx.get("todo_items", [])]
        texts += [p.get("name") or "" for p in ctx.get("projects", [])]
        return [t for t in texts if t]

    async def _existing_values(self, user_id: int) -> set[str]:
        i_rows = await self.db.execute(
            select(UserInterest.value).where(UserInterest.user_id == user_id)
        )
        t_rows = await self.db.execute(
            select(UserTaste.value).where(UserTaste.user_id == user_id)
        )
        return {v.lower() for (v,) in i_rows.all()} | {v.lower() for (v,) in t_rows.all()}

    async def identify_and_verify_interests(self, user_id: int) -> dict:
        """Scan the user's data, persist newly-found interests/tastes, and
        return ``{identified, verified}`` counts."""
        texts = await self._gather_texts(user_id)
        freqs = pa.keyword_frequencies(texts)
        existing = await self._existing_values(user_id)

        identified = 0
        verified = 0
        for term, count in sorted(freqs.items(), key=lambda kv: (-kv[1], kv[0])):
            if term in existing:
                continue
            confidence = min(1.0, count / 3.0)
            is_verified = count >= _VERIFY_THRESHOLD
            if pa.is_taste(term):
                self.db.add(
                    UserTaste(
                        user_id=user_id,
                        category=pa.categorize(term),
                        value=term,
                        source="data_analysis",
                        confidence_score=confidence,
                        is_verified=is_verified,
                    )
                )
            else:
                self.db.add(
                    UserInterest(
                        user_id=user_id,
                        interest_type="topic",
                        category=pa.categorize(term),
                        value=term,
                        source="data_analysis",
                        confidence_score=confidence,
                        is_verified=is_verified,
                    )
                )
            identified += 1
            verified += int(is_verified)

        if identified:
            await self.db.commit()

        await self._sync_user_summary(user_id)
        return {"identified": identified, "verified": verified}

    async def _sync_user_summary(self, user_id: int) -> None:
        """Denormalise verified interests onto User.interests (Step 3 cache)."""
        from app.models.user import User

        rows = await self.db.execute(
            select(UserInterest).where(
                UserInterest.user_id == user_id, UserInterest.is_verified.is_(True)
            )
        )
        verified = [r.value for r in rows.scalars().all()]
        user = (
            await self.db.execute(select(User).where(User.id == user_id))
        ).scalar_one_or_none()
        if user is not None:
            user.interests = {"verified": verified}
            await self.db.commit()
