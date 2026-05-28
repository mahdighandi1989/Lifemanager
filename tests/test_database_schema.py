"""Schema-evolution edge case for init_db / create_all.

Audit task task_882723eb07de (sub-task f46ea7ab) called out
``Base.metadata.create_all`` as an under-engineering anti-pattern:
``create_all`` only *adds* missing tables — it never alters existing
ones. This test pins that exact behaviour so a future reader doesn't
mistake the helper for a migration tool.

Scenario:
    1. Build a metadata snapshot with a narrow "users" table (one
       column).
    2. create_all it onto an in-memory SQLite engine, insert a row.
    3. Build a *wider* metadata for the same table (adds a column).
    4. create_all the wider metadata against the SAME engine.
    5. Assert: the new column does NOT appear on the existing table
       (existing data is preserved, but the schema doesn't evolve).
       That demonstrates exactly why production needs alembic.
"""
from __future__ import annotations

import pytest
import pytest_asyncio
from sqlalchemy import Column, Integer, MetaData, String, Table, inspect, select
from sqlalchemy.ext.asyncio import create_async_engine


@pytest_asyncio.fixture
async def engine():
    eng = create_async_engine("sqlite+aiosqlite:///:memory:")
    yield eng
    await eng.dispose()


@pytest.mark.asyncio
async def test_schema_evolution_edge_case(engine):
    narrow_meta = MetaData()
    narrow_users = Table(
        "users_evo",
        narrow_meta,
        Column("id", Integer, primary_key=True),
        Column("email", String, nullable=False),
    )

    async with engine.begin() as conn:
        await conn.run_sync(narrow_meta.create_all)
        await conn.execute(
            narrow_users.insert().values(id=1, email="legacy@example.com")
        )

    wider_meta = MetaData()
    Table(
        "users_evo",
        wider_meta,
        Column("id", Integer, primary_key=True),
        Column("email", String, nullable=False),
        Column("display_name", String(120), nullable=True),
    )

    async with engine.begin() as conn:
        await conn.run_sync(wider_meta.create_all)

    def _read_columns(sync_conn):
        return {c["name"] for c in inspect(sync_conn).get_columns("users_evo")}

    async with engine.connect() as conn:
        cols = await conn.run_sync(_read_columns)
        result = await conn.execute(
            select(narrow_users.c.id, narrow_users.c.email).where(narrow_users.c.id == 1)
        )
        row = result.one()

    assert "display_name" not in cols, (
        "create_all silently widened the schema — that would mask the very "
        "anti-pattern this test exists to document. Update the docstring on "
        "app/database.py::init_db if this ever changes."
    )
    assert row.email == "legacy@example.com"
