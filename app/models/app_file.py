"""«پیوست‌ها» — files attached to an app record, stored ONLY in Google Drive (owner 2026-10-12).

The owner asked that the backend database not fill up: the bytes go straight
into the record's own Drive folder (the same folder the «آینهٔ درایو» uses:
``LifeManagerData/<app>/<group>/<title · id>/پیوست‌ها/``); this table keeps only
a small pointer (name, type, size, Drive id, link). Deleting in the app never
deletes in Drive — the file is renamed «(حذف‌شده در برنامه) …» and hidden here.
"""
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class AppFile(Base):
    __tablename__ = "app_files"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, index=True, nullable=True)
    app = Column(String(64), index=True, nullable=False)
    rec_id = Column(String(128), index=True, nullable=False)
    name = Column(String(255), nullable=False)
    mime = Column(String(120), default="")
    size = Column(Integer, default=0)
    drive_id = Column(String(128), default="")
    link = Column(String(500), default="")
    deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
