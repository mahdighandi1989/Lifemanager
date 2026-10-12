"""«یادآورهای برنامه» — follow-ups a page asks the server to send by Telegram / e-mail (owner 2026-10-12).

The page (first user: «گره‌گشا» in «معماری یادگیری عمیق») decides WHAT is due and WHEN
(a local date + hour + IANA time zone); the server only delivers, once, on the channels the
page chose, and records each channel's honest outcome (sent / failed / skipped_unconfigured).
Default text is neutral by design — the page sends details only when the owner enabled them.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.sql import func

from app.database import Base


class AppReminder(Base):
    __tablename__ = "app_reminders"
    __table_args__ = (UniqueConstraint("user_id", "app", "rkey", name="uq_app_reminders_user_app_key"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, index=True, nullable=True)
    app = Column(String(64), index=True, nullable=False)
    rkey = Column(String(160), nullable=False)
    due_date = Column(String(10), nullable=False)          # YYYY-MM-DD, local to tz
    hour = Column(Integer, default=9)
    tz = Column(String(64), default="Asia/Dubai")
    send_at = Column(DateTime(timezone=True), index=True)   # UTC, computed by the server
    title = Column(String(200), default="")
    body = Column(Text, default="")
    detail = Column(Text, nullable=True)
    link = Column(String(500), default="")
    channels = Column(String(40), default="telegram,email")
    status = Column(String(24), default="pending", index=True)  # pending|sent|partial|failed|unconfigured|cancelled
    attempts = Column(Integer, default=0)
    result = Column(Text, default="")
    sent_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AppReminderSend(Base):
    """One row per delivery attempt that reached at least one channel — the daily cap counts
    THESE (a re-scheduled reminder can never sneak past the cap) and they are the audit trail."""
    __tablename__ = "app_reminder_sends"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, index=True, nullable=True)
    app = Column(String(64), index=True, nullable=False)
    rkey = Column(String(160), nullable=False)
    at = Column(DateTime(timezone=True), index=True, nullable=False)
    result = Column(Text, default="")
