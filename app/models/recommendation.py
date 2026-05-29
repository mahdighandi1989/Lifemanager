"""ContextualRecommendation — a smart suggestion produced for the user.

Audit task 2165524b (AC 2). Each row is one suggestion (location-based /
physiological / behavioral) optionally tied to a Task, with the context
snapshot that produced it so the UI can explain "why now".
"""
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
from sqlalchemy.sql import func

from app.database import Base


class ContextualRecommendation(Base):
    __tablename__ = "contextual_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    task_id = Column(
        Integer, ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True, index=True
    )
    recommendation_type = Column(String(32), nullable=False, default="behavioral")
    text = Column(Text, nullable=True)  # human-readable suggestion
    context_snapshot = Column(JSON, nullable=True)
    # Profiling extension (audit task 14e65214, Step 4 AC20). ``type`` is the
    # broader category the diverse-recommendation engine filters on
    # (career | hobby | personal_growth | …); ``source_context`` records the
    # profile signals that produced it so the UI can explain "why this".
    type = Column(String(64), nullable=True, index=True)
    source_context = Column(JSON, nullable=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    is_read = Column(Boolean, nullable=False, default=False)
