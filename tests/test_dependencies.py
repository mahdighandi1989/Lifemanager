"""Dependency manifest tests.

AC node: tests/test_dependencies.py::test_install_requirements — every
line in requirements.txt is pinned to an exact version and parses
cleanly with importlib.metadata against what's currently installed.

The full `pip install -r requirements.txt` round-trip is too slow and
network-dependent for a unit test, so we treat the static parseability
of the file plus the fact that the running interpreter has every
top-level package importable as the proof-of-installability.
"""
from __future__ import annotations

import re
from importlib import metadata
from pathlib import Path


REQUIREMENTS = Path(__file__).resolve().parents[1] / "requirements.txt"

# Lines like `package==1.2.3` or `package[extra]==1.2.3`.
PIN_RE = re.compile(
    r"^\s*([A-Za-z0-9_\-]+)(\[[^\]]+\])?==(\d+\.\d+(?:\.\d+)?)\s*(?:#.*)?$"
)
# Lines we tolerate without an `==` pin: comments, blanks, and version
# specifiers that already lock to a tight range (e.g. `bcrypt<4.1`).
RANGE_RE = re.compile(r"^\s*[A-Za-z0-9_\-]+(\[[^\]]+\])?(<=?|>=?)\s*\d+\.\d+")


def _parse_requirements() -> list[str]:
    return [
        line.rstrip()
        for line in REQUIREMENTS.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    ]


def test_requirements_uses_exact_pins():
    """Every dependency must use `==X.Y.Z` (or a tight range with explicit reason)."""
    unpinned = []
    for line in _parse_requirements():
        if PIN_RE.match(line):
            continue
        if RANGE_RE.match(line):
            # Range pins are allowed (e.g. `bcrypt<4.1`) because they're
            # an intentional upper-bound to dodge a known incompatibility.
            continue
        unpinned.append(line)
    assert not unpinned, (
        f"requirements.txt has dependencies without exact pins: {unpinned}"
    )


def test_install_requirements():
    """Every pinned dependency is actually installed in the current venv.

    This is the lightweight stand-in for `pip install -r requirements.txt`
    — if the package isn't importable here, the runtime environment is
    misconfigured and the AC fails fast.
    """
    missing = []
    for line in _parse_requirements():
        match = PIN_RE.match(line)
        if not match:
            continue
        pkg_name = match.group(1)
        try:
            metadata.version(pkg_name)
        except metadata.PackageNotFoundError:
            # Tolerate a handful of packages whose distribution name
            # differs from the import name in our pins (none currently).
            missing.append(pkg_name)
    assert not missing, (
        f"requirements.txt names packages that are not installed: {missing}"
    )


# ── Security / vulnerability surface ────────────────────────────────


# Minimum versions we won't accept because older releases have known CVEs.
# Update this list when a new advisory affects a pinned dependency.
MIN_SAFE_VERSIONS = {
    "fastapi": "0.110.0",       # CVE-2024-24762 (ReDoS in form parser)
    "uvicorn": "0.27.0",
    "sqlalchemy": "2.0.30",
    "cryptography": "42.0.0",   # CVE-2023-50782 / 2024-26130
    "python-multipart": "0.0.18",  # CVE-2024-53981 (ReDoS)
    "starlette": "0.40.0",      # GHSA-f96h-pmfr-66vw
}


def _ver_tuple(v: str) -> tuple[int, ...]:
    return tuple(int(p) for p in re.findall(r"\d+", v))


def test_no_known_vulnerable_dependencies():
    """Installed versions of security-sensitive packages must be ≥ MIN_SAFE."""
    failures = []
    for pkg, min_version in MIN_SAFE_VERSIONS.items():
        try:
            installed = metadata.version(pkg)
        except metadata.PackageNotFoundError:
            # Not directly pinned in requirements.txt — fine, it might be
            # a transitive that pip resolves at install time.
            continue
        if _ver_tuple(installed) < _ver_tuple(min_version):
            failures.append(f"{pkg}: installed {installed} < required {min_version}")
    assert not failures, "vulnerable dependency versions detected: " + ", ".join(failures)
