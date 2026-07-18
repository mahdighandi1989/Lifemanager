"""/api/weekly-review — مرور هفتگی (phase 4).

Thin shells over ``app/services/weekly_review_service``:

* ``GET  /api/weekly-review``           — stored reviews, newest first
* ``GET  /api/weekly-review/latest``    — the most recent review (404-free: ok+null)
* ``POST /api/weekly-review/run``       — generate + deliver a review now
* ``GET  /api/weekly-review/settings``  — schedule settings
* ``PUT  /api/weekly-review/settings``  — update schedule settings (partial)
"""
from typing import Any, Dict

from fastapi import APIRouter, Body, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.services import weekly_review_service as svc

router = APIRouter()


@router.get("/api/weekly-review", tags=["weekly-review"])
@handle_errors
async def list_weekly_reviews(
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    rows = await svc.list_reviews(db, user_id=user_id, limit=limit)
    return {"ok": True, "success": True, "reviews": [svc.serialize(r) for r in rows]}


@router.get("/api/weekly-review/latest", tags=["weekly-review"])
@handle_errors
async def latest_weekly_review(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    rows = await svc.list_reviews(db, user_id=user_id, limit=1)
    return {
        "ok": True,
        "success": True,
        "review": svc.serialize(rows[0]) if rows else None,
    }


@router.post("/api/weekly-review/run", tags=["weekly-review"])
@handle_errors
async def run_weekly_review(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    row = await svc.generate_review(db, user_id=user_id)
    return {"ok": True, "success": True, "review": svc.serialize(row)}


@router.get("/api/weekly-review/settings", tags=["weekly-review"])
@handle_errors
async def get_weekly_review_settings(db: AsyncSession = Depends(get_db)) -> dict:
    cfg = await svc.get_settings(db)
    return {"ok": True, "success": True, "settings": cfg}


@router.put("/api/weekly-review/settings", tags=["weekly-review"])
@handle_errors
async def put_weekly_review_settings(
    partial: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
) -> dict:
    # last_run_at is the scheduler's own stamp — a settings form echoing the
    # GET payload back must not rewind it (it would re-arm this week's
    # already-sent review). Only weekly_tick writes it.
    cleaned = {k: v for k, v in (partial or {}).items() if k != "last_run_at"}
    cfg = await svc.update_settings(db, cleaned)
    return {"ok": True, "success": True, "settings": cfg}
