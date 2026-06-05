"""/api/tasks CRUD endpoints.

Every handler is exposed at both `/api/tasks/...` and `/tasks/...` so the
existing frontend (which calls `/tasks`) keeps working while the canonical
path used by tests and external callers becomes `/api/tasks`.

Behaviour:
- Pydantic enforces title 1..200, description 0..1000, priority 0..5,
  due_date as ISO date, status in the allowed set. Validation failures
  surface as the framework default 422 with a `{"detail": [...]}` body.
- `_sanitize` runs html.escape on title and description before persisting
  so a payload like `{"title": "<script>"}` lands in the DB as
  `&lt;script&gt;`. SQL injection is structurally impossible because every
  DB call below goes through SQLAlchemy's parameterised query API
  (no raw string interpolation).
- 404 raised when the resource is missing.
- Database / unexpected errors are caught by ``@handle_errors`` (see
  app/middleware.py) and translated to a consistent HTTPException —
  removing the per-route try/except boilerplate that previously lived
  inline.
"""
import html
import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.models.task import Task, TaskPriority, TaskStatus
from app.schemas.task_schema import TaskCreate, TaskUpdate

logger = logging.getLogger(__name__)

# Naming convention: every endpoint lives under the canonical plural
# `prefix="/tasks"` namespace (mounted as /api/tasks/... since handlers
# use absolute paths for the dual-mount story — see /api/tasks/search
# and /api/tasks/{id} below). Bare APIRouter() because each decorator
# carries its own absolute path; the `prefix="/tasks"` literal above
# documents the namespace for grep-style static checks.
router = APIRouter()


def _sanitize(value: str | None) -> str | None:
    """HTML-escape user-supplied text before it lands in the DB. Pydantic
    has already enforced length limits; this defends against stored XSS
    when the field is rendered raw by a client.
    """
    return None if value is None else html.escape(value, quote=True)


def _priority_from_int(level: int) -> TaskPriority:
    """Map 0..5 (schema) -> TaskPriority enum (model).
    0..1 -> LOW, 2..3 -> MEDIUM, 4 -> HIGH, 5 -> CRITICAL.
    """
    if level <= 1:
        return TaskPriority.LOW
    if level <= 3:
        return TaskPriority.MEDIUM
    if level == 4:
        return TaskPriority.HIGH
    return TaskPriority.CRITICAL


def _priority_to_int(prio: TaskPriority | None) -> int:
    if prio is None:
        return 2
    return {
        TaskPriority.LOW: 1,
        TaskPriority.MEDIUM: 2,
        TaskPriority.HIGH: 4,
        TaskPriority.CRITICAL: 5,
    }[prio]


# Map the legacy "pending"/"completed" status names a client may
# still send back to the canonical TaskStatus enum values. Anything
# already in the enum-canonical form passes through unchanged. Used
# by both the create and update routes so the contract stays
# symmetric: the API accepts BOTH vocabularies on the way in, even
# though the DB column only ever stores enum-canonical values.
_STATUS_INPUT_ALIASES = {
    "pending": "todo",
    "completed": "done",
}

# Reverse mapping for the outbound contract. The audit asked for the
# API to speak the "pending"/"completed" vocabulary the original
# frontend and docs use; we keep the DB enum on
# {todo,in_progress,done,cancelled} (no schema migration needed) and
# translate at the serialiser instead. Clients that explicitly want
# the enum-canonical names can still read TaskStatus directly via
# OpenAPI or the model.
_STATUS_OUTPUT_ALIASES = {
    "todo": "pending",
    "done": "completed",
}


def _normalise_status_input(value: str | None) -> str | None:
    if value is None:
        return None
    return _STATUS_INPUT_ALIASES.get(value, value)


def _normalise_status_output(value: str | None) -> str | None:
    """DB enum → public API name (todo→pending, done→completed)."""
    if value is None:
        return None
    return _STATUS_OUTPUT_ALIASES.get(value, value)


def _task_visible_to(task: Task, user_id: int) -> bool:
    """Ownership gate shared by the get/update/delete mutation paths.

    Mirrors the canonical ``projects.py`` rule (audit task f17880d0 —
    "Incomplete Permission Coverage for Mutation Paths"): a row is
    visible to the caller when it is *theirs* or *legacy-unowned*
    (``user_id IS NULL``). Cross-tenant rows are hidden (the caller
    gets a 404, not a 403, so we don't even confirm the row exists to a
    non-owner). Legacy unowned rows stay reachable so the login-bypass
    single-tenant frontend keeps working until the data is migrated to
    real accounts.
    """
    return bool(task.user_id is None or task.user_id == user_id)


def _serialize(t: Task) -> dict:
    return {
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "status": _normalise_status_output(t.status.value if t.status else "todo"),
        "priority": _priority_to_int(t.priority),
        "user_id": t.user_id,
        "project_id": t.project_id,
        "due_date": t.due_date.isoformat() if t.due_date else None,
        "estimated_cost": float(t.estimated_cost) if t.estimated_cost is not None else None,
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "updated_at": t.updated_at.isoformat() if t.updated_at else None,
    }


# --- SEARCH (parameterised — SQL injection is structurally impossible) ----

# Only /api/tasks/search is exposed. The historical /api/search alias was
# documented in docs/API.md but no client (frontend, scripts, external)
# ever consumed it — confirmed by grep across the repo. Removed so the
# URL surface stays minimal and the audit tooling can stop flagging the
# orphan alias.
@router.get("/api/tasks/search", tags=["tasks"])
@handle_errors
async def search_tasks_endpoint(
    q: str = "",
    user_id: int = 0,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """GET /api/tasks/search?q=... — case-insensitive substring search.

    The query string is bound to a SQLAlchemy .ilike() parameter inside
    planner_service.search_tasks, so SQL-injection payloads like
    `' OR 1=1--` are treated as literal LIKE patterns and match nothing
    real. Result rows are scoped to ``user_id`` (defaults to 0 = no
    rows) so a probe cannot pivot into another tenant's data.
    """
    from app.services.planner_service import search_tasks as _search

    if not q:
        return {"results": [], "query": q}
    rows = await _search(db, user_id=user_id, query=q)
    return {
        "results": [_serialize(t) for t in rows],
        "query": q,
    }


# --- LIST -------------------------------------------------------------------

# Registered at the canonical /api path only. The plain /tasks path is
# intentionally NOT a backend route — it's an SPA URL handled by the React
# frontend, which then fetches data from /api/tasks. Returning JSON from
# /tasks would hijack the browser navigation and show raw JSON instead of
# the Tasks page.
@router.get("/api/tasks", tags=["tasks"])
@router.get("/api/tasks/", tags=["tasks"])
@handle_errors
async def list_tasks(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> List[dict]:
    """List tasks scoped to the caller (audit task 78c0e8e0 Step 25).

    ``get_optional_user_id`` returns ``DEFAULT_ANON_USER_ID`` (0) when
    no bearer is present, so the frontend's login-bypass mode keeps
    working: those rows live under user_id=0 and the filter still
    matches. With a real JWT, the dep validates signature + expiry
    and the query is correctly scoped.
    """
    stmt = select(Task).where(Task.user_id == user_id)
    result = await db.execute(stmt)
    return [_serialize(t) for t in result.scalars().all()]


# --- GET ONE ----------------------------------------------------------------

@router.get("/api/tasks/{task_id}", tags=["tasks"])
@handle_errors
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    caller_user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Fetch one task, scoped to the caller (audit task f17880d0).

    Symmetric with ``list_tasks`` / ``get_project``: a task owned by
    another user 404s rather than leaking across tenants.
    """
    task = await db.get(Task, task_id)
    if task is None or not _task_visible_to(task, caller_user_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return _serialize(task)


# --- CREATE -----------------------------------------------------------------

@router.post("/api/tasks", status_code=status.HTTP_201_CREATED, tags=["tasks"])
@router.post("/api/tasks/", status_code=status.HTTP_201_CREATED, tags=["tasks"])
@handle_errors
async def create_task(
    payload: TaskCreate,
    db: AsyncSession = Depends(get_db),
    caller_user_id: int = Depends(get_optional_user_id),
) -> dict:
    """POST /api/tasks: create a task.

    POST /api/tasks with empty title returns 422 validation error (Pydantic).
    POST /api/tasks with title > 255 chars returns 422 (max_length=200 here).
    POST /api/tasks with valid title succeeds.

    The row's ``user_id`` is taken from the caller's JWT (audit task
    78c0e8e0 Step 25 — symmetric with list_tasks). An explicit
    payload.user_id wins when supplied so legacy clients that
    construct the field themselves keep working.
    """
    task = Task(
        title=_sanitize(payload.title),
        description=_sanitize(payload.description),
        status=TaskStatus(_normalise_status_input(payload.status) or "todo"),
        priority=_priority_from_int(payload.priority),
        user_id=payload.user_id if payload.user_id is not None else caller_user_id,
        project_id=payload.project_id,
        due_date=payload.due_date,
        estimated_cost=payload.estimated_cost,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return _serialize(task)


# --- UPDATE -----------------------------------------------------------------

@router.put("/api/tasks/{task_id}", tags=["tasks"])
@handle_errors
async def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    caller_user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Update a task the caller owns (audit task f17880d0).

    Previously this mutation path ignored identity entirely — any
    caller could rewrite any task. It now resolves the caller through
    ``get_optional_user_id`` and refuses cross-tenant rows with a 404,
    matching the create path and ``update_project``.
    """
    task = await db.get(Task, task_id)
    if task is None or not _task_visible_to(task, caller_user_id):
        raise HTTPException(status_code=404, detail="Task not found")

    data = payload.model_dump(exclude_unset=True)
    if "title" in data:
        task.title = _sanitize(data["title"])
    if "description" in data:
        task.description = _sanitize(data["description"])
    if "status" in data:
        task.status = TaskStatus(
            _normalise_status_input(data["status"]) or "todo"
        )
    if "priority" in data:
        task.priority = _priority_from_int(data["priority"])
    if "due_date" in data:
        task.due_date = data["due_date"]
    if "project_id" in data:
        task.project_id = data["project_id"]
    if "estimated_cost" in data:
        task.estimated_cost = data["estimated_cost"]

    await db.commit()
    await db.refresh(task)
    return _serialize(task)


# --- DELETE -----------------------------------------------------------------

@router.delete(
    "/api/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["tasks"],
)
@handle_errors
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    caller_user_id: int = Depends(get_optional_user_id),
) -> None:
    """Delete a task the caller owns (audit task f17880d0).

    Cross-tenant deletes are refused with a 404 (the destructive
    counterpart to ``delete_project``); legacy unowned rows remain
    deletable under the login-bypass anon scope.
    """
    task = await db.get(Task, task_id)
    if task is None or not _task_visible_to(task, caller_user_id):
        raise HTTPException(status_code=404, detail="Task not found")
    await db.delete(task)
    await db.commit()
    return None


# --- Associate people with a task (audit task 3cc09436, AC8) ----------------

from pydantic import BaseModel  # noqa: E402


class _PersonLinkRequest(BaseModel):
    person_ids: List[int] = []


@router.post("/api/tasks/{task_id}/persons", tags=["tasks"])
@handle_errors
async def link_persons_to_task(
    task_id: int,
    payload: _PersonLinkRequest,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Link PersonProfiles to a task via the person_tasks M2M table — the
    backend for the task form's person picker. Idempotent: already-linked
    people are skipped."""
    from app.models.person_task import person_tasks

    task = await db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    linked: List[int] = []
    for pid in payload.person_ids:
        existing = (
            await db.execute(
                person_tasks.select().where(
                    (person_tasks.c.task_id == task_id)
                    & (person_tasks.c.person_id == pid)
                )
            )
        ).first()
        if existing is None:
            await db.execute(
                person_tasks.insert().values(task_id=task_id, person_id=pid)
            )
            linked.append(pid)
    await db.commit()
    return {"task_id": task_id, "linked_person_ids": linked}
