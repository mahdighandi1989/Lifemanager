"""AI core metrics — sub-task 1 of task_97867b277c1b.

Every ``generate_text`` call must emit a single structured log line
with ``model``, ``prompt_len``, ``latency_ms``, ``tokens_used``, and
``result_kind``. Pinned across all three code paths so future
refactors that drop the telemetry fail loudly here.
"""
from __future__ import annotations

import logging
import re

import pytest

from app.services.ai import nlp_service


_LINE_RE = re.compile(
    r"ai_performance "
    r"request_id=(?P<request_id>\S+) "
    r"model=(?P<model>\S+) "
    r"prompt_len=(?P<prompt_len>\d+) "
    r"ai_response_latency_ms=(?P<latency_ms>\d+) "
    r"tokens_used=(?P<tokens_used>\d+) "
    r"result_kind=(?P<result_kind>\w+)"
)


def _last_metric_record(caplog) -> dict:
    """Pull the most recent ``ai_performance …`` record out of caplog."""
    for rec in reversed(caplog.records):
        if rec.name == nlp_service.__name__:
            m = _LINE_RE.search(rec.getMessage())
            if m:
                return m.groupdict()
    raise AssertionError(
        "no ai_performance metrics line found in caplog; "
        f"saw {[r.getMessage() for r in caplog.records]}"
    )


@pytest.mark.asyncio
async def test_placeholder_path_emits_metrics(caplog, monkeypatch):
    """No API key → placeholder branch, result_kind='placeholder'."""
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    caplog.set_level(logging.INFO, logger=nlp_service.__name__)
    nlp_service.logger.propagate = True

    result = await nlp_service.generate_text("hello", max_tokens=10)

    assert result["generated_text"].startswith("[ai-placeholder]")
    record = _last_metric_record(caplog)
    assert record["result_kind"] == "placeholder"
    assert record["prompt_len"] == "5"
    assert record["tokens_used"] == "0"
    # Latency is always non-negative; bound it loose so a slow CI box
    # doesn't trip the test.
    assert int(record["latency_ms"]) >= 0


@pytest.mark.asyncio
async def test_upstream_path_emits_metrics(caplog, monkeypatch):
    """Mocked successful upstream → result_kind='provider'."""
    async def fake_call_openai_chat(prompt, model, max_tokens, temperature, **kwargs):
        # **kwargs tolerates the multi-provider routing args (api_key/base_url)
        # added in task 1a08ded2.
        return {
            "generated_text": "real upstream output",
            "model_used": model,
            "tokens_used": 42,
        }

    monkeypatch.setattr(nlp_service, "has_openai_key", lambda: True)
    monkeypatch.setattr(nlp_service, "call_openai_chat", fake_call_openai_chat)
    caplog.set_level(logging.INFO, logger=nlp_service.__name__)
    nlp_service.logger.propagate = True

    result = await nlp_service.generate_text("ping", max_tokens=10)
    assert result["tokens_used"] == 42

    record = _last_metric_record(caplog)
    assert record["result_kind"] == "provider"
    assert record["tokens_used"] == "42"
    assert record["prompt_len"] == "4"


@pytest.mark.asyncio
async def test_error_path_emits_metrics(caplog, monkeypatch):
    """Upstream raises → result_kind='error', tokens_used=0."""
    async def boom(prompt, model, max_tokens, temperature, **kwargs):
        raise RuntimeError("upstream blew up")

    monkeypatch.setattr(nlp_service, "has_openai_key", lambda: True)
    monkeypatch.setattr(nlp_service, "call_openai_chat", boom)
    caplog.set_level(logging.INFO, logger=nlp_service.__name__)
    nlp_service.logger.propagate = True

    result = await nlp_service.generate_text("boom", max_tokens=10)
    assert result["generated_text"].startswith("[ai-error]")

    record = _last_metric_record(caplog)
    assert record["result_kind"] == "error"
    assert record["tokens_used"] == "0"
