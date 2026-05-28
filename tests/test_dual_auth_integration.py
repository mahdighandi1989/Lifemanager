"""Integration test for the dual-model auth pipeline (audit task b7638cb2 AC 3).

Verifies that both ``User`` (local register/login) and ``OAuthUser``
(Google flow) shapes flow through the same get_current_active_user
gate without crashing.
"""
from __future__ import annotations

from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.dependencies import auth as auth_deps


@pytest.mark.asyncio
async def test_dual_model_active_gate_passes_both_shapes():
    """A User (no status column) and an OAuthUser with status='approved'
    must both pass the active gate cleanly."""
    user_row = SimpleNamespace(id=1, email="u@example.com")  # User-shape
    oauth_row = SimpleNamespace(
        id=2, email="o@example.com", status="approved"
    )  # OAuthUser-shape

    assert await auth_deps.get_current_active_user(current_user=user_row) is user_row
    assert await auth_deps.get_current_active_user(current_user=oauth_row) is oauth_row


@pytest.mark.asyncio
async def test_dual_model_admin_gate_rejects_both_non_admin():
    user_row = SimpleNamespace(id=1, email="x@example.com")
    oauth_row = SimpleNamespace(id=2, email="y@example.com")

    for row in (user_row, oauth_row):
        with pytest.raises(HTTPException) as exc:
            await auth_deps.get_current_admin_user(current_user=row)
        assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_pending_oauth_blocked_but_user_with_same_email_passes():
    """The same email on a pending OAuthUser blocks, but on a local
    User passes — proves the gate keys on the column, not the email."""
    pending_oauth = SimpleNamespace(
        id=1, email="shared@example.com", status="pending"
    )
    local_user = SimpleNamespace(id=2, email="shared@example.com")

    with pytest.raises(HTTPException) as exc:
        await auth_deps.get_current_active_user(current_user=pending_oauth)
    assert exc.value.status_code == 403

    out = await auth_deps.get_current_active_user(current_user=local_user)
    assert out is local_user


def test_auth_context_type_is_documented():
    """AC 1-2 — the AuthContext = Union[User, OAuthUser] is the
    documented ground-truth resolution. Pin its presence so a future
    refactor can't quietly drop the union."""
    import typing

    assert hasattr(auth_deps, "AuthContext")
    args = typing.get_args(auth_deps.AuthContext)
    from app.models.user import User
    from app.models.user_oauth import OAuthUser

    assert set(args) == {User, OAuthUser}
