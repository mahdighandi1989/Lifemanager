"""AIAssessment — AI-derived assessment row.

Originally a score on a Person/Interaction (audit task 3cc09436, AC 3). Audit
task 14e65214 (Step 7) widens it into the holistic profile store: the same
table now also holds a *user-level* assessment carrying the Big-Five
personality scores and the latest mood/sentiment snapshot. ``person_id`` is
therefore nullable now — a holistic_profile row belongs to a ``user_id`` and
has no person.
"""
from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.sql import func

from app.database import Base


class AIAssessment(Base):
    __tablename__ = "ai_assessments"

    id = Column(Integer, primary_key=True, index=True)
    # person-scoped (relationship analysis) — nullable so a user-level
    # holistic profile row, which has no person, can be stored here too.
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=True, index=True)
    interaction_id = Column(
        Integer, ForeignKey("interactions.id"), nullable=True, index=True
    )
    score = Column(Float, nullable=True)
    sentiment = Column(String(32), nullable=True)  # positive / neutral / negative
    analysis_text = Column(Text, nullable=True)

    # user-scoped holistic profile (audit task 14e65214, Step 7).
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    assessment_type = Column(String(64), nullable=True, index=True)  # holistic_profile | …
    # Big-Five personality dimensions (0.0 – 1.0).
    openness = Column(Float, nullable=True)
    conscientiousness = Column(Float, nullable=True)
    extraversion = Column(Float, nullable=True)
    agreeableness = Column(Float, nullable=True)
    neuroticism = Column(Float, nullable=True)
    # Mood / sentiment snapshot.
    sentiment_score = Column(Float, nullable=True)  # -1.0 .. 1.0
    dominant_emotion = Column(String(64), nullable=True)
    mood_timestamp = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
