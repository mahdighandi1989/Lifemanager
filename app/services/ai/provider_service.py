"""AI provider transport layer.

Owns the actual HTTP call to OpenAI (or any future provider). Kept in
its own file so:

  * model_service.py stays focused on DB-bound CRUD.
  * nlp_service.py stays focused on the orchestration / fallback path.
  * provider_service.py is the one place to monkeypatch in tests when
    we want to assert the request payload shape.

Timeout honours EXTERNAL_API_TIMEOUT from the env (see
app/services/integration_service.py::_external_timeout) so ops can
dial it up per-deploy without a code change.
"""
from __future__ import annotations

import os


def has_openai_key() -> bool:
    """True iff OPENAI_API_KEY is set to a non-empty value."""
    return bool(os.environ.get("OPENAI_API_KEY"))


def _resolved_timeout() -> float:
    """30s default, configurable via EXTERNAL_API_TIMEOUT env var."""
    raw = os.environ.get("EXTERNAL_API_TIMEOUT")
    if raw:
        try:
            return float(raw)
        except ValueError:
            pass
    return 30.0


async def call_openai_chat(
    *,
    prompt: str,
    model: str,
    max_tokens: int,
    temperature: float,
) -> dict:
    """POST ``prompt`` to the OpenAI chat completions endpoint.

    Returns the AIGenerateResponse-shaped dict. Raises any underlying
    httpx exception — the caller (nlp_service.generate_text) wraps the
    error so the route still returns a 200 with a placeholder.

    Lazy-imports httpx so test environments without it can still
    import this module to assert on the placeholder branch.
    """
    import httpx  # local import keeps the dep optional for tests

    api_key = os.environ["OPENAI_API_KEY"]  # caller has already checked
    async with httpx.AsyncClient(timeout=_resolved_timeout()) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,
                "temperature": temperature,
            },
        )
        response.raise_for_status()
        data = response.json()
        return {
            "generated_text": data["choices"][0]["message"]["content"],
            "model_used": data.get("model", model),
            "tokens_used": data.get("usage", {}).get("total_tokens", 0),
        }
