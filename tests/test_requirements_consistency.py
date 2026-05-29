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


def test_pydantic_keeps_email_extra():
    """Step 2 (task 850097a9) de-duplicated pydantic by KEEPING the
    ``pydantic[email]`` form — that extra pulls email-validator, which
    UserCreate's ``EmailStr`` field depends on. A future "cleanup" that drops
    the ``[email]`` extra would still pass the no-duplicate guard above yet
    silently break email validation, so lock the chosen resolution here.
    Version-agnostic on purpose: only the extra is asserted, not the pin."""
    text = REQ.read_text(encoding="utf-8")
    assert re.search(r"^pydantic\[email\]\s*==", text, flags=re.MULTILINE), (
        "requirements.txt must declare pydantic with the [email] extra "
        "(task 850097a9 Step 2 kept pydantic[email] for email-validator)"
    )


def test_bcrypt_pinned_below_4_1_for_passlib_compat():
    """passlib 1.7.4 reads bcrypt's __about__ module which 4.1+ removed.
    Until passlib ships a fix, the cap must stay."""
    text = REQ.read_text(encoding="utf-8")
    assert re.search(r"^bcrypt\s*<\s*4\.1", text, flags=re.MULTILINE), (
        "requirements.txt must keep `bcrypt<4.1` to stay compatible with passlib 1.7.4"
    )


def test_no_bcrypt_declaration_permits_4_1_or_higher():
    """AC2 (task 850097a9): "no OTHER line with a higher bcrypt version".

    The check above only asserts the `bcrypt<4.1` cap is PRESENT — a stray
    second line like `bcrypt==4.2` would still satisfy it yet reintroduce
    the passlib 1.7.4 breakage at install time. This pins the stronger
    invariant: the bare `bcrypt` package is declared exactly once and that
    single declaration caps below 4.1. (`passlib[bcrypt]` is the passlib
    package with a bcrypt extra — not a bcrypt version pin — so it is
    excluded.)"""
    bcrypt_lines: list[str] = []
    for raw in REQ.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        match = _PACKAGE_NAME_RE.match(line)
        if match and match.group(1).lower() == "bcrypt":
            bcrypt_lines.append(line)

    assert len(bcrypt_lines) == 1, (
        f"expected exactly one bare `bcrypt` declaration, found {bcrypt_lines}"
    )
    assert re.search(r"<\s*4\.1|<=\s*4\.0(\.\d+)?\b", bcrypt_lines[0]), (
        f"the bcrypt declaration must cap below 4.1, got: {bcrypt_lines[0]!r}"
    )


def test_requirements_file_is_pip_parseable():
    """AC 1 of audit task 850097a9: ``pip install -r requirements.txt``
    must succeed. We can't run pip in a unit test, but we can verify
    every line parses as a valid PEP-508 requirement (which is the
    same surface the pip resolver consumes)."""
    try:
        from packaging.requirements import Requirement
        from packaging.specifiers import SpecifierSet
    except Exception as exc:  # packaging is a transitive dep of pip itself
        import pytest as _pytest

        _pytest.skip(f"packaging not importable: {exc}")

    text = REQ.read_text(encoding="utf-8")
    bad: list[str] = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        try:
            Requirement(line)
        except Exception as exc:
            bad.append(f"{line!r}: {exc}")
    assert not bad, "unparseable requirement lines:\n" + "\n".join(bad)


def test_installed_versions_match_pin():
    """AC 1 + AC 3 — verify that the dev environment has actually
    installed the pinned versions, so a future drift between
    requirements.txt and the live env can't go unnoticed."""
    import importlib.metadata as _md

    expectations = {
        "fastapi": "0.115.6",
        "pydantic": "2.10.4",
        "alembic": "1.14.0",
    }
    for pkg, want in expectations.items():
        got = _md.version(pkg)
        assert got == want, f"{pkg}: env has {got}, requirements says {want}"

    # AC 3 — bcrypt must stay <4.1 for passlib compat.
    bcrypt_v = tuple(int(x) for x in _md.version("bcrypt").split(".")[:2])
    assert bcrypt_v < (4, 1), f"bcrypt {bcrypt_v} >= 4.1 — passlib 1.7.4 will break"
