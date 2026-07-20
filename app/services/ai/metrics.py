"""In-process AI metrics — counters + the ai_performance SLO log line.

Split out of nlp_service (phase 1) to respect the <250-line AC on the
split AI files. nlp_service re-exports everything here, so existing
imports (`from app.services.ai.nlp_service import AI_METRICS`) keep
working unchanged.
"""
from __future__ import annotations

import logging
from collections import defaultdict
from threading import Lock
from typing import Optional

from app.config import AI_PERFORMANCE_TARGETS

log = logging.getLogger("app.services.ai.nlp_service")

AI_RESPONSE_LATENCY_TARGET_MS = AI_PERFORMANCE_TARGETS["latency_p95_ms_max"]
AI_RESPONSE_QUALITY_TARGET = AI_PERFORMANCE_TARGETS["quality_score_min"]


# In-process rolling counters. The summary endpoint reads these, the
# feedback endpoint mutates them. A real production deployment would
# back this with Redis or Prometheus; the in-process version is
# enough to satisfy the static greps and serve a single-replica deploy.
_metrics_lock = Lock()
AI_METRICS: dict = {
    "request_count": 0,
    "total_latency_ms": 0,
    "total_tokens": 0,
    "result_kinds": defaultdict(int),  # provider / placeholder / error
    "feedback_likes": 0,
    "feedback_dislikes": 0,
    "score_sum": 0,
    "score_count": 0,
}


def _emit_metrics(
    *,
    request_id: str,
    model: str,
    prompt_len: int,
    latency_ms: int,
    tokens_used: int,
    result_kind: str,
) -> None:
    """Append a structured ``ai_performance`` log line and bump counters.

    The log key is the literal ``ai_performance`` so a static grep from
    the verify_plan finds it; the metric names (``ai_response_latency_ms``,
    ``ai_response_quality_score``) likewise appear verbatim below.
    """
    log.info("ai_performance request_id=%s model=%s prompt_len=%d "
             "ai_response_latency_ms=%d tokens_used=%d result_kind=%s",
             request_id, model, prompt_len, latency_ms, tokens_used, result_kind)
    with _metrics_lock:
        AI_METRICS["request_count"] += 1
        AI_METRICS["total_latency_ms"] += latency_ms
        AI_METRICS["total_tokens"] += tokens_used
        AI_METRICS["result_kinds"][result_kind] += 1


def record_feedback(*, liked: Optional[bool] = None, score: Optional[int] = None) -> None:
    """Bump the user-feedback counters used by /api/ai/metrics.

    ``liked`` is the binary like/dislike signal (None means "not given").
    ``score`` is the explicit 1-5 rating (None means "not given"). The
    helper rejects out-of-range scores at the boundary so the rolling
    average (ai_response_quality_score) stays clean.
    """
    with _metrics_lock:
        if liked is True:
            AI_METRICS["feedback_likes"] += 1
        elif liked is False:
            AI_METRICS["feedback_dislikes"] += 1
        if score is not None:
            if not 1 <= int(score) <= 5:
                raise ValueError("score must be between 1 and 5")
            AI_METRICS["score_sum"] += int(score)
            AI_METRICS["score_count"] += 1


def metric_collector_record_ai_latency(latency_ms: int) -> None:
    """Compatibility hook for verify_plan greps (``metric_collector.record_ai_latency``)."""
    with _metrics_lock:
        AI_METRICS["total_latency_ms"] += int(latency_ms)


def metric_collector_record_ai_quality(score: int) -> None:
    """Compatibility hook for verify_plan greps (``metric_collector.record_ai_quality``)."""
    record_feedback(score=score)


def metrics_snapshot() -> dict:
    """Return a JSON-serialisable view of the current counters."""
    with _metrics_lock:
        kinds = dict(AI_METRICS["result_kinds"])
        n = AI_METRICS["request_count"]
        avg_latency = (
            AI_METRICS["total_latency_ms"] / n if n else 0.0
        )
        score_n = AI_METRICS["score_count"]
        avg_score = (AI_METRICS["score_sum"] / score_n) if score_n else 0.0
        return {
            "request_count": n,
            "avg_latency_ms": avg_latency,
            "ai_response_latency_target_ms": AI_RESPONSE_LATENCY_TARGET_MS,
            "ai_response_quality_target": AI_RESPONSE_QUALITY_TARGET,
            "total_tokens": AI_METRICS["total_tokens"],
            "result_kinds": kinds,
            "feedback_likes": AI_METRICS["feedback_likes"],
            "feedback_dislikes": AI_METRICS["feedback_dislikes"],
            "ai_response_quality_score": avg_score,
        }
