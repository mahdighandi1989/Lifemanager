"""Personal writings (نوشته‌های من) — seed completeness + idempotency + routes.

The seed module was generated with a merge gate proving every sentence of every
source revision is present verbatim (exact-duplicate-only dedup). These tests
pin the outcome so a regressed regeneration fails loudly.
"""
from __future__ import annotations

import pytest
from sqlalchemy import func, select

from app.services import _personal_writings_seed_data as pw
from app.services.personal_writings_seed import ensure_personal_writings_seeded


def test_seed_data_pinned():
    assert pw.PW_EXPECTED_COUNT == 2 == len(pw.PW_WRITINGS)
    assert pw.PW_APPENDIX_BLOCKS == 6            # old-revision blocks preserved
    assert pw.PW_BODY_CHARS == [len(w["body"]) for w in pw.PW_WRITINGS]
    assert pw.PW_BODY_CHARS[0] > 50_000          # merged autobiography
    assert pw.PW_BODY_CHARS[1] > 60_000          # goals document, whole


def test_seed_data_content_integrity():
    khoda, goals = pw.PW_WRITINGS
    # merged autobiography: base + marked appendix of the older revision
    assert "ضمیمه" in khoda["body"] and "ادامه دارد" in khoda["body"]
    assert khoda["category"] == "خداشناسی و شرح حال"
    # goals document intact, incl. sections that also exist as خودسازی lists
    assert "بسم الله" in goals["body"]
    assert "کارهایی که منو عاشق خدا میکنه" in goals["body"]
    assert "مردِ خدا" in goals["body"]
    assert goals["category"] == "برنامه‌ریزی الهی"


@pytest.mark.asyncio
async def test_seeder_idempotent(db_session):
    from app.models.personal_writing import PersonalWriting

    r1 = await ensure_personal_writings_seeded(db_session)
    assert r1["writings_added"] == 2
    r2 = await ensure_personal_writings_seeded(db_session)
    assert r2["writings_added"] == 0
    n = (await db_session.execute(select(func.count(PersonalWriting.id)))).scalar()
    assert n == 2
    row = (await db_session.execute(
        select(PersonalWriting).where(PersonalWriting.category == "خداشناسی و شرح حال")
    )).scalars().one()
    assert len(row.body) == pw.PW_BODY_CHARS[0]  # stored without truncation


def test_writings_routes_roundtrip(api_client):
    # create → list (no body) → detail (full body) → update → delete
    r = api_client.post("/api/writings", json={
        "title": "جستار آزمایشی", "body": "متن " * 100, "category": "آزمون",
        "written_at": "2024-01-01",
    })
    assert r.status_code == 201, r.text
    wid = r.json()["id"]

    r = api_client.get("/api/writings")
    assert r.status_code == 200
    listed = r.json()["writings"]
    assert any(w["id"] == wid for w in listed)
    assert all("body" not in w for w in listed)      # summaries omit the body

    r = api_client.get(f"/api/writings/{wid}")
    assert r.status_code == 200 and r.json()["body"].startswith("متن")

    r = api_client.put(f"/api/writings/{wid}", json={"title": "جستار ویرایش‌شده"})
    assert r.status_code == 200 and r.json()["title"] == "جستار ویرایش‌شده"

    assert api_client.delete(f"/api/writings/{wid}").status_code == 204
    assert api_client.get(f"/api/writings/{wid}").status_code == 404
