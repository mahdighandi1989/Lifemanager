"""AIManager — resolve an application task to a usable, configured model.

The single entry point every feature uses: ``await ai_manager.resolve(db, task)``
returns a :class:`ResolvedModel` (provider + model + decrypted key + base_url +
params) or ``None`` when nothing is configured. Ported from the ALLIN1 design,
adapted to Lifemanager's encrypted-at-rest key storage + env-var fallback.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_catalog import AICatalogModel, AICatalogProvider, AITaskRoute
from app.services.ai.catalog import task_preferred_capability


@dataclass
class ResolvedModel:
    task: str
    provider_key: str
    model_key: str            # the api id to send to the provider
    display_name: str
    api_key: Optional[str]
    auth_scheme: str
    base_url: Optional[str]
    capabilities: List[str] = field(default_factory=list)
    max_output_tokens: Optional[int] = None
    temperature: Optional[float] = None
    context_window: Optional[int] = None

    @property
    def is_usable(self) -> bool:
        return bool(self.api_key)


class AIManager:
    # ---- credential helpers ------------------------------------------------
    @staticmethod
    def effective_api_key(provider: AICatalogProvider) -> Optional[str]:
        """DB secret (decrypted) if present, else the provider's env var."""
        if provider.api_key_encrypted:
            try:
                from app.services.crypt_service import decrypt_data

                return decrypt_data(provider.api_key_encrypted)
            except Exception:
                return None
        if provider.env_key:
            val = os.environ.get(provider.env_key)
            if val:
                return val
        return None

    @classmethod
    def provider_configured(cls, provider: AICatalogProvider) -> bool:
        return bool(cls.effective_api_key(provider))

    # ---- resolution --------------------------------------------------------
    def _build(self, task: str, model: AICatalogModel, provider: AICatalogProvider) -> ResolvedModel:
        return ResolvedModel(
            task=task,
            provider_key=provider.key,
            model_key=model.api_id,
            display_name=model.display_name,
            api_key=self.effective_api_key(provider),
            auth_scheme=provider.auth_scheme,
            base_url=provider.base_url,
            capabilities=list(model.capabilities or []),
            max_output_tokens=model.max_output_tokens,
            temperature=model.temperature,
            context_window=model.context_window,
        )

    async def _provider_map(self, db: AsyncSession):
        return {
            p.key: p for p in (await db.execute(select(AICatalogProvider))).scalars().all()
        }

    async def resolve(self, db: AsyncSession, task: str = "general") -> Optional[ResolvedModel]:
        providers = await self._provider_map(db)
        configured = {k for k, p in providers.items() if p.enabled and self.provider_configured(p)}

        # 1) explicit, enabled route → enabled model on a configured provider.
        route = (
            await db.execute(select(AITaskRoute).where(AITaskRoute.task == task))
        ).scalar_one_or_none()
        if route and route.enabled and route.model_id:
            model = await db.get(AICatalogModel, route.model_id)
            if model and model.enabled and model.provider_key in configured:
                return self._build(task, model, providers[model.provider_key])

        # Candidate pool: enabled models on configured, enabled providers.
        models = (
            await db.execute(
                select(AICatalogModel).where(AICatalogModel.enabled.is_(True))
            )
        ).scalars().all()
        pool = [m for m in models if m.provider_key in configured]
        if not pool:
            return None

        # 2) prefer a model that supports the task's preferred capability.
        need = task_preferred_capability(task)
        if need:
            capable = [m for m in pool if need in (m.capabilities or [])]
            if capable:
                best = min(capable, key=lambda m: m.priority)
                return self._build(task, best, providers[best.provider_key])

        # 3) fall back to the highest-priority configured model of any kind.
        best = min(pool, key=lambda m: m.priority)
        return self._build(task, best, providers[best.provider_key])

    async def resolve_specific(
        self, db: AsyncSession, model_id: int, task: str = "general"
    ) -> Optional[ResolvedModel]:
        model = await db.get(AICatalogModel, model_id)
        if not model or not model.enabled:
            return None
        provider = await db.get(AICatalogProvider, model.provider_key)
        if not provider or not provider.enabled or not self.provider_configured(provider):
            return None
        return self._build(task, model, provider)

    async def capable_models(self, db: AsyncSession, need: str = "documents") -> List[AICatalogModel]:
        providers = await self._provider_map(db)
        configured = {k for k, p in providers.items() if p.enabled and self.provider_configured(p)}
        models = (
            await db.execute(select(AICatalogModel).where(AICatalogModel.enabled.is_(True)))
        ).scalars().all()
        pool = [m for m in models if m.provider_key in configured and need in (m.capabilities or [])]
        return sorted(pool, key=lambda m: m.priority)

    async def is_available(self, db: AsyncSession, task: Optional[str] = None) -> bool:
        resolved = await self.resolve(db, task or "general")
        return bool(resolved and resolved.is_usable)

    async def status(self, db: AsyncSession) -> dict:
        providers = await self._provider_map(db)
        configured = [k for k, p in providers.items() if p.enabled and self.provider_configured(p)]
        models = (
            await db.execute(select(AICatalogModel).where(AICatalogModel.enabled.is_(True)))
        ).scalars().all()
        usable = [m for m in models if m.provider_key in set(configured)]
        return {
            "configured_providers": configured,
            "usable_model_count": len(usable),
            "any_available": len(usable) > 0,
        }


ai_manager = AIManager()
