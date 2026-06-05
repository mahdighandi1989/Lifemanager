"""Sheet-ledger wiring, extracted-text search, /raw, scheduled tiering (task 7367c6f0).

Closes the re-audit gaps beyond the earlier model/upload/cold-tiering work:
search over extracted_text (Step 9), the /api/files/{id}/raw route (Step 7,
was dangling), the central-sheet ledger call wired into upload (Step 4), and
tier_cold_data actually migrating DriveFiles (AC4).
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest


def test_drive_search_matches_extracted_text(api_client):
    api_client.post("/api/drive/upload", json={"filename": "memo.mp3", "mime_type": "audio/mpeg"})
    # the audio upload stored a transcript placeholder containing "transcript"
    hit = api_client.get("/api/drive/files", params={"q": "transcript"}).json()
    assert any(f["filename"] == "memo.mp3" for f in hit)  # matched via extracted_text, not filename


@pytest.mark.asyncio
async def test_files_raw_returns_text_for_local(db_session):
    from app.models.drive_file import DriveFile
    from app.routes.files import get_file_raw

    row = DriveFile(user_id=0, filename="n.txt", storage_location="local", extracted_text="hello text")
    db_session.add(row)
    await db_session.commit()
    await db_session.refresh(row)
    out = await get_file_raw(file_id=row.id, db=db_session, user_id=0)
    assert out["kind"] == "text" and out["content"] == "hello text"


@pytest.mark.asyncio
async def test_files_raw_returns_link_for_drive(db_session):
    from app.models.drive_file import DriveFile
    from app.routes.files import get_file_raw

    row = DriveFile(user_id=0, filename="r.pdf", storage_location="drive",
                    drive_link="https://drive.google.com/file/d/x/view")
    db_session.add(row)
    await db_session.commit()
    await db_session.refresh(row)
    out = await get_file_raw(file_id=row.id, db=db_session, user_id=0)
    assert out["kind"] == "drive_link" and "drive.google.com" in out["drive_link"]


@pytest.mark.asyncio
async def test_record_index_entry_noop_without_creds(monkeypatch):
    from app.services.sheets_service import record_index_entry

    monkeypatch.delenv("GOOGLE_SHEETS_REFRESH_TOKEN", raising=False)
    # No client + no token → clean no-op (False), never raises.
    assert await record_index_entry({"RecordID": "1"}) is False


@pytest.mark.asyncio
async def test_record_index_entry_appends_with_stub():
    from app.services.sheets_service import record_index_entry

    seen = {}

    class StubSheets:
        async def append_row(self, *, sheet_name, values):
            seen["values"] = values
            return {"ok": True}

    ok = await record_index_entry({"RecordID": "7", "DataType": "voice"}, refresh_token="tok", client=StubSheets())
    assert ok is True and seen["values"][0] == "7"


@pytest.mark.asyncio
async def test_tier_cold_files_migrates_drivefiles(db_session):
    from app.models.drive_file import DriveFile
    from app.services.cold_tiering_service import tier_cold_files

    now = datetime.now(timezone.utc)
    db_session.add(DriveFile(user_id=0, filename="old.pdf", storage_location="local",
                             last_accessed_at=now - timedelta(days=40)))
    await db_session.commit()
    result = await tier_cold_files(db_session, now=now)
    assert result["migrated"] >= 1


@pytest.mark.asyncio
async def test_tier_cold_files_records_each_migration_in_ledger(db_session):
    """The migration path logs every moved file to the central sheet ledger
    ("توی شیت باید همه چیزا ثبت بشه"), not just the upload path (AC2+AC4)."""
    from app.models.drive_file import DriveFile
    from app.services.cold_tiering_service import sheet_row_for, tier_cold_files

    now = datetime.now(timezone.utc)
    db_session.add(DriveFile(user_id=0, filename="cold1.pdf", mime_type="application/pdf",
                             storage_location="local", extracted_text="lorem",
                             last_accessed_at=now - timedelta(days=45)))
    db_session.add(DriveFile(user_id=0, filename="warm.pdf", storage_location="local",
                             last_accessed_at=now))  # not cold → must not be ledgered
    await db_session.commit()

    logged = []

    async def ledger(row):
        logged.append(sheet_row_for(row))

    result = await tier_cold_files(db_session, ledger=ledger, now=now)
    assert result["migrated"] == 1
    # Exactly the migrated (cold) file was recorded, projected onto the index shape.
    assert len(logged) == 1
    assert logged[0]["DataType"] == "application/pdf"
    assert logged[0]["OriginalLocation"] == "render"
    assert logged[0]["RecordID"]  # non-empty record id


@pytest.mark.asyncio
async def test_tier_cold_files_ledger_failure_does_not_abort_migration(db_session):
    """A failing sheet append must not roll back a committed migration."""
    from app.models.drive_file import DriveFile
    from app.services.cold_tiering_service import tier_cold_files

    now = datetime.now(timezone.utc)
    db_session.add(DriveFile(user_id=0, filename="old2.pdf", storage_location="local",
                             last_accessed_at=now - timedelta(days=40)))
    await db_session.commit()

    async def boom(row):
        raise RuntimeError("sheets down")

    result = await tier_cold_files(db_session, ledger=boom, now=now)
    assert result["migrated"] >= 1  # migration still succeeded despite ledger error
