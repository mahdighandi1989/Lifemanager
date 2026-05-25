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
- Database / unexpected errors are caught and translated to a 500 with a
  consistent {"detail": "..."} body, and logged at .exception level so the
  traceback ends up in the deploy logs.
"""
import html
import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.task import Task, TaskPriority, TaskStatus
from app.schemas.task_schema import TaskCreate, TaskResponse, TaskUpdate

logger = logging.getLogger(__name__)

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
    return {
        TaskPriority.LOW: 1,
        TaskPriority.MEDIUM: 2,
        TaskPriority.HIGH: 4,
        TaskPriority.CRITICAL: 5,
    }.get(prio, 2)


def _serialize(t: Task) -> dict:
    return {
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "status": t.status.value if t.status else "todo",
        "priority": _priority_to_int(t.priority),
        "user_id": t.user_id,
        "project_id": t.project_id,
        "due_date": t.due_date.isoformat() if t.due_date else None,
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "updated_at": t.updated_at.isoformat() if t.updated_at else None,
    }


# --- LIST -------------------------------------------------------------------

@router.get("/api/tasks/", tags=["tasks"])
@router.get("/tasks/", tags=["tasks"])
async def list_tasks(db: AsyncSession = Depends(get_db)) -> List[dict]:
    try:
        result = await db.execute(select(Task))
        return [_serialize(t) for t in result.scalars().all()]
    except SQLAlchemyError as exc:
        logger.exception("list_tasks failed")
        raise HTTPException(status_code=500, detail="internal error") from exc


# --- GET ONE ----------------------------------------------------------------

@router.get("/api/tasks/{task_id}", tags=["tasks"])
@router.get("/tasks/{task_id}", tags=["tasks"])
async def get_task(task_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    try:
        task = await db.get(Task, task_id)
    except SQLAlchemyError as exc:
        logger.exception("get_task(%s) failed", task_id)
        raise HTTPException(status_code=500, detail="internal error") from exc
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return _serialize(task)


# --- CREATE -----------------------------------------------------------------

@router.post(
    "/api/tasks/",
    status_code=status.HTTP_201_CREATED,
    tags=["tasks"],
)
@router.post(
    "/tasks/",
    status_code=status.HTTP_201_CREATED,
    tags=["tasks"],
)
async def create_task(
    payload: TaskCreate,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """POST /api/tasks: create a task.

    POST /api/tasks with empty title returns 422 validation error (Pydantic).
    POST /api/tasks with title > 255 chars returns 422 (max_length=200 here).
    POST /api/tasks with valid title succeeds.
    """
    try:
        task = Task(
            title=_sanitize(payload.title),
            description=_sanitize(payload.description),
            status=TaskStatus(payload.status),
            priority=_priority_from_int(payload.priority),
            user_id=payload.user_id,
            project_id=payload.project_id,
            due_date=payload.due_date,
        )
        db.add(task)
        await db.commit()
        await db.refresh(task)
    except SQLAlchemyError as exc:
        await db.rollback()
        logger.exception("create_task failed")
        raise HTTPException(status_code=500, detail="internal error") from exc
    return _serialize(task)


# --- UPDATE -----------------------------------------------------------------

@router.put("/api/tasks/{task_id}", tags=["tasks"])
@router.put("/tasks/{task_id}", tags=["tasks"])
async def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: AsyncSession = Depends(get_db),
) -> dict:
    try:
        task = await db.get(Task, task_id)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")

        data = payload.model_dump(exclude_unset=True)
        if "title" in data:
            task.title = _sanitize(data["title"])
        if "description" in data:
            task.description = _sanitize(data["description"])
        if "status" in data:
            task.status = TaskStatus(data["status"])
        if "priority" in data:
            task.priority = _priority_from_int(data["priority"])
        if "due_date" in data:
            task.due_date = data["due_date"]
        if "project_id" in data:
            task.project_id = data["project_id"]

        await db.commit()
        await db.refresh(task)
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        await db.rollback()
        logger.exception("update_task(%s) failed", task_id)
        raise HTTPException(status_code=500, detail="internal error") from exc
    return _serialize(task)


# --- DELETE -----------------------------------------------------------------

@router.delete(
    "/api/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["tasks"],
)
@router.delete(
    "/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["tasks"],
)
async def delete_task(task_id: int, db: AsyncSession = Depends(get_db)) -> None:
    try:
        task = await db.get(Task, task_id)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        await db.delete(task)
        await db.commit()
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        await db.rollback()
        logger.exception("delete_task(%s) failed", task_id)
        raise HTTPException(status_code=500, detail="internal error") from exc
    return None
