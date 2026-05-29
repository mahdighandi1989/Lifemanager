"""PersonProfile — behavioural profile for a tracked person (audit task 3cc09436).

One profile per Person: the AI relationship score, the user's free-text notes,
a JSON behaviour log (good/bad deeds + analysis snapshots), the derived
relationship type, and when it was last analyzed. The AI scoring itself lives
in ``AIService.analyze_person_behavior`` (reused by person_profile_service).
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


class PersonProfile(Base):
    __tablename__ = "person_profiles"

    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(
        Integer, ForeignKey("persons.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    ai_score = Column(Float, nullable=False, server_default="0", default=0.0)
    user_notes = Column(Text, nullable=True)
    behavior_log = Column(JSON, nullable=True)  # [{type, note, at}, ...]
    relationship_type = Column(String(32), nullable=False, server_default="neutral", default="neutral")
    last_analyzed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    person = relationship("Person", backref="profile")
