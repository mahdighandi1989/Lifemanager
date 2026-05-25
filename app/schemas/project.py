"""Backwards-compatibility re-export.

Canonical project schemas live in app.schemas.project_schema; the previous
UUID-based stubs here did not match the Integer-id SQLAlchemy model.
"""
from app.schemas.project_schema import (  # noqa: F401
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)
