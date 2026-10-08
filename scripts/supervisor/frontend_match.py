"""The route PATTERN a concrete URL resolves to — the backend twin of
`matchRoutePattern` in `frontend/src/lib/routesMeta.js` (most-specific wins:
exact segments beat `:param` segments). Used to check that a crawled page really
rendered the page that was asked for, not a redirect."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))


def pattern_of(url: str) -> str:
    from app.services.system_graph_service import parse_routes_meta

    target = [s for s in url.split("?")[0].split("#")[0].split("/") if s]
    best, best_score = None, -1
    for e in parse_routes_meta():
        segs = [s for s in e["path"].split("/") if s]
        if len(segs) != len(target):
            continue
        score = 0
        for a, b in zip(segs, target):
            if a.startswith(":"):
                continue
            if a != b:
                score = -1
                break
            score += 1
        if score > best_score:
            best, best_score = e["path"], score
    return best or url.split("?")[0]
