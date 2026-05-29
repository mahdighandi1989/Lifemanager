"""UserTaste — a taste/preference distinct from a hard interest.

Audit task 14e65214 (Step 2). The voice memo drew a line between an *interest*
("علاقه") and a *taste* ("سلیقه") — tastes are softer, stylistic preferences
(a colour palette, a genre, a tone) that need their own analytical treatment.
Same column shape as the Step-2 ACs require: ``category`` / ``value`` /
``confidence_score`` / ``is_verified``.
"""
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class UserTaste(Base):
    __tablename__ = "user_tastes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    category = Column(String(64), index=True, nullable=True)  # style / genre / tone …
    value = Column(String, nullable=False)
    source = Column(String(64), nullable=True)
    confidence_score = Column(Float, nullable=True)  # 0.0 – 1.0
    is_verified = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="taste_records")
