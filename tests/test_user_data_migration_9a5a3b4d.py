"""Tests for the anonymous-user data reassignment mechanism (AC3 of the
auth-hardening security task 9a5a3b4d).

These exercise :mod:`app.services.user_data_migration` against the real
SQLAlchemy metadata on an in-memory SQLite DB (the same setup the app's own
``db_session`` fixture uses), so a schema change that adds/removes a
``user_id`` table is reflected automatically.
"""
from __future__ import annotations

import pytest
from sqlalchemy import func, select

from app.dependencies.auth import DEFAULT_ANON_USER_ID
from app.models.finance import Income
from app.models.user_asset import UserAsset
from app.services.user_data_migration import (
    affected_tables,
    count_rows_for_user,
    reassign_user_data,
    tables_with_user_id,
)


# --- discovery -------------------------------------------------------------


def test_discovery_includes_known_user_scoped_tables():
    """The dynamic discovery must pick up the sensitive tables the task names
    (finance/assets/context). If a future refactor drops the ``user_id`` column
    from one of these, this pins that it would be noticed."""
    names = set(affected_tables())
    # finance incomes, user assets, and user context all carry user_id
    assert "incomes" in names
    assert "user_assets" in names
    assert "user_contexts" in names
    # every discovered table genuinely has the column
    for table in tables_with_user_id():
        assert "user_id" in table.c


# --- core reassignment -----------------------------------------------------


@pytest.mark.asyncio
async def test_reassign_moves_rows_from_anon_to_real_user(db_session):
    """Rows owned by user 0 are re-homed onto the target real user."""
    db_session.add_all(
        [
            Income(user_id=DEFAULT_ANON_USER_ID, description="salary", amount=100),
            Income(user_id=DEFAULT_ANON_USER_ID, description="bonus", amount=50),
            UserAsset(user_id=DEFAULT_ANON_USER_ID, name="laptop"),
            # a row already owned by a different real user must be untouched
            Income(user_id=99, description="not mine", amount=7),
        ]
    )
    await db_session.commit()

    report = await reassign_user_data(db_session, target_user_id=42)
    await db_session.commit()

    assert report.get("incomes") == 2
    assert report.get("user_assets") == 1

    # user 0 now owns nothing
    remaining = (
        await db_session.execute(
            select(func.count()).select_from(Income).where(
                Income.user_id == DEFAULT_ANON_USER_ID
            )
        )
    ).scalar_one()
    assert remaining == 0

    # user 42 owns the two migrated incomes
    moved = (
        await db_session.execute(
            select(func.count()).select_from(Income).where(Income.user_id == 42)
        )
    ).scalar_one()
    assert moved == 2

    # the pre-existing real user's row is untouched
    untouched = (
        await db_session.execute(
            select(func.count()).select_from(Income).where(Income.user_id == 99)
        )
    ).scalar_one()
    assert untouched == 1


@pytest.mark.asyncio
async def test_dry_run_reports_but_writes_nothing(db_session):
    """``dry_run=True`` returns the would-change counts without mutating."""
    db_session.add_all(
        [
            Income(user_id=DEFAULT_ANON_USER_ID, description="a", amount=1),
            Income(user_id=DEFAULT_ANON_USER_ID, description="b", amount=2),
        ]
    )
    await db_session.commit()

    report = await reassign_user_data(db_session, target_user_id=5, dry_run=True)
    assert report.get("incomes") == 2

    # nothing actually moved
    still_anon = (
        await db_session.execute(
            select(func.count()).select_from(Income).where(
                Income.user_id == DEFAULT_ANON_USER_ID
            )
        )
    ).scalar_one()
    assert still_anon == 2


@pytest.mark.asyncio
async def test_count_rows_only_lists_nonzero_tables(db_session):
    db_session.add(Income(user_id=DEFAULT_ANON_USER_ID, description="x", amount=1))
    await db_session.commit()
    counts = await count_rows_for_user(db_session, DEFAULT_ANON_USER_ID)
    assert counts.get("incomes") == 1
    # a table with no anon rows must not appear
    assert "user_assets" not in counts


# --- guard rails -----------------------------------------------------------


@pytest.mark.asyncio
async def test_target_equal_source_is_rejected(db_session):
    with pytest.raises(ValueError):
        await reassign_user_data(
            db_session, target_user_id=DEFAULT_ANON_USER_ID, source_user_id=DEFAULT_ANON_USER_ID
        )


@pytest.mark.asyncio
async def test_target_anon_user_is_rejected(db_session):
    """Migrating data INTO user 0 defeats the purpose and is refused."""
    with pytest.raises(ValueError):
        await reassign_user_data(
            db_session, target_user_id=DEFAULT_ANON_USER_ID, source_user_id=7
        )


@pytest.mark.asyncio
async def test_no_matching_rows_returns_empty(db_session):
    report = await reassign_user_data(db_session, target_user_id=3)
    assert report == {}
