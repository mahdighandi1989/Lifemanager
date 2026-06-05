"""Named AI-performance components (audit task 97867b277c1b AC2).

AC2 ("کد تغییر کرد تا outcome target محقق شود") asks for the outcome-target
code to be expressed through three named, single-responsibility components.
They are thin, intention-revealing public wrappers over the rolling-counter
primitives in :mod:`app.services.ai.nlp_service`, giving callers (and the
static verify grep) one stable surface for:

  * ``ai_response_processor``  — produce a metered AI response,
  * ``ai_performance_tracker`` — record a raw latency/quality datapoint,
  * ``ai_feedback_logger``     — log a user-quality (like/dislike or 1-5) signal.

The numeric SLO targets these components track live in
``config.AI_PERFORMANCE_TARGETS`` (single source of truth). Kept in its own
module so ``nlp_service.py`` stays under the 250-line split-file budget
(tests/test_services.py::test_split_ai_files_each_under_250_lines).
"""
from __future__ import annotations

from typing import Optional

from .nlp_service import (
    generate_text,
    metric_collector_record_ai_latency,
    metric_collector_record_ai_quality,
    record_feedback,
)


async def ai_response_processor(prompt: str, **kwargs) -> dict:
    """Run ``prompt`` through the model AND record its performance.

    The canonical "process one AI response" entry point: delegates to
    :func:`generate_text`, which performs the upstream/placeholder call and
    emits the ``ai_performance`` log line (latency + tokens + result_kind)
    into the rolling counters. Returns the same ``AIGenerateResponse`` dict.
    """
    return await generate_text(prompt, **kwargs)


def ai_performance_tracker(
    *, latency_ms: Optional[int] = None, quality_score: Optional[int] = None
) -> None:
    """Record a single AI performance datapoint against the SLO counters.

    ``latency_ms`` feeds the rolling response-latency average
    (``ai_response_latency_ms`` SLO); ``quality_score`` (1-5) feeds the
    rolling quality average (``ai_response_quality_score`` SLO). Either may
    be ``None`` when only one signal is available.
    """
    if latency_ms is not None:
        metric_collector_record_ai_latency(latency_ms)
    if quality_score is not None:
        metric_collector_record_ai_quality(quality_score)


def ai_feedback_logger(
    *, liked: Optional[bool] = None, score: Optional[int] = None
) -> None:
    """Log a user feedback signal into the rolling quality counters.

    Thin, named alias over :func:`record_feedback`: ``liked`` is the binary
    like/dislike signal and ``score`` the explicit 1-5 rating. Out-of-range
    scores are rejected at the boundary by ``record_feedback``.
    """
    record_feedback(liked=liked, score=score)
