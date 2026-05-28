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


# ── AIService CRUD against a real DB ───────────────────────────────


@pytest.mark.asyncio
async def test_ai_service_create_list_update_delete_roundtrip(db_session):
    """End-to-end AIModelConfig lifecycle through AIService against the
    real schema. Pins the service-DB contract so a future column
    rename / index change surfaces here."""
    from app.schemas.ai_schema import AIModelConfigCreate, AIModelConfigUpdate
    from app.services.ai_service import AIService

    svc = AIService(db_session)
    created = await svc.create_config(
        AIModelConfigCreate(
            name="integration-cfg-1",
            provider="openai",
            model_name="gpt-3.5-turbo",
        ),
        user_id=1,
    )
    assert created.id is not None
    assert created.name == "integration-cfg-1"

    listing = await svc.get_user_configs(user_id=1)
    assert any(c.id == created.id for c in listing)

    updated = await svc.update_config(
        created.id,
        AIModelConfigUpdate(name="integration-cfg-1-renamed"),
        user_id=1,
    )
    assert updated is not None
    assert updated.name == "integration-cfg-1-renamed"

    deleted = await svc.delete_config(created.id, user_id=1)
    assert deleted is True

    listing_after = await svc.get_user_configs(user_id=1)
    assert not any(c.id == created.id for c in listing_after)


@pytest.mark.asyncio
async def test_ai_service_update_missing_returns_none(db_session):
    """Service update against a non-existent id is a clean None, not a 500."""
    from app.schemas.ai_schema import AIModelConfigUpdate
    from app.services.ai_service import AIService

    svc = AIService(db_session)
    out = await svc.update_config(
        999_999,
        AIModelConfigUpdate(name="ghost"),
        user_id=1,
    )
    assert out is None


@pytest.mark.asyncio
async def test_ai_service_delete_missing_returns_false(db_session):
    from app.services.ai_service import AIService

    svc = AIService(db_session)
    assert await svc.delete_config(999_999, user_id=1) is False


@pytest.mark.asyncio
async def test_image_service_returns_documented_placeholder_shape():
    """Closes the coverage hole on app/services/ai/image_service.py
    so the broader integration suite clears the 80% AC."""
    from app.services.ai import AIImageService

    svc = AIImageService()
    out = await svc.analyze_image(
        "https://example.com/cat.jpg",
        prompt="describe",
    )
    assert "description" in out
    assert "model_used" in out
    assert out["tokens_used"] == 0

    # Module-level convenience too.
    from app.services.ai import analyze_image as analyze_image_fn

    out2 = await analyze_image_fn("https://example.com/dog.jpg")
    assert "description" in out2


# ── AuthService edge paths (duplicate username, disabled login) ─────
# Audit task b7894694 AC4 asks for >=80% coverage of the core services.
# The prior pass left app/services/auth_service.py at ~71% — the
# UserService CRUD class and the module-level get_current_user error
# branches were never exercised. The tests below close those holes
# against the real DB boundary (not mocks).


@pytest.mark.asyncio
async def test_auth_register_rejects_duplicate_username(db_session):
    """Same username, different email -> 'Username already taken'."""
    await auth_service.register(
        db_session,
        UserCreate(email="u-a@example.com", password="hunter2-long", username="dupname"),
    )
    with pytest.raises(ValueError, match="Username already taken"):
        await auth_service.register(
            db_session,
            UserCreate(email="u-b@example.com", password="hunter2-long", username="dupname"),
        )


@pytest.mark.asyncio
async def test_auth_login_rejects_disabled_user(db_session):
    """A disabled account raises UserDisabledError BEFORE the password
    check, so even a correct password cannot mint a token."""
    user = await auth_service.register(
        db_session,
        UserCreate(email="disabled@example.com", password="hunter2-long", username="disabled"),
    )
    user.is_active = False
    await db_session.commit()
    with pytest.raises(auth_service.UserDisabledError):
        await auth_service.login(
            db_session,
            UserLogin(email="disabled@example.com", password="hunter2-long"),
        )


# ── module-level get_current_user (token -> User) ──────────────────


@pytest.mark.asyncio
async def test_get_current_user_resolves_valid_token(db_session):
    user = await auth_service.register(
        db_session,
        UserCreate(email="gcu@example.com", password="hunter2-long", username="gcu"),
    )
    token = auth_service.create_access_token({"sub": str(user.id)})
    resolved = await auth_service.get_current_user(db_session, token)
    assert resolved.id == user.id


@pytest.mark.asyncio
async def test_get_current_user_rejects_garbage_token(db_session):
    with pytest.raises(ValueError, match="Invalid token"):
        await auth_service.get_current_user(db_session, "not-a-jwt")


@pytest.mark.asyncio
async def test_get_current_user_rejects_non_integer_sub(db_session):
    """A token whose `sub` is not an int is rejected by the int() guard
    rather than 500-ing on the DB lookup."""
    token = auth_service.create_access_token({"sub": "not-an-int"})
    with pytest.raises(ValueError, match="Invalid token"):
        await auth_service.get_current_user(db_session, token)


@pytest.mark.asyncio
async def test_get_current_user_rejects_unknown_user(db_session):
    """A well-formed token for a user id that no longer exists raises
    'User not found'."""
    token = auth_service.create_access_token({"sub": "999999"})
    with pytest.raises(ValueError, match="User not found"):
        await auth_service.get_current_user(db_session, token)


# ── UserService CRUD against a real DB ─────────────────────────────


@pytest.mark.asyncio
async def test_user_service_crud_roundtrip(db_session):
    """End-to-end UserService lifecycle: list (empty) -> create via
    register -> fetch by id -> update profile fields -> delete, plus the
    not-found branches of get/update/delete."""
    from app.schemas.user_schema import UserUpdate

    svc = auth_service.UserService(db_session)
    assert await svc.get_all_users() == []

    user = await auth_service.register(
        db_session,
        UserCreate(email="svc@example.com", password="hunter2-long", username="svcuser"),
    )
    assert len(await svc.get_all_users()) == 1

    fetched = await svc.get_user_by_id(user.id)
    assert fetched is not None and fetched.email == "svc@example.com"
    assert await svc.get_user_by_id(999999) is None

    updated = await svc.update_user(
        user.id,
        UserUpdate(bio="hello", display_name="Svc User"),
        current_user_id=user.id,
    )
    assert updated is not None
    assert updated.bio == "hello" and updated.display_name == "Svc User"
    # not-found update returns None
    assert (
        await svc.update_user(999999, UserUpdate(bio="x"), current_user_id=user.id)
        is None
    )

    assert await svc.delete_user(user.id, current_user_id=user.id) is True
    assert await svc.delete_user(999999, current_user_id=user.id) is False
    assert await svc.get_all_users() == []
