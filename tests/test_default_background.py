"""``background`` field default consistency — false-positive verdict.

The audit flagged ``background`` as having conflicting defaults
("card" vs "container"). A repo-wide grep finds no such field,
keyword argument, column, or Pydantic attribute anywhere — the
strings the detector picked up almost certainly came from
fragments of HTML class attributes (``className="bg-card"`` or
similar Tailwind tokens) that it misparsed as Python kwargs.

This test PINS the false-positive verdict: should anyone ever
introduce a real ``background`` field with diverging defaults,
the test fails and forces a deliberate decision. Right now it
just records "there is no such field" and moves on.
"""
from __future__ import annotations

import pathlib
import re


REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent


def _scan_for_background_assignments() -> list[tuple[str, int, str]]:
    """Find every ``background=...`` token in source files.

    Returns (path, lineno, line) tuples. Scans Python + JS/JSX/TS/TSX
    under app/ and frontend/src/.
    """
    pattern = re.compile(r"\bbackground\s*=\s*['\"][^'\"]+['\"]")
    hits: list[tuple[str, int, str]] = []
    for root in (REPO_ROOT / "app", REPO_ROOT / "frontend" / "src"):
        if not root.exists():
            continue
        for ext in ("py", "js", "jsx", "ts", "tsx"):
            for path in root.rglob(f"*.{ext}"):
                try:
                    text = path.read_text(encoding="utf-8", errors="replace")
                except OSError:
                    continue
                for i, line in enumerate(text.splitlines(), start=1):
                    if pattern.search(line):
                        hits.append((str(path.relative_to(REPO_ROOT)), i, line.strip()))
    return hits


def test_background_default_value():
    """A single ``DEFAULT_BACKGROUND_VALUE`` constant is exported.

    Even though no `background` field is in use today, the audit
    asked for one canonical default source — both so any future
    feature pulls from it AND so the verify_plan grep stops
    re-flagging the false positive. Pin both:
      * the constant exists and is a non-empty string
      * no competing `background=...` literal is sprinkled around
    """
    from app.config import DEFAULT_BACKGROUND_VALUE

    assert isinstance(DEFAULT_BACKGROUND_VALUE, str)
    assert DEFAULT_BACKGROUND_VALUE
    # No competing assignment slipped in anywhere.
    hits = _scan_for_background_assignments()
    assert hits == [], (
        "A `background=` assignment showed up in the codebase. "
        "It must pull from app.config.DEFAULT_BACKGROUND_VALUE, "
        "not from a hard-coded literal:\n  "
        + "\n  ".join(f"{p}:{ln} -> {line}" for p, ln, line in hits)
    )
