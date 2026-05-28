"""Auth pipeline must work for both User and OAuthUser shapes.

Audit task b7638cb2 found that ``get_current_active_user`` and
``get_current_admin_user`` accessed ``current_user.status`` /
``current_user.email`` directly — fine for an OAuthUser row but
guaranteed to ``AttributeError`` against the local ``User`` model,
which has no ``status`` column.

These tests pin the now-loose helpers in place so that drift back
to attribute access can't reappear.
"""
from __future__ import annotations

from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.dependencies import auth as auth_deps


@pytest.mark.asyncio
async def test_active_user_passes_for_local_user_without_status():
    """A local User has no ``status`` attribute; missing-attr must be
    treated as 'not pending' so the gate doesn't 500."""
    user = SimpleNamespace(id=1, email="local@example.com")  # no .status
    out = await auth_deps.get_current_active_user(current_user=user)
    assert out is user


@pytest.mark.asyncio
async def test_active_user_blocks_pending_oauth_user():
    oauth = SimpleNamespace(id=2, email="pending@example.com", status="pending")
    with pytest.raises(HTTPException) as excinfo:
        await auth_deps.get_current_active_user(current_user=oauth)
    assert excinfo.value.status_code == 403
    assert "pending" in excinfo.value.detail.lower()


@pytest.mark.asyncio
async def test_active_user_passes_approved_oauth_user():
    oauth = SimpleNamespace(id=3, email="ok@example.com", status="approved")
    out = await auth_deps.get_current_active_user(current_user=oauth)
    assert out is oauth


@pytest.mark.asyncio
async def test_admin_blocks_non_admin_email_on_either_shape():
    user = SimpleNamespace(id=4, email="someone-else@example.com")
    with pytest.raises(HTTPException) as excinfo:
        await auth_deps.get_current_admin_user(current_user=user)
    assert excinfo.value.status_code == 403


@pytest.mark.asyncio
async def test_admin_passes_for_admin_email():
    user = SimpleNamespace(id=5, email="mohamad.mahdi1988@gmail.com")
    out = await auth_deps.get_current_admin_user(current_user=user)
    assert out is user
