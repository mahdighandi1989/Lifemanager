"""Pydantic schemas for the TodoList API surface.

Kept intentionally minimal — the goal is a flexible base the frontend
can extend with categories, tags, colors, etc. without us re-shaping
the DB. Add new optional fields here as needs surface.
"""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class TodoListCreate(BaseModel):
    # Length caps widened: form-title list names run to ~90 chars
    # ("خودسازی - لیست ترس هایی که دارم …") and description prose
    # runs into the thousands for the four خودسازی forms. The
    # underlying columns are both TEXT, so the only purpose of the
    # cap is sanity-limiting accidental megablob uploads.
    name: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=20000)
    sort_order: int = Field(default=0)
    is_archived: bool = Field(default=False)


class TodoListUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=20000)
    sort_order: Optional[int] = None
    is_archived: Optional[bool] = None


class TodoListOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None
    user_id: Optional[int] = None
    sort_order: int = 0
    is_archived: bool = False
    item_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class TodoListWithItemsOut(TodoListOut):
    # Concrete item shape lives in todo_item_schema.TodoItemOut — but
    # importing it here would create a cycle. We type as a flexible
    # dict list and the route layer fills it via _serialize_item().
    items: List[dict] = Field(default_factory=list)
