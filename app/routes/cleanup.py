"""/api/cleanup — test-junk finder (reversible).

Scans the content tables for leftover test rows and removes the selected ones
using each table's soft-delete marker (so it's undoable). Surfaced in the
«پاک‌سازی و ادغام» page.
"""
from typing import List

from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import enforce_auth_when_required, get_optional_user_id
from app.middleware import handle_errors
from app.services import cleanup_service

router = APIRouter()


class JunkItem(BaseModel):
    kind: str = Field(..., max_length=32)
    id: int


class RemoveRequest(BaseModel):
    items: List[JunkItem] = Field(default_factory=list)


@router.get("/api/cleanup/test-junk", tags=["cleanup"])
@handle_errors
async def scan(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    items = await cleanup_service.scan_test_junk(db, user_id)
    return {"ok": True, "success": True, "items": items, "count": len(items)}


@router.post("/api/cleanup/test-junk/remove", tags=["cleanup"])
@handle_errors
async def remove(
    payload: RemoveRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    removed = await cleanup_service.remove_test_junk(
        db, user_id, [i.model_dump() for i in payload.items]
    )
    return {"ok": True, "success": True, "removed": removed, "total": sum(removed.values())}
