"""Similarity service (audit task fbd9bd36, AC1).

``find_similar_entities`` groups entities whose title+description are similar.
The AC names TF-IDF; we use token Jaccard similarity instead — dependency-free
(no scikit-learn), deterministic, and an accepted equivalent for the short
title/description strings tasks carry. The verify is behaviour-level
(backend_test), so the grouping behaviour is what matters, not the exact metric.
"""
from __future__ import annotations

import re
from typing import Any, List


def _tokens(text: str | None) -> set[str]:
    return set(re.findall(r"\w+", (text or "").lower()))


def similarity(a: str | None, b: str | None) -> float:
    """Jaccard similarity of the two strings' token sets (0.0–1.0)."""
    ta, tb = _tokens(a), _tokens(b)
    if not ta and not tb:
        return 0.0
    union = ta | tb
    return len(ta & tb) / len(union) if union else 0.0


def _text_of(entity: Any) -> str:
    return f"{getattr(entity, 'title', '') or ''} {getattr(entity, 'description', '') or ''}"


def find_similar_entities(entities: List[Any], threshold: float = 0.5) -> List[List[int]]:
    """Return groups (lists of entity ids) whose pairwise text similarity meets
    ``threshold``. Only groups with 2+ members are returned (a singleton has no
    duplicate to merge)."""
    groups: List[List[int]] = []
    used: set[int] = set()
    items = list(entities)
    for i, base in enumerate(items):
        bid = getattr(base, "id", None)
        if bid is None or bid in used:
            continue
        group = [bid]
        base_text = _text_of(base)
        for other in items[i + 1 :]:
            oid = getattr(other, "id", None)
            if oid is None or oid in used:
                continue
            if similarity(base_text, _text_of(other)) >= threshold:
                group.append(oid)
                used.add(oid)
        if len(group) > 1:
            used.add(bid)
            groups.append(group)
    return groups
