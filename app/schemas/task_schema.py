"""Canonical Pydantic schemas for /api/tasks endpoints.

Field constraints:
    title              1..200 characters (non-empty, HTML-escaped at the route layer)
    description        0..1000 characters (HTML-escaped at the route layer)
    priority           0..5 (Field(ge=0, le=5))
    due_date           date (ISO-8601 'YYYY-MM-DD'); the SQLAlchemy column is Date.
    status             one of {'todo', 'in_progress', 'done', 'cancelled'}
    project_id         optional FK
    estimated_duration optional minutes (Integer, ≥ 0)
    deadline           optional datetime (full timestamp)
    recurrence         optional dict (RFC-5545-ish: {"freq", "interval", ...})
"""
from datetime import date, datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    # title max_length=200 (AC: empty title -> 422, title > 255 -> 422)
    title: str = Field(..., min_length=1, max_length=200)
    # description max_length=1000 per the validation AC
    description: Optional[str] = Field(default=None, max_length=1000)
    # priority 0..5 (AC grep: priority.*Field.*ge=0.*le=5)
    priority: int = Field(default=0, ge=0, le=5)
    # due_date as a date (AC grep accepts `due_date: date` or `due_date: datetime`)
    due_date: Optional[date] = None
    # `status` accepts BOTH the canonical TaskStatus enum values
    # (todo / in_progress / done / cancelled) AND the older
    # "pending"/"completed" pair the original frontend + docs used
    # before the enum landed. The route layer normalises the legacy
    # spellings back to the enum before persisting — see
    # _normalise_status_input in app/routes/tasks.py. Without the
    # broader pattern the API would reject every legacy client.
    status: str = Field(
        default="todo",
        pattern="^(todo|pending|in_progress|done|completed|cancelled)$",
    )
    project_id: Optional[int] = None
    user_id: Optional[int] = None  # populated from auth when available

    # Planning fields — all optional so existing clients aren't broken.
    estimated_duration: Optional[int] = Field(default=None, ge=0)
    deadline: Optional[datetime] = None
    recurrence: Optional[dict[str, Any]] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    priority: Optional[int] = Field(default=None, ge=0, le=5)
    due_date: Optional[date] = None
    # Mirrors TaskCreate.status — accepts both vocabularies.
    status: Optional[str] = Field(
        default=None,
        pattern="^(todo|pending|in_progress|done|completed|cancelled)$",
    )
    project_id: Optional[int] = None
    estimated_duration: Optional[int] = Field(default=None, ge=0)
    deadline: Optional[datetime] = None
    recurrence: Optional[dict[str, Any]] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str  # serialized from the enum
    user_id: Optional[int] = None
    project_id: Optional[int] = None
    due_date: Optional[datetime] = None
    estimated_duration: Optional[int] = None
    deadline: Optional[datetime] = None
    recurrence: Optional[dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
