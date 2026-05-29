"""POST /api/v1/context/analyze — ambient-context task suggestions.

Audit task 2165524b: turn location + biometric + activity + audio signals into
a list of task suggestions via the context_engine orchestrator.
"""
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic import BaseModel, Field
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


class PhysiologicalIn(BaseModel):
    heart_rate: Optional[int] = None
    activity_status: Optional[str] = None


@router.post("/api/context/physiological", tags=["context"])
@handle_errors
async def ingest_physiological(
    payload: PhysiologicalIn = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Ingest a wearable heart-rate / activity sample into UserContext and
    return fresh context-aware recommendations (audit task 2165524b Steps 6-7).
    Live device pairing is external (see TO-DO); this is the ingestion seam."""
    from app.models.context import UserContext
    from app.services.context_engine.wearable_service import normalize_physiological
    from app.services.recommendation_engine import generate_contextual_recommendations

    norm = normalize_physiological(payload.model_dump())
    ctx = (await db.execute(select(UserContext).where(UserContext.user_id == user_id))).scalars().first()
    if ctx is None:
        ctx = UserContext(user_id=user_id)
        db.add(ctx)
    if norm["heart_rate"] is not None:
        ctx.heart_rate = norm["heart_rate"]
    if norm["activity_status"]:
        ctx.activity_status = norm["activity_status"]
    ctx.last_activity_time = datetime.now(timezone.utc)
    await db.commit()
    recs = await generate_contextual_recommendations(
        db, user_id=user_id,
        context={"heart_rate": ctx.heart_rate, "activity_status": ctx.activity_status},
    )
    return {"physical_state": norm["physical_state"], "recommendations": recs}


class VoiceIn(BaseModel):
    transcript: str = Field(..., min_length=1, max_length=10_000)


@router.post("/api/context/voice", tags=["context"])
@handle_errors
async def ingest_voice(
    payload: VoiceIn = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Infer mood from a voice transcript and store it on UserContext (audit
    task 2165524b Step 10). Continuous capture/ASR is external (see TO-DO)."""
    from app.models.context import UserContext
    from app.services.context_engine.voice_mood_service import analyze_voice_mood

    mood = analyze_voice_mood(payload.transcript)
    ctx = (await db.execute(select(UserContext).where(UserContext.user_id == user_id))).scalars().first()
    if ctx is None:
        ctx = UserContext(user_id=user_id)
        db.add(ctx)
    ctx.mood = mood["mood"]
    ctx.last_activity_time = datetime.now(timezone.utc)
    await db.commit()
    return mood


@router.patch("/api/recommendations/{rec_id}/read", tags=["context"])
@handle_errors
async def mark_recommendation_read(
    rec_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Persist accept/reject by marking a ContextualRecommendation read (AC5) —
    the RecommendationPanel buttons call this so dismissal isn't client-only."""
    from app.models.recommendation import ContextualRecommendation

    row = (
        await db.execute(
            select(ContextualRecommendation).where(
                ContextualRecommendation.id == rec_id,
                ContextualRecommendation.user_id == user_id,
            )
        )
    ).scalars().first()
    if row is None:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    row.is_read = True
    await db.commit()
    return {"id": rec_id, "is_read": True}


@router.get("/api/context/recommendations", tags=["context"])
@handle_errors
async def list_context_recommendations(
    type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> list:
    """Diverse, profile-aware recommendations (audit task 14e65214, Step 4).

    Combines the personalized interest/taste/career suggestions, each carrying
    a ``type`` field, and supports filtering with ``?type=career`` (AC22-23)."""
    from app.services.ai.recommendation_service import RecommendationService

    recs = await RecommendationService(db).generate_personalized_recommendations(user_id)
    if type:
        recs = [r for r in recs if r.get("type") == type]
    return recs


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
