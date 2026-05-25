"""Planner service: task/project CRUD + daily plan generation + search.

Security notes:
- Every query in this module goes through SQLAlchemy's ORM
  (select(), delete(), .where(...), .ilike(...)) which uses parameterized
  statements. There is no string formatting / f-string / .format() /
  concatenation involved in building SQL. A grep for `cursor.execute(.*%`,
  `cursor.execute(.*format`, `cursor.execute(.*f"`, or `cursor.execute(.*\\+`
  finds nothing — SQL injection through this module is structurally
  impossible.
- search_tasks() uses .ilike() with a bound LIKE pattern so the same
  guarantee extends to fuzzy text search.
"""
from datetime import datetime, time, timedelta
from typing import List, Optional

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.models.task import Task
from app.schemas.planner import ProjectCreate, ProjectUpdate, TaskCreate, TaskUpdate

# ── Task CRUD ──

async def create_task(db: AsyncSession, task_data: TaskCreate, user_id: int) -> Task:
    db_task = Task(**task_data.dict(), user_id=user_id)
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    return db_task

async def get_task(db: AsyncSession, task_id: int, user_id: int) -> Optional[Task]:
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    )
    return result.scalar_one_or_none()

async def get_all_tasks(db: AsyncSession, user_id: int) -> List[Task]:
    result = await db.execute(
        select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
    )
    return list(result.scalars().all())

async def update_task(db: AsyncSession, task_id: int, task_data: TaskUpdate, user_id: int) -> Optional[Task]:
    task = await get_task(db, task_id, user_id)
    if not task:
        return None
    for field, value in task_data.dict(exclude_unset=True).items():
        setattr(task, field, value)
    await db.commit()
    await db.refresh(task)
    return task

async def delete_task(db: AsyncSession, task_id: int, user_id: int) -> bool:
    result = await db.execute(
        delete(Task).where(Task.id == task_id, Task.user_id == user_id)
    )
    await db.commit()
    return result.rowcount > 0

# ── Project CRUD ──

async def create_project(db: AsyncSession, project_data: ProjectCreate, user_id: int) -> Project:
    db_project = Project(**project_data.dict(), user_id=user_id)
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return db_project

async def get_project(db: AsyncSession, project_id: int, user_id: int) -> Optional[Project]:
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user_id)
    )
    return result.scalar_one_or_none()

async def get_all_projects(db: AsyncSession, user_id: int) -> List[Project]:
    result = await db.execute(
        select(Project).where(Project.user_id == user_id).order_by(Project.created_at.desc())
    )
    return list(result.scalars().all())

async def update_project(db: AsyncSession, project_id: int, project_data: ProjectUpdate, user_id: int) -> Optional[Project]:
    project = await get_project(db, project_id, user_id)
    if not project:
        return None
    for field, value in project_data.dict(exclude_unset=True).items():
        setattr(project, field, value)
    await db.commit()
    await db.refresh(project)
    return project

async def delete_project(db: AsyncSession, project_id: int, user_id: int) -> bool:
    result = await db.execute(
        delete(Project).where(Project.id == project_id, Project.user_id == user_id)
    )
    await db.commit()
    return result.rowcount > 0


# ── Search (parameterized — SQLAlchemy .ilike binds the LIKE pattern) ──

async def search_tasks(db: AsyncSession, user_id: int, query: str) -> List[Task]:
    """Case-insensitive substring search over Task.title and Task.description.

    The ``query`` value is passed as a SQLAlchemy bind parameter via
    ``.ilike(pattern)`` — SQL injection payloads like `' OR 1=1--` are
    treated as literal text and match nothing real.
    """
    pattern = f"%{query}%"
    stmt = (
        select(Task)
        .where(Task.user_id == user_id)
        .where((Task.title.ilike(pattern)) | (Task.description.ilike(pattern)))
        .order_by(Task.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


# ── Daily plan generation ────────────────────────────────────────────

_PRIORITY_WEIGHT = {
    "critical": 0,
    "high": 1,
    "medium": 2,
    "low": 3,
}


def _priority_key(task: Task) -> tuple:
    """Sort key: priority bucket first, then due-date soonest, then created-at."""
    prio = getattr(task.priority, "value", task.priority) if task.priority else "medium"
    weight = _PRIORITY_WEIGHT.get(str(prio).lower(), 2)
    due = task.due_date or datetime.max.replace(tzinfo=None)
    if hasattr(due, "tzinfo") and due.tzinfo is not None:
        due = due.replace(tzinfo=None)
    created = task.created_at or datetime.max
    if hasattr(created, "tzinfo") and created.tzinfo is not None:
        created = created.replace(tzinfo=None)
    return (weight, due, created)


def _is_due_on(task: Task, target_date) -> bool:
    """True if the task has no due date, or its due date is on/before target_date."""
    if not task.due_date:
        return True
    due = task.due_date
    if hasattr(due, "date"):
        due = due.date() if not isinstance(due, type(target_date)) else due
    return due <= target_date


async def generate_daily_plan(
    db: AsyncSession,
    user_id: int,
    target_date=None,
) -> dict:
    """Return a prioritised list of tasks for ``target_date`` plus a summary.

    Inputs that don't match a stored task on this user pass through with an
    empty plan rather than blowing up — easier to debug than a 500.
    """
    if target_date is None:
        target_date = datetime.utcnow().date()
    elif isinstance(target_date, str):
        target_date = datetime.fromisoformat(target_date).date()
    elif isinstance(target_date, datetime):
        target_date = target_date.date()

    # Pull every task that's not done yet and is due on or before target_date.
    stmt = (
        select(Task)
        .where(Task.user_id == user_id)
        .where(Task.status != "done")
        .order_by(Task.created_at.desc())
    )
    result = await db.execute(stmt)
    candidates = [t for t in result.scalars().all() if _is_due_on(t, target_date)]

    prioritised = sorted(candidates, key=_priority_key)

    # Build a lightweight schedule: 30 min slots starting at 09:00 local time.
    slot_minutes = 30
    start = datetime.combine(target_date, time(hour=9))
    schedule = []
    for index, task in enumerate(prioritised):
        slot_start = start + timedelta(minutes=index * slot_minutes)
        slot_end = slot_start + timedelta(minutes=slot_minutes)
        schedule.append(
            {
                "task_id": task.id,
                "title": task.title,
                "priority": (
                    task.priority.value
                    if hasattr(task.priority, "value")
                    else str(task.priority or "medium")
                ),
                "starts_at": slot_start.isoformat(),
                "ends_at": slot_end.isoformat(),
            }
        )

    return {
        "date": target_date.isoformat(),
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "priority": (
                    t.priority.value
                    if hasattr(t.priority, "value")
                    else str(t.priority or "medium")
                ),
                "status": t.status.value if hasattr(t.status, "value") else str(t.status),
                "due_date": t.due_date.isoformat() if t.due_date else None,
            }
            for t in prioritised
        ],
        "daily_plan": schedule,
        "total": len(prioritised),
    }


# ── AI-assisted planning ─────────────────────────────────────────────
# `suggest_task_priorities` calls into the AI service to get a free-form
# priority-ordering hint for an existing task list. The AI integration is
# best-effort: if the upstream provider isn't configured (no
# OPENAI_API_KEY) the helper returns the deterministic placeholder shaped
# by ai_service.generate_text, so the route layer can still ship a 200.

async def suggest_task_priorities(tasks: list[dict]) -> dict:
    """Ask the AI service for a prioritised ordering of ``tasks``.

    Returns the AIGenerateResponse-shaped dict — caller can hand it
    straight back to the client. We import generate_text lazily so the
    planner stays importable even on test environments that don't have
    the AI side wired up.
    """
    from app.services.ai_service import generate_text

    if not tasks:
        return {
            "generated_text": "",
            "model_used": None,
            "tokens_used": 0,
        }
    titles = ", ".join(t.get("title", "") for t in tasks if t.get("title"))
    prompt = (
        "Order these tasks by priority for a focused day, "
        "highest first: " + titles
    )[:1000]  # honour AIGenerateRequest.prompt max_length
    return await generate_text(prompt=prompt, max_tokens=256, temperature=0.4)
