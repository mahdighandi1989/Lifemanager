"""Activity log — an append-only «who did what to which entity, when» trail.

The runtime counterpart of docs/overhaul/AUDIT_LOG.md (which is the
*engineering* ledger — don't confuse the two). One row per notable user
action across the whole app: tasks, projects, lists, people, finance,
writings, … Written best-effort by
``app.services.activity_log_service.record_activity`` so a logging
failure never breaks the underlying request.

Linking model (two levels, mirrored from a proven banking-ops audit
trail):

* ``entity_type`` + ``entity_id`` identify the acted-on record itself
  (plain indexed strings, no FK — the log must survive the entity's
  deletion).
* ``context_type`` + ``context_id`` name the *owning* profile/section
  when the entity is a child record — e.g. a todo item's list, or a
  deed's person — so «همه‌ی کارهای ذیل این پروفایل» is one indexed
  filter and the global page can deep-link every row to its section.
* ``entity_label`` snapshots the human-readable title at write time so
  rows stay meaningful after the entity is renamed or deleted.

New table ⇒ created by ``Base.metadata.create_all()`` at startup (model
registered in app/models/__init__.py) + alembic 0035 for the production
path. No startup ALTER needed.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    # Actor — the data-scope user id (anon/login-bypass = 0, like every
    # other per-user table). Nullable so system-originated writes are
    # representable, matching the legacy NULL-owner convention.
    user_id = Column(Integer, nullable=True, index=True)
    # What happened.
    action = Column(String(50), nullable=False, index=True)  # create/update/delete/complete/…
    entity_type = Column(String(50), nullable=True, index=True)  # task/project/list/todo_item/person/…
    entity_id = Column(String(64), nullable=True, index=True)
    entity_label = Column(String(255), nullable=True)
    # Owning profile/section (when the entity is a child record).
    context_type = Column(String(50), nullable=True, index=True)
    context_id = Column(String(64), nullable=True, index=True)
    detail = Column(Text, nullable=True)
    # Snapshot of the entity's content BEFORE an update/delete (JSON
    # text). The only in-app undo source until full DB backups land —
    # filled for content-bearing entities (todo items, writings, lists).
    payload_before = Column(Text, nullable=True)
    ip_address = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    def __repr__(self) -> str:
        return (
            f"<ActivityLog(id={self.id}, action='{self.action}', "
            f"entity='{self.entity_type}:{self.entity_id}', user={self.user_id})>"
        )
