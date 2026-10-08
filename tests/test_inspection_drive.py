"""«نظارت و سرکشی» → Google Drive: files and pictures live in the project's
folder (LifeManagerData/inspection/report-NNNN), with a reference, verified —
and the database keeps only the reference.

A fake Drive stands in for google-api-python-client; it computes md5 like Drive
does, so the integrity check is exercised for real."""
import base64
import hashlib

import pytest
from sqlalchemy import func, select

from tests.test_inspection import PNG, SUP, _create, _supervisor_token  # noqa: F401  (autouse)

ROOT = "ROOT-LifeManagerData"


class FakeDrive:
    def __init__(self, corrupt=False):
        self.folders = {}          # (name, parent) -> id
        self.files = {}            # id -> dict
        self.corrupt = corrupt

    async def get_or_create_folder(self, name, parent=None):
        key = (name, parent)
        if key not in self.folders:
            self.folders[key] = f"F{len(self.folders) + 1}"
        return self.folders[key]

    def path_of(self, folder_id):
        names = {v: k for k, v in self.folders.items()}
        parts = []
        while folder_id in names:
            name, parent = names[folder_id]
            parts.insert(0, name)
            folder_id = parent
        return "/".join(([] if folder_id != ROOT else ["LifeManagerData"]) + parts)

    async def upload_ex(self, *, file_name, parent, media, mime_type, description, app_properties):
        fid = f"D{len(self.files) + 1}"
        self.files[fid] = {"name": file_name, "parent": parent, "data": bytes(media), "mime": mime_type,
                           "description": description, "props": dict(app_properties)}
        md5 = hashlib.md5(b"x" if self.corrupt else bytes(media)).hexdigest()
        return {"id": fid, "md5": md5, "link": f"https://drive.google.com/file/d/{fid}/view"}

    async def download(self, fid):
        return self.files[fid]["data"]


@pytest.fixture
def drive(monkeypatch):
    fake = FakeDrive()
    state = {"up": True}

    async def token(db):
        return "rt" if state["up"] else None

    async def root(db):
        return ROOT

    async def client(db):
        return fake if state["up"] else None

    monkeypatch.setattr("app.services.drive_settings_service.resolve_refresh_token", token)
    monkeypatch.setattr("app.services.drive_settings_service.get_root_folder_id", root)
    monkeypatch.setattr("app.services.google_api_client.build_drive_client", client)
    fake.state = state
    return fake


def _upload(c, rid, name, data, mime="application/pdf", note_id=""):
    r = c.post(f"/api/inspection/{rid}/files", files={"file": (name, data, mime)},
               data={"caption": "نمونه", "note_id": note_id})
    assert r.status_code == 200, r.text
    return r.json()["file"]


@pytest.mark.asyncio
async def test_file_goes_to_the_sheets_drive_folder_with_a_reference(api_client, drive):
    rep = _create(api_client)
    pdf = b"%PDF-1.4 sample"
    f = _upload(api_client, rep["id"], "قرارداد.pdf", pdf)
    assert f["store"] == "drive" and f["durable"] and f["drive_link"]
    (d,) = [x for x in drive.files.values() if x["name"].endswith("قرارداد.pdf")]
    assert drive.path_of(d["parent"]) == "LifeManagerData/inspection/report-0001", \
        "the project's existing root (cached id) — never a same-named folder elsewhere"
    assert d["name"] == f"ref-{f['id'][:8]}-قرارداد.pdf"
    assert d["mime"] == "application/pdf", "the real type, so Drive previews it"
    assert d["props"]["lm_report"] == "1" and d["props"]["lm_file"] == f["id"]
    assert "گزارشِ 1" in d["description"] and hashlib.sha256(pdf).hexdigest() in d["description"]
    # the bytes come back through the app, from Drive
    raw = api_client.get(f"/api/inspection/files/{f['id']}/raw", headers=SUP)
    assert raw.status_code == 200 and raw.content == pdf
    full = api_client.get(f"/api/inspection/{rep['id']}").json()["report"]
    assert full["drive_folder_link"].endswith(d["parent"])


@pytest.mark.asyncio
async def test_screenshots_leave_the_database(api_client, drive, db_session):
    rep = _create(api_client, shot=PNG)
    shot_id = rep["notes"][0]["shot_id"]
    (d,) = [x for x in drive.files.values() if x["props"].get("lm_shot") == shot_id]
    assert drive.path_of(d["parent"]) == "LifeManagerData/inspection/report-0001/shots"
    assert d["name"].startswith("n1-before-") and d["mime"] == "image/png"
    img = api_client.get(f"/api/inspection/shots/{shot_id}")
    assert img.status_code == 200 and img.content == base64.b64decode(PNG.split(",", 1)[1])
    st = api_client.get("/api/inspection/storage").json()
    assert st["shots"] == {"drive": 1, "db": 0} and st["db_bytes"] == 0


@pytest.mark.asyncio
async def test_a_corrupt_upload_never_replaces_the_database_copy(api_client, drive):
    drive.corrupt = True
    rep = _create(api_client)
    f = _upload(api_client, rep["id"], "x.pdf", b"%PDF data")
    assert f["store"] == "db", "md5 mismatch ⇒ the upload failed; the bytes stay safe"
    assert "md5" in f["store_note"]
    raw = api_client.get(f"/api/inspection/files/{f['id']}/raw", headers=SUP)
    assert raw.content == b"%PDF data"


@pytest.mark.asyncio
async def test_what_waited_in_the_database_is_moved_by_offload(api_client, drive):
    drive.state["up"] = False
    rep = _create(api_client, shot=PNG)
    f = _upload(api_client, rep["id"], "نمونه.txt", "سلام".encode(), "text/plain")
    assert f["store"] == "db" and "درایو منتقلش می‌کند" in f["store_note"]
    st = api_client.get("/api/inspection/storage").json()
    assert st["drive"]["connected"] is False and st["files"]["db"] == 1 and st["shots"]["db"] == 1
    assert st["db_bytes"] > 0
    # Drive down: offload says why, moves nothing, loses nothing
    res = api_client.post("/api/inspection/storage/offload", headers=SUP).json()
    assert res["drive"] is False and res["left"] == 2 and res["reason"]

    drive.state["up"] = True
    res = api_client.post("/api/inspection/storage/offload", headers=SUP).json()
    assert (res["files_moved"], res["shots_moved"], res["left"]) == (1, 1, 0), res
    got = api_client.get(f"/api/inspection/{rep['id']}").json()["report"]["files"][0]
    assert got["store"] == "drive" and "منتقل شد" in got["store_note"]
    raw = api_client.get(f"/api/inspection/files/{f['id']}/raw", headers=SUP)
    assert raw.content == "سلام".encode()
    st = api_client.get("/api/inspection/storage").json()
    assert st["db_bytes"] == 0 and st["drive"]["connected"] is True
    assert st["drive"]["folder_link"].startswith("https://drive.google.com/drive/folders/")


def test_real_client_sends_mime_reference_and_goes_resumable_when_big():
    from app.services.google_api_client import GoogleDriveClient

    seen = []

    class Req:
        def __init__(self, body, media):
            self.body, self.media = body, media

        def execute(self, num_retries=0):
            data = self.media._fd.getvalue()
            return {"id": "X", "md5Checksum": hashlib.md5(data).hexdigest(), "webViewLink": "L"}

    class Files:
        def create(self, body, media_body, fields):
            assert "md5Checksum" in fields
            seen.append((body, media_body))
            return Req(body, media_body)

    class Svc:
        def files(self):
            return Files()

    c = GoogleDriveClient(Svc())
    small = c._upload_ex_sync("ref-1-a.pdf", "P", b"%PDF", "application/pdf", "گزارشِ 1",
                              {"lm_report": "1"})
    big = c._upload_ex_sync("ref-2-b.bin", "P", b"0" * (6 * 1024 * 1024), "application/zip", "", {})
    assert small == {"id": "X", "md5": hashlib.md5(b"%PDF").hexdigest(), "link": "L"}
    body, media = seen[0]
    assert body == {"name": "ref-1-a.pdf", "mimeType": "application/pdf", "parents": ["P"],
                    "description": "گزارشِ 1", "appProperties": {"lm_report": "1"}}
    assert media.mimetype() == "application/pdf" and not media.resumable()
    assert seen[1][1].resumable(), "above 5 MB a single request is unreliable — resumable"
