"""POST /api/v1/context/analyze — ambient-context task suggestions.

Audit task 2165524b: turn location + biometric + activity + audio signals into
a list of task suggestions via the context_engine orchestrator.
"""
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.services.context_engine import ContextOrchestrator

router = APIRouter()


class _LatLng(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None


class ContextAnalyzeRequest(BaseModel):
    location: Optional[_LatLng] = None
    heart_rate: Optional[int] = None
    activity: Optional[str] = None
    noise_db: Optional[float] = None


@router.post("/api/v1/context/analyze", tags=["context"])
@handle_errors
async def analyze_context(
    payload: ContextAnalyzeRequest,
    user_id: int = Depends(get_optional_user_id),
):
    body = {
        "location": payload.location.model_dump() if payload.location else None,
        "heart_rate": payload.heart_rate,
        "activity": payload.activity,
        "noise_db": payload.noise_db,
    }
    return ContextOrchestrator().analyze(body)


# ── Location capture + recommendations (audit task 2165524b AC 3, 4) ──


class LocationIn(BaseModel):
    lat: float
    lng: float
    accuracy_m: Optional[float] = None


@router.post("/api/context/location", tags=["context"])
@handle_errors
async def save_context_location(
    payload: LocationIn = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Persist the caller's latest location into their UserContext (AC 3)."""
    from app.models.context import UserContext

    result = await db.execute(select(UserContext).where(UserContext.user_id == user_id))
    ctx = result.scalars().first()
    if ctx is None:
        ctx = UserContext(user_id=user_id)
        db.add(ctx)
    ctx.current_location = {"lat": payload.lat, "lng": payload.lng}
    ctx.last_activity_time = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(ctx)
    return {"status": "ok", "current_location": ctx.current_location}


@router.get("/api/recommendations", tags=["context"])
@handle_errors
async def list_recommendations(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> list:
    """Return context-aware recommendations for the caller (AC 4).

    Reads the caller's latest UserContext snapshot and fuses it through the
    recommendation engine (location/physiological/behavioral)."""
    from app.models.context import UserContext
    from app.services.recommendation_engine import generate_contextual_recommendations

    result = await db.execute(select(UserContext).where(UserContext.user_id == user_id))
    ctx_row = result.scalars().first()
    context: dict = {}
    if ctx_row is not None:
        context = {
            "current_location": ctx_row.current_location,
            "heart_rate": ctx_row.heart_rate,
            "activity_status": ctx_row.activity_status,
            "mood": ctx_row.mood,
        }
    return await generate_contextual_recommendations(db, user_id=user_id, context=context)
