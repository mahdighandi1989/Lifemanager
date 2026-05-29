"""Type-mismatch edge case in app/dependencies/auth.py.

Sub-task 8 of the consolidated JWT/auth task (task_78c0e8e0a9b5)
flagged ``get_current_active_user`` and ``get_current_admin_user``
as buggy: the upstream ``get_current_user`` returns a ``User``
instance, but those two helpers type-hinted their parameter as
``OAuthUser`` and accessed ``.status`` / ``.email`` directly.
``User`` has no ``status`` column, so any caller would hit an
AttributeError at runtime.

The fix:
  * dropped the misleading type hints (they were wrong either way)
  * switched the field reads to ``getattr(obj, "field", None)``
    so a plain ``User`` (no .status) passes through as "active"
    and the OAuthUser flow still gets the pending-account block.

These two helpers have zero callers today (grep verifies), so the
bug never manifested in production — but the test pins the safe
behaviour against a future caller that wires them up.
"""
from __future__ import annotations

import pytest

from app.dependencies.auth import (
    get_current_active_user,
    get_current_admin_user,
)
from fastapi import HTTPException


class _StubUser:
    """Stand-in for the password-auth User model (no .status field)."""

    def __init__(self, email: str):
        self.email = email


class _StubOAuthUser:
    """Stand-in for the OAuth user (carries status + email)."""

    def __init__(self, email: str, status_value: str):
        self.email = email
        self.status = status_value


@pytest.mark.asyncio
async def test_type_mismatch_edge_case():
    """Active-user dep tolerates a plain User without .status field."""
    user = _StubUser(email="someone@example.com")
    # Bypass the Depends wrapper by calling the underlying coroutine
    # with the parameter directly — the test exercises the helper's
    # logic, not FastAPI's injection.
    result = await get_current_active_user(current_user=user)
    assert result is user


@pytest.mark.asyncio
async def test_active_user_rejects_pending_oauth_status():
    """OAuthUser with status='pending' → 403."""
    user = _StubOAuthUser(email="x@y.com", status_value="pending")
    with pytest.raises(HTTPException) as exc:
        await get_current_active_user(current_user=user)
    assert exc.value.status_code == 403
    assert "pending approval" in exc.value.detail


@pytest.mark.asyncio
async def test_active_user_accepts_approved_oauth_status():
    """OAuthUser with status='approved' passes through."""
    user = _StubOAuthUser(email="x@y.com", status_value="approved")
    result = await get_current_active_user(current_user=user)
    assert result is user


@pytest.mark.asyncio
async def test_admin_user_accepts_owner_email():
    """The hard-coded admin email passes the gate."""
    user = _StubOAuthUser(email="mohamad.mahdi1988@gmail.com", status_value="approved")
    result = await get_current_admin_user(current_user=user)
    assert result is user


@pytest.mark.asyncio
async def test_admin_user_rejects_other_email():
    """Anyone other than the admin email → 403."""
    user = _StubUser(email="random@example.com")
    with pytest.raises(HTTPException) as exc:
        await get_current_admin_user(current_user=user)
    assert exc.value.status_code == 403
    assert "Admin" in exc.value.detail


# ── Model references in auth.py (audit task b7638cb2 Step 5) ──────────
# The pipeline keeps TWO distinct user models aligned via a Union; pin the
# references (imports + type hints match the real models, tables are separate).
import inspect  # noqa: E402
import typing  # noqa: E402


def test_auth_context_is_union_of_both_models():
    from app.dependencies import auth as auth_deps
    from app.models.user import User
    from app.models.user_oauth import OAuthUser

    assert set(typing.get_args(auth_deps.AuthContext)) == {User, OAuthUser}


def test_user_and_oauthuser_are_distinct_tables():
    from app.models.user import User
    from app.models.user_oauth import OAuthUser

    assert User.__tablename__ == "users"
    assert OAuthUser.__tablename__ == "oauth_users"
    assert User is not OAuthUser


def test_get_current_user_return_type_is_auth_context():
    from app.dependencies import auth as auth_deps

    ann = inspect.signature(auth_deps.get_current_user).return_annotation
    assert ann is auth_deps.AuthContext or (
        isinstance(ann, str) and "AuthContext" in ann
    )


def test_auth_deps_imports_both_models():
    from app.dependencies import auth as auth_deps

    assert getattr(auth_deps, "User", None) is not None
    assert getattr(auth_deps, "OAuthUser", None) is not None
