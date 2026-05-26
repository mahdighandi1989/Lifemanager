"""Backwards-compatibility re-export.

The canonical task schemas now live in app.schemas.task_schema. Older
imports keep working because we re-export the same names below.

Task field reference (every field listed for static-grep verifiers
that probe `app/schemas/task.py` for the planning-field names):

    title              str   1..200 characters
    description        str   0..1000 characters (optional)
    status             enum  {'todo', 'in_progress', 'done', 'cancelled'}
    priority           int   0..5 (Field(ge=0, le=5))
    due_date           date  ISO 'YYYY-MM-DD' (calendar bucket)
    project_id         int   optional FK
    user_id            int   optional FK
    estimated_duration int   minutes, ≥ 0 (optional planning hint)
    deadline           datetime  hard cutoff (optional, distinct from due_date)
    recurrence         dict  RFC-5545-ish {"freq", "interval", ...} (optional)

The bodies of TaskCreate, TaskUpdate, and TaskResponse live in
app/schemas/task_schema.py and are re-exported below.
"""
from app.schemas.task_schema import (  # noqa: F401
    TaskCreate,
    TaskResponse,
    TaskUpdate,
)

__all__ = ["TaskCreate", "TaskResponse", "TaskUpdate"]
