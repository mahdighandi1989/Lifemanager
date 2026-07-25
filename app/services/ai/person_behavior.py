"""Relationship scoring from a person's interaction history (audit task 3cc09436).

Split out of model_service so that module stays under the 250-line cap and so
this scorer has room to grow (good/bad valence + time decay — see Step 5).
Deterministic + offline; AIService.analyze_person_behavior delegates here.
"""
from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any, Iterable, Optional

_TYPE_WEIGHTS = {"meeting": 3, "call": 2, "email": 1, "message": 1, "other": 1}


def _decay(age_days: float, half_life: float = 30.0) -> float:
    """Recency weight — a deed's influence halves every ``half_life`` days.

    This produces the *current mood* of a relationship: how it feels lately.
    It deliberately forgets, so it must NEVER be the only record — a decayed
    score is exactly how «با یه کار خوبش هزار تا کار بدش را فراموش کنم»
    happens. The permanent, undecayed record is ``ledger_from_deeds`` below;
    the two are shown side by side (2026-07-25 افراد rebuild).
    """
    return 0.5 ** (max(0.0, age_days) / half_life)


def _age_days(at: Optional[str], now: datetime) -> float:
    if not at:
        return 0.0
    try:
        dt = datetime.fromisoformat(at)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return max(0.0, (now - dt).total_seconds() / 86400)
    except Exception:
        return 0.0


def score_from_deeds(deeds: Iterable[dict], *, now: Optional[datetime] = None) -> dict:
    """Score a relationship from good/bad deeds with time decay (Step 5).

    Each deed carries a ``valence`` (+1 good, -1 bad, 0 neutral) and an ``at``
    timestamp. Recent deeds weigh more (``_decay``); the decayed sum maps through
    tanh to a 0-100 ai_score and a relationship_type (close/regular/distant/
    strained). Distinguishes good vs bad (unlike the type-only scorer)."""
    now = now or datetime.now(timezone.utc)
    weighted = 0.0
    good = bad = 0
    for d in deeds or []:
        v = d.get("valence")
        if v is None:
            continue
        weighted += float(v) * _decay(_age_days(d.get("at"), now))
        if v > 0:
            good += 1
        elif v < 0:
            bad += 1
    affinity = math.tanh(weighted / 3.0)  # -1 .. 1
    score = round((affinity + 1) / 2 * 100, 1)
    if score >= 66:
        rel = "close"
    elif score >= 45:
        rel = "regular"
    elif bad > good:
        rel = "strained"
    else:
        rel = "distant"
    return {"ai_score": score, "relationship_type": rel, "good_deeds": good, "bad_deeds": bad}


def ledger_from_deeds(deeds: Iterable[dict], *, now: Optional[datetime] = None) -> dict:
    """دفترِ ماندگار — the all-time record that time never erases.

    The owner's rule (2026-07-25): «همه چیز ثبت بشه که فراموشی اتفاق نیفته و
    با یه کار خوبش هزار تا کار بدی که کرده رو فراموش نکنم.» ``score_from_deeds``
    decays on purpose (that is the *mood*); this counts every deed at full
    weight, forever, and keeps the flagged ones («کجا بهم خوبی کرد که فراموش
    نکنم») at the top. Nothing here is a verdict — it is a faithful record the
    owner reads himself.

    Returns counts, the plain balance (good − bad), the flagged entries, and
    the span of the record.
    """
    now = now or datetime.now(timezone.utc)
    good = bad = neutral = 0
    flagged: list[dict] = []
    stamps: list[str] = []
    for d in deeds or []:
        v = d.get("valence")
        if v is None:
            continue
        if v > 0:
            good += 1
        elif v < 0:
            bad += 1
        else:
            neutral += 1
        at = d.get("at")
        if at:
            stamps.append(str(at))
        if d.get("important"):
            flagged.append(
                {
                    "note": (d.get("note") or d.get("kind") or d.get("type") or ""),
                    "valence": v,
                    "at": at,
                    "age_days": round(_age_days(at, now)) if at else None,
                }
            )
    stamps.sort()
    flagged.sort(key=lambda e: str(e.get("at") or ""), reverse=True)
    return {
        "good": good,
        "bad": bad,
        "neutral": neutral,
        "total": good + bad + neutral,
        "balance": good - bad,
        "flagged": flagged,
        "flagged_good": sum(1 for e in flagged if (e.get("valence") or 0) > 0),
        "flagged_bad": sum(1 for e in flagged if (e.get("valence") or 0) < 0),
        "first_at": stamps[0] if stamps else None,
        "last_at": stamps[-1] if stamps else None,
    }


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
