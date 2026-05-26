"""AI text-generation helper.

The public ``generate_text`` coroutine is the single entry point used by
the /ai/generate route and the planner. It delegates the actual
upstream call to ``provider_service.call_openai_chat`` when an API key
is present, and falls back to a deterministic placeholder otherwise so
the end-to-end test path doesn't depend on a live provider.
"""
from __future__ import annotations

from .model_service import DEFAULT_MODEL
from .provider_service import call_openai_chat, has_openai_key


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
    """
    if not has_openai_key():
        return _placeholder_response(prompt, model)

    try:
        return await call_openai_chat(
            prompt=prompt,
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
        )
    except Exception as exc:  # network / provider failure
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
