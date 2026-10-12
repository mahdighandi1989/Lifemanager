"""«آینهٔ درایو»: each mirrored record of /apps/learning-architecture gets its own
Drive folder + one spreadsheet (one tab per section) under
LifeManagerData/learning-architecture/<group>/ — idempotent, never deletes,
and survives Drive being offline."""
import json

import pytest

BASE = "/api/app-records/learning-architecture"


def _item(rid="case_1", title="خبر کانال", rows=None):
    return {"rec_id": rid, "group": "پرونده‌ها", "title": title,
            "tabs": [{"name": "خلاصه", "rows": rows or [["فیلد", "مقدار"], ["عنوان", title]]},
                     {"name": "تصدیق‌ها", "rows": [["#", "تصدیق"], [1, "دلار فردا بالا می‌رود"]]}]}


@pytest.mark.asyncio
async def test_queue_status_and_delete_flow(api_client):
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
        self.sheets, self.writes, self.renames, self.alive = 0, [], [], set()

    def exists(self, fid):
        return fid in self.alive

    def rename(self, fid, name):
        self.renames.append((fid, name))

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
    writer.alive.add(drive.folders[rec_folder])
    assert writer.sheets == 1 and writer.writes[-1][2] == ["خلاصه", "تصدیق‌ها"]
    assert writer.writes[-1][3][1]["rows"][1] == ["1", "دلار فردا بالا می‌رود"], "cells are strings"

    # nothing changed ⇒ nothing pending, nothing written
    assert (await svc.sync_pending(db_session, clients=(drive, writer)))["pending"] == 0
    # edited ⇒ same folder, same sheet, rewritten
    await svc.upsert(db_session, user_id=1, app="learning-architecture", items=[_item(title="خبر کانال ۲")], deleted=[])
    await svc.sync_pending(db_session, clients=(drive, writer))
    assert writer.sheets == 1 and len(writer.writes) == 2 and writer.writes[-1][1] == "خبر کانال ۲"
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

    state = {"tabs": {"Sheet1": 0}}

    class Values:
        def clear(self, **kw):
            return Exec("clear", kw)

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
    grids = [r["updateSheetProperties"]["properties"]["gridProperties"] for r in fmt if "updateSheetProperties" in r]
    assert grids[0]["rowCount"] >= 2501 and grids[0]["columnCount"] >= 30, "grid grown past the 1000×26 default"
    assert any("deleteSheet" in r for r in fmt), "Google's empty default tab is removed once real tabs exist"
    assert any(r.get("updateSpreadsheetProperties", {}).get("properties", {}).get("title") == "عنوان" for r in fmt)
    data = [c for c in calls if c[0] == "values.batchUpdate"][-1][1]["body"]
    assert data["valueInputOption"] == "RAW" and data["data"][0]["range"] == "'خلاصه'!A1"
    assert [c[1]["range"] for c in calls if c[0] == "clear"] == ["'خلاصه'", "'تصدیق‌ها'"]
