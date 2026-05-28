"""Integration tests for the core services.

Audit task b7894694 asked for integration tests that exercise the
real service ↔ database boundary — not just the unit-level mocks
the existing test_auth_service.py / test_ai_service.py rely on.

Each test uses the shared ``db_session`` fixture from conftest, which
builds the schema fresh in an in-memory SQLite engine, so the assertions
are running against the same metadata the app would use.
"""
from __future__ import annotations

import pytest

from app.schemas.auth import UserCreate, UserLogin
from app.services import auth_service
from app.services.ai import nlp_service


# ── AuthService end-to-end ─────────────────────────────────────────


@pytest.mark.asyncio
async def test_auth_register_then_login_roundtrip(db_session):
    """A freshly registered user can log back in and gets a JWT."""
    payload = UserCreate(
        email="integration@example.com",
        password="hunter2-long",
        username="integrator",
    )
    user = await auth_service.register(db_session, payload)
    assert user.id is not None
    assert user.email == "integration@example.com"
    assert user.hashed_password != "hunter2-long"  # bcrypt'd

    token = await auth_service.login(
        db_session,
        UserLogin(email="integration@example.com", password="hunter2-long"),
    )
    assert token.access_token
    assert token.token_type == "bearer"


@pytest.mark.asyncio
async def test_auth_register_rejects_duplicate_email(db_session):
    payload = UserCreate(
        email="dup@example.com",
        password="hunter2-long",
        username="user1",
    )
    await auth_service.register(db_session, payload)

    second = UserCreate(
        email="dup@example.com",
        password="hunter2-long",
        username="user2",
    )
    with pytest.raises(ValueError, match="Email already registered"):
        await auth_service.register(db_session, second)


@pytest.mark.asyncio
async def test_auth_login_rejects_wrong_password(db_session):
    payload = UserCreate(
        email="wrongpw@example.com",
        password="hunter2-long",
        username="wrongpw",
    )
    await auth_service.register(db_session, payload)

    with pytest.raises(ValueError, match="Invalid email or password"):
        await auth_service.login(
            db_session,
            UserLogin(email="wrongpw@example.com", password="not-the-password"),
        )


# ── AI NLP service shape contract ──────────────────────────────────


@pytest.mark.asyncio
async def test_nlp_generate_text_returns_stable_shape():
    """Without OPENAI_API_KEY the placeholder branch must produce the
    documented {generated_text, model_used, tokens_used} keys — the
    route layer asserts on these and we don't want silent drift."""
    out = await nlp_service.generate_text("Hello, world")
    assert set(out.keys()) >= {"generated_text", "model_used", "tokens_used"}
    assert isinstance(out["generated_text"], str)
    assert isinstance(out["tokens_used"], int)
    assert out["tokens_used"] == 0  # placeholder branch never bills tokens
