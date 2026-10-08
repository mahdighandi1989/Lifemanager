"""Who is the supervisor? — the Claude Code routine that answers «نظارت و سرکشی».

WHY A TOKEN AND NOT A USER ACCOUNT
----------------------------------
The sibling projects sign the supervisor in as a user (ALLIN1 by username,
Detective-1 by e-mail). Lifemanager scopes almost every table by `user_id`, so a
supervisor *user* would be a second tenant with its own empty world — and the
owner's data lives in the anon/shared scope. A request header avoids inventing a
phantom tenant: the supervisor is «a caller who can prove it is the routine»,
nothing more.

    X-Supervisor-Token: <token>

WHERE THE TOKEN COMES FROM — no secret in the repo, nothing new to configure
---------------------------------------------------------------------------
1. ``SUPERVISOR_TOKEN`` env var, when set (the hardening option);
2. otherwise derived: HMAC-SHA256(``AUTH_JWT_SECRET``, "lifemanager:supervisor:v1").
   That variable already exists on the Render service, and the routine's
   client (`scripts/supervisor/client.py`) reads it at run time through the
   Render API — the same mechanism Detective-1 uses for its supervisor password.

Derived ONLY from an explicitly-set environment variable, never from a code
default: a token computed from a public placeholder would be a token anyone can
compute. With neither variable set, NOBODY is the supervisor — the routine is
refused (fail-closed) and the owner's controls keep working.

THE GUARDS THIS FEEDS (enforced in `routes/inspection.py`):
  * only the supervisor records an `outcome`, claims the fast queue, or knocks
  * the supervisor is REFUSED the tick, delete, ⚡ and file-removal
"""
from __future__ import annotations

import hashlib
import hmac
import os
from typing import Optional

HEADER = "X-Supervisor-Token"
_DERIVE_LABEL = b"lifemanager:supervisor:v1"
#: Never derive from these — they are placeholders, i.e. public.
_WEAK = {"", "change-me", "changeme", "secret", "dev", "development", "test"}


def expected_token() -> Optional[str]:
    """The token the supervisor must present, or None when none is configured."""
    explicit = (os.getenv("SUPERVISOR_TOKEN") or "").strip()
    if explicit:
        return explicit
    base = (os.getenv("AUTH_JWT_SECRET") or "").strip()
    if not base or base.lower() in _WEAK or len(base) < 16:
        return None
    return derive(base)


def derive(secret: str) -> str:
    """The derivation, shared with the client so both sides agree byte for byte."""
    return hmac.new(secret.encode("utf-8"), _DERIVE_LABEL, hashlib.sha256).hexdigest()


def is_supervisor_token(presented: Optional[str]) -> bool:
    want = expected_token()
    got = (presented or "").strip()
    if not want or not got:
        return False
    return hmac.compare_digest(want.encode(), got.encode())


def configured() -> bool:
    return expected_token() is not None
