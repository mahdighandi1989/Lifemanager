"""SahatThread — «نخِ تسبیح»: a named stream of content under one sahat.

خداشهر (2026-07-22): the thread registry moves from a hard-coded list in
``sahat_service`` into DATA, so the owner can add a new thread («تاریخ انبیا»,
«خوشنویسی», …) from the UI without a deploy. Matching stays read-time token
matching: any list/writing/directive whose text contains one of ``tokens``
self-attaches to the thread — the accretion contract («مطالب پراکنده خودشان
جای خودشان را پیدا می‌کنند») is unchanged, only the registry is now editable.

The original code registry in ``sahat_service.THREADS`` is kept as the seed
AND the fallback (keyless/empty-table deploys keep working — behaviour
preserving). Deactivation is soft (``is_active=False``) — quarantine, not
delete.
"""
from sqlalchemy import Boolean, Column, DateTime, Integer, JSON, String, UniqueConstraint
from sqlalchemy.sql import func

from app.database import Base


class SahatThread(Base):
    __tablename__ = "sahat_threads"

    id = Column(Integer, primary_key=True, index=True)
    # Plain Integer (no FK) mirrors inbox_items — anon scope stores 0/NULL and
    # the row must survive user-table churn.
    user_id = Column(Integer, nullable=True, index=True)
    # Stable slug (e.g. "khodashenasi") — seed threads keep their historical
    # keys so snapshots/links stay valid.
    key = Column(String(64), nullable=False)
    title = Column(String(200), nullable=False)
    sahat = Column(String(16), nullable=False)
    # JSON list of match tokens; a thread matches when ANY token is a
    # substring of the candidate text (same semantics as the code registry).
    tokens = Column(JSON, nullable=False, default=list)
    # Frontend route the thread links to ("/lists", "/writings", …).
    link = Column(String(120), nullable=True)
    sort_order = Column(Integer, nullable=False, server_default="0", default=0)
    is_active = Column(Boolean, nullable=False, server_default="1", default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (UniqueConstraint("user_id", "key", name="uq_sahat_threads_user_key"),)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<SahatThread(key={self.key!r}, sahat={self.sahat!r})>"
