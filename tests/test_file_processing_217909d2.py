"""Gap coverage for file processing & content analysis (audit task 217909d2).

The bulk of this task was already built + tested (test_asset_scan, test_assets_route,
test_data_ingestion_and_recommendations, test_asset_linker, test_local_files). These
close the remaining ACs: movie-list filter (AC2), external-drive detection (AC6),
and dynamic deletion reconcile (AC3 / Step 7).
"""
from __future__ import annotations

import os

import pytest

from app.services.asset_scan_service import detect_external_drives


# ── AC2: movie list from a folder ───────────────────────────────────


def test_scan_then_filter_movies(api_client, tmp_path):
    movies = tmp_path / "Movies"
    movies.mkdir()
    (movies / "Inception.mp4").write_text("x")
    (movies / "notes.txt").write_text("y")

    scan = api_client.post("/api/assets/scan", json={"path": str(movies)})
    assert scan.status_code == 200, scan.text

    got = api_client.get("/api/assets", params={"asset_type": "movie"})
    assert got.status_code == 200
    names = [a["name"] for a in got.json()]
    assert "Inception.mp4" in names
    assert "notes.txt" not in names  # filtered out (it's a document)


# ── AC4: smart asset↔task suggestions ───────────────────────────────


def test_task_suggestions_surfaces_matching_asset(api_client, tmp_path):
    movies = tmp_path / "Movies"
    movies.mkdir()
    (movies / "Inception.mp4").write_text("x")
    api_client.post("/api/assets/scan", json={"path": str(movies)})

    task = api_client.post(
        "/api/tasks", json={"title": "Watch Inception tonight"}
    )
    assert task.status_code in (200, 201), task.text

    r = api_client.get("/api/assets/task-suggestions")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["count"] >= 1
    names = [s["asset_name"] for s in body["suggestions"]]
    assert "Inception.mp4" in names


def test_task_suggestions_empty_when_no_match(api_client, tmp_path):
    movies = tmp_path / "Movies2"
    movies.mkdir()
    (movies / "Inception.mp4").write_text("x")
    api_client.post("/api/assets/scan", json={"path": str(movies)})

    api_client.post("/api/tasks", json={"title": "Buy groceries"})

    r = api_client.get("/api/assets/task-suggestions")
    assert r.status_code == 200
    assert r.json()["count"] == 0


# ── AC6: external-drive detection ───────────────────────────────────


def test_detect_external_drives_via_injected_provider():
    class _Part:
        def __init__(self, mountpoint, opts):
            self.mountpoint = mountpoint
            self.opts = opts

    def provider():
        return [_Part("/media/usb0", "rw,removable"), _Part("/", "rw,fixed")]

    drives = detect_external_drives(_partitions_provider=provider)
    assert "/media/usb0" in drives
    assert "/" not in drives


def test_detect_external_drives_graceful_when_nothing():
    # No psutil on the image + a mount root that doesn't exist → [] (no raise).
    assert detect_external_drives(mount_roots=("/definitely/not/here",)) == []


def test_external_drives_endpoint(api_client):
    r = api_client.get("/api/assets/external-drives")
    assert r.status_code == 200
    assert "drives" in r.json() and isinstance(r.json()["drives"], list)


def test_detect_external_drives_scans_mount_root(tmp_path):
    root = tmp_path / "media"
    (root / "USBDRIVE").mkdir(parents=True)
    drives = detect_external_drives(mount_roots=(str(root),))
    assert any(d.endswith("USBDRIVE") for d in drives)


# ── AC3 / Step 7: dynamic add + delete reconcile ────────────────────


@pytest.mark.asyncio
async def test_ingestion_add_then_remove_reconcile(db_session):
    from app.services.data_ingestion_service import DataIngestionService

    svc = DataIngestionService(db_session)
    scanned = await svc.scan_external_source(["/data/a.txt", "/data/b.txt"])
    added = await svc.compare_and_ingest_new_data(user_id=1, scanned=scanned)
    assert added["created"] == 2

    # b.txt deleted on disk → reconcile prunes it from the index.
    pruned = await svc.compare_and_remove_deleted(user_id=1, present_paths=["/data/a.txt"])
    assert pruned["removed"] == 1

    from sqlalchemy import select
    from app.models.indexed_data_source_entry import IndexedDataSourceEntry

    rows = (await db_session.execute(
        select(IndexedDataSourceEntry).where(IndexedDataSourceEntry.user_id == 1)
    )).scalars().all()
    assert [r.source_path for r in rows] == ["/data/a.txt"]


@pytest.mark.asyncio
async def test_sync_source_adds_and_prunes(db_session):
    from app.services.data_ingestion_service import DataIngestionService

    svc = DataIngestionService(db_session)
    first = await svc.scan_external_source(["/x/1", "/x/2"])
    await svc.compare_and_ingest_new_data(user_id=2, scanned=first)

    # New scan: /x/2 gone, /x/3 appeared.
    second = await svc.scan_external_source(["/x/1", "/x/3"])
    summary = await svc.sync_source(user_id=2, scanned=second)
    assert summary["created"] == 1  # /x/3
    assert summary["removed"] == 1  # /x/2


# ── Step 2 / AC3: periodic (mobile) sync reconcile via celery beat ───


def test_periodic_sync_task_prunes_vanished_paths(tmp_path, monkeypatch):
    """The scheduled task re-checks indexed paths against disk and prunes the
    ones that vanished — the backend half of the mobile/periodic loop."""
    import asyncio

    from sqlalchemy import select
    from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

    import app.database as database
    from app import tasks
    from app.database import Base
    from app.models.indexed_data_source_entry import IndexedDataSourceEntry

    # File-backed SQLite so the data survives the task's internal asyncio.run.
    db_path = tmp_path / "periodic.db"
    engine = create_async_engine(f"sqlite+aiosqlite:///{db_path}")
    factory = async_sessionmaker(engine, expire_on_commit=False)

    keep = tmp_path / "keep.txt"
    keep.write_text("x")
    gone = tmp_path / "gone.txt"  # never created → should be pruned

    async def _seed():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        async with factory() as db:
            db.add(IndexedDataSourceEntry(user_id=1, source_path=str(keep)))
            db.add(IndexedDataSourceEntry(user_id=1, source_path=str(gone)))
            await db.commit()

    asyncio.run(_seed())

    # The task resolves SessionLocal from app.database at call time.
    monkeypatch.setattr(database, "SessionLocal", factory)

    result = tasks.sync_indexed_file_sources()
    assert result["users"] == 1
    assert result["removed"] == 1

    async def _remaining():
        async with factory() as db:
            rows = (
                await db.execute(select(IndexedDataSourceEntry.source_path))
            ).scalars().all()
        await engine.dispose()
        return rows

    assert asyncio.run(_remaining()) == [str(keep)]
