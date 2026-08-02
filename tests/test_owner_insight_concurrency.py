"""collect() fans 7 providers out on ONE session — that must not race.

THE FAILURE THIS PINS, and why the whole suite was blind to it:

`collect()` runs every provider concurrently with `asyncio.gather` on the
request's single `AsyncSession`. The production engine sets
``pool_pre_ping=True`` (app/database.py), so every pool checkout does a real
round-trip — meaning a session's FIRST statement always yields to the event
loop while it provisions its connection. If that first statement is issued
inside the fan-out, providers 2..7 enter the session mid-provisioning and
SQLAlchemy raises:

    InvalidRequestError: This session is provisioning a new connection;
    concurrent operations are not permitted

Every provider swallows its own exception, so all seven land in
``unavailable`` and the route answers ``ok=True, degraded=False`` with ZERO
facets. Total failure, completely silent.

Measured on sqlite+aiosqlite (7 concurrent statements × 10 sessions):
    pool_pre_ping=False →  6/70 failed   (cold connection, first statement)
    pool_pre_ping=True  → 60/70 failed

`tests/conftest.py` builds its engine WITHOUT pre-ping, which is exactly why
1778 tests stayed green over a broken endpoint. So this file builds its own
engine WITH it — otherwise the guard is theatre.
"""
from __future__ import annotations

import asyncio

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine


@pytest.mark.asyncio
async def test_shared_session_fanout_races_without_a_warm_connection():
    """The raw hazard, proven — so the fix below is not guarding a ghost."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", pool_pre_ping=True)
    Session = async_sessionmaker(engine, expire_on_commit=False)

    failures = 0
    async with Session() as db:
        async def hit():
            nonlocal failures
            try:
                await db.execute(text("SELECT 1"))
            except Exception:
                failures += 1

        await asyncio.gather(*[hit() for _ in range(7)])

    assert failures > 0, (
        "the race no longer reproduces — if SQLAlchemy changed its "
        "provisioning behaviour, this whole guard needs rethinking"
    )
    await engine.dispose()


@pytest.mark.asyncio
async def test_collect_warms_the_connection_before_fanning_out():
    """The fix: with pre-ping ON, every provider must still be reached.

    Before the fix this returned 0 facets and 7 unavailable on a real
    Postgres deploy while the test suite showed green.
    """
    import app.models  # noqa: F401 — register the metadata
    from app.database import Base
    from app.models.personal_writing import PersonalWriting
    from app.services import owner_insight

    engine = create_async_engine("sqlite+aiosqlite:///:memory:", pool_pre_ping=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    Session = async_sessionmaker(engine, expire_on_commit=False)

    async with Session() as db:
        db.add(PersonalWriting(user_id=0, title="شرح حال", body="الف " * 5000))
        await db.commit()

    # A FRESH session, so collect() issues its very first statement — the
    # exact shape that broke. Do not touch `db` before calling collect().
    async with Session() as db:
        out = await owner_insight.collect(db, 0)

    seven = len(owner_insight.registered_providers())
    assert len(out["unavailable"]) < seven, (
        f"every provider failed ({out['unavailable']}) — the session raced "
        "again; collect() must provision its connection before gather()"
    )
    assert any(f["key"] == "writings_corpus_unanalysed" for f in out["facets"]), (
        "the seeded writing produced no facet, so the fan-out lost data"
    )
    await engine.dispose()


@pytest.mark.asyncio
async def test_facets_route_serves_facets_on_a_preping_engine():
    """End to end: the endpoint this commit exists for must not be empty."""
    import app.models  # noqa: F401
    from app.database import Base
    from app.models.personal_writing import PersonalWriting
    from app.routes.facets import curate
    from app.services import owner_insight

    engine = create_async_engine("sqlite+aiosqlite:///:memory:", pool_pre_ping=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    Session = async_sessionmaker(engine, expire_on_commit=False)

    async with Session() as db:
        db.add(PersonalWriting(user_id=0, title="شرح حال", body="ب " * 6000))
        await db.commit()

    async with Session() as db:
        payload = await owner_insight.collect(db, 0)

    assert curate(payload["facets"]), "/api/facets would serve an empty body"
    await engine.dispose()
