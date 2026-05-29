"""Deterministic profiling heuristics (audit task 14e65214).

Shared, offline, pure-Python helpers the interest / sentiment / personality /
career services lean on. Keeping them here means a key-less deploy still
produces grounded, *non-clichéd* output: every score is derived from the
user's actual data (their words, their task-completion rate, their
interactions), not a hard-coded template. A configured upstream model can
elaborate on top, but the floor is real signal.

Persian + Latin aware throughout (the voice memo is Persian).
"""
from __future__ import annotations

import re
from typing import Dict, List

from app.services.ai.content_analysis_service import analyze_content

# ── Lexicons ────────────────────────────────────────────────────────
_POSITIVE = {
    "good", "great", "love", "happy", "excited", "success", "enjoy", "calm",
    "hope", "win", "خوب", "عالی", "عشق", "خوشحال", "موفق", "امید", "آرام",
    "لذت", "دوست", "شاد", "انرژی",
}
_NEGATIVE = {
    "bad", "sad", "angry", "tired", "fail", "stress", "worried", "afraid",
    "anxious", "hate", "بد", "غمگین", "عصبانی", "خسته", "شکست", "استرس",
    "نگران", "ترس", "ناامید", "اضطراب",
}

# interest-category map — value term → domain.
_CATEGORY_MAP: Dict[str, List[str]] = {
    "technology": ["code", "coding", "programming", "ai", "software", "data",
                   "python", "tech", "برنامه", "کد", "نرم", "فناوری", "هوش", "داده"],
    "sport": ["run", "running", "gym", "football", "sport", "workout", "yoga",
              "ورزش", "دویدن", "فوتبال", "تمرین", "یوگا"],
    "art": ["music", "paint", "painting", "draw", "art", "design", "photo",
            "هنر", "موسیقی", "نقاشی", "طراحی", "عکاسی"],
    "reading": ["book", "books", "read", "reading", "study", "learn", "writing",
                "کتاب", "مطالعه", "خواندن", "یادگیری", "نوشتن"],
    "cooking": ["cook", "cooking", "food", "recipe", "آشپزی", "غذا", "دستور"],
    "travel": ["travel", "trip", "journey", "سفر", "مسافرت", "گردش"],
    "finance": ["money", "invest", "budget", "stock", "مالی", "سرمایه", "بودجه", "سهام"],
}

# style/genre/tone terms → these are *tastes*, not hard interests.
_TASTE_TERMS = {
    "minimal", "minimalist", "classic", "modern", "vintage", "dark", "bright",
    "jazz", "rock", "pop", "acoustic", "romantic", "مینیمال", "کلاسیک",
    "مدرن", "سنتی", "رمانتیک", "تیره", "روشن",
}

_EMOTION_FROM_SENTIMENT = {
    "positive": "joy",
    "negative": "stress",
    "neutral": "neutral",
}


def categorize(term: str) -> str:
    """Map a single value term to a coarse interest category."""
    t = term.lower()
    for category, terms in _CATEGORY_MAP.items():
        if any(kw in t or t in kw for kw in terms):
            return category
    return "general"


def is_taste(term: str) -> bool:
    return term.lower() in _TASTE_TERMS


def keyword_frequencies(texts: List[str]) -> Dict[str, int]:
    """Aggregate keyword frequencies across many short texts, reusing the
    content-analysis tokenizer (stop-words removed, Persian + Latin)."""
    freq: Dict[str, int] = {}
    blob = "  ".join(t for t in texts if t)
    if not blob.strip():
        return freq
    for tok in re.findall(r"[\w؀-ۿ]{3,}", blob.lower()):
        if tok.isdigit():
            continue
        freq[tok] = freq.get(tok, 0) + 1
    # Drop the stop-words the shared analyzer already knows about by routing
    # the blob through analyze_content and intersecting on its keyword set is
    # overkill; instead re-use its stop-word filter implicitly: tokens that
    # survive analyze_content's keyword pass are "interesting".
    interesting = set(analyze_content(blob).get("keywords", []))
    # Keep frequent tokens even if not in the top-8 keyword cut, but always
    # keep the analyzer's picks.
    return {w: c for w, c in freq.items() if c >= 2 or w in interesting}


def analyze_sentiment(text: str) -> dict:
    """Return ``{sentiment_score, dominant_emotion, label}`` for free text.

    score in [-1, 1]; emotion is a coarse label derived from the lexicon
    balance. Deterministic — same text always yields the same result."""
    tokens = re.findall(r"[\w؀-ۿ]{2,}", (text or "").lower())
    pos = sum(1 for t in tokens if t in _POSITIVE)
    neg = sum(1 for t in tokens if t in _NEGATIVE)
    total = pos + neg
    if total == 0:
        return {"sentiment_score": 0.0, "dominant_emotion": "neutral", "label": "neutral"}
    score = round((pos - neg) / total, 3)
    label = "positive" if score > 0.15 else "negative" if score < -0.15 else "neutral"
    return {
        "sentiment_score": score,
        "dominant_emotion": _EMOTION_FROM_SENTIMENT[label],
        "label": label,
    }


def _clamp(x: float) -> float:
    return round(max(0.0, min(1.0, x)), 3)


def infer_big_five(*, texts: List[str], signals: dict) -> Dict[str, float]:
    """Estimate Big-Five scores (0-1) from real signals — NOT a template.

    ``signals`` may carry: ``completion_rate`` (done/total), ``overdue_ratio``,
    ``interest_categories`` (distinct count), ``social_count`` (interactions),
    ``sentiment_score``. Each dimension is anchored on the signal that most
    plausibly evidences it, so two different users get two different profiles.
    """
    blob = " ".join(t for t in texts if t).lower()
    creative_hits = sum(blob.count(k) for k in ("idea", "design", "art", "learn", "ایده", "خلاق", "یادگیری"))
    distinct_categories = signals.get("interest_categories", 0)
    completion = signals.get("completion_rate", 0.0)
    overdue = signals.get("overdue_ratio", 0.0)
    social = signals.get("social_count", 0)
    sentiment = signals.get("sentiment_score", 0.0)

    return {
        # openness: breadth of interests + creative language.
        "openness": _clamp(0.35 + 0.1 * distinct_categories + 0.05 * creative_hits),
        # conscientiousness: gets things done, few overdue.
        "conscientiousness": _clamp(0.3 + 0.6 * completion - 0.3 * overdue),
        # extraversion: social interaction volume.
        "extraversion": _clamp(0.3 + 0.08 * social),
        # agreeableness: positive affect skews cooperative.
        "agreeableness": _clamp(0.5 + 0.3 * sentiment),
        # neuroticism: overdue pressure + negative affect.
        "neuroticism": _clamp(0.3 + 0.4 * overdue - 0.3 * sentiment),
    }
