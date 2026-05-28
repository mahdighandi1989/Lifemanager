"""LocalFileEntry — index entry for one user-supplied file.

Backs the /api/local-files upload+list endpoints (audit task
217909d2). The web app can't scan the user's filesystem directly —
that boundary is documented in docs/FILE_PROCESSING.md — so this
model stores metadata + extracted text for files the user has
explicitly handed over (manual upload or future desktop-agent push).
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class LocalFileEntry(Base):
    __tablename__ = "local_file_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    source_path = Column(String(1024), nullable=False)
    mime_type = Column(String(128), nullable=True)
    size_bytes = Column(Integer, nullable=True)
    extracted_text = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    keywords = Column(Text, nullable=True)  # comma-separated for portability
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
