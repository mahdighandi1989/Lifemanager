"""POST /api/v1/context/analyze — ambient-context task suggestions.

Audit task 2165524b: turn location + biometric + activity + audio signals into
a list of task suggestions via the context_engine orchestrator.
"""
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

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
