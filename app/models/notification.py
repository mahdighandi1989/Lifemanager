"""Notification model.

Status / attempts / priority / silent / last_error columns power the
delivery-tracking and race-resolution features used by
NotificationService.send_batch_notifications and
NotificationService.claim_pending_notification — see that file for the
contract.
"""
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.sql import func

from app.database import Base
import enum


class NotificationType(str, enum.Enum):
    TASK_REMINDER = "task_reminder"
    PROJECT_UPDATE = "project_update"
    SYSTEM = "system"


# Delivery lifecycle states. New rows start as 'pending'; a worker
# claims one by atomically transitioning pending -> processing, then
# moves it to 'sent' on success or 'failed' after exhausting retries.
NOTIFICATION_STATUSES = ("pending", "processing", "sent", "failed")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # Stored as a plain VARCHAR (not SQLAlchemy Enum) so future callers
    # can add new event types — e.g. 'verify_failed' — without an Alembic
    # migration. The NotificationType enum is still used for the legacy
    # CRUD route where the value comes from the API consumer.
    type = Column(SAEnum(NotificationType, native_enum=False, length=64), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Delivery tracking (added for the notification-system composite).
    status = Column(String(32), default="pending", nullable=True, index=True)
    attempts = Column(Integer, default=0, nullable=True)
    priority = Column(String(16), default="normal", nullable=True)
    silent = Column(Boolean, default=False, nullable=True)
    channel = Column(String(32), nullable=True)
    last_error = Column(Text, nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
