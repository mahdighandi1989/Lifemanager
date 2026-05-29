"""Relationship scoring from a person's interaction history (audit task 3cc09436).

Split out of model_service so that module stays under the 250-line cap and so
this scorer has room to grow (good/bad valence + time decay — see Step 5).
Deterministic + offline; AIService.analyze_person_behavior delegates here.
"""
from __future__ import annotations

from typing import Any, Iterable

_TYPE_WEIGHTS = {"meeting": 3, "call": 2, "email": 1, "message": 1, "other": 1}


def _kind(it: Any) -> str:
    raw = getattr(it, "type", None)
    return getattr(raw, "value", None) or (str(raw).lower() if raw is not None else "other")


def score_person_behavior(person_name: str, interactions: Iterable[Any]) -> dict:
    """Weight each interaction by type, map the weighted sum to an ai_score
    (0-100), and bucket it into a relationship_type."""
    items = list(interactions or [])
    weighted = sum(_TYPE_WEIGHTS.get(_kind(it), 1) for it in items)
    ai_score = min(100, weighted * 10)
    if ai_score >= 60:
        relationship_type = "close"
    elif ai_score >= 20:
        relationship_type = "regular"
    else:
        relationship_type = "distant"
    return {
        "person_name": person_name,
        "ai_score": ai_score,
        "relationship_type": relationship_type,
        "interaction_count": len(items),
        "summary": f"{len(items)} interaction(s); weighted engagement {weighted}.",
    }
