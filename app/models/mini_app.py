"""«صفحهٔ افزوده» — an owner-attached HTML app shown as a page of Lifemanager.

The owner attaches a self-contained HTML app to an inspection sheet and asks for
it as a page. Committing that file into the repo would put foreign code on
`main` (= production) — which the supervisor routine's own safety check
rightly refuses, every time. So such a page is DATA, not code: this row points
at the attachment (bytes in the owner's Drive / DB, verified by sha256), and the
SPA renders it at `/apps/<slug>` inside a sandboxed iframe with an opaque origin
— it can never reach the app's session. Installing a page is an API call; no
commit, no deploy, no repo change.
"""
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class MiniApp(Base):
    __tablename__ = "mini_apps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String(60), unique=True, index=True, nullable=False)
    title = Column(String(120), nullable=False)
    icon = Column(String(8), default="")
    #: where it appears in the sidebar (a NAV_GROUPS key) and after which link
    group = Column(String(20), default="tools")
    after = Column(String(80), default="")
    #: the inspection attachment that IS the page
    source_file_id = Column(String(40), nullable=False)
    sha256 = Column(String(64), default="")
    report_number = Column(Integer, default=0)
    #: retired pages are quarantined (enabled=False), never deleted
    enabled = Column(Boolean, default=True)
    created_by = Column(String(20), default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
