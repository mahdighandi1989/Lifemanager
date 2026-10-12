"""«رکوردهای برنامه»: the real storage of /apps/learning-architecture (records
scoped per user, upserted in batches) and its AI door through Lifemanager's
own AI layer — no provider key ever in the browser."""
import pytest

def _signin(api_client, email="owner-la@example.com"):
    """The page is behind login; /api/app-records refuses anonymous callers."""
    r = api_client.post("/auth/register", json={"email": email, "password": "hunter2-long", "username": email.split("@")[0]})
    assert r.status_code == 201, r.text
    api_client.headers.update({"Authorization": f"Bearer {r.json()['access_token']}"})
    return api_client



@pytest.mark.asyncio
async def test_records_round_trip_and_upsert(api_client):
    _signin(api_client)
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
    _signin(api_client)
    assert api_client.get("/api/app-records/someone-else").status_code == 404
    assert api_client.post("/api/app-records/learning-architecture/bulk", json={"records": [{"type": "x"}]}).status_code == 422


@pytest.mark.asyncio
async def test_ai_door_degrades_without_a_model(api_client):
    _signin(api_client)
    r = api_client.post("/api/app-records/learning-architecture/ai", json={"system": "s", "user": "u"})
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] in (True, False) and "text" in body
    if not body["ok"]:
        assert body["error"], "a clear message instead of a crash"


def test_learning_architecture_task_is_pinnable():
    from app.services.ai.catalog import TASK_TYPES
    assert any(t["id"] == "learning_architecture" for t in TASK_TYPES)


@pytest.mark.asyncio
async def test_anonymous_and_pending_callers_are_refused(api_client):
    base = "/api/app-records/learning-architecture"
    assert api_client.get(base).status_code == 401, "no token ⇒ 401 even with REQUIRE_AUTH=false"
    assert api_client.post(f"{base}/bulk", json={"records": []}).status_code == 401
    assert api_client.get(f"{base}/mirror").status_code == 401
    assert api_client.get(base, headers={"Authorization": "Bearer forged"}).status_code == 401


@pytest.mark.asyncio
async def test_one_bad_record_never_blocks_the_batch(api_client):
    _signin(api_client)
    base = "/api/app-records/learning-architecture"
    big = {"id": "case_big", "type": "case", "blob": "x" * 2_000_100}
    r = api_client.post(f"{base}/bulk", json={"records": [
        {"id": "case_ok", "type": "case"}, big, {"id": "a/b", "type": "case"}, {"id": "case_ok", "type": "case", "v": 2}]})
    body = r.json()
    assert r.status_code == 200 and body["saved"] == 1
    assert {x["id"] for x in body["rejected"]} == {"case_big", "a/b"}
    got = {x["id"]: x for x in api_client.get(base).json()["records"]}
    assert list(got) == ["case_ok"] and got["case_ok"]["v"] == 2, "duplicate id in one batch ⇒ last copy wins"
    # an oversized body is refused before parsing
    r = api_client.post(f"{base}/bulk", content=b"{" + b" " * 8_000_100 + b"}", headers={"content-type": "application/json"})
    assert r.status_code == 413


@pytest.mark.asyncio
async def test_malformed_mirror_input_is_a_422_not_a_500(api_client):
    _signin(api_client)
    base = "/api/app-records/learning-architecture/mirror"
    assert api_client.post(base, json={"items": ["x"]}).status_code == 422
    assert api_client.post(base, json={"items": [{"rec_id": "c1", "tabs": "nope"}]}).status_code == 422
    assert api_client.post(base, json={"items": [{"rec_id": "c1", "tabs": [{"name": "a", "rows": [[1, None]]}]}]}).status_code == 200


@pytest.mark.asyncio
async def test_usage_reports_ai_calls_and_an_estimated_cost_only_when_priced(db_session):
    from app.models.ai_catalog import AICatalogModel
    from app.models.ai_usage import AIUsageLog
    from app.routes.app_records import app_usage

    db_session.add(AICatalogModel(model_key="m1", provider_key="gemini", display_name="Gemini X", enabled=True,
                                  capabilities=["text"], priority=2, source="live", is_custom=False,
                                  input_cost_per_1m=1.0, output_cost_per_1m=4.0))
    db_session.add(AIUsageLog(task="learning_architecture", model="Gemini X", provider="gemini", ok=True,
                              prompt_chars=4_000_000, output_chars=400_000))
    db_session.add(AIUsageLog(task="learning_architecture", model="Unpriced", provider="gemini", ok=True,
                              prompt_chars=400, output_chars=40))
    db_session.add(AIUsageLog(task="other_task", model="Gemini X", provider="gemini", ok=True, prompt_chars=9, output_chars=9))
    await db_session.commit()
    r = await app_usage("learning-architecture", db_session, 0)
    ms = {m["model"]: m for m in r["ai_30d"]["models"]}
    assert set(ms) == {"Gemini X", "Unpriced"}, "only this page's task"
    assert ms["Gemini X"]["est_cost_usd"] == 1.4  # 1M in tokens × $1 + 0.1M out × $4
    assert ms["Unpriced"]["est_cost_usd"] is None and r["ai_30d"]["all_priced"] is False
