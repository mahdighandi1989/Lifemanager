"""/api/projects CRUD endpoints.

Mirrors the tasks router: every handler is exposed at both
`/api/projects/...` and `/projects/...` for frontend backwards-compat.
All DB calls go through SQLAlchemy's parameterised query API (no raw
string interpolation). Text fields are HTML-escaped before persisting.
"""
import html
import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
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

# Stacked decorators register every list/create endpoint at four variants:
#   /api/projects, /api/projects/, /projects, /projects/
# The SPA catch-all in app/main.py matches GET on any path, so without the
# no-trailing-slash variant FastAPI's redirect_slashes never fires and a
# POST /api/projects collides with the catch-all GET → 405. Stacking the
# decorator explicitly removes the ambiguity.
@router.get("/api/projects", tags=["projects"])
@router.get("/api/projects/", tags=["projects"])
@router.get("/projects", tags=["projects"])
@router.get("/projects/", tags=["projects"])
async def list_projects(db: AsyncSession = Depends(get_db)) -> List[dict]:
    try:
        result = await db.execute(select(Project))
        return [_serialize(p) for p in result.scalars().all()]
    except SQLAlchemyError as exc:
        logger.exception("list_projects failed")
        raise HTTPException(status_code=500, detail="internal error") from exc


# --- GET ONE ----------------------------------------------------------------

@router.get("/api/projects/{project_id}", tags=["projects"])
@router.get("/projects/{project_id}", tags=["projects"])
async def get_project(project_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    try:
        project = await db.get(Project, project_id)
    except SQLAlchemyError as exc:
        logger.exception("get_project(%s) failed", project_id)
        raise HTTPException(status_code=500, detail="internal error") from exc
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return _serialize(project)


# --- CREATE -----------------------------------------------------------------

@router.post("/api/projects", status_code=status.HTTP_201_CREATED, tags=["projects"])
@router.post("/api/projects/", status_code=status.HTTP_201_CREATED, tags=["projects"])
@router.post("/projects", status_code=status.HTTP_201_CREATED, tags=["projects"])
@router.post("/projects/", status_code=status.HTTP_201_CREATED, tags=["projects"])
async def create_project(
    payload: ProjectCreate,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """POST /api/projects with a valid body returns 201 + the new row."""
    try:
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
    except SQLAlchemyError as exc:
        await db.rollback()
        logger.exception("create_project failed")
        raise HTTPException(status_code=500, detail="internal error") from exc
    return _serialize(project)


# --- UPDATE -----------------------------------------------------------------

@router.put("/api/projects/{project_id}", tags=["projects"])
@router.put("/projects/{project_id}", tags=["projects"])
async def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
) -> dict:
    try:
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
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        await db.rollback()
        logger.exception("update_project(%s) failed", project_id)
        raise HTTPException(status_code=500, detail="internal error") from exc
    return _serialize(project)


# --- DELETE -----------------------------------------------------------------

@router.delete(
    "/api/projects/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["projects"],
)
@router.delete(
    "/projects/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["projects"],
)
async def delete_project(project_id: int, db: AsyncSession = Depends(get_db)) -> None:
    try:
        project = await db.get(Project, project_id)
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        await db.delete(project)
        await db.commit()
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        await db.rollback()
        logger.exception("delete_project(%s) failed", project_id)
        raise HTTPException(status_code=500, detail="internal error") from exc
    return None
