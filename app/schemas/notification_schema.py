from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.notification import NotificationType


class NotificationCreate(BaseModel):
    type: NotificationType
    title: str
    message: Optional[str] = None


class NotificationOut(BaseModel):
    id: int
    user_id: int
    type: NotificationType
    title: str
    message: Optional[str] = None
    is_read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True