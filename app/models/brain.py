"""BrainUpload — ingested cognitive-training data exports (رشد ذهن و هوش).

Each row is one uploaded export (e.g. a Brilliant.org personal-data zip),
reduced to a parsed stats summary (JSON-as-text) that the brain dashboard
trends across uploads. ``verified_owner`` records the provenance check: the
export's account email is compared against the owner's known email(s), so the
dashboard can distinguish "data that comes from ME" from foreign files.
``analysis_note`` is an optional AI-generated Persian narrative (best-effort,
with references) produced at ingest time.
"""
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class BrainUpload(Base):
    __tablename__ = "brain_uploads"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    source = Column(String(64), nullable=False, default="brilliant", server_default="brilliant")
    filename = Column(String(255), nullable=True)
    via = Column(String(32), nullable=False, default="dashboard", server_default="dashboard")  # dashboard | telegram
    verified_owner = Column(Boolean, nullable=True)  # True/False; NULL = unknown (no baseline)
    owner_email = Column(String(255), nullable=True)
    stats_json = Column(Text, nullable=False)        # parsed summary (JSON)
    analysis_note = Column(Text, nullable=True)      # optional AI narrative with references
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
