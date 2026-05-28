"""BehaviorLog — observed positive/negative behaviour event (AC 5)."""
import enum

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    Text,
)
from sqlalchemy.sql import func

from app.database import Base


class BehaviorType(str, enum.Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"


class BehaviorLog(Base):
    __tablename__ = "behavior_logs"

    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    behavior_type = Column(
        SAEnum(BehaviorType), nullable=False, default=BehaviorType.NEUTRAL
    )
    description = Column(Text, nullable=True)
    observed_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
