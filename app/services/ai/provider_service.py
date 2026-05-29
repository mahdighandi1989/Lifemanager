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


async def resolve_provider_routing(db, *, user_id: int, model: str | None = None):
    """Resolve the caller's selected AI provider to a routing tuple
    ``(model_name, api_key, base_url)`` (audit task 1a08ded2 — make the
    registered providers ACTUALLY drive the analysis call).

    Picks the user's first enabled AIProvider that has a stored key, decrypts
    it, and uses its base_url + default_model. Falls back to
    ``(model or "gpt-3.5-turbo", None, None)`` → the env OpenAI key path. Never
    raises: any DB/crypto error degrades to the fallback so analysis still runs.
    """
    default_model = model or "gpt-3.5-turbo"
    try:
        from sqlalchemy import select

        from app.models.ai_provider import AIProvider

        rows = (
            await db.execute(
                select(AIProvider).where(
                    AIProvider.user_id == user_id, AIProvider.is_enabled.is_(True)
                )
            )
        ).scalars().all()
    except Exception:
        return (default_model, None, None)

    for p in rows:
        if p.api_key_encrypted:
            try:
                from app.services.crypt_service import decrypt_data

                key = decrypt_data(p.api_key_encrypted)
            except Exception:
                continue
            return (model or p.default_model or "gpt-3.5-turbo", key, p.base_url)
    return (default_model, None, None)


def _resolved_timeout() -> float:
    """30s default, configurable via EXTERNAL_API_TIMEOUT env var."""
    raw = os.environ.get("EXTERNAL_API_TIMEOUT")
    if raw:
        try:
            return float(raw)
        except ValueError:
            pass
    return 30.0


OPENAI_BASE_URL = "https://api.openai.com/v1"


async def call_openai_chat(
    *,
    prompt: str,
    model: str,
    max_tokens: int,
    temperature: float,
    api_key: str | None = None,
    base_url: str | None = None,
) -> dict:
    """POST ``prompt`` to an OpenAI-compatible chat-completions endpoint.

    Multi-provider routing (audit task 1a08ded2): ``base_url`` + ``api_key`` let
    the caller target any OpenAI-compatible vendor (DeepSeek / Grok / Perplexity
    / OpenRouter / a local server). When omitted they fall back to OpenAI +
    ``OPENAI_API_KEY`` — preserving the prior single-provider behaviour.

    Returns the AIGenerateResponse-shaped dict. Raises any underlying httpx
    exception — the caller wraps it so the route still returns a 200 with a
    placeholder. Lazy-imports httpx so test envs without it can still import.
    """
    import httpx  # local import keeps the dep optional for tests

    key = api_key or os.environ.get("OPENAI_API_KEY", "")
    root = (base_url or OPENAI_BASE_URL).rstrip("/")
    async with httpx.AsyncClient(timeout=_resolved_timeout()) as client:
        response = await client.post(
            f"{root}/chat/completions",
            headers={
                "Authorization": f"Bearer {key}",
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
