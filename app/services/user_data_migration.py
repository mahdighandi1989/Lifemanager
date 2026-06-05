"""Reassign user-scoped rows from the anonymous default user to a real account.

Security task 9a5a3b4d, AC3 ("داده‌های کاربر 0 به کاربران واقعی منتقل شوند" —
migrate user 0's data to real users).

Background
----------
While the frontend ran in login-bypass mode, every user-scoped route resolved
anonymous traffic to :data:`app.dependencies.auth.DEFAULT_ANON_USER_ID` (user
``0``) — see :func:`app.dependencies.auth.get_optional_user_id`. Real rows
therefore accumulated under ``user_id = 0``. Once real accounts exist and the
operator flips ``REQUIRE_AUTH=true``, that legacy data would become orphaned
(no real account owns it). This module is the *mechanism* that re-homes it.

What is automatable vs. manual
------------------------------
The **mechanism** (which tables carry a ``user_id``, how to rewrite them, how to
do it transactionally with a dry-run preview) is fully automated here. The only
genuinely manual input is the *decision* of which real account inherits the
anonymous data — that is a single integer (``target_user_id``) the operator
passes in. There is no way to infer it from the data, so the caller supplies it
(CLI: ``scripts/reassign_anon_user_data.py``; or programmatically).

Design notes
------------
* Tables are discovered **dynamically** from ``Base.metadata`` — any table with
  a column literally named ``user_id`` is included. This keeps the migration
  correct as the schema grows; a new user-scoped model is picked up with no
  edit here. (See :func:`tables_with_user_id`.)
* The whole reassignment runs inside the caller's transaction, so a failure
  partway through rolls everything back — no table is left half-migrated.
* ``dry_run=True`` reports the per-table row counts that *would* change without
  writing anything, so the operator can eyeball the blast radius first.
"""
from __future__ import annotations

from typing import Dict, List

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import Base
from app.dependencies.auth import DEFAULT_ANON_USER_ID

# Importing app.models for its side effect: it imports every model module, which
# is what populates Base.metadata with the full table set. Without this, a
# freshly-imported process would only see the handful of tables whose modules
# happened to be imported already, and the migration would silently skip tables.
import app.models  # noqa: F401


def tables_with_user_id():
    """Yield every mapped table that has a column literally named ``user_id``.

    Discovery is metadata-driven so the set stays correct as models are added:
    define a new user-scoped table with a ``user_id`` column and it is migrated
    automatically, no change to this module required.
    """
    for table in Base.metadata.sorted_tables:
        if "user_id" in table.c:
            yield table


async def count_rows_for_user(db: AsyncSession, source_user_id: int) -> Dict[str, int]:
    """Return ``{table_name: row_count}`` for rows owned by ``source_user_id``.

    Only tables with a positive count are included, so the result doubles as a
    concise preview of what a reassignment would touch.
    """
    counts: Dict[str, int] = {}
    for table in tables_with_user_id():
        stmt = select(func.count()).select_from(table).where(
            table.c.user_id == source_user_id
        )
        n = (await db.execute(stmt)).scalar_one()
        if n:
            counts[table.name] = int(n)
    return counts


async def reassign_user_data(
    db: AsyncSession,
    *,
    target_user_id: int,
    source_user_id: int = DEFAULT_ANON_USER_ID,
    dry_run: bool = False,
) -> Dict[str, int]:
    """Move every user-scoped row from ``source_user_id`` to ``target_user_id``.

    Parameters
    ----------
    target_user_id:
        The real account that inherits the anonymous data. This is the single
        manual decision — the caller (operator) must choose it.
    source_user_id:
        The owner whose rows are reassigned. Defaults to the anonymous user
        (``0``), which is the whole point of the task, but is parameterised so
        the same mechanism can re-home any user's data.
    dry_run:
        When ``True``, compute and return the per-table counts that *would*
        change but issue no ``UPDATE`` and leave the transaction untouched.

    Returns
    -------
    ``{table_name: rows_affected}`` for every table that had at least one
    matching row. Sums to the total number of rows moved.

    Raises
    ------
    ValueError
        If ``target_user_id == source_user_id`` (a no-op that almost always
        signals operator error) or ``target_user_id`` is the anon sentinel
        (migrating *into* user 0 defeats the purpose).

    The caller owns the transaction boundary. On the happy path callers should
    ``await db.commit()``; on any exception the partial work rolls back with the
    surrounding ``async with`` / ``rollback``.
    """
    if target_user_id == source_user_id:
        raise ValueError(
            f"target_user_id ({target_user_id}) must differ from "
            f"source_user_id ({source_user_id})"
        )
    if target_user_id == DEFAULT_ANON_USER_ID:
        raise ValueError(
            "refusing to reassign data INTO the anonymous user "
            f"({DEFAULT_ANON_USER_ID}); choose a real account"
        )

    if dry_run:
        return await count_rows_for_user(db, source_user_id)

    affected: Dict[str, int] = {}
    for table in tables_with_user_id():
        stmt = (
            update(table)
            .where(table.c.user_id == source_user_id)
            .values(user_id=target_user_id)
        )
        result = await db.execute(stmt)
        # rowcount is reliable for UPDATE on the drivers we use (asyncpg,
        # aiosqlite). Guard against -1/None just in case a driver can't report.
        rc = result.rowcount if result.rowcount is not None and result.rowcount >= 0 else 0
        if rc:
            affected[table.name] = int(rc)
    return affected


def affected_tables() -> List[str]:
    """Names of every table the migration considers — handy for docs/tests."""
    return [t.name for t in tables_with_user_id()]
