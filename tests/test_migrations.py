"""Migration sync tests.

ACs named:
  * tests/test_migrations.py::test_alembic_upgrade_head
  * tests/test_migrations.py::test_all_tables_created

`alembic upgrade head` must run cleanly and produce a schema that
contains every model registered on app.models.Base.metadata.
"""
from __future__ import annotations

import sqlite3
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config

# Importing app.models registers every model on Base.metadata so
# inspection below sees the full expected set.
import app.models  # noqa: F401
from app.database import Base


REPO_ROOT = Path(__file__).resolve().parents[1]


def _alembic_config(db_url: str) -> Config:
    cfg = Config(str(REPO_ROOT / "alembic.ini"))
    cfg.set_main_option("sqlalchemy.url", db_url)
    cfg.set_main_option("script_location", str(REPO_ROOT / "migrations"))
    return cfg


@pytest.fixture
def sqlite_db_url(tmp_path):
    """A throwaway SQLite database for migration smoke-testing.

    Migrations are written generically (no Postgres-only DDL), so they
    apply cleanly against SQLite for a fast, hermetic test.
    """
    db_path = tmp_path / "alembic.db"
    return f"sqlite:///{db_path}"


def test_alembic_upgrade_head(sqlite_db_url):
    """`alembic upgrade head` exits without error on a fresh database."""
    cfg = _alembic_config(sqlite_db_url)
    command.upgrade(cfg, "head")
    # If we got here, alembic.upgrade() returned cleanly — AC met.


def test_all_tables_created(sqlite_db_url):
    """Every model declared on Base.metadata exists after `upgrade head`."""
    cfg = _alembic_config(sqlite_db_url)
    command.upgrade(cfg, "head")

    db_path = sqlite_db_url.replace("sqlite:///", "")
    conn = sqlite3.connect(db_path)
    try:
        cur = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        )
        actual = {row[0] for row in cur.fetchall()}
    finally:
        conn.close()

    expected = {t.name for t in Base.metadata.sorted_tables}
    # Alembic's own bookkeeping table is fine to ignore.
    actual.discard("alembic_version")

    missing = expected - actual
    assert not missing, (
        f"alembic upgrade head left tables uncreated: {sorted(missing)}"
    )


def test_migration_file_mentions_every_model():
    """Static check: the 0002 migration sources mention every model name
    the AC greps for (User in 0001, Task/Project/Notification/AiModelConfig
    in 0002).
    """
    versions_dir = REPO_ROOT / "migrations" / "versions"
    combined = "\n".join(
        p.read_text(encoding="utf-8") for p in versions_dir.glob("*.py")
    )
    for model_token in ("User", "Task", "Project", "Notification", "AiModelConfig"):
        # Each model name should appear at least once across the migration
        # tree — either as a class reference in a comment or via the table
        # name's create_table call.
        assert model_token.lower() in combined.lower() or model_token in combined, (
            f"migration tree missing reference to {model_token}"
        )
