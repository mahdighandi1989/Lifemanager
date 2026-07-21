"""Universal attachment ingest — read a file with the vision model, propose a
review candidate, file it (creating/updating the destination). Owner:
«همه‌چیز، نه فقط صورتحساب»."""
import pytest
from sqlalchemy import select

from app.models.finance import FinancialAccount
from app.models.inbox_item import InboxItem
from app.services import inbox_service
from app.services.ingest import credentials
from app.services.ingest import universal_ingest as ui
from app.services.ingest.attachments import prepare_bytes


def _fake_multimodal(text):
    async def _mm(db, prompt, files, **kw):
        return {"ok": True, "text": text, "model": "test-vision"}
    return _mm


@pytest.mark.asyncio
async def test_extract_proposes_finance_candidate(db_session, monkeypatch):
    import app.services.ai.inference_gateway as ig
    monkeypatch.setattr(ig, "complete_multimodal", _fake_multimodal(
        '{"kind":"finance_account","title":"بانک X","summary":"موجودی حساب",'
        '"fields":{"provider":"Bank X","balance":"AED 1,250.50","currency":"AED"}}'
    ))
    res = await ui.extract_from_file(
        db_session, filename="statement.pdf", mimetype="application/pdf",
        data=b"%PDF-1.4 plain", source_ref="gmail:m1:statement.pdf", user_id=0,
    )
    assert res["status"] == "proposed" and res["kind"] == "finance_account"
    item = (await db_session.execute(select(InboxItem))).scalars().first()
    assert item.suggested_type == "finance_account"
    assert item.suggestion["provider"] == "Bank X"
    assert item.suggestion["source_ref"] == "gmail:m1:statement.pdf"


@pytest.mark.asyncio
async def test_extract_dedups_by_source_ref(db_session, monkeypatch):
    import app.services.ai.inference_gateway as ig
    monkeypatch.setattr(ig, "complete_multimodal", _fake_multimodal('{"kind":"note","title":"x"}'))
    ref = "gmail:m2:a.pdf"
    a = await ui.extract_from_file(db_session, filename="a.pdf", mimetype="application/pdf", data=b"%PDF-1", source_ref=ref)
    await db_session.commit()
    b = await ui.extract_from_file(db_session, filename="a.pdf", mimetype="application/pdf", data=b"%PDF-1", source_ref=ref)
    assert a["status"] == "proposed" and b["status"] == "duplicate"


@pytest.mark.asyncio
async def test_unreadable_file_still_surfaces(db_session, monkeypatch):
    import app.services.ai.inference_gateway as ig
    async def _fail(db, prompt, files, **kw):
        return {"ok": False, "error": "no vision model"}
    monkeypatch.setattr(ig, "complete_multimodal", _fail)
    res = await ui.extract_from_file(db_session, filename="scan.png", mimetype="image/png", data=b"\x89PNG", source_ref="gmail:m3:scan.png")
    assert res["status"] == "unreadable"
    item = (await db_session.execute(select(InboxItem))).scalars().first()
    assert item is not None and item.suggested_type == "note"  # not silently dropped


@pytest.mark.asyncio
async def test_finance_filer_creates_then_updates(db_session):
    first = await inbox_service._file_as_finance_account(
        db_session, {"provider": "Bank X", "balance": "1000", "currency": "AED"}, 0
    )
    await db_session.commit()
    assert first["kind"] == "finance_account"
    # same provider again → UPDATE the balance, not a duplicate account
    await inbox_service._file_as_finance_account(
        db_session, {"provider": "Bank X", "balance": "2500", "currency": "AED"}, 0
    )
    await db_session.commit()
    accts = (await db_session.execute(select(FinancialAccount))).scalars().all()
    assert len(accts) == 1
    assert float(accts[0].balance) == 2500.0


def test_prepare_bytes_passthrough_for_non_pdf():
    data = b"just text"
    ready, needs_pw = prepare_bytes(data, "text/plain")
    assert ready == data and needs_pw is False


@pytest.mark.asyncio
async def test_credential_vault_roundtrip(db_session):
    key = credentials.source_key_for("statements@emiratesnbd.com")
    assert key == "emiratesnbd.com"
    assert await credentials.get_password(db_session, source_key=key) is None
    await credentials.store_password(db_session, source_key=key, password="s3cret")
    assert await credentials.get_password(db_session, source_key=key) == "s3cret"


class _FakeDriveClient:
    """Stub matching GoogleDriveClient's async surface (list_files / download)."""

    def __init__(self, files, blobs):
        self._files = files
        self._blobs = blobs
        self.downloads = 0

    async def list_files(self, folder_id=None):
        return self._files

    async def download(self, drive_file_id):
        self.downloads += 1
        return self._blobs.get(drive_file_id, b"")


@pytest.mark.asyncio
async def test_drive_scan_proposes_then_dedups(db_session, monkeypatch):
    import app.services.ai.inference_gateway as ig
    from app.services.ingest import drive_ingest

    monkeypatch.setattr(ig, "complete_multimodal", _fake_multimodal(
        '{"kind":"document","title":"شناسنامه","summary":"سند هویتی","fields":{"name":"مهدی"}}'
    ))
    files = [
        {"id": "f1", "name": "id.pdf", "mime_type": "application/pdf"},
        {"id": "f2", "name": "sheet", "mime_type": "application/vnd.google-apps.spreadsheet"},
    ]
    client = _FakeDriveClient(files, {"f1": b"%PDF-1.4 id"})
    monkeypatch.setattr(
        "app.services.google_api_client.build_drive_client",
        lambda db: _async_return(client),
    )
    res = await drive_ingest.scan_drive(db_session, user_id=0, limit=10)
    assert res["ok"] and res["proposed"] == 1  # native sheet skipped
    assert client.downloads == 1
    item = (await db_session.execute(select(InboxItem))).scalars().first()
    assert item.suggested_type == "document"
    assert item.suggestion["source_ref"] == "drive:f1"
    # second scan: nothing new (source_ref + seen-set both dedup), no re-download
    res2 = await drive_ingest.scan_drive(db_session, user_id=0, limit=10)
    assert res2["proposed"] == 0
    assert client.downloads == 1  # f1 not downloaded again


@pytest.mark.asyncio
async def test_drive_scan_offline_is_clean_noop(db_session, monkeypatch):
    from app.services.ingest import drive_ingest

    monkeypatch.setattr(
        "app.services.google_api_client.build_drive_client",
        lambda db: _async_return(None),
    )
    res = await drive_ingest.scan_drive(db_session, user_id=0)
    assert res["ok"] is False and res["reason"] == "drive_offline"


def _async_return(value):
    async def _coro(*a, **kw):
        return value
    return _coro()
