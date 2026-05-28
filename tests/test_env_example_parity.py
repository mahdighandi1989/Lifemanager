"""Parity check: every env var the auth_google flow reads must be
declared in .env.example.

Audit task a997baa8 flagged that GOOGLE_REDIRECT_URI was used by
app/routes/auth_google.py but not documented in .env.example. This
test makes sure the next env var added to the OAuth flow doesn't
silently drift the same way.
"""
from __future__ import annotations

from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
ENV_EXAMPLE = REPO_ROOT / ".env.example"


def _env_example_keys() -> set[str]:
    text = ENV_EXAMPLE.read_text(encoding="utf-8")
    keys: set[str] = set()
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            keys.add(line.split("=", 1)[0].strip())
    return keys


def test_google_oauth_env_vars_declared():
    """GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
    must all appear in .env.example — auth_google.py and
    google_auth.py read all three."""
    keys = _env_example_keys()
    for required in ("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI"):
        assert required in keys, f"{required} missing from .env.example"


def test_no_referenced_google_env_var_undocumented():
    """A stronger contract — anywhere code reads os.environ for
    ``GOOGLE_*`` or settings.GOOGLE_*, the same name must appear in
    .env.example. Catches a future drift where a new GOOGLE_FOO env
    var lands in code but the example file isn't updated."""
    import re
    code_dirs = (REPO_ROOT / "app",)
    used: set[str] = set()
    for d in code_dirs:
        for f in d.rglob("*.py"):
            text = f.read_text(encoding="utf-8", errors="ignore")
            used.update(re.findall(r"GOOGLE_[A-Z_]+", text))
    documented = _env_example_keys()
    missing = sorted(name for name in used if name not in documented)
    # Allow internal symbols that aren't env vars (e.g. constants
    # exported as Python identifiers but never read from env).
    allowed_internal = {"GOOGLE_OAUTH"}
    missing = [m for m in missing if m not in allowed_internal]
    assert not missing, f"GOOGLE_* env vars referenced in code but missing from .env.example: {missing}"
