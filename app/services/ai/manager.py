"""AIManager — resolve an application task to a usable, configured model.

The single entry point every feature uses: ``await ai_manager.resolve(db, task)``
returns a :class:`ResolvedModel` (provider + model + decrypted key + base_url +
params) or ``None`` when nothing is configured. Ported from the ALLIN1 design,
adapted to Lifemanager's encrypted-at-rest key storage + env-var fallback.
"""
from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_catalog import AICatalogModel, AICatalogProvider, AITaskRoute
from app.services.ai.catalog import task_preferred_capability

logger = logging.getLogger(__name__)


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
    # The hosts a catalog provider's key may be sent to (2026-10-12 hardening):
    # a base_url edited to anything else (the settings routes are reachable
    # without login while REQUIRE_AUTH is off) would hand the stored key to a
    # stranger, so it is ignored in favour of the catalog's official endpoint.
    OFFICIAL_HOSTS = {
        "anthropic": ("api.anthropic.com",),
        "claude_subscription": ("api.anthropic.com",),
        "gemini": ("generativelanguage.googleapis.com",),
        "openai": ("api.openai.com",),
        "deepseek": ("api.deepseek.com",),
        "openrouter": ("openrouter.ai",),
        "perplexity": ("api.perplexity.ai",),
        "xai": ("api.x.ai",),
    }

    @classmethod
    def safe_base_url(cls, provider: AICatalogProvider) -> Optional[str]:
        allowed = cls.OFFICIAL_HOSTS.get(provider.key)
        url = provider.base_url
        if not allowed or not url:
            return url
        from urllib.parse import urlparse

        try:
            u = urlparse(url)
        except ValueError:
            u = None
        if u is not None and u.scheme == "https" and (u.hostname or "").lower() in allowed:
            return url
        from app.services.ai.catalog import PROVIDER_CATALOG

        return (PROVIDER_CATALOG.get(provider.key) or {}).get("base_url")

    def _build(self, task: str, model: AICatalogModel, provider: AICatalogProvider) -> ResolvedModel:
        return ResolvedModel(
            task=task,
            provider_key=provider.key,
            model_key=model.api_id,
            display_name=model.display_name,
            api_key=self.effective_api_key(provider),
            auth_scheme=provider.auth_scheme,
            base_url=self.safe_base_url(provider),
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

        ordered = await self._auto_order(db, task, providers, configured)
        if not ordered:
            return None
        best = ordered[0]
        return self._build(task, best, providers[best.provider_key])

    @staticmethod
    def _newness(m: AICatalogModel) -> float:
        """Version rank from the model id (same parser the daily refresh uses) — breaks priority ties
        toward the NEWER model instead of database order. Unknown families rank 0."""
        try:
            from app.services.ai.model_discovery import classify

            c = classify(m.provider_key, {"id": m.api_id or "", "methods": ["generateContent"]})
            return float((c or {}).get("rank") or 0.0)
        except Exception:  # noqa: BLE001 — ranking is a tie-breaker, never a failure
            return 0.0

    @staticmethod
    def _cost(m: AICatalogModel) -> Optional[float]:
        """Blended price per 1M tokens (input + output) when the catalog knows it, else None."""
        i, o = getattr(m, "input_cost_per_1m", None), getattr(m, "output_cost_per_1m", None)
        if i is None and o is None:
            return None
        return float(i or 0.0) + float(o or 0.0)

    def _sort(self, models: List[AICatalogModel], cost_first: bool = False) -> List[AICatalogModel]:
        """``(gone, priority)`` tiers; inside a tier (review 2026-10-15) a KNOWN price decides first (cheaper first; a
        priced model before an unpriced one), then the newer version — compared only within the SAME provider (a Gemini
        «4.0» and a Claude «4.6» are not versions of one thing): providers keep their database order (first row), and
        each provider's models are ordered newest first. A transitive key, so the order never depends on input order.

        ``cost_first`` (the no-capable-model fallback): a known cheaper price outranks priority too, and with no price
        the light tier — a fast model WITHOUT «reasoning» (Flash-Lite, GPT-4o mini, seeded Haiku) — comes first."""
        slot: dict = {}
        for m in sorted(models, key=lambda m: m.id or 0):
            slot.setdefault(m.provider_key, len(slot))

        def key(m: AICatalogModel):
            c = self._cost(m)
            gone = "[gone]" in (m.notes or "")
            pri = m.priority if m.priority is not None else 9
            price = (0, c) if c is not None else (1, 0.0)
            tail = (slot.get(m.provider_key, 99), -self._newness(m), m.id or 0)
            if cost_first:
                return (gone, price, "reasoning" in (m.capabilities or []), pri) + tail
            return (gone, pri, price) + tail

        return sorted(models, key=key)

    async def _auto_order(self, db: AsyncSession, task: str, providers=None, configured=None,
                          need: Optional[str] = None) -> List[AICatalogModel]:
        """Automatic pick order for ``task`` (no pin): enabled models on configured providers;
        models with every REQUIRED capability of the task (if any exists) ⇒ then those with the
        PREFERRED capability first ⇒ then priority ⇒ newest. ``need`` (a file's capability) is a hard filter."""
        from app.services.ai.catalog import task_required_capabilities, task_tier

        if providers is None:
            providers = await self._provider_map(db)
        if configured is None:
            configured = {k for k, p in providers.items() if p.enabled and self.provider_configured(p)}
        models = (
            await db.execute(select(AICatalogModel).where(AICatalogModel.enabled.is_(True)))
        ).scalars().all()
        pool = [m for m in models if m.provider_key in configured]
        if need:
            pool = [m for m in pool if need in (m.capabilities or [])]
        req = task_required_capabilities(task)
        pref = task_preferred_capability(task)
        if req:
            full = [m for m in pool if all(c in (m.capabilities or []) for c in req)]
            if full:
                pool = full
            elif pool:
                # no model has every required capability: prefer the CHEAPER FAST model (review 2026-10-15) — a
                # capability gap must never quietly route the task to the priciest model — and say so in the log
                fast = self._sort([m for m in pool if "fast" in (m.capabilities or [])], cost_first=True)
                rest = self._sort([m for m in pool if m not in fast])
                ordered = fast + rest
                logger.warning("AI task %s: no enabled model has %s — falling back to %s (cheaper fast model first)",
                               task, "+".join(req), ordered[0].api_id if ordered else "nothing")
                return ordered
        preferred = self._sort([m for m in pool if pref and pref in (m.capabilities or [])])
        rest = self._sort([m for m in pool if m not in preferred])
        if task_tier(task) == "balanced":
            # (2026-10-18, «lla_coach»): the catalog's top tier (Opus/Pro — «only on explicit pin») goes after the
            # balanced models with the preferred capability; kept as the last preferred choice, never dropped
            from app.services.ai.model_discovery import TOP_TIERS, model_tier

            top = [m for m in preferred if model_tier(m.provider_key, m.api_id) in TOP_TIERS]
            preferred = [m for m in preferred if m not in top] + top
        return preferred + rest

    async def candidates(self, db: AsyncSession, task: str = "general", need: Optional[str] = None,
                         limit: int = 3) -> List[ResolvedModel]:
        """Ordered models to TRY for one call: the owner's live pin first (if it can serve ``need``),
        then the automatic order. The gateway falls over to the next one when a call fails (retired
        model, 404, outage) — so a stale model never leaves a task without an answer."""
        providers = await self._provider_map(db)
        configured = {k for k, p in providers.items() if p.enabled and self.provider_configured(p)}
        out: List[ResolvedModel] = []
        seen = set()
        route = (await db.execute(select(AITaskRoute).where(AITaskRoute.task == task))).scalar_one_or_none()
        if route and route.enabled and route.model_id:
            m = await db.get(AICatalogModel, route.model_id)
            if m and m.enabled and m.provider_key in configured and (not need or need in (m.capabilities or [])):
                out.append(self._build(task, m, providers[m.provider_key])); seen.add(m.id)
        for m in await self._auto_order(db, task, providers, configured, need):
            if len(out) >= limit:
                break
            if m.id in seen:
                continue
            rm = self._build(task, m, providers[m.provider_key])
            if rm.is_usable:
                out.append(rm); seen.add(m.id)
        return out

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
