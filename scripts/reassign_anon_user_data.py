#!/usr/bin/env python3
"""Operator CLI to re-home anonymous (user-0) data onto a real account.

Security task 9a5a3b4d, AC3. This is the runnable front-end for
:mod:`app.services.user_data_migration`. The migration *mechanism* is fully
automated; the one manual input is the target account id, passed here.

Usage
-----
Preview what would move (no writes)::

    python -m scripts.reassign_anon_user_data --target 5 --dry-run

Perform the reassignment of user 0's data onto account 5::

    python -m scripts.reassign_anon_user_data --target 5

Re-home some *other* source user's rows (rarely needed)::

    python -m scripts.reassign_anon_user_data --source 7 --target 5

The whole reassignment runs in a single transaction: it either fully succeeds
and commits, or rolls back leaving the DB untouched. Run ``--dry-run`` first.

⚠️ Run AFTER the real account exists and BEFORE flipping ``REQUIRE_AUTH=true``,
so the anonymous data has an owner once anonymous access is refused.
"""
from __future__ import annotations

import argparse
import asyncio
import sys

from app.database import SessionLocal
from app.dependencies.auth import DEFAULT_ANON_USER_ID
from app.services.user_data_migration import reassign_user_data


def _parse_args(argv=None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument(
        "--target",
        type=int,
        required=True,
        help="real user id that inherits the anonymous data",
    )
    p.add_argument(
        "--source",
        type=int,
        default=DEFAULT_ANON_USER_ID,
        help=f"user id to migrate from (default: {DEFAULT_ANON_USER_ID}, the anon user)",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="report the per-table row counts that would change, write nothing",
    )
    return p.parse_args(argv)


async def _run(args: argparse.Namespace) -> int:
    async with SessionLocal() as db:
        report = await reassign_user_data(
            db,
            target_user_id=args.target,
            source_user_id=args.source,
            dry_run=args.dry_run,
        )
        if args.dry_run:
            print(f"DRY RUN — rows owned by user {args.source} (no changes made):")
        else:
            await db.commit()
            print(f"Reassigned rows from user {args.source} → user {args.target}:")

    if not report:
        print("  (no matching rows)")
        return 0
    total = 0
    for table, n in sorted(report.items()):
        print(f"  {table:<32} {n}")
        total += n
    print(f"  {'TOTAL':<32} {total}")
    return 0


def main(argv=None) -> int:
    args = _parse_args(argv)
    try:
        return asyncio.run(_run(args))
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
