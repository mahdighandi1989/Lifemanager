"""AI catalog endpoints — the "complete AI settings" surface (ALLIN1 port).

Mounted alongside the legacy ``app/routes/ai.py`` provider/config router (which
is preserved). The router prefix is ``/ai`` and it is dual-mounted at ``/ai`` and
``/api/ai`` in ``app/main.py`` (mirroring the legacy AI router), so the SPA's
``/api/ai/...`` calls resolve.

Endpoints (all additive — no method+path collision with the legacy router):
  GET    /ai/overview                       full catalog snapshot for the page
  PUT    /ai/providers/{key}                enable/disable, set key, base_url, notes
  POST   /ai/providers/{key}/sync-models    discover live models
  GET    /ai/models                         list catalog models
  POST   /ai/models                         add a custom model
  PUT    /ai/models/{model_id}              edit a model
  DELETE /ai/models/{model_id}              delete a CUSTOM model
  POST   /ai/models/{model_id}/test         live connectivity ping
  GET    /ai/routes                         list task routes
  PUT    /ai/routes/{task}                  pin a task to a model (or null = auto)

NB: no ``from __future__ import annotations`` — the Body(...) param models would
otherwise reach FastAPI as forward refs and fail TypeAdapter construction.
"""
import os
from typing import Any, Dict, List

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.models.ai_catalog import AICatalogModel, AICatalogProvider, AITaskRoute
from app.schemas.ai_catalog_schema import (
    CatalogModelCreate,
    CatalogModelUpdate,
    CatalogProviderUpdate,
    CatalogTaskRouteUpdate,
)
from app.services.ai.catalog import CAPABILITIES, CAPABILITY_IDS, TASK_TYPES
from app.services.ai.manager import ai_manager

router = APIRouter(prefix="/ai", tags=["ai-catalog"])


def _encrypt(value: str) -> str:
    from app.services.crypt_service import encrypt_data

    return encrypt_data(value)


def _env_configured(provider: AICatalogProvider) -> bool:
    return bool(provider.env_key and os.environ.get(provider.env_key))


@router.get("/overview")
@handle_errors
async def ai_catalog_overview(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> Dict[str, Any]:
    """One call that populates the whole AISettings page."""
    providers = (await db.execute(select(AICatalogProvider))).scalars().all()
    models = (
        await db.execute(select(AICatalogModel).order_by(AICatalogModel.priority))
    ).scalars().all()
    routes = (await db.execute(select(AITaskRoute))).scalars().all()
    return {
        "providers": [p.to_dict(env_configured=_env_configured(p)) for p in providers],
        "models": [m.to_dict() for m in models],
        "routes": [r.to_dict() for r in routes],
        "tasks": TASK_TYPES,
        "capabilities": CAPABILITIES,
        "status": await ai_manager.status(db),
    }


@router.put("/providers/{key}")
@handle_errors
async def update_catalog_provider(
    key: str,
    payload: CatalogProviderUpdate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> Dict[str, Any]:
    provider = await db.get(AICatalogProvider, key)
    if provider is None:
        raise HTTPException(status_code=404, detail="provider not found")
    if payload.enabled is not None:
        provider.enabled = payload.enabled
    if payload.base_url is not None:
        provider.base_url = payload.base_url or None
    if payload.notes is not None:
        provider.notes = payload.notes
    if payload.api_key is not None:
        # empty string clears; any value (re)encrypts (never logged)
        provider.api_key_encrypted = _encrypt(payload.api_key) if payload.api_key else None
    await db.commit()
    await db.refresh(provider)
    return provider.to_dict(env_configured=_env_configured(provider))


@router.post("/providers/{key}/sync-models")
@handle_errors
async def sync_catalog_provider_models(
    key: str,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> Dict[str, Any]:
    from app.services.ai.catalog_tester import sync_provider_models

    return await sync_provider_models(db, key)


@router.get("/models")
@handle_errors
async def list_catalog_models(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> List[Dict[str, Any]]:
    models = (
        await db.execute(select(AICatalogModel).order_by(AICatalogModel.priority))
    ).scalars().all()
    return [m.to_dict() for m in models]


@router.post("/models", status_code=status.HTTP_201_CREATED)
@handle_errors
async def create_catalog_model(
    payload: CatalogModelCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> Dict[str, Any]:
    provider = await db.get(AICatalogProvider, payload.provider_key)
    if provider is None:
        raise HTTPException(status_code=400, detail="unknown provider_key")
    dup = (
        await db.execute(
            select(AICatalogModel).where(AICatalogModel.model_key == payload.model_key)
        )
    ).scalar_one_or_none()
    if dup is not None:
        raise HTTPException(status_code=409, detail="model_key already exists")
    caps = [c for c in (payload.capabilities or []) if c in CAPABILITY_IDS] or ["text"]
    model = AICatalogModel(
        model_key=payload.model_key,
        api_model_id=payload.api_model_id,
        provider_key=payload.provider_key,
        display_name=payload.display_name or payload.model_key,
        enabled=True,
        capabilities=caps,
        max_output_tokens=payload.max_output_tokens,
        context_window=payload.context_window,
        temperature=payload.temperature,
        priority=payload.priority,
        notes=payload.notes,
        source="custom",
        is_custom=True,
    )
    db.add(model)
    await db.commit()
    await db.refresh(model)
    return model.to_dict()


@router.put("/models/{model_id}")
@handle_errors
async def update_catalog_model(
    model_id: int,
    payload: CatalogModelUpdate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> Dict[str, Any]:
    model = await db.get(AICatalogModel, model_id)
    if model is None:
        raise HTTPException(status_code=404, detail="model not found")
    if payload.display_name is not None:
        model.display_name = payload.display_name
    if payload.enabled is not None:
        model.enabled = payload.enabled
    if payload.capabilities is not None:
        model.capabilities = [c for c in payload.capabilities if c in CAPABILITY_IDS]
    if payload.max_output_tokens is not None:
        model.max_output_tokens = payload.max_output_tokens
    if payload.context_window is not None:
        model.context_window = payload.context_window
    if payload.temperature is not None:
        model.temperature = payload.temperature
    if payload.priority is not None:
        model.priority = payload.priority
    if payload.notes is not None:
        model.notes = payload.notes
    await db.commit()
    await db.refresh(model)
    return model.to_dict()


@router.delete("/models/{model_id}")
@handle_errors
async def delete_catalog_model(
    model_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> Dict[str, Any]:
    model = await db.get(AICatalogModel, model_id)
    if model is None:
        raise HTTPException(status_code=404, detail="model not found")
    if not model.is_custom:
        raise HTTPException(
            status_code=400,
            detail="مدل‌های کاتالوگ حذف نمی‌شوند؛ به‌جایش غیرفعالشان کن.",
        )
    # detach any routes pointing here
    routes = (
        await db.execute(select(AITaskRoute).where(AITaskRoute.model_id == model_id))
    ).scalars().all()
    for r in routes:
        r.model_id = None
    deleted_key = model.model_key
    await db.delete(model)
    await db.commit()
    return {"deleted": deleted_key}


@router.post("/models/{model_id}/test")
@handle_errors
async def test_catalog_model(
    model_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> Dict[str, Any]:
    from app.services.ai.catalog_tester import test_model

    return await test_model(db, model_id)


@router.get("/routes")
@handle_errors
async def list_catalog_routes(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> List[Dict[str, Any]]:
    routes = (await db.execute(select(AITaskRoute))).scalars().all()
    return [r.to_dict() for r in routes]


@router.put("/routes/{task}")
@handle_errors
async def update_catalog_route(
    task: str,
    payload: CatalogTaskRouteUpdate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> Dict[str, Any]:
    valid_tasks = {t["id"] for t in TASK_TYPES}
    if task not in valid_tasks:
        raise HTTPException(status_code=400, detail="unknown task")
    route = await db.get(AITaskRoute, task)
    if route is None:
        route = AITaskRoute(task=task, enabled=True)
        db.add(route)
    if payload.model_id is not None:
        # 0 / null both mean "auto-pick"; a positive id must exist
        if payload.model_id:
            target = await db.get(AICatalogModel, payload.model_id)
            if target is None:
                raise HTTPException(status_code=400, detail="unknown model_id")
            route.model_id = payload.model_id
        else:
            route.model_id = None
    if payload.enabled is not None:
        route.enabled = payload.enabled
    if payload.notes is not None:
        route.notes = payload.notes
    await db.commit()
    await db.refresh(route)
    return route.to_dict()
