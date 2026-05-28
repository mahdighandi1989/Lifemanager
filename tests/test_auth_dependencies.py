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
