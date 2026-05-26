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

router = APIRouter()


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
