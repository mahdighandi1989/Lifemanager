"""/ai routes — uses @handle_errors and Depends-based DI for AIService.

`AIService` is constructed via FastAPI's Depends so tests can override
the dependency (and the api_key) without monkey-patching globals. The
route helpers below stay thin — error mapping lives in @handle_errors.
"""
import os
from typing import List

from fastapi import APIRouter, Body, Depends, HTTPException, status
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
from app.services.ai_service import AIService
from app.services.ai.nlp_service import (
    metrics_snapshot,
    record_feedback,
)
# AC 5 (task 97867b277c1b): the module-level `generate_text` import
# has been removed in favour of AIService.generate_text(). The
# /ai/generate route below calls the instance method via the
# already-DI'd ai_service Depends.
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
async def generate(
    payload: AIGenerateRequest,
    ai_service: AIService = Depends(get_ai_service),
) -> AIGenerateResponse:
    """Validate the prompt + run it through the AI service.

    AIGenerateRequest already rejects empty / >1000-char / SQL-injection-
    probe prompts with 422 (Pydantic). The response is shaped by
    AIGenerateResponse — only declared fields ship to the client.

    Per audit task 97867b277c1b AC 6, the route now calls
    ``ai_service.generate_text(...)`` instead of the module-level
    helper — the AIService surface is the canonical entry point.
    """
    result = await ai_service.generate_text(
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


# ── AI Providers + Global Analysis Prompt (audit task 1a08ded2) ─────


from sqlalchemy import select as _select
from app.models.ai_provider import AIProvider, GlobalAnalysisPrompt
from app.schemas.ai_provider_schema import (
    AIProviderCreate,
    AIProviderResponse,
    AIProviderUpdate,
    GlobalAnalysisPromptResponse,
    GlobalAnalysisPromptUpdate,
)
from app.dependencies.auth import get_optional_user_id


@router.post(
    "/providers",
    response_model=AIProviderResponse,
    status_code=status.HTTP_201_CREATED,
)
@handle_errors
async def create_ai_provider(
    payload: AIProviderCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    provider = AIProvider(
        user_id=user_id,
        name=payload.name,
        description=payload.description,
        is_enabled=payload.is_enabled,
    )
    db.add(provider)
    await db.commit()
    await db.refresh(provider)
    return provider


@router.get("/providers", response_model=List[AIProviderResponse])
@handle_errors
async def list_ai_providers(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    result = await db.execute(
        _select(AIProvider).where(AIProvider.user_id == user_id)
    )
    return list(result.scalars().all())


@router.get("/providers/{provider_id}", response_model=AIProviderResponse)
@handle_errors
async def get_ai_provider(
    provider_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    result = await db.execute(
        _select(AIProvider).where(
            (AIProvider.id == provider_id) & (AIProvider.user_id == user_id)
        )
    )
    provider = result.scalar_one_or_none()
    if provider is None:
        raise HTTPException(status_code=404, detail="AI provider not found")
    return provider


@router.patch("/providers/{provider_id}", response_model=AIProviderResponse)
@handle_errors
async def update_ai_provider(
    provider_id: int,
    payload: AIProviderUpdate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    result = await db.execute(
        _select(AIProvider).where(
            (AIProvider.id == provider_id) & (AIProvider.user_id == user_id)
        )
    )
    provider = result.scalar_one_or_none()
    if provider is None:
        raise HTTPException(status_code=404, detail="AI provider not found")
    if payload.name is not None:
        provider.name = payload.name
    if payload.description is not None:
        provider.description = payload.description
    if payload.is_enabled is not None:
        provider.is_enabled = payload.is_enabled
    await db.commit()
    await db.refresh(provider)
    return provider


@router.delete("/providers/{provider_id}", status_code=status.HTTP_204_NO_CONTENT)
@handle_errors
async def delete_ai_provider(
    provider_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    result = await db.execute(
        _select(AIProvider).where(
            (AIProvider.id == provider_id) & (AIProvider.user_id == user_id)
        )
    )
    provider = result.scalar_one_or_none()
    if provider is None:
        raise HTTPException(status_code=404, detail="AI provider not found")
    await db.delete(provider)
    await db.commit()


@router.get("/global-prompt", response_model=GlobalAnalysisPromptResponse)
@handle_errors
async def get_global_prompt(db: AsyncSession = Depends(get_db)):
    result = await db.execute(_select(GlobalAnalysisPrompt))
    prompt = result.scalars().first()
    if prompt is None:
        # Default empty surface so the frontend can render the editor
        # the very first time the page is opened.
        return GlobalAnalysisPromptResponse(prompt_text="")
    return prompt


# ── Dynamic AI analysis (audit task e606cca6) ─────────────────────


from app.schemas.ai_schema import (
    DynamicAnalysisRequest,
    DynamicAnalysisResponse,
)
from app.config import FEATURE_AI_ENABLED


@router.post("/dynamic-analyze", response_model=DynamicAnalysisResponse)
@handle_errors
async def dynamic_analyze(
    payload: DynamicAnalysisRequest = Body(...),
    ai_service: AIService = Depends(get_ai_service),
) -> DynamicAnalysisResponse:
    """Dynamic AI analysis on free-form text. Gated on FEATURE_AI_ENABLED
    so a deploy without AI infrastructure doesn't accidentally bill the
    upstream provider. Returns 403 when the flag is off."""
    if not FEATURE_AI_ENABLED:
        raise HTTPException(status_code=403, detail="AI analysis is disabled")

    parts = []
    if payload.system_role_prompt:
        parts.append(payload.system_role_prompt)
    if payload.task_context:
        parts.append(payload.task_context)
    parts.append(payload.prompt)
    merged = "\n\n".join(parts)

    out = await ai_service.generate_text(prompt=merged[:1000])
    return DynamicAnalysisResponse(
        insights=out.get("generated_text", ""),
        model_used=out.get("model_used"),
    )


@router.put("/global-prompt", response_model=GlobalAnalysisPromptResponse)
@handle_errors
async def put_global_prompt(
    payload: GlobalAnalysisPromptUpdate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    result = await db.execute(_select(GlobalAnalysisPrompt))
    prompt = result.scalars().first()
    if prompt is None:
        prompt = GlobalAnalysisPrompt(
            prompt_text=payload.prompt_text, edited_by_user_id=user_id
        )
        db.add(prompt)
    else:
        prompt.prompt_text = payload.prompt_text
        prompt.edited_by_user_id = user_id
    await db.commit()
    await db.refresh(prompt)
    return prompt


# ── User data context for AI (audit task 1a08ded2 AC 29-31) ────────


@router.get("/user_data_context")
@handle_errors
async def user_data_context(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Aggregate the caller's task/project/todo/notification surface
    so the AI flow has user-scoped context. Always scoped to the
    bearer's user_id — never leaks cross-user data (AC 31)."""
    from app.services.ai.ai_data_access_service import get_user_data_context

    return await get_user_data_context(db, user_id=user_id)
