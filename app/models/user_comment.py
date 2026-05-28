"""UserComment — note attached to a Person / Interaction (AC 4)."""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.sql import func

from app.database import Base


class UserComment(Base):
    __tablename__ = "user_comments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=True, index=True)
    interaction_id = Column(
        Integer, ForeignKey("interactions.id"), nullable=True, index=True
    )
    comment_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
