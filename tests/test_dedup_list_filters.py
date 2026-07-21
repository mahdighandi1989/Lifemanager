"""Merged-away rows must not re-surface in the list endpoints.

The DeduplicationService / MergeManagement tool soft-deletes a duplicate by
marking it (``Task.merged_into_id`` set, ``Project.is_active=False``) rather
than hard-deleting it (CLAUDE.md rule 2 — reversible). Before this batch the
list endpoints ignored those markers, so the owner still saw both the survivor
AND the merged duplicate — the merge tool looked like a no-op. These tests pin
that a merged row disappears from the list while every un-merged / legacy row
stays visible, and that creating the same project twice converges on one row.

A shared in-memory engine backs both the API client and a direct session so a
test can plant a merged row (a state the public API can't express) and then
observe the list endpoint through the real route.
"""
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.database import Base, get_db
from app.main import app
from app.models.project import Project
from app.models.task import Task, TaskStatus


@pytest_asyncio.fixture
async def client_and_session():
    """TestClient + AsyncSession sharing ONE in-memory engine.

    conftest's ``api_client`` and ``db_session`` each spin up their own engine,
    so state written through one is invisible to the other. Here both hang off
    the same factory so a row planted via the session is served by the route.
    """
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def _get_db():
        async with factory() as session:
            yield session

    app.dependency_overrides[get_db] = _get_db
    session = factory()
    try:
        yield TestClient(app), session
    finally:
        await session.close()
        app.dependency_overrides.clear()
        await engine.dispose()


# --- projects ---------------------------------------------------------------

@pytest.mark.asyncio
async def test_list_projects_hides_merged_source(client_and_session):
    client, session = client_and_session
    survivor = Project(name="alpha", user_id=0, is_active=True)
    merged = Project(name="alpha (dup)", user_id=0, is_active=False)
    session.add_all([survivor, merged])
    await session.commit()

    names = {p["name"] for p in client.get("/api/projects/").json()}
    assert "alpha" in names            # survivor stays
    assert "alpha (dup)" not in names  # merged-away hidden


@pytest.mark.asyncio
async def test_list_projects_keeps_legacy_null_is_active(client_and_session):
    """A row whose is_active is NULL (pre-dedup legacy) must NOT vanish —
    only an explicit False (a merge) hides a project."""
    client, session = client_and_session
    legacy = Project(name="legacy", user_id=0, is_active=None)
    session.add(legacy)
    await session.commit()

    names = {p["name"] for p in client.get("/api/projects/").json()}
    assert "legacy" in names


# --- tasks ------------------------------------------------------------------

@pytest.mark.asyncio
async def test_list_tasks_hides_merged_source(client_and_session):
    client, session = client_and_session
    survivor = Task(title="ring the dentist", user_id=0, status=TaskStatus.TODO)
    merged = Task(
        title="call dentist", user_id=0, status=TaskStatus.TODO, merged_into_id=1
    )
    session.add_all([survivor, merged])
    await session.commit()

    titles = {t["title"] for t in client.get("/api/tasks/").json()}
    assert "ring the dentist" in titles   # survivor stays
    assert "call dentist" not in titles   # merged-away hidden


# --- idempotent create ------------------------------------------------------

@pytest.mark.asyncio
async def test_create_project_is_idempotent_by_name(client_and_session):
    client, _ = client_and_session
    first = client.post("/api/projects/", json={"name": "test project"})
    second = client.post("/api/projects/", json={"name": "test project"})
    assert first.status_code == 201
    assert second.json()["id"] == first.json()["id"]   # same row, no duplicate
    listed = [p for p in client.get("/api/projects/").json() if p["name"] == "test project"]
    assert len(listed) == 1
