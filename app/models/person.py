"""Person — one tracked contact owned by a user.

Backs the /api/persons CRUD surface (audit task 3cc09436). Each row
belongs to exactly one user (``user_id`` FK to ``users.id``); the
notes column is sanitised at the service boundary the same way the
User profile fields are.
"""
from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class Person(Base):
    __tablename__ = "persons"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(64), nullable=True)
    notes = Column(Text, nullable=True)
    # Phase 3 (2026-07-20, audit #11): the CRM had no date column any
    # reminder could hang on. birthday drives the yearly attention rule;
    # next_follow_up drives «پیگیری این فرد» — both optional.
    birthday = Column(Date, nullable=True)
    next_follow_up = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
