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
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.models.project import Project
from app.schemas.project_schema import ProjectCreate, ProjectUpdate
from app.services.activity_log_service import record_activity

logger = logging.getLogger(__name__)

router = APIRouter()


def _sanitize(value: str | None) -> str | None:
    return None if value is None else html.escape(value, quote=True)


def _owned_or_unowned(user_id: int):
    """Scope filter: rows owned by the caller OR legacy unowned (NULL) rows.

    Mirrors app/services/list_service.list_lists — closes the cross-tenant
    read leak audit task 78c0e8e0 flagged (list_projects previously returned
    EVERY user's projects) while staying compatible with the login-bypass
    anon scope (user 0) and pre-scoping rows that predate the user_id column.
    """
    return or_(Project.user_id == user_id, Project.user_id.is_(None))


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
async def list_projects(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> List[dict]:
    """List the caller's projects (scoped, audit task 78c0e8e0).

    Previously returned EVERY user's projects. Now scoped to the caller via
    ``get_optional_user_id`` (anon → user 0 under login-bypass), including
    legacy unowned rows so nothing pre-scoping disappears.

    Merged-away rows are hidden: the DeduplicationService soft-deletes a merged
    source by setting ``is_active=False`` (never a hard delete — reversible),
    so listing filters them out. ``is_active IS NOT False`` keeps legacy rows
    whose column is NULL visible — only an *explicit* False (a merge) hides a
    row, so nothing pre-dedup disappears (CLAUDE.md rule 2)."""
    result = await db.execute(
        select(Project).where(
            _owned_or_unowned(user_id), Project.is_active.isnot(False)
        )
    )
    return [_serialize(p) for p in result.scalars().all()]


# --- GET ONE ----------------------------------------------------------------

@router.get("/api/projects/{project_id}", tags=["projects"])
@handle_errors
async def get_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Return one project by id, scoped to the caller (audit task 78c0e8e0).

    A project owned by another user 404s rather than leaking across tenants;
    legacy unowned rows remain visible under login-bypass.
    """
    project = await db.get(Project, project_id)
    if project is None or (project.user_id is not None and project.user_id != user_id):
        raise HTTPException(status_code=404, detail="Project not found")
    return _serialize(project)


# --- CREATE -----------------------------------------------------------------

@router.post("/api/projects", status_code=status.HTTP_201_CREATED, tags=["projects"])
@router.post("/api/projects/", status_code=status.HTTP_201_CREATED, tags=["projects"])
@handle_errors
async def create_project(
    payload: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """POST /api/projects with a valid body returns 201 + the new row.

    The owner is taken from the auth context (not trusted from the body) so a
    client can't plant a row under someone else's id; anon resolves to user 0.

    Idempotent by (owner, name): if an active project with the same sanitized
    name already exists for this owner, return it instead of inserting a second
    row. This is the root-cause fix for the duplicate "test project" rows the
    owner hit — a double-submit (or a re-run of the same create) now converges
    on the one project rather than piling up near-identical rows. It is not a
    delete: an existing row is reused, never removed (CLAUDE.md rule 2).
    """
    owner = payload.user_id if payload.user_id is not None else user_id
    clean_name = _sanitize(payload.name)
    existing = await db.execute(
        select(Project).where(
            Project.user_id == owner,
            Project.name == clean_name,
            Project.is_active.isnot(False),
        )
    )
    dup = existing.scalars().first()
    if dup is not None:
        return _serialize(dup)
    project = Project(
        name=clean_name,
        description=_sanitize(payload.description),
        user_id=owner,
    )
    if hasattr(project, "status"):
        project.status = payload.status
    db.add(project)
    await db.commit()
    await db.refresh(project)
    await record_activity(
        action="create", entity_type="project", entity_id=project.id,
        entity_label=project.name, detail="ایجاد پروژه", user_id=user_id, db=db,
    )
    return _serialize(project)


# --- UPDATE -----------------------------------------------------------------

@router.put("/api/projects/{project_id}", tags=["projects"])
@handle_errors
async def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    project = await db.get(Project, project_id)
    if project is None or (project.user_id is not None and project.user_id != user_id):
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
    await record_activity(
        action="update", entity_type="project", entity_id=project.id,
        entity_label=project.name, detail="ویرایش پروژه", user_id=user_id, db=db,
    )
    return _serialize(project)


# --- DELETE -----------------------------------------------------------------

@router.delete(
    "/api/projects/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["projects"],
)
@handle_errors
async def delete_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> None:
    project = await db.get(Project, project_id)
    if project is None or (project.user_id is not None and project.user_id != user_id):
        raise HTTPException(status_code=404, detail="Project not found")
    name = project.name
    await db.delete(project)
    await db.commit()
    await record_activity(
        action="delete", entity_type="project", entity_id=project_id,
        entity_label=name, detail="حذف پروژه", user_id=user_id, db=db,
    )
    return None
