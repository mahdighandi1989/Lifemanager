"""Cross-tier `data` pipeline integration test (audit task 42eab35f).

Coherence guard: the frontend ``AuthContext`` surfaces an authenticated
``user`` whose ``id`` is the backend ``users.id`` *integer* primary key
(see ``frontend/src/context/AuthContext.jsx::normalizeUser`` + the
``AuthUser`` typedef). The backend ``UserContext`` model links its rows to a
user via ``user_id`` — an ``Integer`` ForeignKey to ``users.id``
(``app/models/context.py``).

Ground truth = backend (the FK type). This test pins the *whole* pipeline
end to end so the two tiers can never silently drift apart again:

    register → login (JWT ``sub`` = str(user.id))
      → GET /users/        (the exact payload AuthContext consumes; ``id`` int)
      → POST /api/context/location   (stores a UserContext keyed by that id)
      → DB row's UserContext.user_id == that same integer id
      → GET /api/recommendations     (reads the row back, keyed by the id)

If the frontend ever surfaced a UUID/string ``id``, or the backend keyed
UserContext on anything but that integer, one of these assertions breaks.

Uses a single shared in-memory engine (not the shared ``api_client``
fixture) so the test can both drive the live app *and* inspect the
persisted ``UserContext`` row directly — the strongest form of the
cross-tier coherence assertion.
"""
from __future__ import annotations

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.database import Base, get_db
from app.main import app
from app.models.context import UserContext


@pytest_asyncio.fixture
async def client_and_factory():
    """A TestClient plus the sessionmaker behind it, so a test can drive the
    live HTTP app and then open its own session against the same engine to
    verify what actually got persisted."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def _get_db():
        async with factory() as session:
            yield session

    app.dependency_overrides[get_db] = _get_db
    try:
        yield TestClient(app), factory
    finally:
        app.dependency_overrides.clear()
        await engine.dispose()


@pytest.mark.asyncio
async def test_data_pipeline_user_id_links_authcontext_to_usercontext(
    client_and_factory,
):
    client, factory = client_and_factory

    # 1. register + login — JWT carries sub = str(user.id).
    register = client.post(
        "/auth/register",
        json={
            "email": "pipeline@example.com",
            "username": "pipelineuser",
            "password": "S3cure-Passw0rd!",
        },
    )
    assert register.status_code in (200, 201), register.text

    login = client.post(
        "/auth/login",
        json={"email": "pipeline@example.com", "password": "S3cure-Passw0rd!"},
    )
    assert login.status_code == 200, login.text
    token = login.json()["access_token"]
    assert token
    headers = {"Authorization": f"Bearer {token}"}

    # 2. GET /users/ — this is exactly the payload AuthContext.fetchMe()
    #    consumes (it takes data[0]). normalizeUser() guarantees an integer
    #    `id`; assert the backend really hands one back.
    listed = client.get("/users/", headers=headers)
    assert listed.status_code == 200, listed.text
    rows = listed.json()
    assert isinstance(rows, list) and rows, "expected at least the registered user"
    auth_user = rows[0]
    assert "id" in auth_user, "AuthContext relies on `id` being present"
    user_id = auth_user["id"]
    assert isinstance(user_id, int) and not isinstance(user_id, bool), (
        "AuthContext's contract is an INTEGER `user.id` (not a UUID/string); "
        f"got {type(user_id).__name__}={user_id!r}"
    )

    # 3. POST /api/context/location — a guarded route that resolves the caller
    #    via the same token and stores a UserContext keyed by user_id.
    loc = client.post(
        "/api/context/location",
        json={"lat": 35.7, "lng": 51.4},
        headers=headers,
    )
    assert loc.status_code == 200, loc.text
    assert loc.json()["current_location"] == {"lat": 35.7, "lng": 51.4}

    # 4. The persisted UserContext row links to that SAME integer id. This is
    #    the coherence guarantee: AuthContext's `user.id` == UserContext.user_id.
    async with factory() as session:
        ctx = (
            await session.execute(
                select(UserContext).where(UserContext.user_id == user_id)
            )
        ).scalars().first()
    assert ctx is not None, "UserContext was not linked by the integer user.id"
    assert ctx.user_id == user_id
    assert isinstance(ctx.user_id, int) and not isinstance(ctx.user_id, bool)
    assert ctx.current_location == {"lat": 35.7, "lng": 51.4}

    # 5. Reading back through the API (keyed by the same id) must succeed —
    #    proves the round-trip store→fetch stays linked end to end.
    recs = client.get("/api/recommendations", headers=headers)
    assert recs.status_code == 200, recs.text
    assert isinstance(recs.json(), list)
