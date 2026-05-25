"""Audit log for incoming webhook events.

A new table rather than re-using Notification because notifications are
NOT NULL on user_id and tied to a per-user enum vocabulary — webhook
events are system-wide and the sender may not know which user they map
to. Created by Base.metadata.create_all() at startup.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id = Column(Integer, primary_key=True, index=True)
    event = Column(String(120), nullable=False, index=True)
    # Full payload as JSON-encoded text — Postgres TEXT is unbounded, but
    # we truncate at the route layer to keep individual rows reasonable.
    payload = Column(Text, nullable=True)
    signature = Column(String(128), nullable=True)
    delivered_at = Column(DateTime(timezone=True), server_default=func.now())
