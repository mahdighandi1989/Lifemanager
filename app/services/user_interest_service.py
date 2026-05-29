"""CRUD service for user interests + tastes (audit task 14e65214, Step 1).

Plain async SQLAlchemy CRUD. Ownership is enforced on delete so a caller can
only remove their own row (returns False otherwise → the route 404s).
"""
from typing import List, Optional

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_interest import UserInterest
from app.models.user_taste import UserTaste
from app.schemas.user_interest_schema import UserInterestCreate, UserTasteCreate


class UserInterestService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── interests ────────────────────────────────────────────────────
    async def create_interest(
        self, user_id: int, interest_data: UserInterestCreate
    ) -> UserInterest:
        new_interest = UserInterest(user_id=user_id, **interest_data.model_dump())
        self.db.add(new_interest)
        await self.db.commit()
        await self.db.refresh(new_interest)
        return new_interest

    async def get_interests_by_user(self, user_id: int) -> List[UserInterest]:
        result = await self.db.execute(
            select(UserInterest).where(UserInterest.user_id == user_id)
        )
        return list(result.scalars().all())

    async def get_interest_by_id(self, interest_id: int) -> Optional[UserInterest]:
        result = await self.db.execute(
            select(UserInterest).where(UserInterest.id == interest_id)
        )
        return result.scalar_one_or_none()

    async def delete_interest(self, interest_id: int, user_id: int) -> bool:
        interest = await self.get_interest_by_id(interest_id)
        if not interest or interest.user_id != user_id:
            return False
        await self.db.execute(
            delete(UserInterest).where(UserInterest.id == interest_id)
        )
        await self.db.commit()
        return True

    # ── tastes ───────────────────────────────────────────────────────
    async def create_taste(
        self, user_id: int, taste_data: UserTasteCreate
    ) -> UserTaste:
        new_taste = UserTaste(user_id=user_id, **taste_data.model_dump())
        self.db.add(new_taste)
        await self.db.commit()
        await self.db.refresh(new_taste)
        return new_taste

    async def get_tastes_by_user(self, user_id: int) -> List[UserTaste]:
        result = await self.db.execute(
            select(UserTaste).where(UserTaste.user_id == user_id)
        )
        return list(result.scalars().all())
