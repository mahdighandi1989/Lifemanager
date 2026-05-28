"""Guard requirements.txt against the drift the audit flagged.

Task 850097a9 found that pydantic was declared twice (once as
``pydantic==`` and once as ``pydantic[email]==``) and that bcrypt
needed an upper bound because passlib 1.7.4 trips on bcrypt 4.1+.
This test asserts both invariants so the same drift can't reappear.
"""
from __future__ import annotations

import re
from pathlib import Path


REQ = Path(__file__).resolve().parent.parent / "requirements.txt"

_PACKAGE_NAME_RE = re.compile(r"^\s*([A-Za-z0-9_.\-]+)")


def _top_level_packages() -> list[str]:
    names: list[str] = []
    for raw in REQ.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        match = _PACKAGE_NAME_RE.match(line)
        if match:
            names.append(match.group(1).lower())
    return names


def test_no_duplicate_top_level_package_declarations():
    """Each top-level package appears at most once. The extras suffix
    (e.g. ``pydantic[email]``) does not change the package name as far
    as pip is concerned, so the audit-flagged duplicate would still be
    caught here."""
    names = _top_level_packages()
    seen: dict[str, int] = {}
    for name in names:
        seen[name] = seen.get(name, 0) + 1
    duplicates = {name: count for name, count in seen.items() if count > 1}
    assert not duplicates, f"duplicate package declarations: {duplicates}"


def test_bcrypt_pinned_below_4_1_for_passlib_compat():
    """passlib 1.7.4 reads bcrypt's __about__ module which 4.1+ removed.
    Until passlib ships a fix, the cap must stay."""
    text = REQ.read_text(encoding="utf-8")
    assert re.search(r"^bcrypt\s*<\s*4\.1", text, flags=re.MULTILINE), (
        "requirements.txt must keep `bcrypt<4.1` to stay compatible with passlib 1.7.4"
    )
