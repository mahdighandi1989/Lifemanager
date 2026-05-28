"""IndexedDataSourceEntry — one ingested file/asset row (audit task 217909d2 AC 27).

Acts as the audit log + dedupe key for the data-ingestion pipeline:
one row per indexed asset, with the checksum so re-ingesting an
unchanged file is a no-op.
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class IndexedDataSourceEntry(Base):
    __tablename__ = "indexed_data_source_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    source_path = Column(String(1024), nullable=False)
    checksum = Column(String(128), nullable=True)
    last_modified = Column(DateTime(timezone=True), nullable=True)
    processed_at = Column(DateTime(timezone=True), server_default=func.now())
    associated_todo_list_id = Column(
        Integer, ForeignKey("todo_lists.id"), nullable=True
    )
