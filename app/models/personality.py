"""Personality models (audit task 14e65214, Step 6).

The voice memo asked the system to "شخصیت منو روانشناسی کنن" — psychologically
profile the user — going deeper than fleeting moods to the stable Big-Five
dimensions, so the career-path engine (Step 8) has something durable to reason
over.

  * ``PersonalityTrait`` — one scored dimension (openness, conscientiousness …)
    on a 0–1 scale, with a short human-readable description.
  * ``PersonalityAssessment`` — one analysis run: the summary text + the trait
    snapshot as JSON, optionally tagging which model produced it.

Both link back to the local ``User`` (table ``users``).
"""
from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class PersonalityTrait(Base):
    __tablename__ = "personality_traits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    assessment_id = Column(
        Integer,
        ForeignKey("personality_assessments.id", ondelete="CASCADE"),
        index=True,
        nullable=True,
    )
    name = Column(String(64), nullable=False)  # openness / conscientiousness / …
    score = Column(Float, nullable=True)  # 0.0 – 1.0
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PersonalityAssessment(Base):
    __tablename__ = "personality_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    summary = Column(Text, nullable=True)
    traits = Column(JSON, nullable=True)  # {"openness": 0.7, ...}
    model_used = Column(String(120), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="personality_assessments")
