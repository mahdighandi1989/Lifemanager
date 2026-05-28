"""DriveFile model — cold-storage metadata schema (audit task 7367c6f0, AC3)."""
import pytest

from app.models.drive_file import DriveFile


def test_drive_file_has_required_fields():
    cols = {c.name for c in DriveFile.__table__.columns}
    required = {
        "id",
        "user_id",
        "filename",
        "mime_type",
        "drive_file_id",
        "drive_link",
        "storage_tier",
        "extracted_text",
        "migrated_at",
        "created_at",
    }
    assert required <= cols, f"DriveFile missing columns: {required - cols}"


@pytest.mark.asyncio
async def test_drive_file_persists_with_hot_default(db_session):
    row = DriveFile(user_id=1, filename="notes.pdf", mime_type="application/pdf")
    db_session.add(row)
    await db_session.commit()
    await db_session.refresh(row)
    assert row.id is not None
    assert row.storage_tier == "hot"  # AC8/AC11 — new rows start hot, migrate to cold
