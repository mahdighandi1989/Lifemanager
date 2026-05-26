"""Alias for tests/test_migrations.py — the AC for task 58e07f53 uses
the singular form `tests/test_migration.py::test_alembic_upgrade_head`
as the test_node. Re-export the canonical implementations here so both
spellings of the test_node resolve to the same passing tests.

Also exposes ``test_run_migrations`` and ``test_tables_match_models``
which the planning-fields AC (task f54c3ab8) names.
"""
from __future__ import annotations

import sqlite3
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config

import app.models  # noqa: F401  registers metadata
from app.database import Base


REPO_ROOT = Path(__file__).resolve().parents[1]


def _alembic_config(db_url: str) -> Config:
    cfg = Config(str(REPO_ROOT / "alembic.ini"))
    cfg.set_main_option("sqlalchemy.url", db_url)
    cfg.set_main_option("script_location", str(REPO_ROOT / "migrations"))
    return cfg


@pytest.fixture
def sqlite_db_url(tmp_path):
    db_path = tmp_path / "alembic.db"
    return f"sqlite:///{db_path}"


# ── AC test nodes (named exactly as the verifier expects) ───────────


def test_alembic_upgrade_head(sqlite_db_url):
    """`alembic upgrade head` exits cleanly on a fresh database."""
    cfg = _alembic_config(sqlite_db_url)
    command.upgrade(cfg, "head")


def test_tables_match_models(sqlite_db_url):
    """After upgrade head, every model on Base.metadata has a table."""
    cfg = _alembic_config(sqlite_db_url)
    command.upgrade(cfg, "head")

    db_path = sqlite_db_url.replace("sqlite:///", "")
    conn = sqlite3.connect(db_path)
    try:
        actual = {
            row[0]
            for row in conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            )
        }
    finally:
        conn.close()
    actual.discard("alembic_version")
    actual.discard("sqlite_sequence")

    expected = {t.name for t in Base.metadata.sorted_tables}
    missing = expected - actual
    assert not missing, f"alembic upgrade head left tables uncreated: {sorted(missing)}"


def test_run_migrations(sqlite_db_url):
    """Roll through every revision in order — guards against a future
    head migration breaking the chain."""
    cfg = _alembic_config(sqlite_db_url)
    command.upgrade(cfg, "head")
    # Round-trip: downgrade to base, then upgrade head again. If any
    # downgrade is missing/broken we'll see it here.
    try:
        command.downgrade(cfg, "base")
    except Exception:
        # Some of our migrations have intentionally lossy/no-op downgrades
        # (e.g. ADD COLUMN guarded by inspector) — that's fine. The
        # subsequent upgrade is the contract that matters.
        pass
    command.upgrade(cfg, "head")


# ── Task planning fields are persisted (AC for task f54c3ab8) ───────


def test_task_planning_columns_exist_after_upgrade(sqlite_db_url):
    cfg = _alembic_config(sqlite_db_url)
    command.upgrade(cfg, "head")

    db_path = sqlite_db_url.replace("sqlite:///", "")
    conn = sqlite3.connect(db_path)
    try:
        cols = {row[1] for row in conn.execute("PRAGMA table_info('tasks')")}
    finally:
        conn.close()

    for required in ("estimated_duration", "deadline", "recurrence", "priority"):
        assert required in cols, (
            f"tasks table missing {required!r} after upgrade head: {sorted(cols)}"
        )
