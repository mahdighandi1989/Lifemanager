"""UserTaste — a taste/preference distinct from a hard interest.

Audit task 14e65214 (Step 2). The voice memo drew a line between an *interest*
("علاقه") and a *taste* ("سلیقه") — tastes are softer, stylistic preferences
(a colour palette, a genre, a tone) that need their own analytical treatment.
Same column shape as the Step-2 ACs require: ``category`` / ``value`` /
``confidence_score`` / ``is_verified``.
"""
from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class UserTaste(Base):
    __tablename__ = "user_tastes"

    id = Column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id"), index=True, nullable=True
    )
    category: Mapped[Optional[str]] = mapped_column(String(64), index=True, nullable=True)  # style / genre / tone …
    value: Mapped[str] = mapped_column(String, nullable=False)
    source: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # 0.0 – 1.0
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="taste_records")
