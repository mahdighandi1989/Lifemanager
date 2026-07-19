"""Personal-sync — Gmail messages + Calendar events mirrored into the app.

Two NEW tables (register in app/models/__init__.py + alembic 0040; no
startup ALTER needed):

* ``personal_emails`` — one row per synced Gmail message (metadata + snippet
  only, never full bodies at rest). The AI triage layer fills ``ai_category``
  / ``ai_summary`` / ``needs_action``; filing one as a task links back via
  ``task_id`` so the «رسیدگی شد» state is visible.
* ``personal_events`` — upcoming Google Calendar events (rolling window).
  The attention engine reminds about near ones (dedup via attention_marks).

Single-account-per-install, like the Drive connection they ride on — rows
carry no user_id (the install IS the user, same as GlobalSetting).
"""
from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
    Text,
)
from sqlalchemy.sql import func

from app.database import Base


class PersonalEmail(Base):
    __tablename__ = "personal_emails"

    # Gmail's own message id — natural PK, dedup across polls for free.
    id = Column(String(32), primary_key=True)
    thread_id = Column(String(32), nullable=True, index=True)
    from_addr = Column(String(512), nullable=True)
    subject = Column(Text, nullable=True)
    snippet = Column(Text, nullable=True)
    received_at = Column(DateTime(timezone=True), nullable=True, index=True)
    is_unread = Column(Boolean, nullable=False, default=False)
    labels = Column(JSON, nullable=True)
    # triage output (AI task «email_triage», heuristic fallback):
    ai_category = Column(String(32), nullable=True, index=True)  # action/important/receipt/newsletter/other
    ai_summary = Column(Text, nullable=True)  # one Persian line
    needs_action = Column(Boolean, nullable=False, default=False, index=True)
    suggested_task = Column(String(255), nullable=True)
    analyzed_at = Column(DateTime(timezone=True), nullable=True)
    ai_model = Column(String(120), nullable=True)  # NULL ⇒ heuristic
    task_id = Column(Integer, nullable=True)  # soft link — the filed follow-up task
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class PersonalEvent(Base):
    __tablename__ = "personal_events"

    # Google Calendar event id — natural PK.
    id = Column(String(128), primary_key=True)
    calendar_id = Column(String(255), nullable=True)
    summary = Column(String(512), nullable=True)
    description = Column(Text, nullable=True)
    location = Column(String(512), nullable=True)
    start_at = Column(DateTime(timezone=True), nullable=True, index=True)
    end_at = Column(DateTime(timezone=True), nullable=True)
    all_day = Column(Boolean, nullable=False, default=False)
    status = Column(String(32), nullable=True)  # confirmed / cancelled …
    html_link = Column(String(1024), nullable=True)
    task_id = Column(Integer, nullable=True)  # soft link — filed follow-up task
    synced_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
