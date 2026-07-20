"""Catalog-gateway seam (phase 1, 2026-07-20 — audit #2).

One function: try the completion through the owner-configured catalog
stack (AISettings → ai_manager → inference_gateway) BEFORE the legacy
OpenAI-compatible path in ``nlp_service.generate_text``. Split into its
own module to respect the <250-line AC on the split AI files.
"""
from __future__ import annotations

import logging
import time
from typing import Optional

log = logging.getLogger(__name__)

async def try_catalog_gateway(
    prompt: str,
    *,
    max_tokens: int,
    temperature: float,
    request_id: str,
    start_ns: int,
) -> Optional[dict]:
    """Attempt the completion through the owner-configured catalog stack
    (AISettings → ai_manager → inference_gateway). Returns the legacy
    AIGenerateResponse dict on success, or None to fall back. Never raises.
    Escape hatch: AI_LEGACY_ONLY=1 disables the seam entirely."""
    import os

    if os.getenv("AI_LEGACY_ONLY", "").strip() in {"1", "true", "yes"}:
        return None
    try:
        from app.database import SessionLocal
        from app.services.ai import inference_gateway

        async with SessionLocal() as db:
            res = await inference_gateway.complete(
                db,
                prompt,
                task="general",
                max_tokens=max_tokens,
                temperature=temperature,
            )
        if not (res and res.get("ok") and (res.get("text") or "").strip()):
            return None
        text = res["text"]
        result = {
            "generated_text": text,
            "model_used": f"catalog:{res.get('model') or 'unknown'}",
            # The gateway doesn't surface provider token counts uniformly;
            # a chars/4 estimate keeps the SLO metrics comparable.
            "tokens_used": max(1, len(text) // 4),
        }
        # Lazy import — nlp_service imports this module at top level, so
        # the metrics hook must be resolved at call time to avoid a cycle.
        from .nlp_service import _emit_metrics

        latency_ms = (time.perf_counter_ns() - start_ns) // 1_000_000
        _emit_metrics(
            request_id=request_id,
            model=result["model_used"],
            prompt_len=len(prompt),
            latency_ms=latency_ms,
            tokens_used=result["tokens_used"],
            result_kind="catalog",
        )
        return result
    except Exception as exc:
        log.debug("catalog gateway seam fell back to legacy path: %r", exc)
        return None
