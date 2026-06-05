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
from app.dependencies.auth import get_optional_user_id
from app.services.planner_service import generate_daily_plan

router = APIRouter()


class GeneratePlanRequest(BaseModel):
    date: Optional[_date] = None
    # Deprecated: identity is resolved from the bearer token, not the
    # body. Kept for backward compatibility with older clients but
    # ignored by the handler (see below) — a caller can no longer read
    # another tenant's plan by supplying their user_id here.
    user_id: Optional[int] = None


@router.post("/api/planner/generate")
async def generate_plan(
    payload: GeneratePlanRequest,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Build the daily plan for the requested date.

    The plan is always scoped to the *authenticated* caller. Identity
    comes from the bearer token via ``get_optional_user_id`` — never
    from ``payload.user_id`` — so a caller cannot read another tenant's
    tasks by passing an arbitrary id in the body (audit task f17880d0:
    incomplete permission coverage for mutation paths). Anonymous
    callers under the login-bypass single-tenant frontend resolve to
    user 0 and get that scope's plan; the underlying service only
    returns tasks that actually belong to the resolved user, so an
    unknown user just yields an empty plan rather than a 500.
    """
    try:
        return await generate_daily_plan(
            db, user_id=user_id, target_date=payload.date
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"planner failed: {exc}",
        ) from exc
