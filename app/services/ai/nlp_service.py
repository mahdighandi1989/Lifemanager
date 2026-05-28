"""AI text-generation helper.

The public ``generate_text`` coroutine is the single entry point used by
the /ai/generate route and the planner. It delegates the actual
upstream call to ``provider_service.call_openai_chat`` when an API key
is present, and falls back to a deterministic placeholder otherwise so
the end-to-end test path doesn't depend on a live provider.

Telemetry: every call emits one structured INFO log line with
``model``, ``prompt_len``, ``latency_ms``, ``tokens_used``, and a
``result_kind`` enum (``upstream`` / ``placeholder`` / ``error``).
This is the lightweight "AI core metrics" surface the audit asked
for — enough for ops dashboards (count by result_kind, p50/p95
latency) without dragging in a full Prometheus client. Plumb a
real metrics backend later by parsing these log lines or by
wrapping ``_emit_metrics``.
"""
from __future__ import annotations

import logging
import time

from .model_service import DEFAULT_MODEL
from .provider_service import call_openai_chat, has_openai_key

logger = logging.getLogger(__name__)


def _emit_metrics(
    *,
    model: str,
    prompt_len: int,
    latency_ms: int,
    tokens_used: int,
    result_kind: str,
) -> None:
    """One-line structured INFO record for every generate_text call.

    Kept private so the calling code doesn't need to remember the
    field set — change the log shape here once and every caller
    follows.
    """
    logger.info(
        "ai.generate_text model=%s prompt_len=%d latency_ms=%d "
        "tokens_used=%d result_kind=%s",
        model, prompt_len, latency_ms, tokens_used, result_kind,
    )


async def generate_text(
    prompt: str,
    *,
    max_tokens: int = 512,
    temperature: float = 0.7,
    model: str = DEFAULT_MODEL,
) -> dict:
    """Generate text for ``prompt``.

    Returns a dict matching ``AIGenerateResponse``:

        {"generated_text": str, "model_used": str, "tokens_used": int}

    When no provider API key is configured, the prompt is echoed back
    in a wrapper so end-to-end tests don't depend on a live upstream.
    Errors from the upstream are caught and surfaced as a placeholder so
    the route layer still returns a 200 — the caller can detect the
    "[ai-error]" prefix if it wants to distinguish.

    Every code path emits a single ``_emit_metrics`` line so ops can
    watch latency + tokens + result mix without instrumenting the
    routes themselves.
    """
    started = time.perf_counter()
    prompt_len = len(prompt or "")

    if not has_openai_key():
        result = _placeholder_response(prompt, model)
        _emit_metrics(
            model=result["model_used"],
            prompt_len=prompt_len,
            latency_ms=int((time.perf_counter() - started) * 1000),
            tokens_used=result["tokens_used"],
            result_kind="placeholder",
        )
        return result

    try:
        result = await call_openai_chat(
            prompt=prompt,
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        _emit_metrics(
            model=result.get("model_used", model),
            prompt_len=prompt_len,
            latency_ms=int((time.perf_counter() - started) * 1000),
            tokens_used=int(result.get("tokens_used", 0) or 0),
            result_kind="upstream",
        )
        return result
    except Exception as exc:  # network / provider failure
        latency_ms = int((time.perf_counter() - started) * 1000)
        _emit_metrics(
            model=model,
            prompt_len=prompt_len,
            latency_ms=latency_ms,
            tokens_used=0,
            result_kind="error",
        )
        return {
            "generated_text": f"[ai-error] {type(exc).__name__}: {exc}",
            "model_used": model,
            "tokens_used": 0,
        }


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
