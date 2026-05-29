"""/api/deduplication — scan + merge similar entities (audit task fbd9bd36).

The AC-named surface over DeduplicationService: scan returns a job id +
grouped duplicates; merge folds a source into a target (soft-deleting source).
Login-bypass friendly (get_optional_user_id), like the rest of the app.
"""
import uuid
from typing import Optional

from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.services.deduplication_service import DeduplicationService

router = APIRouter()

# In-process scan-job store (single-replica deploy; mirrors the AI guidance
# store). Maps job_id -> {user_id, groups}. A multi-replica setup would back
# this with Redis.
_SCAN_JOBS: dict = {}


class MergeRequest(BaseModel):
    source_id: int
    target_id: int
    entity_type: str = "task"


@router.post("/api/deduplication/scan", tags=["deduplication"])
@handle_errors
async def scan(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """AC2: scan for duplicate groups; return a job id for progress tracking."""
    groups = await DeduplicationService(db).scan_for_duplicates(user_id=user_id)
    job_id = uuid.uuid4().hex
    _SCAN_JOBS[job_id] = {"user_id": user_id, "groups": groups}
    return {"job_id": job_id, "status": "completed", "group_count": len(groups)}


@router.get("/api/deduplication/groups", tags=["deduplication"])
@handle_errors
async def groups(
    job_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Return the similar-entity groups for a prior scan job, or a fresh scan."""
    if job_id and job_id in _SCAN_JOBS:
        return {"groups": _SCAN_JOBS[job_id]["groups"]}
    fresh = await DeduplicationService(db).scan_for_duplicates(user_id=user_id)
    return {"groups": fresh}


@router.post("/api/deduplication/merge", tags=["deduplication"])
@handle_errors
async def merge(
    payload: MergeRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """AC3: merge source into target, moving content and soft-deleting source."""
    return await DeduplicationService(db).merge(
        source_id=payload.source_id,
        target_id=payload.target_id,
        entity_type=payload.entity_type,
    )
