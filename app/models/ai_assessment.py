"""AIAssessment — AI-derived score on a Person/Interaction (AC 3)."""
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class AIAssessment(Base):
    __tablename__ = "ai_assessments"

    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=False, index=True)
    interaction_id = Column(
        Integer, ForeignKey("interactions.id"), nullable=True, index=True
    )
    score = Column(Float, nullable=True)
    sentiment = Column(String(32), nullable=True)  # positive / neutral / negative
    analysis_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
