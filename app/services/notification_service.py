from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional

from app.models.notification import Notification
from app.schemas.notification import NotificationCreate

async def create_notification(db: AsyncSession, notification_data: NotificationCreate, user_id: int) -> Notification:
    db_notification = Notification(
        **notification_data.dict(),
        user_id=user_id
    )
    db.add(db_notification)
    await db.commit()
    await db.refresh(db_notification)
    return db_notification

async def get_user_notifications(db: AsyncSession, user_id: int, limit: int = 50, offset: int = 0) -> List[Notification]:
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(result.scalars().all())

async def get_notification(db: AsyncSession, notification_id: int, user_id: int) -> Optional[Notification]:
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id
        )
    )
    return result.scalar_one_or_none()

async def mark_as_read(db: AsyncSession, notification_id: int, user_id: int) -> Optional[Notification]:
    notification = await get_notification(db, notification_id, user_id)
    if not notification:
        return None
    notification.is_read = True
    await db.commit()
    await db.refresh(notification)
    return notification

async def delete_notification(db: AsyncSession, notification_id: int, user_id: int) -> bool:
    result = await db.execute(
        delete(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id
        )
    )
    await db.commit()
    return result.rowcount > 0

async def get_unread_count(db: AsyncSession, user_id: int) -> int:
    result = await db.execute(
        select(Notification).where(
            Notification.user_id == user_id,
            Notification.is_read == False
        )
    )
    return len(list(result.scalars().all()))
