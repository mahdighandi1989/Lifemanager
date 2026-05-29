"""AI provider key encryption + multi-provider routing (audit task 1a08ded2 AC5/7).

The raw memo wanted to register providers (DeepSeek/GPT/Gemini/Claude/Grok/...)
with their keys and ACTUALLY analyze through them. The prior impl stored no key
and always hit OpenAI. These pin: keys are stored encrypted (never plaintext /
never returned), and resolve_provider_routing drives the call to the chosen
provider's base_url + decrypted key.
"""
from __future__ import annotations

import pytest

from app.database import Base


def test_ai_provider_has_routing_columns():
    cols = {c.name for c in Base.metadata.tables["ai_providers"].columns}
    assert {"base_url", "api_key_encrypted", "default_model"} <= cols


def test_create_provider_encrypts_key_and_masks_response(api_client):
    r = api_client.post(
        "/api/ai/providers",
        json={
            "name": "deepseek", "base_url": "https://api.deepseek.com/v1",
            "api_key": "sk-secret-123", "default_model": "deepseek-chat",
        },
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["has_api_key"] is True
    assert body["base_url"] == "https://api.deepseek.com/v1"
    assert body["default_model"] == "deepseek-chat"
    # the raw key is never echoed back
    assert "sk-secret-123" not in r.text
    assert "api_key" not in body

    # test-connection reports configured (no live call without a reachable host)
    t = api_client.post(f"/api/ai/providers/{body['id']}/test")
    assert t.status_code == 200
    assert t.json()["configured"] is True


@pytest.mark.asyncio
async def test_key_stored_encrypted_not_plaintext(db_session):
    from sqlalchemy import select

    from app.models.ai_provider import AIProvider
    from app.routes.ai import _encrypt_key
    from app.services.crypt_service import decrypt_data

    enc = _encrypt_key("sk-plain-xyz")
    assert enc and enc != "sk-plain-xyz"  # encrypted at rest
    db_session.add(AIProvider(user_id=1, name="grok", api_key_encrypted=enc, base_url="https://api.x.ai/v1"))
    await db_session.commit()
    row = (await db_session.execute(select(AIProvider).where(AIProvider.user_id == 1))).scalar_one()
    assert row.api_key_encrypted != "sk-plain-xyz"
    assert decrypt_data(row.api_key_encrypted) == "sk-plain-xyz"  # recoverable


@pytest.mark.asyncio
async def test_resolve_provider_routing_uses_registered_provider(db_session):
    from app.models.ai_provider import AIProvider
    from app.routes.ai import _encrypt_key
    from app.services.ai.provider_service import resolve_provider_routing

    db_session.add(
        AIProvider(
            user_id=7, name="deepseek", is_enabled=True,
            api_key_encrypted=_encrypt_key("sk-route-me"),
            base_url="https://api.deepseek.com/v1", default_model="deepseek-chat",
        )
    )
    await db_session.commit()
    model, key, base_url = await resolve_provider_routing(db_session, user_id=7)
    assert key == "sk-route-me"
    assert base_url == "https://api.deepseek.com/v1"
    assert model == "deepseek-chat"


@pytest.mark.asyncio
async def test_resolve_routing_falls_back_without_provider(db_session):
    from app.services.ai.provider_service import resolve_provider_routing

    model, key, base_url = await resolve_provider_routing(db_session, user_id=999, model="gpt-4o")
    assert key is None and base_url is None and model == "gpt-4o"


@pytest.mark.asyncio
async def test_call_openai_chat_routes_to_custom_base_url(monkeypatch):
    """call_openai_chat hits the provider's base_url + key, not hard-wired OpenAI."""
    captured = {}

    class _Resp:
        status_code = 200

        def raise_for_status(self):
            pass

        def json(self):
            return {"choices": [{"message": {"content": "hi"}}], "model": "deepseek-chat", "usage": {"total_tokens": 3}}

    class _Client:
        def __init__(self, *a, **k):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *a):
            return False

        async def post(self, url, headers=None, json=None):
            captured["url"] = url
            captured["auth"] = headers["Authorization"]
            return _Resp()

    import httpx

    monkeypatch.setattr(httpx, "AsyncClient", _Client)
    from app.services.ai.provider_service import call_openai_chat

    out = await call_openai_chat(
        prompt="p", model="deepseek-chat", max_tokens=10, temperature=0.0,
        api_key="sk-route", base_url="https://api.deepseek.com/v1",
    )
    assert out["generated_text"] == "hi"
    assert captured["url"] == "https://api.deepseek.com/v1/chat/completions"
    assert captured["auth"] == "Bearer sk-route"
