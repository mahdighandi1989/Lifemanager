"""/api/planner — daily plan generation.

POST /api/planner/generate with {"date": "YYYY-MM-DD"} returns the
prioritised task list and a 30-minute slot schedule for that day.
"""
from datetime import date as _date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.planner_service import generate_daily_plan

router = APIRouter()


class GeneratePlanRequest(BaseModel):
    date: Optional[_date] = None
    user_id: Optional[int] = None


@router.post("/api/planner/generate")
async def generate_plan(
    payload: GeneratePlanRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Build the daily plan for the requested date.

    user_id falls back to None (anonymous) so the route works before
    auth is wired in; the underlying service only returns tasks that
    actually belong to user_id, so an unknown user just yields an empty
    plan rather than a 500.
    """
    try:
        return await generate_daily_plan(
            db, user_id=payload.user_id or 0, target_date=payload.date
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"planner failed: {exc}",
        ) from exc
