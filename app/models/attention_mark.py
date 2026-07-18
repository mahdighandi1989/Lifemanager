"""AttentionMark — dedup/cooldown memory of the attention engine (موتور توجه).

One row per (user, dedup_key) the engine has already alerted about —
``dedup_key`` is ``{rule}:{entity_id}`` (e.g. ``task_overdue:12``,
``license_expiry:3``). Before re-alerting, the engine checks
``last_sent_at`` against the rule's cooldown so the owner is nagged on a
sane cadence (daily for overdue tasks, weekly for a document that keeps
being about to expire) instead of every scan cycle. Plain columns, no
FKs — the mark must survive the entity's deletion, same rule as
``activity_logs`` / ``inbox_items``.

New table ⇒ created by ``Base.metadata.create_all()`` at startup (model
registered in app/models/__init__.py) + alembic 0037 for the production
path. No startup ALTER needed.
"""
from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class AttentionMark(Base):
    __tablename__ = "attention_marks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    dedup_key = Column(String(128), nullable=False, index=True)
    rule = Column(String(50), nullable=False, index=True)
    last_sent_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self) -> str:
        return f"<AttentionMark(key='{self.dedup_key}', last_sent_at={self.last_sent_at})>"
