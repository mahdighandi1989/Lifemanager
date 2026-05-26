"""Pydantic schemas for TodoItem and its M2M membership operations.

The Move / Share / Unshare schemas carry list ids — the routes use
them to mutate rows in the `todo_list_items` association table
without exposing the table itself to the API.
"""
from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class TodoItemCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    description: Optional[str] = Field(default=None, max_length=20000)
    is_completed: bool = False
    is_starred: bool = False
    parent_id: Optional[int] = None
    due_date: Optional[date] = None
    # When provided, the item is also linked to each list. Without it
    # the item is created free-floating (useful for the "move into a
    # list later" UX). Duplicate ids are de-duplicated by the route.
    list_ids: List[int] = Field(default_factory=list)


class TodoItemUpdate(BaseModel):
    content: Optional[str] = Field(default=None, min_length=1, max_length=1000)
    description: Optional[str] = Field(default=None, max_length=20000)
    is_completed: Optional[bool] = None
    is_starred: Optional[bool] = None
    parent_id: Optional[int] = None
    due_date: Optional[date] = None


class TodoItemMove(BaseModel):
    """Move an item from one list to another (un-share + share atomically)."""
    from_list_id: int
    to_list_id: int


class TodoItemShare(BaseModel):
    """Add the item to one or more additional lists."""
    list_ids: List[int] = Field(..., min_length=1)


class TodoItemUnshare(BaseModel):
    """Remove the item from one or more lists. Does not delete the item."""
    list_ids: List[int] = Field(..., min_length=1)


class TodoItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    content: str
    description: Optional[str] = None
    is_completed: bool = False
    is_starred: bool = False
    parent_id: Optional[int] = None
    due_date: Optional[date] = None
    owner_id: Optional[int] = None
    list_ids: List[int] = Field(default_factory=list)
    subitem_ids: List[int] = Field(default_factory=list)
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
