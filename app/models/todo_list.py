"""TodoList model — top-level container for to-do items.

A TodoList groups TodoItems. The relationship is many-to-many through
the `todo_list_items` association table so a single item can appear
in multiple lists (the user explicitly asked for this — items in
"Important" may also live in "Tasks" or "برنامه نویسی" etc.).

The association row carries `position` so each list can order its
items independently without mutating the underlying item.
"""
from __future__ import annotations

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


# Many-to-many bridge — a separate Table (not a model) so SQLAlchemy
# can transparently INSERT/DELETE rows when items are shared/unshared
# across lists. `position` lets each list order items independently;
# UNIQUE (list_id, item_id) blocks duplicate membership.
todo_list_items = Table(
    "todo_list_items",
    Base.metadata,
    Column("todo_list_id", Integer, ForeignKey("todo_lists.id", ondelete="CASCADE"), primary_key=True),
    Column("todo_item_id", Integer, ForeignKey("todo_items.id", ondelete="CASCADE"), primary_key=True),
    Column("position", Integer, nullable=False, server_default="0"),
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
    UniqueConstraint("todo_list_id", "todo_item_id", name="uq_todo_list_items_list_item"),
)


class TodoList(Base):
    __tablename__ = "todo_lists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    # nullable until auth is universally wired in — the routes populate
    # this from the authenticated principal when available.
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    # sort_order lets the user reorder their lists in the sidebar
    # without renaming them. Lower = earlier.
    sort_order = Column(Integer, nullable=False, server_default="0")
    # is_archived hides the list from the default sidebar without
    # destroying its data — soft-delete semantics for power users.
    is_archived = Column(Boolean, nullable=False, server_default="0", default=False)
    # خداشهر (2026-07-22): persistent sahat assignment; NULL = classifier
    # default at read time, stored value always wins (owner correction final).
    sahat = Column(String(16), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    items = relationship(
        "TodoItem",
        secondary=todo_list_items,
        back_populates="lists",
        lazy="selectin",
        order_by="TodoItem.id",
    )

    def __repr__(self) -> str:
        return f"<TodoList(id={self.id}, name={self.name!r})>"
