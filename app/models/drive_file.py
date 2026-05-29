"""DriveFile — metadata for a file mirrored to Google Drive (audit task 7367c6f0).

Holds the bookkeeping the cold-storage tiering needs: where the blob lives
(``storage_location`` local|drive), its storage tier (hot DB row vs cold Drive
object), the Drive id/link, any text extracted from audio/image processing,
and the access timestamps the 30-day cold-tiering policy keys off. The Drive
upload / Sheets logging / OCR are implemented in app/services/
{google_drive_service, sheets_service, transcription_service, cold_tiering_service}.
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class DriveFile(Base):
    __tablename__ = "drive_files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    filename = Column(String(512), nullable=False)
    mime_type = Column(String(128), nullable=True)
    drive_file_id = Column(String(255), nullable=True)  # Google Drive object id
    drive_link = Column(String(1024), nullable=True)  # download / preview URL
    # local = still served from the DB/app; drive = blob lives in Google Drive.
    storage_location = Column(String(16), nullable=False, server_default="local", default="local")
    # "hot" = still a live DB row; "cold" = migrated out to Drive (AC8/AC11).
    storage_tier = Column(String(16), nullable=False, server_default="hot", default="hot")
    extracted_text = Column(Text, nullable=True)  # audio transcript / image OCR (AC6/7/12)
    last_accessed_at = Column(DateTime(timezone=True), server_default=func.now())
    migrated_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
