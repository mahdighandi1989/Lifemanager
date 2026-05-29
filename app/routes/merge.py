"""/api/merge — duplicate-task suggestions + execution (audit task fbd9bd36, AC3/AC4)."""
from typing import List

from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.models.task import Task
from app.services import consolidation_service
from app.services.similarity_service import find_similar_entities

router = APIRouter()


class MergeExecuteRequest(BaseModel):
    merge_type: str = "task"
    entity_ids: List[int] = []


@router.post("/api/merge/suggestions", tags=["merge"])
@handle_errors
async def merge_suggestions(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """AC3: group the user's similar (not-yet-merged) tasks into merge
    suggestions."""
    rows = (
        await db.execute(
            select(Task).where(
                Task.user_id == user_id, Task.merged_into_id.is_(None)
            )
        )
    ).scalars().all()
    by_id = {t.id: t for t in rows}
    groups = find_similar_entities(rows, threshold=0.5)
    suggestions = [
        {
            "entity_ids": g,
            "tasks": [
                {"id": tid, "title": by_id[tid].title} for tid in g if tid in by_id
            ],
        }
        for g in groups
    ]
    return {"merge_type": "task", "suggestions": suggestions}


@router.post("/api/merge/execute", tags=["merge"])
@handle_errors
async def merge_execute(
    payload: MergeExecuteRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """AC4: merge ``entity_ids`` — the first is the primary, the rest are
    folded into it."""
    if len(payload.entity_ids) < 2:
        return {"ok": False, "error": "need at least two entity_ids to merge"}
    primary, *duplicates = payload.entity_ids
    result = await consolidation_service.merge_tasks(db, primary, duplicates)
    if result is None:
        raise HTTPException(status_code=404, detail="primary task not found")
    return {"ok": True, **result}
