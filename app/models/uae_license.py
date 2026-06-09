"""UAEDrivingLicenseRecord — persisted RTA driving licence (task 32ade384).

Stores both pages of the UAE driving licence (attachments #34/#35) in one
row, since they describe a single physical card. Page-2 columns
(``traffic_code_no``, ``permitted_vehicles``) are nullable so a face-only
extraction can be stored first and enriched later. ``permitted_vehicles``
is ``Text`` so the bilingual Arabic/Latin class string is preserved
without truncation or mojibake.
"""
from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class UAEDrivingLicenseRecord(Base):
    __tablename__ = "uae_driving_licenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)

    # ── Page 1 — licence face ────────────────────────────────────────
    license_no = Column(String(32), nullable=False, index=True)
    name_en = Column(String(255), nullable=True)
    name_ar = Column(String(255), nullable=True)
    nationality = Column(String(128), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    place_of_issue = Column(String(128), nullable=True)
    issuing_authority = Column(String(64), nullable=True, default="RTA")

    # ── Page 2 — back of card (nullable until enriched) ──────────────
    traffic_code_no = Column(String(32), nullable=True)
    permitted_vehicles = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
