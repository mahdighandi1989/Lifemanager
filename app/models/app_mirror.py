"""«آینهٔ درایو» — a Google Drive copy of selected app records (owner 2026-10-12).

The database stays the source of truth (fast, small). For every record a page
chooses to mirror (in «معماری یادگیری عمیق»: each factory case, each topic, the
course) the page sends a ready-made, human-readable document — a title, a group
and a list of tabs with rows — and the `app_mirror` job writes it to
``LifeManagerData/<app>/<group>/<title · id>/`` as ONE folder with ONE
spreadsheet (one tab per section). The page owns the labels, so a new kind of
record is mirrored by adding a builder on the page — no schema or backend change.
"""
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.sql import func

from app.database import Base


class AppMirror(Base):
    __tablename__ = "app_mirrors"
    __table_args__ = (UniqueConstraint("user_id", "app", "rec_id", name="uq_app_mirrors_user_app_rec"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, index=True, nullable=True)
    app = Column(String(64), index=True, nullable=False)
    rec_id = Column(String(128), nullable=False)
    #: folder under the app folder, e.g. «پرونده‌ها» / «موضوع‌ها» / «دوره»
    grp = Column(String(64), default="")
    title = Column(String(300), default="")
    #: {"tabs": [{"name": str, "rows": [[cell, …], …]}, …]} as JSON text
    doc = Column(Text, default="")
    doc_hash = Column(String(64), default="")
    #: hash of the doc last written to Drive ("" = never) — pending when != doc_hash
    synced_hash = Column(String(64), default="")
    folder_id = Column(String(128), default="")
    sheet_id = Column(String(128), default="")
    synced_at = Column(DateTime(timezone=True), nullable=True)
    error = Column(Text, default="")
    #: the record was deleted in the app — the Drive folder is renamed, never deleted
    deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
