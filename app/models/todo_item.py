"""TodoItem model — a single actionable row inside one or more lists.

Items have:
  * `content`      — the user-visible text (required).
  * `description`  — optional long-form notes.
  * `is_completed` — the "خط خورده" (crossed-out) state from the PDFs.
  * `is_starred`   — the "ستاره" (starred) state from the PDFs.
  * M2M relationship to TodoList through `todo_list_items`, so the
    same item can be shared between lists (e.g. an item that
    appears in both "Important" and "Tasks").
"""
from __future__ import annotations

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base
from app.models.todo_list import todo_list_items


class TodoItem(Base):
    __tablename__ = "todo_items"

    id = Column(Integer, primary_key=True, index=True)
    # Text (not VARCHAR(1000)) — the self-improvement seed includes
    # paragraph-length items (up to ~2.3k chars for the "عشق به خدا"
    # form where each row is a habit + a multi-sentence explanation).
    # VARCHAR(1000) on Postgres rejected those inserts with
    # StringDataRightTruncation, partially seeding the list (12 → 2,
    # 28 → 25) and bricking /api/self-improvement/overview with a 500.
    content = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    is_completed = Column(Boolean, nullable=False, server_default="0", default=False)
    is_starred = Column(Boolean, nullable=False, server_default="0", default=False)
    # owner_id is the user who created the item. Items inserted via
    # the unauth'd routes leave this NULL — the routes will populate
    # it once auth is wired in everywhere.
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    # parent_id models the subitem hierarchy that Microsoft To Do
    # exports use: items can have nested children (e.g. "ارسال جنس
    # به ایران" has 17 subitems). One-level deep is enough for the
    # data we're seeding — we don't enforce it but the UI assumes it.
    parent_id = Column(
        Integer,
        ForeignKey("todo_items.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    # due_date and is_overdue capture the date stamps shown in the
    # PDF exports ("Overdue, Wed, May 22, 2024"). Stored as a plain
    # Date — no time component is meaningful here.
    due_date = Column(Date, nullable=True)
    # completed_at is recorded the moment is_completed flips True so
    # ops can plot "completions per day" without trawling created_at.
    completed_at = Column(DateTime(timezone=True), nullable=True)
    # Soft-delete (سطل زباله): DELETE routes stamp this instead of
    # removing the row, so years-old owner content survives a wrong
    # click. Read paths filter deleted_at IS NULL; /api/trash lists,
    # restores, or purges stamped rows.
    deleted_at = Column(DateTime(timezone=True), nullable=True, index=True)
    # ``type`` classifies the item beyond is_starred/is_completed —
    # audit task 2165524b AC 1 asked for {task, shopping, errand, ...}.
    # Default 'task' keeps every existing row's classification stable.
    type = Column(String(32), nullable=False, server_default="task", default="task")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    lists = relationship(
        "TodoList",
        secondary=todo_list_items,
        back_populates="items",
        lazy="selectin",
    )
    parent = relationship("TodoItem", remote_side="TodoItem.id", backref="subitems")

    def __repr__(self) -> str:
        return (
            f"<TodoItem(id={self.id}, content={self.content[:30]!r}, "
            f"completed={self.is_completed}, starred={self.is_starred})>"
        )
