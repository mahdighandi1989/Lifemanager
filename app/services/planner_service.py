from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional

from app.models.task import Task
from app.models.project import Project
from app.schemas.planner import TaskCreate, TaskUpdate, ProjectCreate, ProjectUpdate

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
