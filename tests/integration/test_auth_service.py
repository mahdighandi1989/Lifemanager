"""AuthService ↔ DB integration tests (audit task b7894694).

Real register → login → token-resolution roundtrip against the in-memory DB,
plus the duplicate/wrong-password rejection paths.
"""
from __future__ import annotations

import pytest

from app.schemas.auth import UserCreate, UserLogin
from app.services import auth_service


@pytest.mark.asyncio
async def test_register_then_login_roundtrip(db_session):
    user = await auth_service.register(
        db_session,
        UserCreate(email="i@example.com", password="hunter2-long", username="i"),
    )
    assert user.id is not None and user.hashed_password != "hunter2-long"
    token = await auth_service.login(
        db_session, UserLogin(email="i@example.com", password="hunter2-long")
    )
    assert token.access_token and token.token_type == "bearer"


@pytest.mark.asyncio
async def test_register_rejects_duplicate_email(db_session):
    await auth_service.register(
        db_session, UserCreate(email="d@example.com", password="hunter2-long", username="d1")
    )
    with pytest.raises(ValueError, match="Email already registered"):
        await auth_service.register(
            db_session, UserCreate(email="d@example.com", password="hunter2-long", username="d2")
        )


@pytest.mark.asyncio
async def test_login_rejects_wrong_password(db_session):
    await auth_service.register(
        db_session, UserCreate(email="w@example.com", password="correct-horse", username="w")
    )
    with pytest.raises(Exception):
        await auth_service.login(
            db_session, UserLogin(email="w@example.com", password="wrong-password")
        )


@pytest.mark.asyncio
async def test_verify_token_resolves_registered_user(db_session):
    await auth_service.register(
        db_session, UserCreate(email="v@example.com", password="hunter2-long", username="v")
    )
    token = await auth_service.login(
        db_session, UserLogin(email="v@example.com", password="hunter2-long")
    )
    resolved = await auth_service.AuthService(db_session).verify_token(token.access_token)
    assert resolved is not None and resolved.email == "v@example.com"
