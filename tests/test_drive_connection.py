"""Complete Google Drive integration — connection store + real client adapter
+ management endpoints (audit task: complete Google Drive integration).

Covers:
  * drive_settings_service: encrypted store / resolve / disconnect roundtrip.
  * GoogleDriveClient: folder find-or-create (idempotent) + upload, wired
    through the existing google_drive_service.upload_file seam end-to-end with a
    fake google-api service (no network).
  * ensure_app_folders + make_drive_mover.
  * /api/drive/status (public-read), /api/drive/disconnect (admin-gated),
    /api/drive/upload-file (stores local when Drive is offline).
"""
from __future__ import annotations

import re

import pytest


# ── A minimal fake of the google-api-python-client Drive v3 service ──────────
# Supports just what GoogleDriveClient exercises: files().list/create/get_media
# + .execute(). Folders are tracked by name so get_or_create is idempotent.


class _Exec:
    def __init__(self, result):
        self._r = result

    def execute(self):
        return self._r


class _FakeFiles:
    def __init__(self):
        self.folders: dict[str, str] = {}
        self.files: dict[str, dict] = {}
        self._n = 0

    def list(self, q="", spaces=None, fields=None, pageSize=None):
        m = re.search(r"name = '([^']*)'", q)
        name = m.group(1) if m else None
        if "application/vnd.google-apps.folder" in q:
            if name in self.folders:
                return _Exec({"files": [{"id": self.folders[name], "name": name}]})
            return _Exec({"files": []})
        if "application/vnd.google-apps.spreadsheet" in q:
            return _Exec({"files": []})
        return _Exec(
            {
                "files": [
                    {"id": fid, "name": f["name"], "mimeType": "application/octet-stream"}
                    for fid, f in self.files.items()
                ]
            }
        )

    def create(self, body=None, media_body=None, fields=None):
        self._n += 1
        body = body or {}
        if body.get("mimeType") == "application/vnd.google-apps.folder":
            fid = f"folder-{body['name']}-{self._n}"
            self.folders[body["name"]] = fid
            return _Exec({"id": fid})
        fid = f"file-{self._n}"
        self.files[fid] = {"name": body.get("name")}
        return _Exec({"id": fid})

    def get_media(self, fileId=None):
        return _Exec(b"")


class FakeDriveService:
    def __init__(self):
        self._files = _FakeFiles()

    def files(self):
        return self._files


# ── drive_settings_service ───────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_store_resolve_disconnect_roundtrip(db_session, monkeypatch):
    monkeypatch.delenv("GOOGLE_DRIVE_REFRESH_TOKEN", raising=False)
    monkeypatch.delenv("GOOGLE_SHEETS_REFRESH_TOKEN", raising=False)
    from sqlalchemy import select

    from app.models.global_setting import GlobalSetting
    from app.services import drive_settings_service as dss

    assert await dss.is_connected(db_session) is False

    await dss.store_connection(db_session, refresh_token="r3fr3sh", account_email="me@gmail.com")
    assert await dss.resolve_refresh_token(db_session) == "r3fr3sh"
    assert await dss.get_account_email(db_session) == "me@gmail.com"
    assert await dss.is_connected(db_session) is True

    # The refresh token is encrypted at rest — the stored ciphertext is NOT the
    # plaintext token.
    row = (
        await db_session.execute(
            select(GlobalSetting).where(GlobalSetting.key == dss.KEY_REFRESH_TOKEN)
        )
    ).scalar_one()
    assert row.value != "r3fr3sh"

    await dss.disconnect(db_session)
    assert await dss.resolve_refresh_token(db_session) is None
    assert await dss.is_connected(db_session) is False


@pytest.mark.asyncio
async def test_resolve_refresh_token_env_fallback(db_session, monkeypatch):
    monkeypatch.setenv("GOOGLE_DRIVE_REFRESH_TOKEN", "from-env")
    from app.services import drive_settings_service as dss

    assert await dss.resolve_refresh_token(db_session) == "from-env"


# ── GoogleDriveClient + the google_drive_service seam ────────────────────────


@pytest.mark.asyncio
async def test_drive_client_folder_create_is_idempotent():
    from app.services.google_api_client import GoogleDriveClient

    client = GoogleDriveClient(FakeDriveService())
    fid = await client.get_or_create_folder("LifeManagerData")
    assert fid
    again = await client.get_or_create_folder("LifeManagerData")
    assert again == fid  # found, not re-created


@pytest.mark.asyncio
async def test_upload_file_seam_end_to_end_with_real_client():
    """The shipped google_drive_service.upload_file, driven by the REAL
    GoogleDriveClient wrapper over a fake google-api service, returns a Drive id
    + canonical share link."""
    from app.services import google_drive_service
    from app.services.google_api_client import GoogleDriveClient

    client = GoogleDriveClient(FakeDriveService())
    res = await google_drive_service.upload_file(
        refresh_token="tok",
        file_name="report.pdf",
        data_type="documents",
        media=b"hello",
        client=client,
    )
    assert res["drive_file_id"]
    assert res["drive_link"].startswith("https://drive.google.com/file/d/")
    assert res["folder_id"]


@pytest.mark.asyncio
async def test_ensure_app_folders_creates_tree_and_caches_root(db_session):
    from app.services import drive_settings_service as dss
    from app.services.google_api_client import GoogleDriveClient, ensure_app_folders
    from app.services.google_drive_service import DEFAULT_SUBFOLDERS

    client = GoogleDriveClient(FakeDriveService())
    root, subs = await ensure_app_folders(db_session, client)
    assert root
    assert set(subs) == set(DEFAULT_SUBFOLDERS)
    assert await dss.get_root_folder_id(db_session) == root


@pytest.mark.asyncio
async def test_make_drive_mover_uploads_extracted_text(db_session):
    from app.models.drive_file import DriveFile
    from app.services.google_api_client import (
        GoogleDriveClient,
        ensure_app_folders,
        make_drive_mover,
    )

    client = GoogleDriveClient(FakeDriveService())
    _root, subs = await ensure_app_folders(db_session, client)
    mover = make_drive_mover(client, subs)
    row = DriveFile(user_id=0, filename="cold.txt", extracted_text="lorem", storage_location="local")
    info = await mover(row)
    assert info["drive_file_id"]
    assert "drive.google.com" in info["drive_link"]


@pytest.mark.asyncio
async def test_build_clients_none_when_disconnected(db_session, monkeypatch):
    monkeypatch.delenv("GOOGLE_DRIVE_REFRESH_TOKEN", raising=False)
    monkeypatch.delenv("GOOGLE_SHEETS_REFRESH_TOKEN", raising=False)
    from app.services.google_api_client import build_clients

    drive_client, sheets_client = await build_clients(db_session)
    assert drive_client is None and sheets_client is None


# ── Route layer ──────────────────────────────────────────────────────────────


def test_drive_status_route(api_client):
    resp = api_client.get("/api/drive/status")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert set(body) >= {"configured", "connected", "account_email", "root_folder_name"}
    assert body["connected"] is False  # no token in a fresh test DB


def test_drive_disconnect_requires_admin(api_client):
    """conftest sets ADMIN_EMAILS, so the single-tenant bypass is OFF and an
    anonymous mutation is refused with 403."""
    resp = api_client.post("/api/drive/disconnect")
    assert resp.status_code == 403


def test_drive_upload_file_stores_local_when_offline(api_client):
    files = {"file": ("note.txt", b"hello world", "text/plain")}
    resp = api_client.post("/api/drive/upload-file", files=files)
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["filename"] == "note.txt"
    assert body["storage_location"] == "local"
    assert body["drive_file_id"] is None  # Drive not connected → kept local

    listing = api_client.get("/api/drive/files").json()
    assert any(f["filename"] == "note.txt" for f in listing)


# ── AC5: actually download bytes through the app ─────────────────────────────


@pytest.mark.asyncio
async def test_download_file_seam_returns_bytes_with_stub_client():
    """google_drive_service.download_file hands back whatever the client yields
    — the seam the /download route uses to stream real Drive bytes."""
    from app.services import google_drive_service

    class StubDownloadClient:
        async def download(self, drive_file_id):
            assert drive_file_id == "abc"
            return b"the-bytes"

    data = await google_drive_service.download_file(
        refresh_token="tok", drive_file_id="abc", client=StubDownloadClient()
    )
    assert data == b"the-bytes"


@pytest.mark.asyncio
async def test_download_route_redirects_to_link_when_drive_offline(db_session):
    """A Drive-tiered file, with Drive NOT connected, degrades to a 302 to the
    share link so the capability still works."""
    from starlette.responses import RedirectResponse

    from app.models.drive_file import DriveFile
    from app.routes.files import download_file

    row = DriveFile(
        user_id=0,
        filename="r.pdf",
        storage_location="drive",
        drive_file_id="x",
        drive_link="https://drive.google.com/file/d/x/view",
    )
    db_session.add(row)
    await db_session.commit()
    await db_session.refresh(row)

    resp = await download_file(file_id=row.id, db=db_session, user_id=0)
    assert isinstance(resp, RedirectResponse)
    assert "drive.google.com" in resp.headers["location"]


def test_download_route_local_returns_text(api_client):
    """A local file (no raw bytes stored) downloads as its extracted-text body."""
    up = api_client.post(
        "/api/drive/upload-file", files={"file": ("memo.txt", b"hi", "text/plain")}
    )
    fid = up.json()["id"]
    resp = api_client.get(f"/api/files/{fid}/download")
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/plain")


@pytest.mark.asyncio
async def test_refresh_access_token_details_surfaces_google_rejection(monkeypatch):
    """The diagnostic seam behind «بررسی اتصال»: a Google 400 (invalid_grant —
    revoked/expired token) must come back as a REASONED failure, and the
    back-compat refresh_access_token shim must still return plain None."""
    from app.services import google_api_client as gac

    monkeypatch.setattr(gac.settings, "GOOGLE_CLIENT_ID", "cid", raising=False)
    monkeypatch.setattr(gac.settings, "GOOGLE_CLIENT_SECRET", "sec", raising=False)

    class _Resp:
        status_code = 400
        text = '{"error": "invalid_grant", "error_description": "Token has been expired or revoked."}'

    class _Client:
        def __init__(self, *a, **k):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *a):
            return False

        async def post(self, *a, **k):
            return _Resp()

    monkeypatch.setattr(gac.httpx, "AsyncClient", _Client)

    token, error = await gac.refresh_access_token_details("dead-token")
    assert token is None
    assert error is not None and "invalid_grant" in error and "refresh_rejected" in error
    assert await gac.refresh_access_token("dead-token") is None

    # And the two local (no-network) reasons stay distinct.
    assert await gac.refresh_access_token_details("") == (None, "no_refresh_token")
    monkeypatch.setattr(gac.settings, "GOOGLE_CLIENT_ID", "", raising=False)
    assert (await gac.refresh_access_token_details("t"))[1] == "oauth_not_configured"
