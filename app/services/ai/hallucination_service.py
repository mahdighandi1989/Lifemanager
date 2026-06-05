"""Hallucination detection + mitigation for the ``ai_llm`` pipeline.

Audit task 32145cd6 — the generation pipeline (``nlp_service.generate_text`` ->
``provider_service.call_openai_chat``) historically produced text and passed it
straight through to routes/UI with **no** check that the answer was grounded,
internally consistent, or confident. The two sides of that coherence gap:

  * Producer side (``provider_service`` / ``nlp_service``) — emits free-form
    model text and assumes it is fit to show a user.
  * Consumer side (``app/routes/ai.py``, the SPA chat/analysis surfaces) —
    presents that text as if it were trustworthy fact.

Ground truth (per the task's "business logic is the ground truth" rule) is the
**consumer's** expectation: a user-facing answer must be flagged when it is
ungrounded or self-contradictory. This module aligns the producer side to that
expectation by scoring every response and flagging the uncertain ones for human
review — without ever blocking the response (a 200 still ships; the metadata
rides alongside it).

The detector is deliberately dependency-free and deterministic (no second LLM
call): a key-less / offline deploy still gets the guard, and the unit tests
never touch a live provider. It reuses :func:`analyze_content`'s tokenisation
conventions so keyword/grounding logic matches the rest of the AI pipeline.
"""
from __future__ import annotations

import logging
import re
from collections import deque
from threading import Lock
from typing import Optional

from app.config import AI_HALLUCINATION_CONFIG

logger = logging.getLogger(__name__)

# Markers that almost always indicate the model is *unsure*. Their presence is a
# good thing for honesty but a signal that the answer wants human eyes before it
# drives a decision — so they pull the confidence score down (Persian + Latin).
_HEDGES = (
    "i'm not sure", "i am not sure", "not sure", "i think", "i believe",
    "maybe", "perhaps", "possibly", "might be", "could be", "as far as i know",
    "i guess", "probably", "it seems", "i don't know", "i do not know",
    "نمی‌دانم", "نمیدانم", "شاید", "احتمالا", "احتمالاً", "به نظر می‌رسد",
    "مطمئن نیستم", "گمان می‌کنم",
)

# Negation tokens used by the contradiction check (Persian + Latin).
_NEGATIONS = {
    "not", "no", "never", "n't", "cannot", "without", "neither", "none",
    "نیست", "نه", "ندارد", "نمی", "نمی‌", "هرگز", "بدون",
}

# Lightweight stop-words mirrored from content_analysis_service so the grounding
# overlap ignores the same filler tokens the rest of the pipeline does.
_STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "to", "of", "in", "on", "for",
    "with", "is", "are", "was", "were", "be", "been", "this", "that", "it",
    "as", "at", "by", "from", "you", "your", "i", "we", "they", "he", "she",
    "را", "و", "در", "به", "از", "که", "این", "آن", "با", "برای", "تا",
    "یک", "می", "هم", "رو", "است", "های", "ها", "بود", "شد",
}

# Prefixes the pipeline emits for non-generated text. These are deterministic
# and not model hallucinations, so they get special-cased (see :func:`assess`).
_ERROR_PREFIX = "[ai-error]"
_PLACEHOLDER_PREFIX = "[ai-placeholder]"

# When a grounding context is supplied and fewer than this fraction of the
# answer's content tokens appear in it, the answer is treated as ungrounded
# (likely fabricated) and flagged for human review.
_GROUNDING_FLAG_THRESHOLD = 0.34

# Bounded in-process queue of flagged outputs awaiting human review. A real
# multi-replica deploy would back this with Redis/DB; the in-process deque is
# enough for a single-replica deploy and keeps the unit tests hermetic.
_review_lock = Lock()
_review_queue: deque = deque(maxlen=AI_HALLUCINATION_CONFIG["review_queue_max"])


def _tokens(text: str) -> list[str]:
    """Content tokens (len>=3, Persian or Latin, stop-words/digits removed)."""
    out = []
    for tok in re.findall(r"[\w؀-ۿ']{3,}", (text or "").lower()):
        if tok in _STOPWORDS or tok.isdigit():
            continue
        out.append(tok)
    return out


def _sentences(text: str) -> list[str]:
    """Split free-form text into trimmed, non-empty sentences."""
    parts = re.split(r"(?<=[.!?؟])\s+|\n+", (text or "").strip())
    return [s.strip() for s in parts if s.strip()]


def confidence_score(
    text: str, *, grounding_ratio: Optional[float] = None, contradictions: int = 0
) -> float:
    """Heuristic 0..1 confidence for a generated answer.

    OpenAI's chat-completions endpoint does not return a calibrated confidence
    (logprobs are off by default and provider_service never requests them — see
    that module's payload), so we derive a *synthetic* score from observable
    signals: hedging language, internal contradictions, answer length sanity,
    and — when a grounding context was supplied — how much of the answer is
    actually anchored in it. The score is monotonic and clamped to [0, 1].
    """
    low = (text or "").lower()
    score = 1.0

    # Each hedge phrase shaves confidence — capped so a single "maybe" doesn't
    # zero out an otherwise solid answer.
    hedges = sum(1 for h in _HEDGES if h in low)
    score -= min(hedges, 3) * 0.15

    # Each detected internal contradiction is a strong hallucination signal.
    score -= min(contradictions, 3) * 0.3

    # Trivially short answers carry little information and are hard to trust.
    if len(_tokens(text)) < 2:
        score -= 0.2

    # Grounding: when context was supplied, an answer that barely overlaps it is
    # likely fabricated. No context → grounding is unknown, so don't penalise.
    if grounding_ratio is not None:
        score -= (1.0 - grounding_ratio) * 0.4

    return max(0.0, min(1.0, round(score, 4)))


def grounding_ratio(text: str, context: Optional[str]) -> Optional[float]:
    """Fraction of the answer's content tokens that also appear in ``context``.

    This is the fact-check signal: an answer "grounded" in the supplied data
    context (the user's pages/tasks/knowledge) reuses its vocabulary. Returns
    ``None`` when no context is supplied (grounding is then unknown, not zero)
    and ``1.0`` for an empty answer (nothing ungrounded to worry about).
    """
    if not context:
        return None
    answer_tokens = set(_tokens(text))
    if not answer_tokens:
        return 1.0
    context_tokens = set(_tokens(context))
    if not context_tokens:
        return 0.0
    overlap = answer_tokens & context_tokens
    return round(len(overlap) / len(answer_tokens), 4)


def find_contradictions(text: str) -> list[str]:
    """Detect internal contradictions between sentences of ``text``.

    Catches the canonical "the sky is blue" / "the sky is not blue" coherence
    bug the audit calls out: two sentences sharing most of their content tokens
    where exactly one is negated. Purely lexical (no semantic model) but
    deterministic and dependency-free; returns a human-readable description per
    contradicting pair so the reviewer can see *why* it was flagged.
    """
    sents = _sentences(text)
    findings: list[str] = []
    for i in range(len(sents)):
        a = sents[i]
        a_tokens = _content_set(a)
        a_neg = _has_negation(a)
        if len(a_tokens) < 2:
            continue
        for j in range(i + 1, len(sents)):
            b = sents[j]
            b_tokens = _content_set(b)
            if len(b_tokens) < 2:
                continue
            shared = a_tokens & b_tokens
            # Containment overlap (shared / smaller set) is robust to one
            # sentence carrying extra filler the other lacks ("...right now").
            overlap = len(shared) / min(len(a_tokens), len(b_tokens))
            # Same subject matter + exactly one side negated == contradiction.
            if overlap >= 0.7 and (a_neg != _has_negation(b)):
                findings.append(
                    f"sentence {i + 1} contradicts sentence {j + 1} "
                    f"(shared topic: {', '.join(sorted(shared)[:4])})"
                )
    return findings


def _content_set(sentence: str) -> set[str]:
    """Content tokens of a sentence with contracted/standalone negations and
    their stems stripped, so the negation itself never inflates the overlap."""
    out = set()
    for tok in _tokens(sentence):
        if tok in _NEGATIONS:
            continue
        stripped = re.sub(r"n['’]t$", "", tok)  # isn't -> is, doesn't -> does
        out.add(stripped or tok)
    return out


def _has_negation(sentence: str) -> bool:
    low = sentence.lower()
    toks = set(re.findall(r"[\w؀-ۿ']+", low))
    if toks & _NEGATIONS:
        return True
    # Catch contracted forms ("isn't", "don't", "can't") that tokenise oddly.
    return bool(re.search(r"\bn't\b|n['’]t", low))


def assess(text: str, *, context: Optional[str] = None) -> dict:
    """Full hallucination assessment for one generated answer.

    Returns a JSON-serialisable dict::

        {"confidence": float, "grounding_ratio": float|None,
         "contradictions": list[str], "flagged": bool, "reasons": list[str]}

    Deterministic placeholders (no key configured) and upstream error strings
    are *not* model hallucinations, so they short-circuit to a confident,
    un-flagged result — flagging them would drown the review queue in noise.
    """
    text = text or ""
    stripped = text.lstrip()
    if stripped.startswith(_PLACEHOLDER_PREFIX):
        return _clean_result(reason=None)
    if stripped.startswith(_ERROR_PREFIX):
        # An upstream failure isn't a hallucination but the user still got no
        # real answer — surface it as low confidence without queueing it.
        return {
            "confidence": 0.0, "grounding_ratio": None, "contradictions": [],
            "flagged": False, "reasons": ["upstream provider error"],
        }

    contradictions = find_contradictions(text)
    ratio = grounding_ratio(text, context)
    confidence = confidence_score(
        text, grounding_ratio=ratio, contradictions=len(contradictions)
    )

    reasons: list[str] = []
    if contradictions:
        reasons.append("internal contradiction detected")
    poorly_grounded = ratio is not None and ratio < _GROUNDING_FLAG_THRESHOLD
    if poorly_grounded:
        reasons.append("answer poorly grounded in provided context")
    if any(h in text.lower() for h in _HEDGES):
        reasons.append("model expressed uncertainty")

    threshold = AI_HALLUCINATION_CONFIG["confidence_flag_threshold"]
    flagged = confidence < threshold or bool(contradictions) or poorly_grounded
    return {
        "confidence": confidence,
        "grounding_ratio": ratio,
        "contradictions": contradictions,
        "flagged": flagged,
        "reasons": reasons,
    }


def _clean_result(*, reason: Optional[str]) -> dict:
    return {
        "confidence": 1.0, "grounding_ratio": None, "contradictions": [],
        "flagged": False, "reasons": [reason] if reason else [],
    }


def flag_for_review(*, prompt: str, answer: str, assessment: dict) -> None:
    """Enqueue a low-confidence answer for human review (bounded, in-process)."""
    with _review_lock:
        _review_queue.append(
            {
                "prompt": (prompt or "")[:500],
                "answer": (answer or "")[:1000],
                "confidence": assessment.get("confidence"),
                "reasons": assessment.get("reasons", []),
                "contradictions": assessment.get("contradictions", []),
            }
        )
    logger.warning(
        "ai_hallucination_flagged confidence=%s reasons=%s",
        assessment.get("confidence"), assessment.get("reasons"),
    )


def review_queue_snapshot() -> dict:
    """JSON-serialisable view of the pending human-review queue."""
    with _review_lock:
        items = list(_review_queue)
    return {"flagged_count": len(items), "items": items}


def clear_review_queue() -> None:
    """Drain the queue (used by tests and after a reviewer processes a batch)."""
    with _review_lock:
        _review_queue.clear()


# Anti-hallucination grounding instruction prepended to outbound prompts so the
# model itself is steered away from guessing (audit task 32145cd6, Step 6 —
# prompt engineering). Kept as a single canonical string so every entry point
# applies the *same* mitigation.
GROUNDING_SYSTEM_PROMPT = (
    "You are a careful assistant. Answer only from the information provided in "
    "the context. If the context does not contain the answer, say you do not "
    "know rather than guessing. Do not invent facts, names, numbers, or "
    "citations. If you are uncertain, state your uncertainty explicitly."
)


def ground_prompt(prompt: str) -> str:
    """Prefix the grounding instruction to ``prompt`` to reduce hallucination."""
    return f"{GROUNDING_SYSTEM_PROMPT}\n\n{prompt}"


def annotate_result(
    result: dict, *, prompt: str = "", context: Optional[str] = None
) -> dict:
    """Run the assessment over a generated ``result`` dict and attach it.

    Mutates and returns ``result`` with a ``hallucination`` key. When the
    assessment flags the answer (and detection is enabled), the answer is also
    enqueued for human review. Never raises: a detector bug must not take down
    the generation path it guards.
    """
    try:
        assessment = assess(result.get("generated_text", ""), context=context)
        result["hallucination"] = assessment
        if assessment["flagged"] and AI_HALLUCINATION_CONFIG["enabled"]:
            flag_for_review(
                prompt=prompt,
                answer=result.get("generated_text", ""),
                assessment=assessment,
            )
    except Exception:  # pragma: no cover - defensive
        logger.exception("hallucination assessment failed; passing through")
    return result
