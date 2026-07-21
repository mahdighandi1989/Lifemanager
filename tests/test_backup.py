"""پشتیبان‌گیری خودکار — full-table export, Drive-degraded local fallback,
once-per-day tick, and the /api/backup endpoints.

Covers: every metadata table exported JSON-safe (date proven via a TodoItem
due_date), run_backup degrading to a local gzip file + status blob update,
backup_tick's once-per-UTC-day gate, local retention cap, and the three
routes (status / run / export).
"""
import asyncio
import gzip
import json
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import pytest
from sqlalchemy import text as _sql_text

from app.main import app as _app
from app.services import backup_service

# The router is wired in app/main.py's "Include routers" block; until that
# lands, mount it here so the endpoint tests exercise the real app pipeline.
# The routes must sit BEFORE the SPA catch-all ("/{full_path:path}") — the
# same ordering main.py's router block guarantees — or the catch-all wins.
if not any(getattr(r, "path", None) == "/api/backup/status" for r in _app.routes):
    from app.routes.backup import router as _backup_router

    _before = len(_app.router.routes)
    _app.include_router(_backup_router, tags=["backup"])
    _added = _app.router.routes[_before:]
    del _app.router.routes[_before:]
    _idx = next(
        (
            i
            for i, r in enumerate(_app.router.routes)
            if getattr(r, "path", None) == "/{full_path:path}"
        ),
        len(_app.router.routes),
    )
    _app.router.routes[_idx:_idx] = _added


@pytest.fixture(autouse=True)
def _isolated_backup_env(tmp_path, monkeypatch):
    """Local fallback writes go to tmp_path; Drive is deterministically offline
    (no live client, no env refresh-token fallback leaking in from the host)."""
    monkeypatch.setattr(backup_service, "BACKUPS_DIR", tmp_path / "backups")

    async def _no_client(db):
        return None

    monkeypatch.setattr(
        "app.services.google_api_client.build_drive_client", _no_client
    )
    monkeypatch.delenv("GOOGLE_DRIVE_REFRESH_TOKEN", raising=False)
    monkeypatch.delenv("GOOGLE_SHEETS_REFRESH_TOKEN", raising=False)


def _run_sql(statement):
    from app.database import get_db

    override = _app.dependency_overrides[get_db]

    async def _go():
        agen = override()
        session = await agen.__anext__()
        try:
            await session.execute(_sql_text(statement))
            await session.commit()
        finally:
            await agen.aclose()

    asyncio.run(_go())


# ── service layer ────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_export_all_tables_covers_every_table_json_safe(db_session):
    from app.database import Base
    from app.models.todo_item import TodoItem

    db_session.add(TodoItem(content="ردیف پشتیبان", due_date=date(2026, 7, 1)))
    await db_session.commit()

    export = await backup_service.export_all_tables(db_session)

    # every registered table is present, with matching counts
    assert set(export["tables"]) == {t.name for t in Base.metadata.sorted_tables}
    assert set(export["counts"]) == set(export["tables"])
    assert export["counts"]["todo_items"] == 1
    # date serialized to isoformat; whole payload round-trips through json
    row = export["tables"]["todo_items"][0]
    assert row["due_date"] == "2026-07-01"
    assert row["content"] == "ردیف پشتیبان"
    json.dumps(export, ensure_ascii=False)  # must not raise
    assert export["exported_at"]


@pytest.mark.asyncio
async def test_run_backup_degrades_to_local_file_and_updates_status(db_session):
    from app.models.todo_item import TodoItem

    db_session.add(TodoItem(content="پشتیبان محلی", due_date=date(2026, 7, 2)))
    await db_session.commit()

    result = await backup_service.run_backup(db_session)

    assert result["ok"] is True and result["success"] is True
    assert result["degraded"] is True
    assert result["drive_file_id"] is None
    assert result["file_name"].startswith("lifemanager-backup-")
    assert result["file_name"].endswith(".json.gz")

    local = Path(result["local_path"])
    assert local.exists() and local.name == result["file_name"]
    assert local.parent == Path(backup_service.BACKUPS_DIR)
    assert result["size_bytes"] == local.stat().st_size

    data = json.loads(gzip.decompress(local.read_bytes()).decode("utf-8"))
    assert data["counts"]["todo_items"] == 1
    assert data["tables"]["todo_items"][0]["due_date"] == "2026-07-02"

    status = await backup_service.get_status(db_session)
    # Local-only (Drive offline) is degraded: last_local_at is stamped but
    # last_ok_at / has_durable_backup are NOT (2026-07-20 review).
    assert status["last_ok_at"] is None
    assert status["last_local_at"] is not None
    assert status["has_durable_backup"] is False
    assert status["is_stale"] is True
    assert status["last_attempt_at"] is not None
    assert status["last_file_name"] == result["file_name"]
    assert status["last_size_bytes"] == result["size_bytes"]
    assert status["last_counts_total"] == sum(result["counts"].values())
    assert status["drive_configured"] is False


@pytest.mark.asyncio
async def test_backup_tick_runs_at_most_once_per_utc_day(db_session):
    now = datetime(2026, 7, 20, 3, 0, tzinfo=timezone.utc)

    first = await backup_service.backup_tick(db_session, now=now)
    assert first["ok"] is True and "skipped" not in first

    second = await backup_service.backup_tick(db_session, now=now + timedelta(hours=5))
    assert second["ok"] is True
    assert second["skipped"] == "already_ran_today"

    next_day = await backup_service.backup_tick(db_session, now=now + timedelta(days=1))
    assert next_day["ok"] is True and "skipped" not in next_day


@pytest.mark.asyncio
async def test_local_retention_keeps_at_most_14_files(db_session):
    directory = Path(backup_service.BACKUPS_DIR)
    directory.mkdir(parents=True, exist_ok=True)
    for i in range(20):  # older (lexicographically smaller) than any real file
        (directory / f"lifemanager-backup-20200101-0000{i:02d}.json.gz").write_bytes(b"x")

    result = await backup_service.run_backup(db_session)
    assert result["ok"] is True

    files = sorted(directory.glob("lifemanager-backup-*.json.gz"))
    assert len(files) == backup_service.MAX_LOCAL_BACKUPS
    assert files[-1].name == result["file_name"]  # newest (the real one) kept


# ── endpoints ────────────────────────────────────────────────────────────────
def test_backup_status_endpoint(api_client):
    r = api_client.get("/api/backup/status")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["ok"] is True and body["success"] is True
    status = body["status"]
    assert status["is_stale"] is True  # no backup has ever run
    assert status["drive_configured"] is False
    assert status["last_ok_at"] is None


def test_backup_run_endpoint_then_status_reflects_it(api_client):
    r = api_client.post("/api/backup/run")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["ok"] is True and body["success"] is True
    assert body["degraded"] is True  # Drive offline in tests
    assert body["file_name"].startswith("lifemanager-backup-")
    assert body["size_bytes"] > 0
    assert Path(body["local_path"]).exists()

    status = api_client.get("/api/backup/status").json()["status"]
    assert status["last_file_name"] == body["file_name"]
    # A LOCAL-only (degraded) backup is not durable — it must NOT clear
    # is_stale or claim a durable backup (2026-07-20 review).
    assert status["is_stale"] is True
    assert status["has_durable_backup"] is False
    assert status["last_local_at"]


def test_backup_export_endpoint_returns_raw_json(api_client):
    _run_sql(
        "INSERT INTO todo_items (content, is_completed, is_starred, type, due_date) "
        "VALUES ('row-for-export', 0, 0, 'task', '2026-07-03')"
    )
    r = api_client.get("/api/backup/export")
    assert r.status_code == 200, r.text
    assert r.headers["content-type"].startswith("application/json")
    assert "attachment" in r.headers.get("content-disposition", "")
    assert "lifemanager-backup-" in r.headers.get("content-disposition", "")

    data = r.json()
    assert data.get("secrets_redacted") is True  # manual download masks creds
    assert data["counts"]["todo_items"] == 1
    row = data["tables"]["todo_items"][0]
    assert row["content"] == "row-for-export"
    assert row["due_date"] == "2026-07-03"


def test_backup_endpoints_require_auth_when_configured(api_client, monkeypatch):
    """Flipping REQUIRE_AUTH=true (the owner-actions remediation) must
    actually close the full-DB export/run to anonymous callers — the
    critical hole the 2026-07-20 review found."""
    from app.config import settings as _settings

    monkeypatch.setattr(_settings, "REQUIRE_AUTH", True)
    assert api_client.get("/api/backup/export").status_code == 401
    assert api_client.post("/api/backup/run").status_code == 401
    assert api_client.get("/api/backup/status").status_code == 401


def test_backup_export_redacts_credentials(api_client):
    """The manual HTTP download masks password hashes / encrypted keys."""
    _run_sql(
        "INSERT INTO users (email, username, hashed_password, is_active) "
        "VALUES ('x@y.z', 'x', 'bcrypt$secret$hash', 1)"
    )
    data = api_client.get("/api/backup/export").json()
    users = data["tables"].get("users", [])
    assert users and all(
        u.get("hashed_password") == "***redacted***" for u in users
    )
