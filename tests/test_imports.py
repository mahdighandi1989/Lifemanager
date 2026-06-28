"""Import engine + endpoints (ALLIN1 port).

Covers app/services/import_service.py (parse / bulk / dedup / AI extraction) and
app/routes/imports.py. Bulk-import logic is unit-tested against the real
``db_session``; endpoints via ``api_client``.
"""
from __future__ import annotations

import pytest


# ── bulk import engine (unit) ────────────────────────────────────────


@pytest.mark.asyncio
async def test_bulk_import_dry_run_then_commit_then_idempotent(db_session):
    from sqlalchemy import func, select

    from app.models.task import Task
    from app.services.import_service import bulk_import

    csv = b"title,description,priority\nBuy milk,store,high\nCall mom,,low\nBuy milk,dup,medium\n"

    dry = await bulk_import(db_session, "tasks", csv, "t.csv", user_id=1, dry_run=True)
    assert dry["would_create"] == 2 and dry["skipped_existing"] == 1 and dry["created"] == 0

    real = await bulk_import(db_session, "tasks", csv, "t.csv", user_id=1, dry_run=False)
    assert real["created"] == 2

    count = (await db_session.execute(select(func.count()).select_from(Task))).scalar()
    assert count == 2

    again = await bulk_import(db_session, "tasks", csv, "t.csv", user_id=1, dry_run=False)
    assert again["created"] == 0 and again["skipped_existing"] == 3


@pytest.mark.asyncio
async def test_bulk_import_missing_required_column(db_session):
    from app.services.import_service import ImportParseError, bulk_import

    with pytest.raises(ImportParseError):
        await bulk_import(db_session, "tasks", b"description\nx\n", "x.csv", user_id=1, dry_run=True)


@pytest.mark.asyncio
async def test_bulk_import_row_error_is_collected(db_session):
    from app.services.import_service import bulk_import

    # bad priority on row 2; row 3 fine
    csv = b"title,priority\nA,not-a-priority\nB,low\n"
    res = await bulk_import(db_session, "tasks", csv, "t.csv", user_id=1, dry_run=True)
    assert res["would_create"] == 1
    assert res["errors"] and res["errors"][0]["row"] == 2


@pytest.mark.asyncio
async def test_import_people_from_json(db_session):
    from app.services.import_service import bulk_import

    data = b'[{"name": "Ada", "email": "ada@x.io"}, {"name": "Linus"}]'
    res = await bulk_import(db_session, "people", data, "p.json", user_id=5, dry_run=False)
    assert res["created"] == 2


@pytest.mark.asyncio
async def test_ai_extraction_persists_rows(db_session, monkeypatch):
    import app.services.ai.inference_gateway as gw
    from app.services.import_service import _extract_rows_with_ai, import_rows

    async def fake_complete(db, prompt, **kw):
        return {"ok": True, "text": '[{"description": "salary", "amount": "1000"}]', "model": "x"}

    monkeypatch.setattr(gw, "complete", fake_complete)
    rows = await _extract_rows_with_ai(
        db_session, "incomes", b"raw text invoice", "note.txt", "text/plain", None
    )
    assert rows and rows[0]["description"] == "salary"
    res = await import_rows(db_session, "incomes", rows, user_id=9, dry_run=False)
    assert res["created"] == 1


# ── endpoints (api_client) ───────────────────────────────────────────


def test_targets_endpoint_lists_entities(api_client):
    res = api_client.get("/api/imports/targets")
    assert res.status_code == 200, res.text
    ids = {t["id"] for t in res.json()}
    assert {"tasks", "people", "incomes", "assets"} <= ids


def test_template_download(api_client):
    res = api_client.get("/api/imports/tasks/template")
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("text/csv")
    assert "title" in res.text


def test_bulk_import_endpoint_dry_run(api_client):
    res = api_client.post(
        "/api/imports/tasks?dry_run=true",
        files={"file": ("t.csv", b"title\nHello world\n", "text/csv")},
    )
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["dry_run"] is True and body["would_create"] == 1


def test_bulk_import_unknown_target_404(api_client):
    res = api_client.post(
        "/api/imports/nope", files={"file": ("t.csv", b"x\n", "text/csv")}
    )
    assert res.status_code == 404


def test_ai_models_endpoint(api_client):
    res = api_client.get("/api/imports/ai-models")
    assert res.status_code == 200
    body = res.json()
    assert "models" in body and "any_available" in body  # empty (catalog unseeded in tests)


def test_analyze_creates_job(api_client):
    res = api_client.post(
        "/api/imports/analyze",
        data={"target": "tasks"},
        files={"file": ("doc.txt", b"some text", "text/plain")},
    )
    assert res.status_code == 200, res.text
    job_id = res.json()["job_id"]
    poll = api_client.get(f"/api/imports/jobs/{job_id}")
    assert poll.status_code == 200 and poll.json()["job_id"] == job_id
