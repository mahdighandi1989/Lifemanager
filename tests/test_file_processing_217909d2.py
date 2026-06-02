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
