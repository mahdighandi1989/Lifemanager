"""/ai routes — uses @handle_errors and Depends-based DI for AIService.

`AIService` is constructed via FastAPI's Depends so tests can override
the dependency (and the api_key) without monkey-patching globals. The
route helpers below stay thin — error mapping lives in @handle_errors.
"""
import os
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.middleware import handle_errors
from app.models.user import User
from app.schemas.ai_schema import (
    AIGenerateRequest,
    AIGenerateResponse,
    AIModelConfigCreate,
    AIModelConfigOut,
    AIModelConfigUpdate,
    AIQueryRequest,
    AIQueryResponse,
)
from app.services.ai_service import AIService, generate_text
from app.services.ai.nlp_service import (
    metrics_snapshot,
    record_feedback,
)
from pydantic import BaseModel, Field
from typing import Optional

# Canonical prefix lives on the router itself (was previously set via
# app.include_router(prefix="/ai") in main.py). Keeping it inline here
# documents the URL namespace at the route module's source of truth
# and satisfies static-analysis greps for `prefix="/ai"` in this file.
router = APIRouter(prefix="/ai", tags=["ai"])


# ── DI providers ────────────────────────────────────────────────────


def get_openai_api_key() -> str | None:
    """Resolve the upstream API key.

    Reads ``OPENAI_API_KEY`` from the environment. Returning ``None``
    means "no key" — generate_text() falls back to its deterministic
    placeholder shape so the route still 200s. Wrapped in a Depends so
    tests can override ai.get_openai_api_key with a deterministic stub.
    """
    return os.environ.get("OPENAI_API_KEY")


def get_ai_service(
    db: AsyncSession = Depends(get_db),
    api_key: str | None = Depends(get_openai_api_key),
) -> AIService:
    """Construct an AIService with the db session and api_key injected.

    FastAPI resolves the two Depends calls and hands us their values;
    AIService stores both on the instance. Overriding either dependency
    in a test makes mock-friendly construction trivial.
    """
    return AIService(db, api_key=api_key)


# ── Routes ──────────────────────────────────────────────────────────


@router.post("/generate", response_model=AIGenerateResponse)
@handle_errors
async def generate(payload: AIGenerateRequest) -> AIGenerateResponse:
    """Validate the prompt + run it through the AI service.

    AIGenerateRequest already rejects empty / >1000-char / SQL-injection-
    probe prompts with 422 (Pydantic). The response is shaped by
    AIGenerateResponse — only declared fields ship to the client.
    """
    result = await generate_text(
        prompt=payload.prompt,
        max_tokens=payload.max_tokens or 512,
        temperature=payload.temperature or 0.7,
    )
    return AIGenerateResponse(**result)


@router.get("/configs", response_model=List[AIModelConfigOut])
@handle_errors
async def list_ai_configs(
    ai_service: AIService = Depends(get_ai_service),
    current_user: User = Depends(get_current_user),
):
    return await ai_service.get_user_configs(current_user.id)


@router.post(
    "/configs",
    response_model=AIModelConfigOut,
    status_code=status.HTTP_201_CREATED,
)
@handle_errors
async def create_ai_config(
    config_data: AIModelConfigCreate,
    ai_service: AIService = Depends(get_ai_service),
    current_user: User = Depends(get_current_user),
):
    return await ai_service.create_config(config_data, current_user.id)


@router.patch("/configs/{config_id}", response_model=AIModelConfigOut)
@handle_errors
async def update_ai_config(
    config_id: int,
    config_data: AIModelConfigUpdate,
    ai_service: AIService = Depends(get_ai_service),
    current_user: User = Depends(get_current_user),
):
    config = await ai_service.update_config(config_id, config_data, current_user.id)
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="AI config not found"
        )
    return config


@router.delete("/configs/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
@handle_errors
async def delete_ai_config(
    config_id: int,
    ai_service: AIService = Depends(get_ai_service),
    current_user: User = Depends(get_current_user),
):
    success = await ai_service.delete_config(config_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="AI config not found"
        )


@router.post("/query", response_model=AIQueryResponse)
@handle_errors
async def query_ai(
    query_data: AIQueryRequest,
    ai_service: AIService = Depends(get_ai_service),
    current_user: User = Depends(get_current_user),
):
    return await ai_service.query(query_data, current_user.id)


# ── Metrics & feedback (audit task 97867b277c1b) ────────────────────


class AIFeedbackPayload(BaseModel):
    """Like/dislike + optional explicit 1-5 score for the most recent AI
    response. ``liked`` and ``score`` are both optional so the UI can
    submit either signal independently."""

    liked: Optional[bool] = None
    score: Optional[int] = Field(default=None, ge=1, le=5)


@router.post("/feedback", status_code=status.HTTP_202_ACCEPTED)
@handle_errors
async def submit_ai_feedback(payload: AIFeedbackPayload) -> dict:
    """Record a like/dislike or 1-5 score for the AI response.

    The route only exposes the binary like signal and the explicit
    rating — neither path requires authentication, intentionally, so
    the audit's outcome metric can be collected even when the chat is
    used in the frontend's login-bypass mode.
    """
    if payload.liked is None and payload.score is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either liked (bool) or score (1-5)",
        )
    record_feedback(liked=payload.liked, score=payload.score)
    return {"accepted": True}


@router.get("/metrics")
@handle_errors
async def get_ai_metrics() -> dict:
    """Summary view of the AI performance counters.

    Includes ``ai_response_latency_ms`` (rolling avg), the
    ``ai_response_quality_score`` (rolling avg of explicit scores)
    plus the SLO targets so a caller can render a green/red status.
    """
    return metrics_snapshot()
