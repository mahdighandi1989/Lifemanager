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
    # Psychological + interest profiling (audit task 14e65214, Step 4). These
    # back the diverse, non-clichéd recommendation engine: the analyzed Big-Five
    # snapshot, a rolling mood log, and the career/general interests distilled
    # from the user's data.
    personality_traits = Column(JSON, nullable=True)  # {"openness": 0.7, ...}
    mood_history = Column(JSON, nullable=True)  # [{"mood": .., "at": ..}, ...]
    career_interests = Column(JSON, nullable=True)  # ["data science", ...]
    general_interests = Column(JSON, nullable=True)  # ["reading", ...]
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
