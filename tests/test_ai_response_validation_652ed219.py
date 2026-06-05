"""AI response validation / parsing — audit task 652ed219.

Coherence fix: ``AIGenerateResponse`` is the canonical contract for the
``ai_llm`` text-generation pipeline, but it was only enforced at the
``/ai/generate`` route boundary. ``nlp_service.generate_text`` returned the
raw provider dict to every other consumer (orchestrate_analysis, planner,
finance advice, file summaries, task feedback) with no structural guarantee.

These tests pin the two sides together:

* the unit tests exercise ``validate_ai_generation`` — the single
  post-generation validation/parsing entry point — directly;
* the integration tests drive ``generate_text`` (the pipeline chokepoint)
  with a monkeypatched provider returning valid / malformed / error
  payloads and assert that a schema-valid shape always reaches the caller.
"""
from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.schemas.ai_schema import (
    AIAnalysisResultSchema,
    AIGenerateResponse,
    validate_ai_generation,
)


# ── Unit: validate_ai_generation ────────────────────────────────────────


def test_valid_payload_round_trips():
    out = validate_ai_generation(
        {"generated_text": "hello", "model_used": "gpt-4o", "tokens_used": 12}
    )
    assert out == {
        "generated_text": "hello",
        "model_used": "gpt-4o",
        "tokens_used": 12,
    }


def test_extra_provider_keys_are_stripped():
    """A provider tacking on undeclared fields can't leak to consumers."""
    out = validate_ai_generation(
        {
            "generated_text": "hi",
            "model_used": "gpt-4o",
            "tokens_used": 3,
            "system_fingerprint": "fp_x",
            "raw_choices": [{"finish_reason": "stop"}],
        }
    )
    assert set(out) == {"generated_text", "model_used", "tokens_used"}


def test_missing_optional_fields_get_safe_defaults():
    """model_used falls back to default_model; tokens_used is never None
    (downstream metrics do arithmetic on it)."""
    out = validate_ai_generation(
        {"generated_text": "ok"}, default_model="gpt-3.5-turbo"
    )
    assert out["model_used"] == "gpt-3.5-turbo"
    assert out["tokens_used"] == 0


def test_empty_string_generated_text_is_valid():
    """An empty completion is structurally valid — it's still a str."""
    out = validate_ai_generation({"generated_text": ""})
    assert out["generated_text"] == ""


def test_missing_generated_text_raises():
    with pytest.raises(ValidationError):
        validate_ai_generation({"model_used": "gpt-4o", "tokens_used": 1})


def test_null_generated_text_raises():
    with pytest.raises(ValidationError):
        validate_ai_generation({"generated_text": None})


def test_non_mapping_payload_raises():
    with pytest.raises(ValidationError):
        validate_ai_generation("just a string")


def test_wrong_type_tokens_raises():
    with pytest.raises(ValidationError):
        validate_ai_generation(
            {"generated_text": "ok", "tokens_used": "not-an-int"}
        )


def test_analysis_result_schema_alias_exposed():
    """The task-named structured-output schema is importable and usable."""
    inst = AIAnalysisResultSchema(insights="x", context_items_count=2)
    assert inst.insights == "x"
    assert inst.context_items_count == 2


# ── Integration: generate_text pipeline (ai_llm) ────────────────────────


@pytest.mark.asyncio
async def test_generate_text_validates_provider_output(monkeypatch):
    """Happy path: a well-formed provider response flows through validated."""
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")

    async def _fake_call(**kwargs):
        return {
            "generated_text": "real answer",
            "model_used": "gpt-4o",
            "tokens_used": 7,
            "extra_provider_field": "should be stripped",
        }

    monkeypatch.setattr(
        "app.services.ai.nlp_service.call_openai_chat", _fake_call
    )
    from app.services.ai.nlp_service import generate_text

    result = await generate_text("hi", model="gpt-4o")
    assert result["generated_text"] == "real answer"
    assert result["tokens_used"] == 7
    # Undeclared provider field must not survive the validation step.
    assert "extra_provider_field" not in result


@pytest.mark.asyncio
async def test_generate_text_flags_malformed_provider_output(monkeypatch):
    """A structurally-invalid provider body is caught at the chokepoint and
    replaced with a guaranteed-valid, flagged shape — never propagated."""
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")

    async def _bad_call(**kwargs):
        # `content` came back null upstream → no generated_text.
        return {"model_used": "gpt-4o", "tokens_used": None}

    monkeypatch.setattr(
        "app.services.ai.nlp_service.call_openai_chat", _bad_call
    )
    from app.services.ai.nlp_service import generate_text

    result = await generate_text("hi", model="gpt-4o")
    # Downstream consumers get the contract keys, always well-typed.
    assert result["generated_text"].startswith("[ai-invalid]")
    assert result["model_used"] == "gpt-4o"
    assert isinstance(result["tokens_used"], int)
    # And the result still validates against the canonical schema.
    AIGenerateResponse(**result)


@pytest.mark.asyncio
async def test_generate_text_handles_provider_exception(monkeypatch):
    """Network/provider failure still yields a valid placeholder shape."""
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")

    async def _boom(**kwargs):
        raise RuntimeError("connection reset")

    monkeypatch.setattr(
        "app.services.ai.nlp_service.call_openai_chat", _boom
    )
    from app.services.ai.nlp_service import generate_text

    result = await generate_text("hi", model="gpt-4o")
    assert result["generated_text"].startswith("[ai-error]")
    AIGenerateResponse(**result)


@pytest.mark.asyncio
async def test_invalid_kind_recorded_in_metrics(monkeypatch):
    """The validation-failure path is observable as result_kind=invalid."""
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")

    async def _bad_call(**kwargs):
        return {"generated_text": 123}  # wrong type

    monkeypatch.setattr(
        "app.services.ai.nlp_service.call_openai_chat", _bad_call
    )
    from app.services.ai.nlp_service import generate_text, metrics_snapshot

    await generate_text("hi", model="gpt-4o")
    snap = metrics_snapshot()
    assert snap["result_kinds"].get("invalid", 0) >= 1


@pytest.mark.asyncio
async def test_orchestrate_analysis_consumes_validated_output(
    db_session, monkeypatch
):
    """End-to-end through the pass-through layer: model_service →
    orchestrate_analysis reads generated_text from an already-validated dict,
    even when the provider tried to return a malformed body."""
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")

    async def _bad_call(**kwargs):
        return {"tokens_used": 5}  # missing generated_text

    monkeypatch.setattr(
        "app.services.ai.nlp_service.call_openai_chat", _bad_call
    )
    from app.services.ai.model_service import AIService

    out = await AIService(db_session, api_key="sk-test").orchestrate_analysis(
        prompt="analyse my data", user_id=0
    )
    # No KeyError / malformed leak — insights is a string, flagged invalid.
    assert isinstance(out["insights"], str)
    assert out["insights"].startswith("[ai-invalid]")
