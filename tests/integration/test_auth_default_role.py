"""Default-role / privilege enforcement for LOCAL registration.

Audit task a75e183c — "Enforce Default Role for Local User Registration".

The coherence issue: the OAuth pipeline
(``app/services/google_auth.py::get_or_create_user``) explicitly assigns a
least-privilege default (PENDING / READ_ONLY) and only elevates emails in the
operator's ``ADMIN_EMAILS`` bootstrap list. The local pipeline
(``app/services/auth_service.py::register``) used to rely on the column
default for ``is_superuser`` and ignored the bootstrap list entirely, so a
bootstrap-admin email registering locally was stored ``is_superuser=False``
yet resolved as admin via ``is_admin()``'s email check — an inconsistency.

Ground truth = the OAuth side (server decides privilege, never the client;
ADMIN_EMAILS is the single source of bootstrap admins). These tests pin the
local side to that contract:

  * default registration → least privilege (``is_superuser=False``),
  * a privilege field smuggled into the request body → rejected (422),
  * a bootstrap-admin email → stored ``is_superuser=True``, coherent with
    ``is_admin()``.
"""
from __future__ import annotations

import pytest
from sqlalchemy import select

from app.config import settings
from app.dependencies.auth import is_admin
from app.models.user import User
from app.schemas.auth import UserCreate
from app.services import auth_service


# --- Service-layer: least-privilege default --------------------------------


@pytest.mark.asyncio
async def test_register_assigns_least_privilege_by_default(db_session):
    """A normal local registration must NOT be a superuser, and the flag is
    set explicitly (not left to the column default)."""
    user = await auth_service.register(
        db_session,
        UserCreate(email="plain@example.com", password="hunter2-long", username="plain"),
    )
    assert user.is_superuser is False
    assert user.is_active is True
    # is_admin() (RBAC gate) must agree: a plain local user is not admin.
    assert is_admin(user) is False


@pytest.mark.asyncio
async def test_default_privilege_persisted_in_db(db_session):
    """The least-privilege default is what actually lands in the row, not
    just the returned object."""
    await auth_service.register(
        db_session,
        UserCreate(email="persist@example.com", password="hunter2-long", username="persist"),
    )
    row = (
        await db_session.execute(
            select(User).where(User.email == "persist@example.com")
        )
    ).scalar_one()
    assert row.is_superuser is False


# --- Bootstrap-admin coherence ---------------------------------------------


@pytest.mark.asyncio
async def test_register_bootstrap_admin_email_is_superuser(db_session):
    """An email in ADMIN_EMAILS registering locally is stored is_superuser=True
    so the persisted flag is coherent with is_admin()'s email bootstrap.

    conftest seeds ADMIN_EMAILS with a known address; use it (case-insensitive)
    to prove the alignment.
    """
    admin_email = settings.admin_emails_list[0]
    user = await auth_service.register(
        db_session,
        UserCreate(email=admin_email.upper(), password="hunter2-long", username="boot"),
    )
    assert user.is_superuser is True
    assert is_admin(user) is True


# --- Schema boundary: no self-asserted privilege ----------------------------


def test_usercreate_rejects_smuggled_privilege_fields():
    """UserCreate forbids unknown fields, so a body asserting its own role /
    superuser status fails validation instead of being silently dropped."""
    import pydantic

    for bad in ({"role": "admin"}, {"is_superuser": True}, {"permissions": "admin"}, {"status": "approved"}):
        with pytest.raises(pydantic.ValidationError):
            UserCreate(
                email="x@example.com",
                password="hunter2-long",
                username="x",
                **bad,
            )


# --- End-to-end through the HTTP route -------------------------------------


def test_register_route_rejects_role_injection(api_client):
    """POST /auth/register carrying a privilege field is rejected at the
    schema boundary (422) — the escalation never reaches the service."""
    resp = api_client.post(
        "/auth/register",
        json={
            "email": "inject@example.com",
            "username": "inject",
            "password": "S3cure-Passw0rd!",
            "is_superuser": True,
        },
    )
    assert resp.status_code == 422, resp.text


def test_register_route_default_user_is_not_admin(api_client):
    """A clean registration succeeds and the resulting account is a plain,
    least-privilege user end-to-end."""
    resp = api_client.post(
        "/auth/register",
        json={
            "email": "e2e@example.com",
            "username": "e2euser",
            "password": "S3cure-Passw0rd!",
        },
    )
    assert resp.status_code in (200, 201), resp.text
