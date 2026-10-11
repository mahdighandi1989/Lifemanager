"""«رکوردهای برنامه»: the real storage of /apps/learning-architecture (records
scoped per user, upserted in batches) and its AI door through Lifemanager's
own AI layer — no provider key ever in the browser."""
import pytest


@pytest.mark.asyncio
async def test_records_round_trip_and_upsert(api_client):
    base = "/api/app-records/learning-architecture"
    assert api_client.get(base).json()["records"] == []
    recs = [{"id": "case_1", "type": "case", "title": "خبر کانال", "st": {"st_intake": {"data": {"input": "x"}}}},
            {"id": "settings", "type": "set", "seenStart": True}]
    r = api_client.post(f"{base}/bulk", json={"records": recs})
    assert r.status_code == 200 and r.json()["saved"] == 2
    recs[0]["title"] = "خبر کانال (ویرایش)"
    api_client.post(f"{base}/bulk", json={"records": [recs[0]]})
    got = {x["id"]: x for x in api_client.get(base).json()["records"]}
    assert len(got) == 2 and got["case_1"]["title"] == "خبر کانال (ویرایش)", "upsert, not duplicate"
    assert got["case_1"]["st"]["st_intake"]["data"]["input"] == "x", "the app's document comes back intact"
    assert api_client.delete(f"{base}/case_1").json()["deleted"] is True
    assert [x["id"] for x in api_client.get(base).json()["records"]] == ["settings"]


@pytest.mark.asyncio
async def test_unknown_app_and_bad_records_are_refused(api_client):
    assert api_client.get("/api/app-records/someone-else").status_code == 404
    assert api_client.post("/api/app-records/learning-architecture/bulk", json={"records": [{"type": "x"}]}).status_code == 422


@pytest.mark.asyncio
async def test_ai_door_degrades_without_a_model(api_client):
    r = api_client.post("/api/app-records/learning-architecture/ai", json={"system": "s", "user": "u"})
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] in (True, False) and "text" in body
    if not body["ok"]:
        assert body["error"], "a clear message instead of a crash"


def test_learning_architecture_task_is_pinnable():
    from app.services.ai.catalog import TASK_TYPES
    assert any(t["id"] == "learning_architecture" for t in TASK_TYPES)
