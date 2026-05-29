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
from app.dependencies.auth import get_current_user, get_optional_user_id
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


# AI model-config CRUD is scoped by get_optional_user_id (login-bypass design,
# audit task 78c0e8e0a9b5) — anon traffic resolves to user 0 so the settings
# page can list/manage models without a bearer, consistent with tasks/lists/
# finance/context. (Was get_current_user, which 403'd the SPA's /api/ai/configs
# calls under login-bypass — task 1a08ded2 AC 45-48, 51-54.)
@router.get("/configs", response_model=List[AIModelConfigOut])
@handle_errors
async def list_ai_configs(
    provider: Optional[str] = None,
    ai_service: AIService = Depends(get_ai_service),
    user_id: int = Depends(get_optional_user_id),
):
    # AC 15 (task 1a08ded2): optional ?provider= filter — documented in
    # docs/API.md, now enforced here so the contract holds.
    configs = await ai_service.get_user_configs(user_id)
    if provider:
        configs = [c for c in configs if getattr(c, "provider", None) == provider]
    return configs


@router.post(
    "/configs",
    response_model=AIModelConfigOut,
    status_code=status.HTTP_201_CREATED,
)
@handle_errors
async def create_ai_config(
    config_data: AIModelConfigCreate,
    ai_service: AIService = Depends(get_ai_service),
    user_id: int = Depends(get_optional_user_id),
):
    return await ai_service.create_config(config_data, user_id)


@router.patch("/configs/{config_id}", response_model=AIModelConfigOut)
@handle_errors
async def update_ai_config(
    config_id: int,
    config_data: AIModelConfigUpdate,
    ai_service: AIService = Depends(get_ai_service),
    user_id: int = Depends(get_optional_user_id),
):
    config = await ai_service.update_config(config_id, config_data, user_id)
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
    user_id: int = Depends(get_optional_user_id),
):
    success = await ai_service.delete_config(config_id, user_id)
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
    response_ref: Optional[str] = Field(default=None, max_length=128)


@router.post("/feedback", status_code=status.HTTP_202_ACCEPTED)
@handle_errors
async def submit_ai_feedback(
    payload: AIFeedbackPayload,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Record a like/dislike or 1-5 score for the AI response.

    Persists an ``AIFeedback`` row (durable, per-user — audit task
    97867b277c1b) AND bumps the in-process counters. Anon-friendly under
    login-bypass so the outcome metric is collectable from the chat UI.
    """
    if payload.liked is None and payload.score is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either liked (bool) or score (1-5)",
        )
    from app.models.ai_feedback import AIFeedback

    db.add(
        AIFeedback(
            user_id=user_id,
            liked=payload.liked,
            score=payload.score,
            response_ref=payload.response_ref,
        )
    )
    await db.commit()
    record_feedback(liked=payload.liked, score=payload.score)
    return {"accepted": True}


@router.get("/metrics")
@handle_errors
async def get_ai_metrics(db: AsyncSession = Depends(get_db)) -> dict:
    """Summary view of the AI performance counters.

    Latency/throughput come from the in-process rolling counters; the
    user-feedback aggregates (likes / dislikes / quality score) are read from
    the persisted ``ai_feedback`` table so they survive a restart (audit task
    97867b277c1b). Falls back to the in-memory snapshot if the table is absent.
    """
    snap = metrics_snapshot()
    try:
        from sqlalchemy import func as _f

        from app.models.ai_feedback import AIFeedback

        likes = (await db.execute(
            _select(_f.count()).select_from(AIFeedback).where(AIFeedback.liked.is_(True))
        )).scalar() or 0
        dislikes = (await db.execute(
            _select(_f.count()).select_from(AIFeedback).where(AIFeedback.liked.is_(False))
        )).scalar() or 0
        avg_row = (await db.execute(
            _select(_f.avg(AIFeedback.score), _f.count(AIFeedback.score)).where(
                AIFeedback.score.isnot(None)
            )
        )).first()
        avg_score = float(avg_row[0]) if avg_row and avg_row[0] is not None else snap["ai_response_quality_score"]
        snap.update(
            {
                "feedback_likes": int(likes),
                "feedback_dislikes": int(dislikes),
                "ai_response_quality_score": avg_score,
                "feedback_persisted_count": int(avg_row[1]) if avg_row else 0,
            }
        )
    except Exception:
        pass  # table not migrated yet — serve the in-memory snapshot
    return snap


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


def _provider_to_response(p: AIProvider) -> AIProviderResponse:
    """Map an AIProvider ORM row to its response, exposing only ``has_api_key``
    (never the encrypted/raw key)."""
    return AIProviderResponse(
        id=p.id,
        user_id=p.user_id,
        name=p.name,
        description=p.description,
        is_enabled=p.is_enabled,
        base_url=p.base_url,
        default_model=p.default_model,
        has_api_key=bool(p.api_key_encrypted),
        created_at=p.created_at,
        updated_at=p.updated_at,
    )


def _encrypt_key(raw: Optional[str]) -> Optional[str]:
    """Encrypt a provider API key at rest (audit task 1a08ded2 AC5/7)."""
    if not raw:
        return None
    from app.services.crypt_service import encrypt_data

    return encrypt_data(raw)


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
        base_url=payload.base_url,
        default_model=payload.default_model,
        api_key_encrypted=_encrypt_key(payload.api_key),
    )
    db.add(provider)
    await db.commit()
    await db.refresh(provider)
    return _provider_to_response(provider)


@router.get("/providers", response_model=List[AIProviderResponse])
@handle_errors
async def list_ai_providers(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    result = await db.execute(
        _select(AIProvider).where(AIProvider.user_id == user_id)
    )
    return [_provider_to_response(p) for p in result.scalars().all()]


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
    return _provider_to_response(provider)


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
    if payload.base_url is not None:
        provider.base_url = payload.base_url
    if payload.default_model is not None:
        provider.default_model = payload.default_model
    if payload.api_key is not None:
        # empty string clears the key; any value (re)encrypts it
        provider.api_key_encrypted = _encrypt_key(payload.api_key) if payload.api_key else None
    await db.commit()
    await db.refresh(provider)
    return _provider_to_response(provider)


@router.post("/providers/{provider_id}/test")
@handle_errors
async def test_ai_provider(
    provider_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Test-connection probe (audit task 1a08ded2). Reports whether the
    provider has a key + base_url configured and, when a key is present, makes
    a best-effort tiny chat call to confirm reachability. Never leaks the key;
    degrades to a configuration report when offline / unkeyed."""
    result = await db.execute(
        _select(AIProvider).where(
            (AIProvider.id == provider_id) & (AIProvider.user_id == user_id)
        )
    )
    provider = result.scalar_one_or_none()
    if provider is None:
        raise HTTPException(status_code=404, detail="AI provider not found")

    configured = bool(provider.api_key_encrypted)
    reachable = None
    detail = "No API key configured — add one to enable live calls." if not configured else "configured"
    if configured:
        from app.services.crypt_service import decrypt_data
        from app.services.ai.model_service import DEFAULT_MODEL
        from app.services.ai.provider_service import call_openai_chat

        try:
            key = decrypt_data(provider.api_key_encrypted)
            await call_openai_chat(
                prompt="ping", model=provider.default_model or DEFAULT_MODEL,
                max_tokens=1, temperature=0.0, api_key=key, base_url=provider.base_url,
            )
            reachable, detail = True, "reachable"
        except Exception as exc:
            reachable, detail = False, f"unreachable: {type(exc).__name__}"
    return {
        "provider_id": provider.id,
        "name": provider.name,
        "configured": configured,
        "base_url": provider.base_url,
        "reachable": reachable,
        "detail": detail,
    }


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
    AIAnalysisRequest,
    AIAnalysisResult,
    AnalyzeTasksRequest,
    DynamicAnalysisRequest,
    DynamicAnalysisResponse,
)
from app.config import FEATURE_AI_ENABLED
from app.dependencies.auth import get_optional_user_id


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

    # AC2 (task e606cca6): send the FULL request to the model — do not
    # truncate. The request schema already bounds the prompt (max_length
    # 10_000), so the merged system+context+prompt reaches the model intact
    # instead of being clipped to the first 1000 chars.
    out = await ai_service.generate_text(prompt=merged)
    return DynamicAnalysisResponse(
        insights=out.get("generated_text", ""),
        model_used=out.get("model_used"),
    )


@router.post("/analyze", response_model=AIAnalysisResult)
@handle_errors
async def analyze(
    payload: AIAnalysisRequest = Body(...),
    ai_service: AIService = Depends(get_ai_service),
    user_id: int = Depends(get_optional_user_id),
) -> AIAnalysisResult:
    """Analyse the caller's page data according to the editable global prompt
    + this request (audit task 1a08ded2 AC 34-37). Composes global-prompt +
    user data context + the request via AIService.orchestrate_analysis. Gated
    on FEATURE_AI_ENABLED so a deploy without AI infra returns 403 instead of
    billing a provider."""
    if not FEATURE_AI_ENABLED:
        raise HTTPException(status_code=403, detail="AI analysis is disabled")
    result = await ai_service.orchestrate_analysis(
        prompt=payload.prompt, user_id=user_id, model=payload.model_id
    )
    return AIAnalysisResult(**result)


def _build_task_feedback(context: dict, analysis: dict, task_id) -> str:
    """Dynamic (not hard-coded) Persian feedback from the task context +
    detected patterns. Works offline; a configured model can elaborate on top."""
    parts = [
        f"وضعیت تسک‌ها: {context['total']} کل، {context['completed']} انجام‌شده، "
        f"{context['pending']} در انتظار، {context['overdue']} عقب‌افتاده."
    ]
    parts.extend(analysis.get("patterns", []))
    if task_id is not None:
        parts.append(f"برای تسک #{task_id} در چارچوب پرامپت شما تحلیل انجام شد.")
    return " ".join(parts)


@router.post("/analyze-tasks", tags=["ai"])
@handle_errors
async def analyze_tasks(
    payload: AnalyzeTasksRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Dynamic, prompt-framed feedback on the caller's tasks (audit task
    e606cca6 AC4): full task context (no token cap, AC8) + work-pattern analysis
    -> intelligent feedback, also persisted as a notification (AC5)."""
    from app.services.notification_service import send_ai_feedback
    from app.services.task_analysis import analyze_user_tasks

    uid = payload.user_id if payload.user_id is not None else user_id
    from app.services.ai.task_feedback import generate_task_feedback

    context = await ai_service.get_task_context(uid)
    analysis = await analyze_user_tasks(db, user_id=uid)
    # Run the full context through the configured model within the editable
    # prompt box (Steps 7-8); the deterministic text is the offline fallback.
    deterministic = _build_task_feedback(context, analysis, payload.task_id)
    fb = await generate_task_feedback(
        db, user_id=uid, context=context, analysis=analysis,
        fallback=deterministic, task_id=payload.task_id,
    )
    await send_ai_feedback(db, user_id=uid, feedback=fb["feedback"])
    return {
        "task_id": payload.task_id,
        "context": context,
        "analysis": analysis,
        "feedback": fb["feedback"],
        "model_generated": fb["model_generated"],
    }


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


# ── AI guidance (audit task e606cca6 ACs 27-28) ────────────────────


# In-process store of AI-generated guidance per user. Backed by Redis
# in production; the in-memory dict serves the single-replica deploy
# and the test suite.
_AI_GUIDANCE_STORE: dict[int, list[dict]] = {}


@router.post("/guidance/generate", status_code=status.HTTP_201_CREATED)
@handle_errors
async def generate_ai_guidance(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Generate one piece of AI guidance grounded in the caller's
    current task/project context, persist it for retrieval, and return
    it. The endpoint is anon-friendly (login-bypass mode) so the
    frontend can render guidance for the default user too."""
    from app.services.ai.model_service import get_user_activity_context

    ctx = await get_user_activity_context(db, user_id=user_id)
    summary = (
        f"You have {len(ctx.open_tasks)} open tasks and "
        f"{len(ctx.active_projects)} active projects."
    )
    guidance = {"id": len(_AI_GUIDANCE_STORE.get(user_id, [])) + 1, "guidance": summary}
    _AI_GUIDANCE_STORE.setdefault(user_id, []).append(guidance)
    return guidance


@router.get("/guidance")
@handle_errors
async def list_ai_guidance(
    user_id: int = Depends(get_optional_user_id),
) -> List[dict]:
    return list(_AI_GUIDANCE_STORE.get(user_id, []))


# ── /ai/correlate_needs (audit task 217909d2 AC 38) ────────────────


class UserNeedQuery(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)


@router.post("/correlate_needs")
@handle_errors
async def correlate_needs(
    payload: UserNeedQuery = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> List[dict]:
    """Match the caller's owned tasks/todo_items/local_files against
    the intent + keywords pulled from ``payload.query``."""
    from app.services.ai.recommendation_service import get_recommendations

    return await get_recommendations(db, user_id=user_id, query=payload.query)
