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
    """No ``background`` field exists → no default-conflict bug.

    The audit's claim that defaults ``"card"`` and ``"container"``
    diverged is a false positive. This test confirms there is no
    ``background=...`` assignment anywhere in the application or
    frontend source tree.
    """
    hits = _scan_for_background_assignments()
    assert hits == [], (
        "Audit's false-positive turned real: a `background=` "
        "assignment showed up in the codebase. Either consolidate "
        "the default into a single constant OR update this test "
        "to whitelist the legitimate use:\n  "
        + "\n  ".join(f"{p}:{ln} -> {line}" for p, ln, line in hits)
    )
