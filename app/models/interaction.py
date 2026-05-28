"""Interaction — one event with a tracked Person (audit task 3cc09436 AC 2)."""
import enum

from sqlalchemy import Column, DateTime, Enum as SAEnum, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class InteractionType(str, enum.Enum):
    CALL = "call"
    MEETING = "meeting"
    MESSAGE = "message"
    EMAIL = "email"
    OTHER = "other"


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=False, index=True)
    type = Column(SAEnum(InteractionType), nullable=False, default=InteractionType.OTHER)
    date = Column(DateTime(timezone=True), nullable=True)
    summary = Column(String(512), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
