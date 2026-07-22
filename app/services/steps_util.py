"""مرحله‌بندی — shared helpers for ordered, trackable steps on any entity.

The «نخِ تسبیح» done right: take an input (a task's title/description) and turn
it into a short ordered list of concrete stages you can tick off and follow —
calmly, no daily-command nagging. Fully deterministic + keyless (an AI pass can
enrich later, but the heuristic split always works offline).

Steps are stored as ``[{"text": str, "done": bool}, …]`` — the same shape the
directive engine already uses, so the two stay compatible.
"""
from __future__ import annotations

import re
from typing import Any, Dict, List, Optional

_MAX_STEPS = 20
_MAX_LEN = 300

# Leading bullet / numbering to strip when a line is already a step.
_LEAD = re.compile(r"^\s*(?:[-*•▪◦]|\d+[.)–-]|[۰-۹]+[.)–-])\s*")
# Sentence-ish splitters for a single blob with no line breaks.
_SPLIT = re.compile(r"[\n؛;•]|(?<=[.!؟?])\s+|\s-\s|\s،\s")


def clean_steps(steps: Any) -> List[Dict[str, Any]]:
    """Coerce stored steps into ``[{"text": str, "done": bool}, …]``."""
    if not isinstance(steps, list):
        return []
    out: List[Dict[str, Any]] = []
    for s in steps:
        if isinstance(s, dict) and str(s.get("text", "")).strip():
            out.append({"text": str(s["text"]).strip()[:_MAX_LEN], "done": bool(s.get("done"))})
        elif isinstance(s, str) and s.strip():
            out.append({"text": s.strip()[:_MAX_LEN], "done": False})
    return out[:_MAX_STEPS]


def current_step(steps: Any) -> Optional[str]:
    """The first not-yet-done step — the concrete «قدمِ بعدی» (info, not a nag)."""
    for s in clean_steps(steps):
        if not s["done"]:
            return s["text"]
    return None


def steps_progress(steps: Any) -> Dict[str, Any]:
    cleaned = clean_steps(steps)
    done = sum(1 for s in cleaned if s["done"])
    return {
        "steps": cleaned,
        "steps_total": len(cleaned),
        "steps_done": done,
        "current_step": current_step(cleaned),
    }


def split_into_steps(title: Optional[str], description: Optional[str] = None) -> List[Dict[str, Any]]:
    """Heuristically break an input into ordered stages. Prefers explicit
    lines/bullets in the description; falls back to sentence-ish splitting.
    Deterministic and keyless — never raises."""
    body = (description or "").strip()
    lines = [ln.strip() for ln in body.splitlines() if ln.strip()]
    parts: List[str]
    if len(lines) >= 2:
        parts = [_LEAD.sub("", ln).strip() for ln in lines]
    else:
        blob = body or (title or "")
        parts = [_LEAD.sub("", p).strip() for p in _SPLIT.split(blob) if p and p.strip()]
    # Dedup consecutive + drop empties; cap.
    seen: List[str] = []
    for p in parts:
        if p and (not seen or seen[-1] != p):
            seen.append(p[:_MAX_LEN])
    return [{"text": p, "done": False} for p in seen[:_MAX_STEPS]]


def toggle_step(steps: Any, index: int, done: bool) -> List[Dict[str, Any]]:
    cleaned = clean_steps(steps)
    if 0 <= index < len(cleaned):
        cleaned[index]["done"] = bool(done)
    return cleaned
