"""UserInterest — an interest the system identified (or the user declared).

Audit task 14e65214 (Steps 1 & 2). One row per (user, interest). The columns
span both steps' acceptance criteria:

  * Step 1 input/storage: ``interest_type`` / ``value`` / ``source`` /
    ``confidence_score`` — how the raw interest entered the system.
  * Step 2 identification: ``category`` (the domain — ورزش / فناوری / هنر …)
    plus ``is_verified``, the "we're confident this is really an interest"
    flag the voice memo asked for ("مطمئن بشن که این علاقه است").

Login-bypass single-tenant design: ``user_id`` mirrors UserContext /
ContextualRecommendation — FK to ``users.id`` but nullable so anonymous
traffic (user 0) can still own rows.
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


class UserInterest(Base):
    __tablename__ = "user_interests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    # Step 1 fields — how the interest was supplied.
    interest_type = Column(String(64), index=True, nullable=True)
    value = Column(String, nullable=False)
    source = Column(String(64), nullable=True)  # manual_input | task_analysis | ...
    confidence_score = Column(Float, nullable=True)  # 0.0 – 1.0
    # Step 2 fields — domain + verification.
    category = Column(String(64), index=True, nullable=True)
    is_verified = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="interest_records")
