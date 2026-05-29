"""AIFeedback — durable like/dislike + 1-5 rating on AI responses.

Audit task task_97867b277c1b: the original implementation kept feedback in an
in-process counter (lost on restart, not per-user). This model persists each
feedback signal so /api/ai/metrics can report durable, per-user quality stats.
"""
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class AIFeedback(Base):
    __tablename__ = "ai_feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    # The chat message / response this feedback is about (free-form id from the
    # UI). Optional so the binary thumb works even without a message handle.
    response_ref = Column(String(128), nullable=True)
    liked = Column(Boolean, nullable=True)  # True=like, False=dislike, None=not given
    score = Column(Integer, nullable=True)  # explicit 1-5 rating
    latency_ms = Column(Integer, nullable=True)  # optional measured latency sample
    created_at = Column(DateTime(timezone=True), server_default=func.now())
