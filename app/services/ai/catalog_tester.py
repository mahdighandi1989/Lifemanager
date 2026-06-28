"""Live connectivity test + model discovery for catalog providers (ALLIN1 port).

``test_model`` sends a tiny ping to verify a model's credential works.
``sync_provider_models`` pulls the provider's live model list and reconciles it
into ``ai_catalog_models`` (add new / refresh / mark discovered). Custom models
are never touched.
"""
from __future__ import annotations

import time
from typing import Any, Dict

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_catalog import AICatalogModel, AICatalogProvider
from app.services.ai.manager import ai_manager


async def test_model(db: AsyncSession, model_id: int) -> Dict[str, Any]:
    """Send a minimal request to confirm the credential + model work."""
    model = await db.get(AICatalogModel, model_id)
    if model is None:
        return {"ok": False, "message": "مدل پیدا نشد", "status_code": 404}
    provider = await db.get(AICatalogProvider, model.provider_key)
    if provider is None:
        return {"ok": False, "message": "ارائه‌دهنده پیدا نشد", "status_code": 404}
    key = ai_manager.effective_api_key(provider)
    if not key:
        return {"ok": False, "message": "کلید API تنظیم نشده", "status_code": 400}

    from app.services.ai.inference_gateway import (
        _is_anthropic,
        _is_gemini,
    )
    from app.services.ai.manager import ResolvedModel

    rm = ResolvedModel(
        task="general",
        provider_key=provider.key,
        model_key=model.api_id,
        display_name=model.display_name,
        api_key=key,
        auth_scheme=provider.auth_scheme,
        base_url=provider.base_url,
        capabilities=list(model.capabilities or []),
    )
    start = time.monotonic()
    try:
        from app.services.ai.inference_gateway import (
            _anthropic_text,
            _gemini_text,
            _openai_text,
        )

        if _is_anthropic(rm):
            await _anthropic_text(rm, "ping", None, 16, 0.0)
        elif _is_gemini(rm):
            await _gemini_text(rm, "ping", None, 16, 0.0)
        else:
            await _openai_text(rm, "ping", None, 16, 0.0)
        latency = int((time.monotonic() - start) * 1000)
        return {"ok": True, "latency_ms": latency, "message": f"OK · {latency} ms", "status_code": 200}
    except Exception as exc:
        latency = int((time.monotonic() - start) * 1000)
        status = getattr(getattr(exc, "response", None), "status_code", None)
        return {
            "ok": False,
            "latency_ms": latency,
            "status_code": status,
            "message": f"{type(exc).__name__}: {exc}",
        }


async def sync_provider_models(db: AsyncSession, provider_key: str) -> Dict[str, Any]:
    """Fetch the provider's live model list and reconcile into the catalog."""
    provider = await db.get(AICatalogProvider, provider_key)
    if provider is None:
        return {"ok": False, "message": "ارائه‌دهنده پیدا نشد"}
    key = ai_manager.effective_api_key(provider)
    if not key:
        return {"ok": False, "message": "کلید API تنظیم نشده"}

    try:
        live_ids = await _list_models(provider, key)
    except Exception as exc:
        return {"ok": False, "message": f"عدم دریافت فهرست مدل‌ها: {exc}"}
    if not live_ids:
        return {"ok": False, "message": "فهرست مدلی برنگشت"}

    existing = {
        m.model_key: m
        for m in (
            await db.execute(
                select(AICatalogModel).where(AICatalogModel.provider_key == provider_key)
            )
        ).scalars().all()
    }
    added = 0
    for mid in live_ids:
        if mid in existing:
            continue
        db.add(
            AICatalogModel(
                model_key=mid,
                provider_key=provider_key,
                display_name=mid,
                enabled=False,  # discovered models are off until the owner enables
                capabilities=["text"],
                priority=6,
                source="discovered",
                is_custom=False,
            )
        )
        added += 1
    await db.commit()
    return {
        "ok": True,
        "added": added,
        "total": len(live_ids),
        "message": f"همگام‌سازی شد · {len(live_ids)} مدل، {added} مورد جدید",
    }


async def _list_models(provider: AICatalogProvider, key: str):
    """Return a list of live model ids from the provider's models API."""
    import httpx

    root = (provider.base_url or "").rstrip("/")
    async with httpx.AsyncClient(timeout=30.0) as client:
        if provider.key in {"anthropic", "claude_subscription"}:
            headers = {"anthropic-version": "2023-06-01"}
            if provider.auth_scheme == "oauth_bearer":
                headers["authorization"] = f"Bearer {key}"
                # Subscription OAuth tokens require the oauth beta flag + a
                # Claude-CLI user-agent, else 401.
                headers["anthropic-beta"] = "oauth-2025-04-20"
                headers["user-agent"] = "claude-cli/1.0 (external)"
            else:
                headers["x-api-key"] = key
            resp = await client.get(f"{root}/v1/models?limit=1000", headers=headers)
            resp.raise_for_status()
            return [m["id"] for m in resp.json().get("data", [])]
        if provider.key == "gemini":
            resp = await client.get(f"{root}/v1beta/models?key={key}&pageSize=1000")
            resp.raise_for_status()
            out = []
            for m in resp.json().get("models", []):
                name = m.get("name", "")
                out.append(name.split("/")[-1] if "/" in name else name)
            return out
        # OpenAI-compatible families
        resp = await client.get(
            f"{root}/models", headers={"Authorization": f"Bearer {key}"}
        )
        resp.raise_for_status()
        return [m["id"] for m in resp.json().get("data", [])]
