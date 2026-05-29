"""UserContext — ambient signals snapshot for the smart-assistant engine.

Audit task 2165524b (AC 1). One row per user holds the latest known
location / biometric / activity signals that the recommendation engine reads
to produce context-aware suggestions ("you're near X, you can do Y").
"""
from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class UserContext(Base):
    __tablename__ = "user_contexts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    current_location = Column(JSON, nullable=True)  # {"lat": .., "lng": ..}
    last_activity_time = Column(DateTime(timezone=True), nullable=True)
    heart_rate = Column(Integer, nullable=True)
    activity_status = Column(String(32), nullable=True)  # idle | active | working | ...
    mood = Column(String(32), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
