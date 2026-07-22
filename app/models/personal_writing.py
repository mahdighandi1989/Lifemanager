"""PersonalWriting — long-form personal writings (نوشته‌های من).

The home for documents that must stay WHOLE (not scattered into list items):
the owner's spiritual autobiography («تاریخچه خداشناسی»), the this-world/
hereafter goals-with-philosophy document, and any future essays/journals.
``category`` groups writings in the UI; ``body`` is unbounded Text so multi-
page documents survive verbatim; ``source_note`` records provenance (original
files, merge decisions); ``written_at`` is the document's own date (not the
import date).
"""
from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class PersonalWriting(Base):
    __tablename__ = "personal_writings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    title = Column(String(500), nullable=False)
    category = Column(String(120), nullable=True, index=True)
    # خداشهر (2026-07-22): persistent sahat assignment; NULL = classifier
    # default at read time, stored value always wins (owner correction final).
    sahat = Column(String(16), nullable=True)
    body = Column(Text, nullable=False)
    source_note = Column(String(500), nullable=True)
    written_at = Column(Date, nullable=True)
    sort_order = Column(Integer, nullable=False, default=0, server_default="0")
    # Soft-delete (سطل زباله): a writing body can be years of personal
    # history — DELETE stamps this instead of dropping the row.
    deleted_at = Column(DateTime(timezone=True), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
