"""Lightweight, deterministic content analysis (audit task 1a08ded2 AC 68).

Kept in its own module (re-exported from ``nlp_service``) so ``nlp_service``
stays under the 250-line split cap enforced by
``tests/test_services.py::test_split_ai_files_each_under_250_lines``.

No upstream call: the auto-ingestion pipeline (event_publisher ->
process_ai_ingestion_event -> ai_ingestion_service) feeds new-entity text
through :func:`analyze_content`, so a key-less / offline deploy still produces
a usable summary + keywords without billing a provider.
"""
from __future__ import annotations

import re

# Common Persian + Latin stop-words stripped from keyword extraction.
_STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "to", "of", "in", "on", "for",
    "with", "is", "are", "this", "that", "it",
    "را", "و", "در", "به", "از", "که", "این", "آن", "با", "برای", "تا",
    "یک", "می", "هم", "رو", "است", "های",
}


def analyze_content(text: str, *, entity_type: str | None = None) -> dict:
    """Analyse free-form entity text into a small structured result.

    Returns ``{"summary": str, "keywords": list[str]}``. Pure and
    deterministic so the ingestion pipeline and its tests never depend on a
    live provider. ``summary`` is the first sentence (capped at 200 chars);
    ``keywords`` are the most frequent non-trivial tokens (Persian + Latin),
    stop-words removed. ``entity_type`` is accepted for future per-type tuning
    but does not change the contract today.
    """
    text = (text or "").strip()
    if not text:
        return {"summary": "", "keywords": []}

    # Summary: text up to the first sentence boundary, capped.
    sentence = re.split(r"(?<=[.!?؟])\s|\n", text, maxsplit=1)[0].strip()
    summary = sentence[:200]

    # Keywords: frequency of tokens (len>=3), Persian or Latin, minus stop-words.
    freq: dict[str, int] = {}
    for tok in re.findall(r"[\w؀-ۿ]{3,}", text.lower()):
        if tok in _STOPWORDS or tok.isdigit():
            continue
        freq[tok] = freq.get(tok, 0) + 1
    keywords = [w for w, _ in sorted(freq.items(), key=lambda kv: (-kv[1], kv[0]))[:8]]

    return {"summary": summary, "keywords": keywords}
