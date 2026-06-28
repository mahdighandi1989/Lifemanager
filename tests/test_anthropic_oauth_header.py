"""Claude subscription (OAuth token) calls must send the oauth beta header.

A Claude Pro/Max OAuth token is only accepted on /v1/messages when the request
carries `anthropic-beta: oauth-2025-04-20` (+ the Claude-Code system spoof) and
`Authorization: Bearer ...`. Omitting the beta header → 401 Unauthorized (the bug
the owner hit on the AI-settings "test" button).
"""
from __future__ import annotations

import httpx
import pytest

from app.services.ai import inference_gateway as ig
from app.services.ai.manager import ResolvedModel


class _FakeResp:
    def __init__(self, payload):
        self._payload = payload

    def raise_for_status(self):
        return None

    def json(self):
        return self._payload


class _FakeClient:
    """Captures the outbound request so we can assert on headers."""

    captured: dict = {}

    def __init__(self, *a, **k):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *a):
        return False

    async def post(self, url, headers=None, json=None):
        _FakeClient.captured = {"url": url, "headers": headers, "json": json}
        return _FakeResp({"content": [{"type": "text", "text": "ok"}]})


def _rm(auth_scheme: str) -> ResolvedModel:
    return ResolvedModel(
        task="general",
        provider_key="claude_subscription" if auth_scheme == "oauth_bearer" else "anthropic",
        model_key="claude-opus-4-8",
        display_name="Claude Opus 4.8",
        api_key="sk-ant-oat01-XXX" if auth_scheme == "oauth_bearer" else "sk-ant-api03-XXX",
        auth_scheme=auth_scheme,
        base_url=None,
        capabilities=["text"],
    )


@pytest.mark.asyncio
async def test_oauth_token_sends_beta_and_bearer(monkeypatch):
    monkeypatch.setattr(httpx, "AsyncClient", _FakeClient)
    out = await ig._anthropic_text(_rm("oauth_bearer"), "ping", None, 16, 0.0)
    assert out == "ok"
    h = _FakeClient.captured["headers"]
    assert h["authorization"] == "Bearer sk-ant-oat01-XXX"
    assert h["anthropic-beta"] == "oauth-2025-04-20"
    # Anthropic 401s an OAuth token whose user-agent isn't the Claude CLI.
    assert h["user-agent"] == "claude-cli/1.0 (external)"
    assert "x-api-key" not in h
    # the Claude-Code system spoof must be the first system block
    sys_blocks = _FakeClient.captured["json"]["system"]
    assert sys_blocks[0]["text"] == "You are Claude Code, Anthropic's official CLI for Claude."


@pytest.mark.asyncio
async def test_api_key_path_unchanged(monkeypatch):
    """A normal API key still uses x-api-key and NO oauth beta header."""
    monkeypatch.setattr(httpx, "AsyncClient", _FakeClient)
    await ig._anthropic_text(_rm("api_key"), "ping", None, 16, 0.0)
    h = _FakeClient.captured["headers"]
    assert h["x-api-key"] == "sk-ant-api03-XXX"
    assert "authorization" not in h
    assert "anthropic-beta" not in h
    assert "user-agent" not in h
