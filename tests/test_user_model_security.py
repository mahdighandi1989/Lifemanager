"""User model bio / display_name sanitization — defence-in-depth.

The model's @validates hook now scrubs HTML from both fields on
every assignment, INSERT or UPDATE (see app/models/user.py).
This is layered behind the route-layer bleach.clean — even a
future code path that bypasses the route (Celery task, admin
script, test fixture, etc.) cannot store an XSS payload.
"""
from __future__ import annotations

import pytest
import pytest_asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.database import Base
from app.models.user import User


@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as session:
        yield session
    await engine.dispose()


@pytest.mark.asyncio
async def test_bio_display_name_sanitization_edge_case(db_session):
    """Direct ORM writes also get scrubbed.

    Bypass the route layer entirely — construct a User instance
    with an XSS payload in `bio` AND in `display_name`, persist,
    and read back. The @validates hook must have stripped the
    script tags by the time the row lands in the DB.
    """
    payload_bio = (
        "<script>alert('xss-in-bio')</script>"
        "Welcome to my profile."
        "<img src=x onerror='alert(1)'>"
    )
    payload_name = "<b>Cool</b><script>alert('xss-in-name')</script>User"

    u = User(
        email="edge@example.com",
        username="edge",
        hashed_password="x" * 60,
        bio=payload_bio,
        display_name=payload_name,
    )
    db_session.add(u)
    await db_session.commit()
    await db_session.refresh(u)

    # No <script> survives, regardless of where the field was set.
    assert "<script>" not in (u.bio or "")
    assert "<script>" not in (u.display_name or "")
    # The onerror attribute (an XSS vector even without <script>)
    # is also stripped.
    assert "onerror" not in (u.bio or "")
    # The benign plain-text content survives.
    assert "Welcome to my profile" in u.bio
    assert "User" in u.display_name

    # Re-read from DB to confirm the SCRUBBED value is what was
    # persisted (not just what the in-memory object shows).
    row = (
        await db_session.execute(select(User).where(User.email == "edge@example.com"))
    ).scalar_one()
    assert "<script>" not in (row.bio or "")
    assert "<script>" not in (row.display_name or "")
    assert "onerror" not in (row.bio or "")


@pytest.mark.asyncio
async def test_bio_display_name_accept_none(db_session):
    """None passes through unchanged — Optional contract preserved."""
    u = User(
        email="none@example.com",
        username="nonebio",
        hashed_password="x" * 60,
        bio=None,
        display_name=None,
    )
    db_session.add(u)
    await db_session.commit()
    await db_session.refresh(u)
    assert u.bio is None
    assert u.display_name is None
