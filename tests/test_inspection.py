"""«نظارت و سرکشی» — every guard here was paid for in ALLIN1 / Detective-1 first.

Each test names the failure it pins. The supervisor is a caller presenting
`X-Supervisor-Token`; everyone else is the owner (single-owner app).
"""
from __future__ import annotations

import base64
from datetime import datetime, timedelta, timezone

import pytest

TOKEN = "t" * 64
SUP = {"X-Supervisor-Token": TOKEN}
PNG = "data:image/png;base64," + base64.b64encode(
    bytes.fromhex("89504e470d0a1a0a0000000d4948445200000001000000010806000000"
                  "1f15c4890000000d4944415478da63f8ffff3f0005fe02fe0dc4cd5c"
                  "0000000049454e44ae426082")).decode()

SPOT = {
    "page": "/tasks", "page_label": "کارها", "section_id": "", "section_label": "",
    "reopen": "/tasks?tab=x", "dom_path": "main > div > button", "covered_text": "دکمهٔ ذخیره",
    "rect": {"x": 10, "y": 20, "w": 100, "h": 40}, "viewport": {"w": 1400, "h": 900},
    "geometry": {"doc": {"x": 10, "y": 220, "w": 100, "h": 40},
                 "anchor": {"path": "main > div", "rel": {"x": 0.1, "y": 0.2, "w": 0.5, "h": 0.3},
                            "rect": {"x": 0, "y": 200, "w": 200, "h": 130}}},
}


def _set_admins(monkeypatch, emails):
    """Patch the settings objects the gate and `is_admin` actually hold — other
    suites drop `app.config` from sys.modules, so `import app.config` here may
    be a different object from the one the route imported."""
    import app.dependencies.auth as auth_dep
    from app.routes import inspection as route

    monkeypatch.setattr(route._config.settings, "ADMIN_EMAILS", emails)
    monkeypatch.setattr(auth_dep.settings, "ADMIN_EMAILS", emails)


@pytest.fixture(autouse=True)
def _supervisor_token(monkeypatch):
    monkeypatch.setenv("SUPERVISOR_TOKEN", TOKEN)
    monkeypatch.delenv("AUTH_JWT_SECRET", raising=False)
    # The sheet rules are tested as the (anonymous, local) owner; the owner-only
    # gate has its own test that configures an admin explicitly.
    _set_admins(monkeypatch, "")


def _create(c, text="دکمهٔ ذخیره کار نمی‌کند", spot=SPOT, shot=None):
    body = {"text": text}
    if spot is not None:
        body["spot"] = spot
    if shot:
        body["shot"] = shot
    r = c.post("/api/inspection", json=body)
    assert r.status_code == 200, r.text
    return r.json()["report"]


def _answer(c, rid, outcome="fixed", after=PNG, **kw):
    body = {"text": "انجام شد", "outcome": outcome, **kw}
    if after:
        body["after_shot"] = after
    return c.post(f"/api/inspection/{rid}/notes", json=body, headers=SUP)


# ── filing ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_records_the_way_back_and_the_box(api_client):
    r = _create(api_client)
    assert r["number"] == 1 and r["status"] == "open"
    assert r["reopen"] == "/tasks?tab=x"
    assert r["geometry"]["anchor"]["rel"]["w"] == 0.5
    assert r["glow"]["tone"] == "open"
    assert r["title"] == "دکمهٔ ذخیره کار نمی‌کند"
    assert _create(api_client, "دومی")["number"] == 2


@pytest.mark.asyncio
async def test_general_request_needs_no_place(api_client):
    """«درخواستِ عمومی» — a request that points at no screen (or one not built yet)."""
    r = _create(api_client, "یک قابلیتِ تازه می‌خواهم", spot=None)
    assert r["general"] is True
    assert r["page"] == "/inspection" and r["section_id"] == "general"
    assert r["geometry"] is None, "a general request must never draw a highlight"


@pytest.mark.asyncio
async def test_supervisor_cannot_file_sheets(api_client):
    """A routine that opened its own sheets could answer itself into a clean board."""
    assert api_client.post("/api/inspection", json={"text": "x"}, headers=SUP).status_code == 403


@pytest.mark.asyncio
async def test_wrong_supervisor_token_is_401_not_owner(api_client):
    """Otherwise a misconfigured routine is taken for the OWNER and its answers
    re-open sheets as owner follow-ups."""
    r = api_client.get("/api/inspection", headers={"X-Supervisor-Token": "nope"})
    assert r.status_code == 401


# ── the colour and the outcome ───────────────────────────────────────

@pytest.mark.asyncio
async def test_fixed_without_after_picture_is_refused(api_client):
    rid = _create(api_client)["id"]
    r = _answer(api_client, rid, after=None, dependencies=[{"name": "x", "status": "ok"}])
    assert r.status_code == 422 and "تصویرِ بعدش" in r.json()["detail"]


@pytest.mark.asyncio
async def test_answer_turns_green_and_records_deps(api_client):
    rid = _create(api_client)["id"]
    r = _answer(api_client, rid, dependencies=[{"name": "GET /api/tasks", "status": "ok"}],
                commits=["abc1234"])
    assert r.status_code == 200, r.text
    rep = r.json()["report"]
    assert rep["status"] == "answered" and rep["glow"]["tone"] == "answered"
    assert rep["glow"]["outcome"] == "fixed"
    assert rep["dependencies"][0]["name"] == "GET /api/tasks"
    assert rep["notes"][-1]["by"] == "reviewer" and rep["notes"][-1]["after_shot_id"]


@pytest.mark.asyncio
async def test_owner_cannot_record_an_outcome(api_client):
    rid = _create(api_client)["id"]
    r = api_client.post(f"/api/inspection/{rid}/notes", json={"text": "x", "outcome": "fixed"})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_reviewer_reply_must_carry_an_outcome(api_client):
    """«پاسخ دادم» must say what happened — there is no «I think it's fixed»."""
    rid = _create(api_client)["id"]
    r = api_client.post(f"/api/inspection/{rid}/notes", json={"text": "دیدم"}, headers=SUP)
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_owner_follow_up_turns_it_amber_again(api_client):
    """«اگر دوباره اون گزارش … پیامی ثبت کردم دوباره نارنجی بشه»."""
    rid = _create(api_client)["id"]
    assert _answer(api_client, rid).status_code == 200
    r = api_client.post(f"/api/inspection/{rid}/notes", json={"text": "هنوز درست نیست"})
    rep = r.json()["report"]
    assert rep["status"] == "open" and rep["glow"]["tone"] == "open"


# ── the tick and the archive ─────────────────────────────────────────

@pytest.mark.asyncio
async def test_only_the_owner_ticks(api_client):
    rid = _create(api_client)["id"]
    r = api_client.post(f"/api/inspection/{rid}/status", json={"status": "approved"}, headers=SUP)
    assert r.status_code == 403
    r = api_client.post(f"/api/inspection/{rid}/status", json={"status": "approved"})
    assert r.status_code == 200 and r.json()["report"]["glow"]["tone"] == "approved"


@pytest.mark.asyncio
async def test_follow_up_on_a_ticked_sheet_takes_the_tick_back(api_client):
    rid = _create(api_client)["id"]
    api_client.post(f"/api/inspection/{rid}/status", json={"status": "approved"})
    rep = api_client.post(f"/api/inspection/{rid}/notes", json={"text": "نه، یک چیز دیگر"}).json()["report"]
    assert rep["status"] == "open"


@pytest.mark.asyncio
async def test_file_moves_ticked_sheets_into_binders(api_client, monkeypatch):
    from app.routes import inspection as mod

    monkeypatch.setattr(mod, "BINDER_CAPACITY", 2)
    ids = [_create(api_client, f"گزارش {i}")["id"] for i in range(3)]
    keep = _create(api_client, "باز می‌ماند")["id"]
    for rid in ids:
        api_client.post(f"/api/inspection/{rid}/status", json={"status": "approved"})
    res = api_client.post("/api/inspection/file", headers=SUP).json()
    assert res["filed"] == 3
    assert [p["binder"] for p in res["pages"]] == [1, 1, 2], "capacity 2 ⇒ a second binder"
    open_now = {r["id"] for r in api_client.get("/api/inspection").json()["reports"]}
    assert open_now == {keep}, "filed sheets leave the wall (and their highlight)"
    filed = api_client.get("/api/inspection?status=filed").json()["reports"]
    assert all(r["binder"]["number"] in (1, 2) for r in filed)
    assert len(api_client.get("/api/inspection/binders").json()["binders"]) == 2


@pytest.mark.asyncio
async def test_filed_sheet_is_closed(api_client):
    rid = _create(api_client)["id"]
    api_client.post(f"/api/inspection/{rid}/status", json={"status": "approved"})
    api_client.post("/api/inspection/file")
    assert api_client.post(f"/api/inspection/{rid}/notes", json={"text": "x"}).status_code == 422
    assert api_client.post(f"/api/inspection/{rid}/urgent").status_code == 422


# ── ⚡ the fast queue ───────────────────────────────────────────────

@pytest.mark.asyncio
async def test_urgent_order_is_the_order_pressed(api_client):
    a = _create(api_client, "اول ثبت شد")["id"]
    b = _create(api_client, "دوم ثبت شد")["id"]
    assert api_client.post(f"/api/inspection/{b}/urgent").json()["position"] == 1
    assert api_client.post(f"/api/inspection/{a}/urgent").json()["position"] == 2
    got = api_client.post("/api/inspection/urgent/claim", json={}, headers=SUP).json()
    assert got["report"]["id"] == b, "pressed first ⇒ served first, whatever the number"


@pytest.mark.asyncio
async def test_claim_is_one_at_a_time_and_supervisor_only(api_client):
    a = _create(api_client)["id"]
    api_client.post(f"/api/inspection/{a}/urgent")
    assert api_client.post("/api/inspection/urgent/claim", json={}).status_code == 403
    first = api_client.post("/api/inspection/urgent/claim", json={}, headers=SUP).json()
    second = api_client.post("/api/inspection/urgent/claim", json={}, headers=SUP).json()
    assert first["report"]["id"] == a
    assert second["report"] is None and second["busy"] == 1, "a claimed sheet is not handed out twice"


@pytest.mark.asyncio
async def test_claim_expires_so_a_crashed_run_cannot_wedge_the_queue(api_client, monkeypatch):
    from app.routes import inspection as mod

    a = _create(api_client)["id"]
    api_client.post(f"/api/inspection/{a}/urgent")
    api_client.post("/api/inspection/urgent/claim", json={}, headers=SUP)
    real_now = mod._now
    monkeypatch.setattr(mod, "_now", lambda: real_now() + timedelta(minutes=46))
    again = api_client.post("/api/inspection/urgent/claim", json={}, headers=SUP).json()
    assert again["report"]["id"] == a


@pytest.mark.asyncio
async def test_answer_discharges_urgent_and_follow_up_requeues_it(api_client):
    a = _create(api_client)["id"]
    api_client.post(f"/api/inspection/{a}/urgent")
    api_client.post("/api/inspection/urgent/claim", json={}, headers=SUP)
    rep = _answer(api_client, a, dependencies=[{"name": "x", "status": "ok"}]).json()["report"]
    assert rep["urgent"] is False and rep["urgent_done_at"]
    assert api_client.get("/api/inspection/urgent").json()["waiting"] == 0
    rep = api_client.post(f"/api/inspection/{a}/notes", json={"text": "باز هم"}).json()["report"]
    assert rep["urgent"] is True, "asking again puts it back in the fast queue"


@pytest.mark.asyncio
async def test_supervisor_cannot_rush_or_delete(api_client):
    a = _create(api_client)["id"]
    assert api_client.post(f"/api/inspection/{a}/urgent", headers=SUP).status_code == 403
    assert api_client.delete(f"/api/inspection/{a}", headers=SUP).status_code == 403


@pytest.mark.asyncio
async def test_claim_is_the_urgent_heartbeat(api_client):
    """Every claim — even of an empty queue — is how the page learns when the
    routine comes («ناظر چند دقیقهٔ دیگر می‌آید»)."""
    before = api_client.get("/api/inspection/rounds").json()["urgent"]
    assert before["basis"] == "assumed" and before["last_seen"] is None
    api_client.post("/api/inspection/urgent/claim", json={}, headers=SUP)
    after = api_client.get("/api/inspection/rounds").json()["urgent"]
    assert after["last_seen"] is not None


@pytest.mark.asyncio
async def test_queue_pull_is_the_full_round_heartbeat(api_client):
    assert api_client.get("/api/inspection/rounds").json()["full"]["last_seen"] is None
    api_client.get("/api/inspection/queue")                       # owner: not a knock
    assert api_client.get("/api/inspection/rounds").json()["full"]["last_seen"] is None
    api_client.get("/api/inspection/queue", headers=SUP)
    assert api_client.get("/api/inspection/rounds").json()["full"]["last_seen"] is not None


# ── the queue counts unfinished work as owed ─────────────────────────

@pytest.mark.asyncio
async def test_partial_and_not_done_stay_owed(api_client):
    a = _create(api_client, "الف")["id"]
    b = _create(api_client, "ب")["id"]
    c = _create(api_client, "ج")["id"]
    _answer(api_client, a, outcome="partial", after=None, dependencies=[{"name": "x", "status": "ok"}])
    _answer(api_client, b, outcome="needs-owner", after=None, dependencies=[{"name": "x", "status": "ok"}])
    q = api_client.get("/api/inspection/queue", headers=SUP).json()
    assert q["unanswered"] == 1 and q["unfinished"] == 1 and q["owed"] == 2
    assert q["unfinished_numbers"] == [1]
    assert q["waiting_for_owner"] == 1
    assert c


# ── files: any type, and they MUST be read ───────────────────────────

def _upload(c, rid, name, data, mime="application/octet-stream", note_id=""):
    files = {"file": (name, data, mime)}
    r = c.post(f"/api/inspection/{rid}/files", files=files, data={"caption": "نمونه", "note_id": note_id})
    assert r.status_code == 200, r.text
    return r.json()["file"]


@pytest.mark.asyncio
async def test_unread_file_blocks_the_supervisor_answer(api_client, tmp_path, monkeypatch):
    monkeypatch.setenv("INSPECTION_FILE_DIR", str(tmp_path))
    rid = _create(api_client)["id"]
    f = _upload(api_client, rid, "نمونه.txt", ("ب" * 5000).encode("utf-8"), "text/plain")
    assert f["extract_status"] == "ok" and f["text_chars"] == 5000
    r = _answer(api_client, rid, dependencies=[{"name": "x", "status": "ok"}])
    assert r.status_code == 422 and "نمونه.txt" in r.json()["detail"]

    # the OWNER reading it back does not discharge the supervisor's duty
    api_client.get(f"/api/inspection/files/{f['id']}/text")
    assert _answer(api_client, rid, dependencies=[{"name": "x", "status": "ok"}]).status_code == 422

    # skipping ahead does not count; a contiguous read does
    api_client.get(f"/api/inspection/files/{f['id']}/text?offset=4000", headers=SUP)
    assert _answer(api_client, rid, dependencies=[{"name": "x", "status": "ok"}]).status_code == 422
    api_client.get(f"/api/inspection/files/{f['id']}/text?offset=0&limit=3000", headers=SUP)
    page = api_client.get(f"/api/inspection/files/{f['id']}/text?offset=3000", headers=SUP).json()
    assert page["fully_read"] is True
    assert _answer(api_client, rid, dependencies=[{"name": "x", "status": "ok"}]).status_code == 200


@pytest.mark.asyncio
async def test_an_image_must_be_opened(api_client, tmp_path, monkeypatch):
    monkeypatch.setenv("INSPECTION_FILE_DIR", str(tmp_path))
    rid = _create(api_client)["id"]
    f = _upload(api_client, rid, "عکس.png", base64.b64decode(PNG.split(",", 1)[1]), "image/png")
    assert f["extract_status"] == "image"
    assert _answer(api_client, rid, dependencies=[{"name": "x", "status": "ok"}]).status_code == 422
    raw = api_client.get(f"/api/inspection/files/{f['id']}/raw", headers=SUP)
    assert raw.status_code == 200 and raw.content.startswith(b"\x89PNG")
    assert _answer(api_client, rid, dependencies=[{"name": "x", "status": "ok"}]).status_code == 200


@pytest.mark.asyncio
async def test_any_file_type_is_accepted_and_never_falsely_empty(api_client, tmp_path, monkeypatch):
    """Unknown types are `unsupported` (we never tried) — not `empty`."""
    monkeypatch.setenv("INSPECTION_FILE_DIR", str(tmp_path))
    rid = _create(api_client)["id"]
    f = _upload(api_client, rid, "داده.bin", b"\x00\x01\x02binary")
    assert f["extract_status"] == "unsupported"
    # no Drive here ⇒ the database, which survives a deploy — and it says why
    assert f["store"] == "db" and f["durable"] is True
    assert "پایگاه‌داده" in f["store_note"] and "Drive" in f["store_note"]
    raw = api_client.get(f"/api/inspection/files/{f['id']}/raw", headers=SUP)
    assert raw.status_code == 200 and raw.content == b"\x00\x01\x02binary"


@pytest.mark.asyncio
async def test_a_large_file_round_trips_through_chunk_rows(api_client, db_session):
    """Several chunk rows, reassembled in order — and gone with the file."""
    from types import SimpleNamespace

    from sqlalchemy import func, select

    from app.models.inspection import FILE_CHUNK_BYTES, InspectionFileChunk
    from app.services import inspection_files as ifiles

    blob = bytes(range(256)) * ((FILE_CHUNK_BYTES * 2 + 1024) // 256)
    rid = _create(api_client)["id"]
    f = _upload(api_client, rid, "بزرگ.bin", blob)
    raw = api_client.get(f"/api/inspection/files/{f['id']}/raw", headers=SUP)
    assert raw.status_code == 200 and raw.content == blob
    assert api_client.delete(f"/api/inspection/files/{f['id']}").status_code == 200

    # the same path at the service level, where the rows can be counted
    placed = await ifiles.store(db_session, data=blob, filename="بزرگ.bin", mime="", file_id="f1")
    await db_session.commit()
    count = lambda: db_session.execute(select(func.count()).select_from(InspectionFileChunk)
                                       .where(InspectionFileChunk.file_id == "f1"))
    assert placed["store"] == "db" and (await count()).scalar_one() == 3
    row = SimpleNamespace(id="f1", store="db", byte_size=len(blob), drive_id="", local_path="")
    assert await ifiles.load(db_session, row) == blob
    await ifiles.drop_chunks(db_session, "f1")
    await db_session.commit()
    assert (await count()).scalar_one() == 0, "an orphan chunk is unreachable bytes on a 1 GB database"


@pytest.mark.asyncio
async def test_persian_filename_downloads(api_client, tmp_path, monkeypatch):
    """ALLIN1 v152: a Persian name in Content-Disposition returned 500."""
    monkeypatch.setenv("INSPECTION_FILE_DIR", str(tmp_path))
    rid = _create(api_client)["id"]
    f = _upload(api_client, rid, "قراردادِ نمونه.txt", "سلام".encode("utf-8"), "text/plain")
    r = api_client.get(f"/api/inspection/files/{f['id']}/raw")
    assert r.status_code == 200 and "UTF-8''" in r.headers["content-disposition"]


@pytest.mark.asyncio
async def test_follow_up_claims_only_its_own_files(api_client, tmp_path, monkeypatch):
    """«فایل هایی که پیوستش میخوام بکنم نباید قاتی فایل های پیوست قبلی باشه»."""
    monkeypatch.setenv("INSPECTION_FILE_DIR", str(tmp_path))
    rid = _create(api_client)["id"]
    first = _upload(api_client, rid, "اول.txt", b"a", "text/plain")
    second = _upload(api_client, rid, "دوم.txt", b"b", "text/plain")
    rep = api_client.post(f"/api/inspection/{rid}/notes",
                          json={"text": "ادامه با فایلِ جدید", "file_ids": [second["id"]],
                                "spot": {**SPOT, "reopen": "/lists"}}).json()["report"]
    note = rep["notes"][-1]
    by_id = {f["id"]: f for f in rep["files"]}
    assert by_id[second["id"]]["note_id"] == note["id"]
    assert by_id[first["id"]]["note_id"] == "", "the sheet's own file stays the sheet's"
    assert note["spot"]["reopen"] == "/lists", "a follow-up carries its own box"
    assert rep["reopen"] == "/tasks?tab=x", "the parent's spot is never overwritten"


@pytest.mark.asyncio
async def test_supervisor_cannot_delete_a_sample(api_client, tmp_path, monkeypatch):
    monkeypatch.setenv("INSPECTION_FILE_DIR", str(tmp_path))
    rid = _create(api_client)["id"]
    f = _upload(api_client, rid, "x.txt", b"x", "text/plain")
    assert api_client.delete(f"/api/inspection/files/{f['id']}", headers=SUP).status_code == 403
    assert api_client.delete(f"/api/inspection/files/{f['id']}").status_code == 200


@pytest.mark.asyncio
async def test_delete_takes_shots_and_files_with_it(api_client, tmp_path, monkeypatch):
    """ALLIN1 v149: deleting a sheet left orphan file rows holding megabytes."""
    monkeypatch.setenv("INSPECTION_FILE_DIR", str(tmp_path))
    rid = _create(api_client, shot=PNG)["id"]
    _upload(api_client, rid, "x.txt", b"x", "text/plain")
    res = api_client.delete(f"/api/inspection/{rid}").json()
    assert res["files_removed"] == 1
    assert api_client.get(f"/api/inspection/{rid}").status_code == 404


# ── editing keeps the record ─────────────────────────────────────────

@pytest.mark.asyncio
async def test_edit_keeps_the_original_and_only_your_side(api_client):
    rep = _create(api_client, "متنِ اول")
    nid = rep["notes"][0]["id"]
    r = api_client.patch(f"/api/inspection/{rep['id']}/notes/{nid}", json={"text": "متنِ درست"})
    note = r.json()["report"]["notes"][0]
    assert note["text"] == "متنِ درست" and note["original_text"] == "متنِ اول"
    assert r.json()["report"]["title"] == "متنِ درست"
    assert api_client.patch(f"/api/inspection/{rep['id']}/notes/{nid}",
                            json={"text": "ناظر"}, headers=SUP).status_code == 403


# ── the inventory knows every page and sub-page ──────────────────────

@pytest.mark.asyncio
async def test_inventory_lists_pages_and_tab_subpages(api_client):
    _create(api_client)
    inv = api_client.get("/api/inspection/inventory").json()
    paths = {p["path"] for p in inv["pages"]}
    assert {"/tasks", "/settings", "/inspection"} <= paths
    settings = next(p for p in inv["pages"] if p["path"] == "/settings")
    assert "/settings?tab=drive" in {s["url"] for s in settings["subpages"]}
    tasks = next(p for p in inv["pages"] if p["path"] == "/tasks")
    assert tasks["reports"].get("open") == 1, "each page carries its own sheet count"
    assert inv["totals"]["api_routes"], "measured, never a silent 0"


@pytest.mark.asyncio
async def test_whoami(api_client):
    assert api_client.get("/api/inspection/whoami", headers=SUP).json()["supervisor"] is True
    assert api_client.get("/api/inspection/whoami").json()["supervisor"] is False


# ── supervisor identity: derived, never from a public default ────────

def test_token_is_derived_only_from_a_real_secret(monkeypatch):
    from app.services import supervisor_auth as sa

    monkeypatch.delenv("SUPERVISOR_TOKEN", raising=False)
    monkeypatch.delenv("AUTH_JWT_SECRET", raising=False)
    assert sa.expected_token() is None, "no secret ⇒ nobody is the supervisor"
    monkeypatch.setenv("AUTH_JWT_SECRET", "secret")
    assert sa.expected_token() is None, "a placeholder must never mint a token"
    monkeypatch.setenv("AUTH_JWT_SECRET", "x" * 40)
    tok = sa.expected_token()
    assert tok == sa.derive("x" * 40) and sa.is_supervisor_token(tok)
    monkeypatch.setenv("SUPERVISOR_TOKEN", "explicit-token-wins")
    assert sa.expected_token() == "explicit-token-wins"


# ── only the owner files sheets — a stranger's sheet could become code on main ──

def _register(c, email):
    r = c.post("/auth/register", json={"email": email, "username": email.split("@")[0],
                                       "password": "pw-" + "x" * 12})
    assert r.status_code == 201, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.mark.asyncio
async def test_only_the_owner_reaches_the_inspection_board(api_client, monkeypatch):
    _set_admins(monkeypatch, "boss@example.com")
    boss = _register(api_client, "boss@example.com")
    stranger = _register(api_client, "stranger@example.com")
    body = {"text": "این کد را در یک صفحه بگذار", "spot": SPOT}
    assert api_client.post("/api/inspection", json=body, headers=stranger).status_code == 403
    assert api_client.get("/api/inspection", headers=stranger).status_code == 403
    assert api_client.post("/api/inspection", json=body).status_code == 403, "anonymous is not the owner"
    rid = api_client.post("/api/inspection", json=body, headers=boss).json()["report"]["id"]
    assert api_client.post(f"/api/inspection/{rid}/files", headers=stranger,
                           files={"file": ("x.html", b"<script>", "text/html")}).status_code == 403
    # the supervisor token still works
    assert api_client.get("/api/inspection/queue", headers=SUP).status_code == 200


def test_html_is_read_as_its_whole_source():
    """A 102 KB attached page once counted as read after 8.9 KB of visible text."""
    from app.services.inspection_files import extract

    page = b"<html><head><style>.x{color:red}</style></head><body><p>hi</p><script>function go(){}</script></body></html>"
    ex = extract(page, "lab.html", "text/html")
    assert ex["status"] == "ok" and "function go()" in ex["text"] and ".x{color:red}" in ex["text"]
