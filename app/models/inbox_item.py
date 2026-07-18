"""InboxItem — «صندوق ورودی همه‌چیز» (universal capture inbox).

One row per raw thing the owner throws at the system — a thought, an
errand, a name, a money note — captured from the web quick-box or the
Telegram ``/inbox`` command BEFORE deciding where it belongs. The AI
triage layer (``app/services/inbox_service.py``) then suggests a
destination (task / todo / note / person) and the row is *filed* into
the real entity with one confirmation, or dismissed.

Lifecycle (``status``):

* ``pending``   — captured; may or may not carry a suggestion yet.
* ``filed``     — turned into a real entity; ``filed_entity_type`` /
  ``filed_entity_id`` point at it (plain columns, no FK — the inbox
  trail must survive the entity's later deletion, same rule as
  ``activity_logs``).
* ``dismissed`` — reviewed and intentionally dropped (kept, not
  deleted, so «هیچ‌چیز گم نمی‌شود» stays literally true).

``suggestion`` is the triage payload (title/description/priority/
due_date/list_name/category/person_name/reason) as JSON; ``ai_model``
records which model produced it (or ``None`` for the heuristic
fallback) — the same provenance rule the brain dashboard follows.

New table ⇒ created by ``Base.metadata.create_all()`` at startup (model
registered in app/models/__init__.py) + alembic 0036 for the production
path. No startup ALTER needed.
"""
from sqlalchemy import JSON, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class InboxItem(Base):
    __tablename__ = "inbox_items"

    id = Column(Integer, primary_key=True, index=True)
    # Data-scope owner (anon/login-bypass = 0; legacy NULL is also read
    # by the anon scope, like every other per-user table).
    user_id = Column(Integer, nullable=True, index=True)
    # The raw captured text, HTML-escaped at the route boundary.
    content = Column(Text, nullable=False)
    source = Column(String(32), nullable=False, default="web", server_default="web")
    status = Column(
        String(32), nullable=False, default="pending", server_default="pending", index=True
    )
    # Triage result.
    suggested_type = Column(String(32), nullable=True)  # task/todo/note/person/unknown
    suggestion = Column(JSON, nullable=True)
    ai_model = Column(String(120), nullable=True)
    # Where the row ended up when filed.
    filed_entity_type = Column(String(50), nullable=True)
    filed_entity_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self) -> str:
        return (
            f"<InboxItem(id={self.id}, status='{self.status}', "
            f"suggested='{self.suggested_type}', user={self.user_id})>"
        )
