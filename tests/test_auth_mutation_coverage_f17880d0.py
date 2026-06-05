"""Auth-pipeline integration coverage for mutation paths (audit task f17880d0).

Coherence issue under audit ("Incomplete Permission Coverage for Mutation
Paths"): ``app/dependencies/auth.py`` defines the identity/permission
dependencies, but several FastAPI *mutation* routes never applied them, so a
caller could update or delete another tenant's data. ``projects.py`` was the
already-coherent ground truth (every mutation resolves the caller via
``get_optional_user_id`` and refuses cross-tenant rows with a 404, while
legacy-unowned rows stay reachable for the login-bypass single-tenant
frontend). These tests pin that the previously-unguarded mutation paths —
tasks, todo-lists, todo-items — now follow the same rule end to end, and that
the role-change path stays admin-gated.

The end-to-end auth chain exercised here:
  bearer/anon → get_optional_user_id → route ownership check → 200/404.

We simulate distinct callers by overriding ``get_optional_user_id`` (the same
technique used by tests/test_user_scoping_78c0e8e0.py) so the test stays
hermetic — no real JWT minting needed to prove the *authorization* logic,
which is what the audit flagged. The JWT signature/expiry half of the pipeline
is already covered by tests/test_jwt_auth_pipeline.py.
"""
from __future__ import annotations

import types

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.database import Base, get_db
from app.dependencies.auth import get_optional_user_id
from app.main import app


def _as_user(uid: int) -> None:
    """Pin the resolved caller id for the optional-auth dependency."""
    app.dependency_overrides[get_optional_user_id] = lambda: uid


@pytest.fixture(autouse=True)
def _clear_overrides():
    yield
    app.dependency_overrides.pop(get_optional_user_id, None)


# --- TASKS ------------------------------------------------------------------

def test_task_update_delete_scoped_to_owner(api_client):
    """A task created by user 1 cannot be updated or deleted by user 2."""
    _as_user(1)
    created = api_client.post("/api/tasks/", json={"title": "u1 task"}).json()
    tid = created["id"]
    assert created["user_id"] == 1  # owner taken from auth context, not body

    _as_user(2)
    assert api_client.get(f"/api/tasks/{tid}").status_code == 404  # no leak
    assert api_client.put(
        f"/api/tasks/{tid}", json={"title": "hijack"}
    ).status_code == 404
    assert api_client.delete(f"/api/tasks/{tid}").status_code == 404

    # The row is untouched and still belongs to (and is mutable by) user 1.
    _as_user(1)
    assert api_client.get(f"/api/tasks/{tid}").json()["title"] == "u1 task"
    assert api_client.put(
        f"/api/tasks/{tid}", json={"title": "renamed by owner"}
    ).status_code == 200
    assert api_client.delete(f"/api/tasks/{tid}").status_code == 204


def test_task_anon_login_bypass_still_works(api_client):
    """Anonymous (user 0) keeps full CRUD under login-bypass — the fix must
    not regress the single-tenant frontend."""
    _as_user(0)
    tid = api_client.post("/api/tasks/", json={"title": "anon"}).json()["id"]
    assert api_client.get(f"/api/tasks/{tid}").status_code == 200
    assert api_client.put(f"/api/tasks/{tid}", json={"title": "x"}).status_code == 200
    assert api_client.delete(f"/api/tasks/{tid}").status_code == 204


# --- TODO LISTS -------------------------------------------------------------

def test_list_get_update_delete_scoped_to_owner(api_client):
    _as_user(11)
    lid = api_client.post("/api/lists", json={"name": "u11 list"}).json()["id"]

    _as_user(22)
    assert api_client.get(f"/api/lists/{lid}").status_code == 404
    assert api_client.put(
        f"/api/lists/{lid}", json={"name": "hijack"}
    ).status_code == 404
    assert api_client.delete(f"/api/lists/{lid}").status_code == 404
    # Can't inject an item into someone else's list either.
    assert api_client.post(
        f"/api/lists/{lid}/items", json={"content": "sneaky"}
    ).status_code == 404

    _as_user(11)
    assert api_client.get(f"/api/lists/{lid}").status_code == 200
    assert api_client.delete(f"/api/lists/{lid}").status_code == 204


# --- TODO ITEMS (ownership inherited from the parent list) ------------------

def test_todo_item_mutation_scoped_through_list_owner(api_client):
    _as_user(101)
    lid = api_client.post("/api/lists", json={"name": "owner-list"}).json()["id"]
    item = api_client.post(
        "/api/todo-items", json={"content": "mine", "list_ids": [lid]}
    ).json()
    iid = item["id"]

    # A different tenant can't toggle / update / delete the item, because its
    # only list belongs to user 101.
    _as_user(202)
    assert api_client.patch(
        f"/api/todo-items/{iid}", json={"content": "hijack"}
    ).status_code == 404
    assert api_client.post(
        f"/api/todo-items/{iid}/toggle-complete"
    ).status_code == 404
    assert api_client.delete(f"/api/todo-items/{iid}").status_code == 404
    # And can't create an item inside the other tenant's list.
    assert api_client.post(
        "/api/todo-items", json={"content": "x", "list_ids": [lid]}
    ).status_code == 404

    # Owner retains full control.
    _as_user(101)
    assert api_client.post(
        f"/api/todo-items/{iid}/toggle-complete"
    ).status_code == 200
    assert api_client.delete(f"/api/todo-items/{iid}").status_code == 204


# --- ROLE CHANGE (admin gate stays enforced) --------------------------------

@pytest.mark.asyncio
async def test_role_change_endpoint_rejects_non_admin():
    """The approve-user (role/permission change) handler must 403 a
    non-admin caller. The router is only mounted when GOOGLE_CLIENT_ID is
    configured, so we exercise the handler directly to prove the permission
    gate (``is_admin``) guards the mutation regardless of mounting."""
    from fastapi import HTTPException

    from app.routes.auth_google import approve_pending_user

    non_admin = types.SimpleNamespace(
        id=5, email="nobody@example.com", role=None, permissions=None
    )
    with pytest.raises(HTTPException) as exc:
        await approve_pending_user(
            user_id=9, permissions="read-only", db=None, current_user=non_admin
        )
    assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_role_change_endpoint_allows_admin(monkeypatch):
    """An admin (by role) passes the gate; we stub the DB-touching service so
    the test stays at the authorization layer."""
    import app.routes.auth_google as ag
    from app.models.user_oauth import OAuthUser, UserRole

    approved = types.SimpleNamespace(id=9, email="approved@example.com")

    async def _fake_approve_user(db, user_id, permissions):
        return approved

    monkeypatch.setattr(ag, "approve_user", _fake_approve_user)

    admin = types.SimpleNamespace(
        id=1, email="admin@example.com", role=UserRole.ADMIN, permissions=None
    )
    result = await ag.approve_pending_user(
        user_id=9, permissions="read-only", db=None, current_user=admin
    )
    assert result is approved
    # Sanity: the imported OAuthUser shape is what the gate reasons about.
    assert hasattr(OAuthUser, "role")


# --- USER PROFILE UPDATE (POST /api/users/profile) --------------------------
# Step 2 of the audit: this mutation resolved no caller identity, so it could
# never enforce "a user may only update their own profile". It now resolves the
# caller from the token (get_optional_user_id) — never the body — and persists
# only onto that user's own row, while staying anonymous-safe (sanitize+echo).


@pytest_asyncio.fixture
async def seeded_db():
    """Per-test in-memory engine with two real User rows (ids assigned by the
    DB). Yields (factory, user_a_id, user_b_id)."""
    from app.models.user import User

    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as db:
        a = User(email="a@example.com", username="a", hashed_password="x")
        b = User(email="b@example.com", username="b", hashed_password="x")
        db.add_all([a, b])
        await db.commit()
        await db.refresh(a)
        await db.refresh(b)
        ids = (a.id, b.id)

    async def _get_db():
        async with factory() as session:
            yield session

    app.dependency_overrides[get_db] = _get_db
    try:
        yield factory, ids[0], ids[1]
    finally:
        app.dependency_overrides.pop(get_db, None)
        await engine.dispose()


@pytest.mark.asyncio
async def test_profile_persists_only_to_authenticated_callers_own_row(seeded_db):
    """An authenticated caller's sanitized profile lands on THEIR row — and
    there is no body/path field through which another user could be targeted."""
    from app.models.user import User

    factory, uid_a, uid_b = seeded_db
    _as_user(uid_a)
    client = TestClient(app)

    r = client.post(
        "/api/users/profile",
        json={"bio": "<script>x</script>hello", "display_name": "Alice"},
    )
    assert r.status_code == 200, r.text
    assert "<script>" not in r.json()["bio"]

    # Persisted onto user A (sanitized), and user B is completely untouched.
    async with factory() as db:
        a = (await db.execute(select(User).where(User.id == uid_a))).scalar_one()
        b = (await db.execute(select(User).where(User.id == uid_b))).scalar_one()
    assert a.display_name == "Alice"
    assert a.bio is not None and "<script>" not in a.bio
    assert b.bio is None and b.display_name is None


@pytest.mark.asyncio
async def test_profile_anonymous_caller_sanitizes_but_does_not_persist(seeded_db):
    """Anonymous (login-bypass → user 0) still gets a 200 sanitize+echo and
    writes to nobody's row — the verifier probe path stays intact."""
    from app.models.user import User

    factory, uid_a, uid_b = seeded_db
    _as_user(0)
    client = TestClient(app)

    r = client.post("/api/users/profile", json={"bio": "anon", "display_name": "z"})
    assert r.status_code == 200
    assert r.json()["sanitized"] is True

    async with factory() as db:
        rows = (await db.execute(select(User))).scalars().all()
    assert all(u.bio is None and u.display_name is None for u in rows)


# --- PLANNER (POST /api/planner/generate) -----------------------------------
# The handler trusted payload.user_id, so any caller could read another
# tenant's tasks by passing their id. Identity now comes from the token.


@pytest.mark.asyncio
async def test_planner_scopes_to_token_identity_ignoring_body_user_id(seeded_db):
    """A caller resolved as user A cannot read user B's plan by putting
    user_id=B in the body — the body field is ignored."""
    from app.models.task import Task

    factory, uid_a, uid_b = seeded_db
    async with factory() as db:
        db.add_all([
            Task(title="A-task", user_id=uid_a),
            Task(title="B-task", user_id=uid_b),
        ])
        await db.commit()

    _as_user(uid_a)
    client = TestClient(app)
    # Attempt to exfiltrate user B's plan by spoofing the body id.
    r = client.post("/api/planner/generate", json={"user_id": uid_b})
    assert r.status_code == 200, r.text
    titles = {t["title"] for t in r.json().get("tasks", [])}
    assert "A-task" in titles  # own task present
    assert "B-task" not in titles  # other tenant's task NOT leaked
