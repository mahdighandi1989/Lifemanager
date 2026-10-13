"""«آینهٔ درایو»: each mirrored record of /apps/learning-architecture gets its own
Drive folder + one spreadsheet (one tab per section) under
LifeManagerData/learning-architecture/<group>/ — idempotent, never deletes,
and survives Drive being offline."""
import json

import pytest


@pytest.fixture(autouse=True)
def _owner_is_admin(monkeypatch):
    """AI/Drive/attachments/reminders are owner-only once ADMIN_EMAILS is set (audit 2026-10-13); the test
    owner accounts are the admins here, strangers are not."""
    from app.config import settings
    monkeypatch.setattr(settings, "ADMIN_EMAILS", "owner-la@example.com,rem@example.com,owner@example.com")

def _signin(api_client, email="owner-la@example.com"):
    """The page is behind login; /api/app-records refuses anonymous callers."""
    r = api_client.post("/auth/register", json={"email": email, "password": "hunter2-long", "username": email.split("@")[0]})
    assert r.status_code == 201, r.text
    api_client.headers.update({"Authorization": f"Bearer {r.json()['access_token']}"})
    return api_client


BASE = "/api/app-records/learning-architecture"


def _item(rid="case_1", title="خبر کانال", rows=None):
    return {"rec_id": rid, "group": "پرونده‌ها", "title": title,
            "tabs": [{"name": "خلاصه", "rows": rows or [["فیلد", "مقدار"], ["عنوان", title]]},
                     {"name": "تصدیق‌ها", "rows": [["#", "تصدیق"], [1, "دلار فردا بالا می‌رود"]]}]}


@pytest.mark.asyncio
async def test_queue_status_and_delete_flow(api_client):
    _signin(api_client)
    r = api_client.post(f"{BASE}/mirror", json={"items": [_item()]})
    assert r.status_code == 200 and r.json()["changed"] == 1
    assert api_client.post(f"{BASE}/mirror", json={"items": [_item()]}).json()["changed"] == 0, "same doc ⇒ no rewrite"
    st = api_client.get(f"{BASE}/mirror").json()
    assert st["ok"] and len(st["items"]) == 1
    it = st["items"][0]
    assert it["pending"] is True and it["group"] == "پرونده‌ها" and it["folder_url"] == ""
    # deleting the record in the app marks the mirror (the Drive folder is renamed later, never deleted)
    api_client.post(f"{BASE}/bulk", json={"records": [{"id": "case_1", "type": "case"}]})
    api_client.delete(f"{BASE}/case_1")
    it = api_client.get(f"{BASE}/mirror").json()["items"][0]
    assert it["deleted"] is True and it["pending"] is True


@pytest.mark.asyncio
async def test_sync_without_drive_keeps_rows_pending_with_a_clear_message(api_client):
    _signin(api_client)
    api_client.post(f"{BASE}/mirror", json={"items": [_item("topic_1", "موضوع")]})
    r = api_client.post(f"{BASE}/mirror/sync").json()
    assert r["ok"] and r["written"] == 0 and r.get("skipped") == "no_drive"
    it = api_client.get(f"{BASE}/mirror").json()["items"][0]
    assert it["pending"] is True and "درایو" in it["error"]


class FakeDrive:
    def __init__(self):
        self.folders = {}
        self._drive = None

    async def get_or_create_folder(self, name, parent=None):
        key = (name, parent)
        self.folders.setdefault(key, f"fold{len(self.folders) + 1}")
        return self.folders[key]


class FakeWriter:
    def __init__(self):
        self.sheets, self.writes, self.renames, self.alive, self.moves = 0, [], [], set(), []
        self.names, self.parents = {}, {}

    def meta(self, fid):
        if fid not in self.alive:
            return None
        return {"id": fid, "name": self.names.get(fid), "parents": self.parents.get(fid, [])}

    def exists(self, fid):
        return fid in self.alive

    def rename(self, fid, name):
        self.renames.append((fid, name))
        self.names[fid] = name

    def move(self, fid, new_parent, old):
        self.moves.append((fid, new_parent, old))
        self.parents[fid] = [new_parent]

    def create_sheet(self, name, parent):
        self.sheets += 1
        sid = f"sheet{self.sheets}"
        self.alive.add(sid)
        return sid

    def write(self, sheet_id, title, tabs):
        self.writes.append((sheet_id, title, [t["name"] for t in tabs], tabs))


@pytest.mark.asyncio
async def test_sync_builds_folder_tree_and_sheet_once_then_updates_in_place(db_session, monkeypatch):
    from app.services import app_mirror_service as svc
    from app.services import inspection_drive

    async def fake_root(db, client):
        return "ROOT"

    monkeypatch.setattr(inspection_drive, "root_folder", fake_root)
    drive, writer = FakeDrive(), FakeWriter()
    await svc.upsert(db_session, user_id=1, app="learning-architecture", items=[_item()], deleted=[])
    res = await svc.sync_pending(db_session, clients=(drive, writer))
    assert res["written"] == 1
    # LifeManagerData(ROOT) / learning-architecture / پرونده‌ها / «خبر کانال · ase_1»
    assert ("learning-architecture", "ROOT") in drive.folders
    app_id = drive.folders[("learning-architecture", "ROOT")]
    grp_id = drive.folders[("پرونده‌ها", app_id)]
    rec_folder = [k for k in drive.folders if k[1] == grp_id][0]
    assert rec_folder[0].startswith("خبر کانال · ")
    fid = drive.folders[rec_folder]
    writer.alive.add(fid)
    writer.names[fid], writer.parents[fid] = rec_folder[0], [grp_id]
    assert writer.sheets == 1 and writer.writes[-1][2] == ["خلاصه", "تصدیق‌ها"]
    assert writer.writes[-1][3][1]["rows"][1] == ["1", "دلار فردا بالا می‌رود"], "cells are strings"

    # nothing changed ⇒ nothing pending, nothing written
    assert (await svc.sync_pending(db_session, clients=(drive, writer)))["pending"] == 0
    # edited ⇒ same folder, same sheet, rewritten
    await svc.upsert(db_session, user_id=1, app="learning-architecture", items=[_item(title="خبر کانال ۲")], deleted=[])
    await svc.sync_pending(db_session, clients=(drive, writer))
    assert writer.sheets == 1 and len(writer.writes) == 2 and writer.writes[-1][1] == "خبر کانال ۲"
    assert writer.renames[-1] == (fid, svc.record_folder_name("خبر کانال ۲", "case_1")), "title change ⇒ folder renamed"
    n_renames = len(writer.renames)
    await svc.upsert(db_session, user_id=1, app="learning-architecture", items=[_item(title="خبر کانال ۲", rows=[["x"]])], deleted=[])
    await svc.sync_pending(db_session, clients=(drive, writer))
    assert len(writer.renames) == n_renames, "same name ⇒ no rename call"
    # group changed (e.g. topic ↔ course) ⇒ the SAME folder is moved, not duplicated
    moved = _item(title="خبر کانال ۲", rows=[["y"]])
    moved["group"] = "دوره"
    await svc.upsert(db_session, user_id=1, app="learning-architecture", items=[moved], deleted=[])
    await svc.sync_pending(db_session, clients=(drive, writer))
    assert writer.moves and writer.moves[-1][0] == fid and writer.sheets == 1
    # deleted ⇒ folder renamed, not deleted
    await svc.upsert(db_session, user_id=1, app="learning-architecture", items=[], deleted=["case_1"])
    await svc.sync_pending(db_session, clients=(drive, writer))
    assert writer.renames[-1][1].startswith(svc.DELETED_PREFIX)


def test_documents_are_clamped_to_what_sheets_accepts():
    from app.services.app_mirror_service import MAX_CELL, normalize_doc

    doc = normalize_doc("t", [{"name": "a/b", "rows": [["x" * (MAX_CELL + 10), None, 3]]}, {"name": "a/b", "rows": ["single"]}])
    assert [t["name"] for t in doc["tabs"]] == ["a／b", "a／b 2"]
    assert len(doc["tabs"][0]["rows"][0][0]) == MAX_CELL and doc["tabs"][0]["rows"][0][1:] == ["", "3"]
    assert doc["tabs"][1]["rows"] == [["single"]]
    json.dumps(doc)


def test_writer_sizes_the_grid_and_sends_valid_sheets_requests():
    """A fake Sheets/Drive service records the exact API calls the writer makes."""
    from app.services.app_mirror_service import _Writer

    calls = []

    class Exec:
        def __init__(self, name, kw, result=None):
            self.name, self.kw, self.result = name, kw, result

        def execute(self, num_retries=0):
            calls.append((self.name, self.kw))
            return self.result if self.result is not None else {}

    state = {"tabs": {"Sheet1": 0, "قدیمی‌ها": 5, "خلاصه": 7}}

    class Values:
        def clear(self, **kw):
            return Exec("clear", kw)

        def batchClear(self, **kw):
            return Exec("batchClear", kw)

        def batchUpdate(self, **kw):
            return Exec("values.batchUpdate", kw)

    class Spreadsheets:
        def get(self, **kw):
            return Exec("get", kw, {"sheets": [{"properties": {"title": t, "sheetId": i}} for t, i in state["tabs"].items()]})

        def batchUpdate(self, spreadsheetId, body):
            for r in body["requests"]:
                if "addSheet" in r:
                    state["tabs"][r["addSheet"]["properties"]["title"]] = len(state["tabs"]) + 10
            return Exec("batchUpdate", {"body": body})

        def values(self):
            return Values()

    class Sheets:
        def spreadsheets(self):
            return Spreadsheets()

    rows = [["h"] * 30] + [["x"] * 30 for _ in range(2500)]
    _Writer(None, Sheets()).write("SID", "عنوان", [{"name": "خلاصه", "rows": rows}, {"name": "تصدیق‌ها", "rows": [["#"]]}])
    fmt = [c for c in calls if c[0] == "batchUpdate"][-1][1]["body"]["requests"]
    grids = [r["updateSheetProperties"]["properties"]["gridProperties"] for r in fmt
             if "gridProperties" in r.get("updateSheetProperties", {}).get("properties", {})]
    assert grids[0]["rowCount"] >= 2501 and grids[0]["columnCount"] >= 30, "grid grown past the 1000×26 default"
    assert any("deleteSheet" in r for r in fmt), "Google's empty default tab is removed once real tabs exist"
    assert any(r.get("updateSpreadsheetProperties", {}).get("properties", {}).get("title") == "عنوان" for r in fmt)
    data = [c for c in calls if c[0] == "values.batchUpdate"][-1][1]["body"]
    assert data["valueInputOption"] == "RAW" and data["data"][0]["range"] == "'خلاصه'!A1"
    order = [c[0] for c in calls]
    assert order.index("values.batchUpdate") < order.index("batchClear"), "write first, then clear only the stale tail"
    assert "clear" not in order, "a whole tab is never blanked before the write"
    tails = [c for c in calls if c[0] == "batchClear"][-1][1]["body"]["ranges"]
    assert "'خلاصه'!A2502:AF2521" in tails and "'تصدیق‌ها'!B1:F1" in tails
    stale = [r["updateSheetProperties"]["properties"] for r in fmt if "updateSheetProperties" in r
             and r["updateSheetProperties"]["properties"].get("sheetId") == 5]
    assert stale and stale[0]["title"].startswith("(قدیمی) "), "a section the doc no longer has is kept + labelled"
    assert not any(r.get("deleteSheet", {}).get("sheetId") == 5 for r in fmt)


def test_a_transient_drive_error_is_not_taken_as_gone():
    from app.services.app_mirror_service import _Writer, is_quota_error

    class HttpErr(Exception):
        def __init__(self, st, msg=""):
            super().__init__(msg or f"HTTP {st}")
            self.resp = type("R", (), {"status": st})()

    class Files:
        def __init__(self, exc):
            self.exc = exc

        def get(self, **kw):
            exc = self.exc

            class E:
                def execute(self, num_retries=0):
                    raise exc
            return E()

    class Drive:
        def __init__(self, exc):
            self._f = Files(exc)

        def files(self):
            return self._f

    assert _Writer(Drive(HttpErr(404)), None).meta("x") is None
    with pytest.raises(HttpErr):
        _Writer(Drive(HttpErr(503)), None).meta("x")
    assert is_quota_error(HttpErr(429)) and is_quota_error(HttpErr(403, "userRateLimitExceeded"))
    assert not is_quota_error(HttpErr(403, "insufficientPermissions"))


@pytest.mark.asyncio
async def test_failed_rows_go_last_and_quota_stops_the_run(db_session, monkeypatch):
    from app.services import app_mirror_service as svc
    from app.services import inspection_drive

    async def fake_root(db, client):
        return "ROOT"

    monkeypatch.setattr(inspection_drive, "root_folder", fake_root)
    await svc.upsert(db_session, user_id=1, app="learning-architecture",
                     items=[_item("case_a"), _item("case_b"), _item("case_c")], deleted=[])

    class Quota(Exception):
        resp = type("R", (), {"status": 429})()

    class QuotaWriter(FakeWriter):
        def write(self, sheet_id, title, tabs):
            raise Quota("rate")

    drive = FakeDrive()
    res = await svc.sync_pending(db_session, clients=(drive, QuotaWriter()))
    assert res["stopped"] == "quota" and res["failed"] == 1 and res["written"] == 0, "first quota error ends the run"
    writer = FakeWriter()
    res = await svc.sync_pending(db_session, clients=(drive, writer), limit=2)
    titles = [w[0] for w in writer.writes]
    assert res["written"] == 2 and len(titles) == 2
    st = await svc.status(db_session, user_id=1, app="learning-architecture")
    assert sum(1 for i in st["items"] if i["pending"]) == 1


class FakeDriveUp(FakeDrive):
    def __init__(self):
        super().__init__()
        self.uploads = []

    async def upload_ex(self, *, file_name, parent, media, mime_type="", description="", app_properties=None):
        self.uploads.append((file_name, parent, len(media), mime_type))
        return {"id": f"file{len(self.uploads)}", "md5": "", "link": f"https://drive/file{len(self.uploads)}"}


@pytest.mark.asyncio
async def test_attachments_go_to_the_record_folder_in_drive_and_only_a_pointer_is_kept(db_session, monkeypatch):
    from app.services import app_mirror_service as svc
    from app.services import inspection_drive

    async def fake_root(db, client):
        return "ROOT"

    monkeypatch.setattr(inspection_drive, "root_folder", fake_root)
    drive, writer = FakeDriveUp(), FakeWriter()
    f = await svc.upload_attachment(db_session, user_id=1, app="learning-architecture", rec_id="case_9", group="پرونده‌ها",
                                    title="خبر", filename="سند/۱.pdf", mime="application/pdf", data=b"%PDF-1", clients=(drive, writer))
    assert f["name"] == "سند／۱.pdf" and f["size"] == 6 and f["link"]
    grp = drive.folders[("پرونده‌ها", drive.folders[("learning-architecture", "ROOT")])]
    rec = [v for k, v in drive.folders.items() if k[1] == grp][0]
    assert drive.uploads[0][1] == drive.folders[("پیوست‌ها", rec)], "inside <record folder>/پیوست‌ها"
    # the mirror later writes its sheet into the SAME folder
    st = await svc.status(db_session, user_id=1, app="learning-architecture")
    assert st["items"][0]["folder_url"].endswith(rec)
    assert len(await svc.list_attachments(db_session, user_id=1, app="learning-architecture", rec_id="case_9")) == 1
    u = await svc.usage(db_session, user_id=1, app="learning-architecture")
    assert u["files"] == 1 and u["file_bytes_in_drive"] == 6
    # delete ⇒ hidden + renamed in Drive, never deleted
    writer.alive.add("file1")
    assert await svc.delete_attachment(db_session, user_id=1, app="learning-architecture", file_id=f["id"], clients=(drive, writer))
    assert writer.renames[-1] == ("file1", svc.DELETED_PREFIX + "سند／۱.pdf")
    assert await svc.list_attachments(db_session, user_id=1, app="learning-architecture") == []
    # someone else's file id ⇒ refused
    assert not await svc.delete_attachment(db_session, user_id=2, app="learning-architecture", file_id=f["id"], clients=(drive, writer))


@pytest.mark.asyncio
async def test_without_drive_an_upload_is_refused_not_stored_on_the_server(api_client):
    _signin(api_client)
    r = api_client.post("/api/app-records/learning-architecture/files", data={"rec_id": "case_1"},
                        files={"file": ("a.txt", b"hello", "text/plain")})
    assert r.status_code == 503 and "درایو" in r.json()["detail"]
    assert api_client.get("/api/app-records/learning-architecture/files").json()["files"] == []
    u = api_client.get("/api/app-records/learning-architecture/usage").json()
    assert u["storage"]["files"] == 0 and u["ai_30d"]["models"] == []
    assert api_client.post("/api/app-records/learning-architecture/files", data={"rec_id": "a/b"},
                           files={"file": ("a.txt", b"x", "text/plain")}).status_code == 422
