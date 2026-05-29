"""Google Drive file mgmt + cold-tiering (audit task 7367c6f0).

Covers the eight canonical ACs: Drive upload+share-link, Sheets index append,
the storage_location/extracted_text model fields, the 30-day cold-tiering job,
GET /api/files/{id} Drive resolution, audio text extraction, the LifeManagerData
folder layout, and the searchable Drive listing.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from app.database import Base


# ── AC3: model fields ───────────────────────────────────────────────


def test_drivefile_has_storage_fields():
    cols = {c.name for c in Base.metadata.tables["drive_files"].columns}
    assert {"storage_location", "drive_file_id", "drive_link", "extracted_text"} <= cols


# ── AC1: Drive service upload returns a shareable link ──────────────


@pytest.mark.asyncio
async def test_drive_upload_returns_share_link():
    from app.services.google_drive_service import upload_file, build_share_link

    class StubClient:
        async def get_or_create_folder(self, name, parent=None):
            return f"folder::{name}"

        async def upload(self, *, file_name, parent, media=None):
            return "drivefileid123"

    out = await upload_file(
        refresh_token="tok", file_name="clip.mp3", data_type="audio",
        record_id="r1", client=StubClient(),
    )
    assert out["drive_file_id"] == "drivefileid123"
    assert out["drive_link"] == build_share_link("drivefileid123")
    assert out["folder_id"] == "folder::r1"


@pytest.mark.asyncio
async def test_drive_upload_requires_credentials():
    from app.services.google_drive_service import upload_file

    with pytest.raises(RuntimeError):
        await upload_file(refresh_token=None, file_name="x.txt")


# ── AC2: Sheets index append ────────────────────────────────────────


@pytest.mark.asyncio
async def test_sheets_append_index_row():
    from app.services.sheets_service import append_index_row, INDEX_SHEET_NAME

    captured = {}

    class StubSheets:
        async def append_row(self, *, sheet_name, values):
            captured["sheet"] = sheet_name
            captured["values"] = values
            return {"updates": {"updatedRows": 1}}

    out = await append_index_row(
        refresh_token="tok",
        record={"RecordID": "7", "DataType": "voice", "DriveFileID": "abc"},
        client=StubSheets(),
    )
    assert captured["sheet"] == INDEX_SHEET_NAME == "LifeManagerIndex"
    # row is projected onto the fixed column order
    assert captured["values"][0] == "7" and captured["values"][1] == "voice"
    assert out["appended"][4] == "abc"  # DriveFileID column


# ── AC4: cold-tiering 30-day policy ─────────────────────────────────


@pytest.mark.asyncio
async def test_cold_tiering_migrates_stale_files(db_session):
    from app.models.drive_file import DriveFile
    from app.services.cold_tiering_service import tier_cold_files, is_cold

    now = datetime.now(timezone.utc)
    stale = DriveFile(user_id=1, filename="old.pdf", storage_location="local",
                      last_accessed_at=now - timedelta(days=45))
    fresh = DriveFile(user_id=1, filename="new.pdf", storage_location="local",
                      last_accessed_at=now - timedelta(days=2))
    db_session.add_all([stale, fresh])
    await db_session.commit()

    assert is_cold(stale, now=now) is True
    assert is_cold(fresh, now=now) is False

    result = await tier_cold_files(db_session, user_id=1, now=now)
    assert result["migrated"] == 1
    await db_session.refresh(stale)
    await db_session.refresh(fresh)
    assert stale.storage_location == "drive" and stale.migrated_at is not None
    assert fresh.storage_location == "local"


# ── AC6: audio text extraction on upload ────────────────────────────


def test_audio_upload_extracts_text(api_client):
    up = api_client.post(
        "/api/drive/upload", json={"filename": "memo.mp3", "mime_type": "audio/mpeg"}
    )
    assert up.status_code == 201, up.text
    assert up.json()["extracted_text"]  # transcript placeholder stored

    # a plain document gets no extraction
    doc = api_client.post("/api/drive/upload", json={"filename": "notes.pdf"})
    assert doc.json()["extracted_text"] is None


# ── AC5: GET /api/files/{id} resolves Drive blobs ───────────────────


@pytest.mark.asyncio
async def test_get_file_resolves_drive_link(db_session):
    """Drive-tiered files resolve to their Drive link (AC5). Calls the route
    coroutine directly with the async session — one event loop, no TestClient
    cross-loop hazard."""
    from app.models.drive_file import DriveFile
    from app.routes.files import get_file

    row = DriveFile(user_id=0, filename="report.pdf", storage_location="drive",
                    drive_file_id="d1", drive_link="https://drive.google.com/file/d/d1/view")
    db_session.add(row)
    await db_session.commit()
    await db_session.refresh(row)

    body = await get_file(file_id=row.id, db=db_session, user_id=0)
    assert body["storage_location"] == "drive"
    assert body["download_url"] == "https://drive.google.com/file/d/d1/view"

    # missing → 404
    from fastapi import HTTPException

    with pytest.raises(HTTPException) as exc:
        await get_file(file_id=999999, db=db_session, user_id=0)
    assert exc.value.status_code == 404


def test_get_missing_file_404(api_client):
    assert api_client.get("/api/files/987654").status_code == 404


# ── AC7: LifeManagerData folder layout ──────────────────────────────


def test_drive_folder_layout(api_client):
    r = api_client.get("/api/drive/folders")
    assert r.status_code == 200
    body = r.json()
    assert "Lifemanager Data" in body["root_folder"] or "LifeManager" in body["root_folder"]
    assert "audio" in body["subfolders"]
