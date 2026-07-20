"""Phase 4 (2026-07-20): global assistant, search, system map."""
from __future__ import annotations

import pytest


@pytest.mark.asyncio
async def test_chat_endpoint_falls_back_honestly_without_model(api_client):
    r = api_client.post("/api/ai/chat", json={"message": "وضعیت مالی‌ام چطوره؟"})
    assert r.status_code == 200, r.text
    body = r.json()
    # No model configured in tests → ok:false with an honest Persian fallback
    # that still carries the live data summary.
    assert body["ok"] is False
    assert "مدل" in body["text"]


@pytest.mark.asyncio
async def test_global_search_spans_domains(api_client):
    api_client.post("/api/tasks/", json={"title": "خرید هدیه تولد"})
    lst = api_client.post("/api/lists", json={"name": "هدیه‌ها"}).json()
    api_client.post(
        f"/api/lists/{lst['id']}/items", json={"content": "هدیه برای مادر"}
    )
    api_client.post("/api/writings", json={"title": "دربارهٔ هدیه دادن", "body": "متن"})
    r = api_client.get("/api/search", params={"q": "هدیه"})
    assert r.status_code == 200, r.text
    kinds = {res["kind"] for res in r.json()["results"]}
    assert {"task", "todo_item", "list", "writing"} <= kinds
    # هر نتیجه لینک ناوبری دارد.
    assert all(res["url"] for res in r.json()["results"])


@pytest.mark.asyncio
async def test_global_search_short_query_is_empty(api_client):
    r = api_client.get("/api/search", params={"q": "a"})
    assert r.status_code == 200 and r.json()["results"] == []


@pytest.mark.asyncio
async def test_system_map_lists_capabilities_with_counts(api_client):
    api_client.post("/api/tasks/", json={"title": "یک تسک"})
    r = api_client.get("/api/system-map")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["counts"]["tasks"] >= 1
    keys = {s["key"] for s in body["sections"]}
    assert {"capture", "day", "content", "life", "brain_ai", "safety"} <= keys
    # هر آیتم توضیح فارسی دارد.
    for section in body["sections"]:
        assert all(i["desc"] for i in section["items"])
