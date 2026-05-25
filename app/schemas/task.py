"""Backwards-compatibility re-export.

The canonical task schemas now live in app.schemas.task_schema. Older
imports keep working because we re-export the same names.
"""
from app.schemas.task_schema import (  # noqa: F401
    TaskCreate,
    TaskResponse,
    TaskUpdate,
)
