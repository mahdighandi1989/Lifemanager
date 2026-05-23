from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.schemas.notification_schema import NotificationCreate, NotificationOut
from app.services.notification_service import NotificationService
from app.models.user import User
from app.dependencies.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[NotificationOut])
async def list_notifications(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    notification_service = NotificationService(db)
    notifications = await notification_service.get_user_notifications(current_user.id)
    return notifications

@router.post("/", response_model=NotificationOut, status_code=status.HTTP_201_CREATED)
async def create_notification(notification_data: NotificationCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    notification_service = NotificationService(db)
    notification = await notification_service.create_notification(notification_data, current_user.id)
    return notification

@router.patch("/{notification_id}/read", response_model=NotificationOut)
async def mark_as_read(notification_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    notification_service = NotificationService(db)
    notification = await notification_service.mark_as_read(notification_id, current_user.id)
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return notification

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(notification_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    notification_service = NotificationService(db)
    success = await notification_service.delete_notification(notification_id, current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
