"""Unit tests for app/services/auth_service.py.

Covers the public service surface:
    hash_password / verify_password   (bcrypt round-trip)
    create_access_token / validate_token  (JWT round-trip + tamper / expiry)
    register / login                  (DB-backed flows, with bad creds path)

The previous tests/test_auth_service.py referenced methods that never
existed on AuthService (authenticate, create_user, _get_user_by_email, ...)
and could not run.
"""
from datetime import timedelta

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.database import Base
from app.schemas.auth import UserCreate, UserLogin
from app.services import auth_service


@pytest_asyncio.fixture
async def session_factory():
    """Per-test in-memory SQLite engine + session factory.

    Must be an async fixture so the engine binds to the test's event loop;
    sync fixtures that asyncio.run() a setup leave the engine attached to a
    closed loop and the test then RuntimeErrors on use.
    """
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    yield factory
    await engine.dispose()


# --- Password hashing --------------------------------------------------------

def test_password_hashing_and_verification():
    """bcrypt round-trip works and rejects wrong passwords."""
    h = auth_service.hash_password("correct horse battery staple")
    assert h != "correct horse battery staple", "hash must not be the plain text"
    assert h.startswith("$2"), "expected a bcrypt $2x/$2b hash"
    assert auth_service.verify_password("correct horse battery staple", h)
    assert not auth_service.verify_password("wrong password", h)


def test_password_hash_is_salted():
    """Two hashes of the same password must differ (random salt)."""
    a = auth_service.hash_password("same")
    b = auth_service.hash_password("same")
    assert a != b
    assert auth_service.verify_password("same", a)
    assert auth_service.verify_password("same", b)


# --- JWT --------------------------------------------------------------------

def test_verify_token_with_valid_token():
    t = auth_service.create_access_token({"sub": "42", "email": "a@b.c"})
    payload = auth_service.validate_token(t)
    assert payload is not None
    assert payload["sub"] == "42"
    assert payload["email"] == "a@b.c"


def test_verify_token_with_expired_token():
    expired = auth_service.create_access_token(
        {"sub": "42"}, expires_delta=timedelta(seconds=-1)
    )
    assert auth_service.validate_token(expired) is None


def test_verify_token_with_tampered_token():
    t = auth_service.create_access_token({"sub": "42"})
    # Flip one character in the signature
    head, body, sig = t.split(".")
    bad_sig = ("A" if sig[0] != "A" else "B") + sig[1:]
    tampered = ".".join([head, body, bad_sig])
    assert auth_service.validate_token(tampered) is None


def test_verify_token_with_garbage():
    assert auth_service.validate_token("not.a.jwt") is None
    assert auth_service.validate_token("") is None


def test_verify_token_rejects_missing_sub():
    """A token without a 'sub' claim must not validate even if signature is good."""
    from jose import jwt as jose_jwt

    from app.config import settings

    bad = jose_jwt.encode(
        {"email": "a@b.c"}, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    assert auth_service.validate_token(bad) is None


# --- register / login (DB-backed) -------------------------------------------

@pytest.mark.asyncio
async def test_register(session_factory):
    async with session_factory() as db:
        user = await auth_service.register(
            db,
            UserCreate(email="a@b.com", username="al", password="hunter2!"),
        )
        assert user.id is not None
        assert user.email == "a@b.com"
        # Password must NOT be stored plain.
        assert user.hashed_password != "hunter2!"
        assert auth_service.verify_password("hunter2!", user.hashed_password)


@pytest.mark.asyncio
async def test_register_rejects_duplicate_email(session_factory):
    async with session_factory() as db:
        await auth_service.register(
            db, UserCreate(email="dup@b.com", username="one", password="passwordA1")
        )
    async with session_factory() as db:
        with pytest.raises(ValueError, match="already registered"):
            await auth_service.register(
                db,
                UserCreate(email="dup@b.com", username="two", password="passwordB2"),
            )


@pytest.mark.asyncio
async def test_login_with_correct_password(session_factory):
    async with session_factory() as db:
        await auth_service.register(
            db, UserCreate(email="x@y.com", username="xx", password="ok-password")
        )
    async with session_factory() as db:
        tok = await auth_service.login(
            db, UserLogin(email="x@y.com", password="ok-password")
        )
    assert tok.token_type == "bearer"
    assert auth_service.validate_token(tok.access_token) is not None


@pytest.mark.asyncio
async def test_login_with_wrong_password_raises(session_factory):
    async with session_factory() as db:
        await auth_service.register(
            db, UserCreate(email="x@y.com", username="xx", password="longenough-pw")
        )
    async with session_factory() as db:
        with pytest.raises(ValueError, match="Invalid"):
            await auth_service.login(
                db, UserLogin(email="x@y.com", password="wrong-password")
            )


@pytest.mark.asyncio
async def test_login_unknown_email_raises(session_factory):
    async with session_factory() as db:
        with pytest.raises(ValueError, match="Invalid"):
            await auth_service.login(
                db, UserLogin(email="ghost@y.com", password="anything")
            )


# --- refresh-token semantics (validate_token round-trip stays consistent) ----

def test_refresh_token_round_trip():
    """Re-issuing a token from a previously validated payload preserves
    identity. (We don't have a separate refresh-token type yet; this checks
    the building block.)"""
    t1 = auth_service.create_access_token({"sub": "7"})
    p = auth_service.validate_token(t1)
    assert p is not None
    t2 = auth_service.create_access_token({"sub": p["sub"]})
    assert auth_service.validate_token(t2)["sub"] == "7"


def test_refresh_with_invalid_old_token_fails():
    assert auth_service.validate_token("invalid") is None
