"""E2E performance metrics for the AI surface (audit task 97867b277c1b).

The outcome target rewritten as measurable values:

  * ``ai_response_latency_ms`` (rolling avg) stays below
    ``AI_RESPONSE_LATENCY_TARGET_MS = 500`` for the placeholder path.
  * ``ai_response_quality_score`` (rolling avg of explicit 1-5
    feedback) trends toward ``AI_RESPONSE_QUALITY_TARGET = 4.0``.
  * Every /api/ai/generate call must produce one ``ai_performance``
    log entry carrying latency + tokens + result_kind so an operator
    can SLO-track the production outcome.

These assertions cover both targets without needing a live provider.
"""
from __future__ import annotations

import logging

import pytest

from app.services.ai import nlp_service


@pytest.fixture(autouse=True)
def _reset_metrics():
    """Each test starts from a clean snapshot."""
    nlp_service.AI_METRICS["request_count"] = 0
    nlp_service.AI_METRICS["total_latency_ms"] = 0
    nlp_service.AI_METRICS["total_tokens"] = 0
    nlp_service.AI_METRICS["result_kinds"].clear()
    nlp_service.AI_METRICS["feedback_likes"] = 0
    nlp_service.AI_METRICS["feedback_dislikes"] = 0
    nlp_service.AI_METRICS["score_sum"] = 0
    nlp_service.AI_METRICS["score_count"] = 0
    yield


@pytest.mark.asyncio
async def test_ai_outcome_metrics(api_client, caplog):
    """E2E: 5 /ai/generate calls + 3 explicit scores produce a metrics
    snapshot meeting the SLO targets."""
    caplog.set_level(logging.INFO, logger="app.services.ai.nlp_service")

    for i in range(5):
        resp = api_client.post(
            "/ai/generate",
            json={"prompt": f"hello {i}", "max_tokens": 16},
        )
        assert resp.status_code == 200, resp.text

    for score in (4, 5, 4):
        ack = api_client.post("/ai/feedback", json={"score": score})
        assert ack.status_code == 202

    api_client.post("/ai/feedback", json={"liked": True})
    api_client.post("/ai/feedback", json={"liked": False})

    snapshot = api_client.get("/ai/metrics").json()
    assert snapshot["request_count"] == 5
    # Placeholder path is deterministic and fast — well below the 500ms SLO.
    assert snapshot["avg_latency_ms"] < nlp_service.AI_RESPONSE_LATENCY_TARGET_MS
    # Three scores of 4/5/4 → avg 4.33, which clears the 4.0 target.
    assert snapshot["ai_response_quality_score"] >= nlp_service.AI_RESPONSE_QUALITY_TARGET
    assert snapshot["feedback_likes"] == 1
    assert snapshot["feedback_dislikes"] == 1

    # And every generate call must have produced an ai_performance log line.
    perf_lines = [r for r in caplog.records if "ai_performance" in r.getMessage()]
    assert len(perf_lines) == 5


def test_metrics_targets_are_measurable():
    """The audit asked for measurable targets — verify both are numbers."""
    assert isinstance(nlp_service.AI_RESPONSE_LATENCY_TARGET_MS, int)
    assert nlp_service.AI_RESPONSE_LATENCY_TARGET_MS > 0
    assert isinstance(nlp_service.AI_RESPONSE_QUALITY_TARGET, float)
    assert 1.0 <= nlp_service.AI_RESPONSE_QUALITY_TARGET <= 5.0


def test_feedback_helper_rejects_out_of_range_score():
    with pytest.raises(ValueError):
        nlp_service.record_feedback(score=7)
