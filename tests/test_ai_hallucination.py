"""Hallucination detection + mitigation for the ``ai_llm`` pipeline.

Audit task 32145cd6. Covers each mechanism in isolation (Step 8 — unit tests
run in a silo) and the whole pipeline end-to-end (Step 9 — integration test
through ``generate_text`` and the /ai/generate route, with a mocked provider so
nothing touches a live LLM).
"""
from __future__ import annotations

import asyncio

import pytest

from app.services.ai import hallucination_service as hs


@pytest.fixture(autouse=True)
def _drain_queue():
    """Keep the in-process review queue hermetic between tests."""
    hs.clear_review_queue()
    yield
    hs.clear_review_queue()


# ── confidence scoring ──────────────────────────────────────────────


def test_confident_grounded_answer_scores_high():
    text = "The project deadline is Friday and the budget is approved."
    score = hs.confidence_score(text, grounding_ratio=1.0, contradictions=0)
    assert score >= 0.9


def test_hedging_lowers_confidence():
    text = "I'm not sure, but maybe the deadline could be Friday."
    score = hs.confidence_score(text)
    assert score < 0.9


def test_contradiction_lowers_confidence_sharply():
    score = hs.confidence_score("anything", contradictions=1)
    assert score <= 0.7


def test_confidence_is_clamped_to_unit_interval():
    score = hs.confidence_score("hi", grounding_ratio=0.0, contradictions=3)
    assert 0.0 <= score <= 1.0


# ── grounding / fact-check ──────────────────────────────────────────


def test_grounding_none_when_no_context():
    assert hs.grounding_ratio("the sky is blue", None) is None


def test_grounding_high_when_answer_overlaps_context():
    context = "The quarterly budget covers marketing and engineering salaries."
    ratio = hs.grounding_ratio("The budget covers engineering salaries.", context)
    assert ratio is not None and ratio >= 0.6


def test_grounding_low_when_answer_invents_terms():
    context = "The quarterly budget covers marketing salaries."
    ratio = hs.grounding_ratio(
        "Aliens piloted the spaceship across Jupiter yesterday.", context
    )
    assert ratio is not None and ratio < 0.34


# ── consistency / contradiction detection ───────────────────────────


def test_detects_negation_contradiction():
    text = "The sky is blue today. The sky is not blue today."
    findings = hs.find_contradictions(text)
    assert findings, "expected a contradiction between the two sentences"


def test_no_false_positive_on_consistent_text():
    text = "The sky is blue. The grass is green. Water is wet."
    assert hs.find_contradictions(text) == []


def test_detects_contracted_negation():
    text = "The server is running. The server isn't running right now."
    assert hs.find_contradictions(text)


# ── flagging for human review ───────────────────────────────────────


def test_low_confidence_answer_is_flagged_and_queued():
    out = hs.assess("The sky is blue. The sky is not blue.")
    assert out["flagged"] is True
    hs.flag_for_review(prompt="weather?", answer="...", assessment=out)
    snap = hs.review_queue_snapshot()
    assert snap["flagged_count"] == 1
    assert snap["items"][0]["confidence"] == out["confidence"]


def test_threshold_is_configurable(monkeypatch):
    # Force every answer below threshold → flagged regardless of content.
    monkeypatch.setitem(hs.AI_HALLUCINATION_CONFIG, "confidence_flag_threshold", 1.1)
    out = hs.assess("A perfectly clear, confident sentence about the budget.")
    assert out["flagged"] is True


def test_placeholder_is_not_flagged_as_hallucination():
    out = hs.assess("[ai-placeholder] prompt received (length=10): hello")
    assert out["flagged"] is False
    assert out["confidence"] == 1.0


def test_upstream_error_is_low_confidence_but_not_queued():
    out = hs.assess("[ai-error] TimeoutError: upstream timed out")
    assert out["flagged"] is False
    assert out["confidence"] == 0.0


# ── prompt-engineering mitigation ───────────────────────────────────


def test_ground_prompt_prepends_anti_hallucination_instruction():
    grounded = hs.ground_prompt("What is the capital of France?")
    assert grounded.endswith("What is the capital of France?")
    assert "do not know" in grounded.lower()
    assert hs.GROUNDING_SYSTEM_PROMPT in grounded


# ── integration: the whole ai_llm pipeline (Step 9) ─────────────────


def test_generate_text_attaches_hallucination_block_placeholder(monkeypatch):
    """Key-less path: generate_text still annotates the result."""
    from app.services.ai import nlp_service

    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    out = asyncio.run(nlp_service.generate_text("hello world"))
    assert "hallucination" in out
    assert out["hallucination"]["flagged"] is False  # placeholder is not a halluc.


def test_pipeline_flags_contradictory_provider_answer(monkeypatch):
    """Mocked provider returns a self-contradictory answer → pipeline flags it
    and enqueues it for human review, without raising."""
    from app.services.ai import nlp_service

    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")

    async def _fake_call(**kwargs):
        return {
            "generated_text": "The sky is blue. The sky is not blue.",
            "model_used": "gpt-3.5-turbo",
            "tokens_used": 12,
        }

    monkeypatch.setattr(nlp_service, "call_openai_chat", _fake_call)
    out = asyncio.run(nlp_service.generate_text("describe the sky"))
    assert out["hallucination"]["flagged"] is True
    assert hs.review_queue_snapshot()["flagged_count"] == 1


def test_pipeline_grounding_against_context(monkeypatch):
    """An ungrounded answer (no overlap with context) is flagged via the
    grounding ratio path."""
    from app.services.ai import nlp_service

    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")

    async def _fake_call(**kwargs):
        return {
            "generated_text": "Dragons guard the crystal mountain treasure.",
            "model_used": "gpt-3.5-turbo",
            "tokens_used": 8,
        }

    monkeypatch.setattr(nlp_service, "call_openai_chat", _fake_call)
    out = asyncio.run(
        nlp_service.generate_text(
            "summarise my tasks",
            context="Buy groceries, finish the budget report, call the dentist.",
        )
    )
    h = out["hallucination"]
    assert h["grounding_ratio"] is not None and h["grounding_ratio"] < 0.34
    assert h["flagged"] is True


def test_detect_can_be_disabled_per_call(monkeypatch):
    from app.services.ai import nlp_service

    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    out = asyncio.run(
        nlp_service.generate_text("hello", detect_hallucination=False)
    )
    assert "hallucination" not in out


# ── integration: through the /ai/generate route ─────────────────────


def test_generate_route_returns_hallucination_block(api_client):
    resp = api_client.post(
        "/ai/generate", json={"prompt": "hello world", "max_tokens": 16}
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert "hallucination" in body
    assert body["hallucination"] is not None
    assert "confidence" in body["hallucination"]


def test_hallucination_flags_endpoint(api_client, monkeypatch):
    """The review-queue endpoint exposes flagged answers."""
    hs.clear_review_queue()
    hs.flag_for_review(
        prompt="weather?",
        answer="The sky is blue. The sky is not blue.",
        assessment=hs.assess("The sky is blue. The sky is not blue."),
    )
    resp = api_client.get("/ai/hallucination-flags")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["flagged_count"] >= 1
    assert body["items"][0]["prompt"] == "weather?"
