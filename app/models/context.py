"""UserContext — ambient signals snapshot for the smart-assistant engine.

Audit task 2165524b (AC 1). One row per user holds the latest known
location / biometric / activity signals that the recommendation engine reads
to produce context-aware suggestions ("you're near X, you can do Y").
"""
from typing import Any, Optional

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column
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
    personality_traits: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)  # {"openness": 0.7, ...}
    mood_history: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)  # [{"mood": .., "at": ..}, ...]
    career_interests: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)  # ["data science", ...]
    general_interests: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)  # ["reading", ...]
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Recommendation(Base):
    """A smart suggestion produced for the user (audit task 14e65214, Step 4
    AC20 — and originally audit task 2165524b).

    This is the canonical recommendation model; it is re-exported from
    ``app.models.recommendation`` as ``ContextualRecommendation`` for
    backward compatibility. ``type`` is the broader category the diverse,
    non-clichéd recommendation engine filters on (career | hobby |
    personal_growth | …) and ``source_context`` records the profile signals
    that produced it so the UI can explain "why this".
    """

    __tablename__ = "contextual_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    task_id = Column(
        Integer, ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True, index=True
    )
    recommendation_type = Column(String(32), nullable=False, default="behavioral")
    text = Column(Text, nullable=True)  # human-readable suggestion
    context_snapshot = Column(JSON, nullable=True)
    type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    source_context: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    is_read = Column(Boolean, nullable=False, default=False)
