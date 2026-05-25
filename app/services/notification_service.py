from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional

from app.models.notification import Notification
from app.schemas.notification_schema import NotificationCreate


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_notification(self, notification_data: NotificationCreate, user_id: int) -> Notification:
        db_notification = Notification(
            **notification_data.dict(),
            user_id=user_id
        )
        self.db.add(db_notification)
        await self.db.commit()
        await self.db.refresh(db_notification)
        return db_notification

    async def get_user_notifications(self, user_id: int, limit: int = 50, offset: int = 0) -> List[Notification]:
        result = await self.db.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_notification(self, notification_id: int, user_id: int) -> Optional[Notification]:
        result = await self.db.execute(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.user_id == user_id
            )
        )
        return result.scalar_one_or_none()

    async def mark_as_read(self, notification_id: int, user_id: int) -> Optional[Notification]:
        notification = await self.get_notification(notification_id, user_id)
        if not notification:
            return None
        notification.is_read = True
        await self.db.commit()
        await self.db.refresh(notification)
        return notification

    async def delete_notification(self, notification_id: int, user_id: int) -> bool:
        result = await self.db.execute(
            delete(Notification).where(
                Notification.id == notification_id,
                Notification.user_id == user_id
            )
        )
        await self.db.commit()
        return result.rowcount > 0

    async def get_unread_count(self, user_id: int) -> int:
        result = await self.db.execute(
            select(Notification).where(
                Notification.user_id == user_id,
                Notification.is_read == False
            )
        )
        return len(list(result.scalars().all()))