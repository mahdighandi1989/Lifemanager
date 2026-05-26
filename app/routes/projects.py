"""/api/projects CRUD endpoints.

Mirrors the tasks router: every handler is exposed at both
`/api/projects/...` and `/projects/...` for frontend backwards-compat.
All DB calls go through SQLAlchemy's parameterised query API (no raw
string interpolation). Text fields are HTML-escaped before persisting.

Error handling is centralized via @handle_errors (app/middleware.py)
so each route stays focused on its business logic.
"""
import html
import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware import handle_errors
from app.models.project import Project
from app.schemas.project_schema import ProjectCreate, ProjectUpdate

logger = logging.getLogger(__name__)

router = APIRouter()


def _sanitize(value: str | None) -> str | None:
    return None if value is None else html.escape(value, quote=True)


def _serialize(p: Project) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "user_id": p.user_id,
        "status": getattr(p, "status", "active") or "active",
        "is_active": bool(p.is_active),
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }


# --- LIST -------------------------------------------------------------------

# Registered at the canonical /api path only. The plain /projects path is
# an SPA URL handled by the React frontend; the frontend fetches data
# from /api/projects.
@router.get("/api/projects", tags=["projects"])
@router.get("/api/projects/", tags=["projects"])
@handle_errors
async def list_projects(db: AsyncSession = Depends(get_db)) -> List[dict]:
    result = await db.execute(select(Project))
    return [_serialize(p) for p in result.scalars().all()]


# --- GET ONE ----------------------------------------------------------------

@router.get("/api/projects/{project_id}", tags=["projects"])
@handle_errors
async def get_project(project_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    project = await db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return _serialize(project)


# --- CREATE -----------------------------------------------------------------

@router.post("/api/projects", status_code=status.HTTP_201_CREATED, tags=["projects"])
@router.post("/api/projects/", status_code=status.HTTP_201_CREATED, tags=["projects"])
@handle_errors
async def create_project(
    payload: ProjectCreate,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """POST /api/projects with a valid body returns 201 + the new row."""
    project = Project(
        name=_sanitize(payload.name),
        description=_sanitize(payload.description),
        user_id=payload.user_id,
    )
    if hasattr(project, "status"):
        project.status = payload.status
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return _serialize(project)


# --- UPDATE -----------------------------------------------------------------

@router.put("/api/projects/{project_id}", tags=["projects"])
@handle_errors
async def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
) -> dict:
    project = await db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    data = payload.model_dump(exclude_unset=True)
    if "name" in data:
        project.name = _sanitize(data["name"])
    if "description" in data:
        project.description = _sanitize(data["description"])
    if "status" in data and hasattr(project, "status"):
        project.status = data["status"]
    await db.commit()
    await db.refresh(project)
    return _serialize(project)


# --- DELETE -----------------------------------------------------------------

@router.delete(
    "/api/projects/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["projects"],
)
@handle_errors
async def delete_project(project_id: int, db: AsyncSession = Depends(get_db)) -> None:
    project = await db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)
    await db.commit()
    return None
