"""موتور نهادینه‌سازی — the internalization engine.

Covers app/services/directive_service.py (extraction heuristic, daily command
selection, done→strength→streak→graduation, miss penalty, evening sweep,
growth report, auto-intake) and app/routes/directives.py (the surface + the
write-gate). AI is never configured here, so the deterministic HEURISTIC
extraction path is exercised end-to-end.
"""
from datetime import datetime, timedelta, timezone

import pytest

from app.services import directive_service as svc


def _now(day=22, hour=8):
    return datetime(2026, 7, day, hour, 0, tzinfo=timezone.utc)


# ── service layer ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_extract_is_heuristic_and_idempotent(db_session):
    from app.models.todo_item import TodoItem

    for t in ["هر روز قرآن بخوان", "ورزش روزانه", "کتاب بخوان"]:
        db_session.add(TodoItem(content=t, is_starred=True))
    await db_session.commit()

    first = await svc.extract_directives(db_session, 0, use_ai=False)
    assert first["ok"] and first["proposed_added"] == 3 and first["used_ai"] is False

    props = await svc.list_directives(db_session, 0, status="proposed")
    assert len(props) == 3
    # domain heuristic tagged the spiritual/health/knowledge items
    domains = {p["title"]: p["domain"] for p in props}
    assert domains["هر روز قرآن بخوان"] == "معنوی"
    assert domains["ورزش روزانه"] == "سلامت"

    # re-running adds nothing (dedup by normalized title)
    again = await svc.extract_directives(db_session, 0, use_ai=False)
    assert again["proposed_added"] == 0 and again["skipped"] == 3


@pytest.mark.asyncio
async def test_approve_reject_transitions(db_session):
    d = await svc.add_manual(db_session, 0, title="مراقبه", cadence="daily")
    assert d.status == "active"  # manual adds are active immediately
    d2 = await svc.auto_intake_from_text(db_session, 0, "زبان یاد بگیر")
    assert d2 is not None and d2.status == "proposed"
    activated = await svc.set_status(db_session, d2.id, "active", 0)
    assert activated.status == "active"
    archived = await svc.set_status(db_session, d.id, "archived", 0)
    assert archived.status == "archived"


@pytest.mark.asyncio
async def test_auto_intake_dedupes(db_session):
    a = await svc.auto_intake_from_text(db_session, 0, "نماز اول وقت")
    assert a is not None
    b = await svc.auto_intake_from_text(db_session, 0, "  نماز اول وقت  ")  # same normalized
    assert b is None


@pytest.mark.asyncio
async def test_select_today_persists_and_caps(db_session):
    for i in range(8):
        await svc.add_manual(db_session, 0, title=f"فرمان {i}")
    # strict preset caps daily_count at 5
    res = await svc.select_today_commands(db_session, 0, now=_now(), persist=True)
    assert len(res["commands"]) == 5 and res["persisted"] is True
    # second call the same LOCAL day returns the SAME persisted set (idempotent).
    # hour=16 UTC + the tz offset (+4h) = 20:00 local, still the same day.
    again = await svc.select_today_commands(db_session, 0, now=_now(hour=16))
    assert {c["id"] for c in again["commands"]} == {c["id"] for c in res["commands"]}
    assert again["persisted"] is True


@pytest.mark.asyncio
async def test_done_raises_strength_and_graduates(db_session):
    d = await svc.add_manual(db_session, 0, title="حفظ قرآن")
    graduated_on = None
    last = None
    for i in range(30):
        last = await svc.mark(db_session, d.id, True, 0, now=_now(day=1) + timedelta(days=i))
        if last["graduated"]:
            graduated_on = i
            break
    # strict preset: grad_streak=21, grad_strength=90 → graduates on the 21st done
    assert graduated_on == 20
    assert last["directive"]["status"] == "graduated"
    assert last["directive"]["strength"] == 100 and last["directive"]["streak"] == 21


@pytest.mark.asyncio
async def test_miss_resets_streak_and_drops_strength(db_session):
    d = await svc.add_manual(db_session, 0, title="ورزش")
    await svc.mark(db_session, d.id, True, 0, now=_now(day=1))
    await svc.mark(db_session, d.id, True, 0, now=_now(day=2))
    r = await svc.mark(db_session, d.id, False, 0, now=_now(day=3))  # miss
    assert r["directive"]["streak"] == 0
    # 2 gains (7+7=14) then a penalty (12) → 2
    assert r["directive"]["strength"] == 2
    assert r["directive"]["times_missed"] == 1


@pytest.mark.asyncio
async def test_evening_followup_marks_unanswered_missed(db_session):
    for i in range(3):
        await svc.add_manual(db_session, 0, title=f"عادت {i}")
    await svc.select_today_commands(db_session, 0, now=_now(), persist=True)
    # answer one, leave two
    cmds = (await svc.select_today_commands(db_session, 0, now=_now()))["commands"]
    await svc.mark(db_session, cmds[0]["id"], True, 0, now=_now(hour=10))
    # hour=17 UTC + tz (+4h) = 21:00 local, same day as the morning surfacing.
    summary = await svc.run_evening_followup(db_session, 0, now=_now(hour=17))
    assert summary["missed"] == 2  # the two unanswered commands


@pytest.mark.asyncio
async def test_growth_report_counts(db_session):
    a = await svc.add_manual(db_session, 0, title="a")
    await svc.add_manual(db_session, 0, title="b")
    await svc.auto_intake_from_text(db_session, 0, "c-proposed")
    await svc.mark(db_session, a.id, True, 0, now=_now())  # a is now forming
    rep = await svc.growth_report(db_session, 0, now=_now())
    assert rep["counts"]["active"] == 2
    assert rep["counts"]["forming"] == 1 and rep["counts"]["not_started"] == 1
    assert rep["counts"]["proposed"] == 1


@pytest.mark.asyncio
async def test_reconcile_archives_directive_when_source_trashed(db_session):
    from app.models.todo_item import TodoItem

    it = TodoItem(content="هر روز قرآن", is_starred=True)
    db_session.add(it)
    await db_session.commit()
    await db_session.refresh(it)

    assert (await svc.extract_directives(db_session, 0, use_ai=False))["proposed_added"] == 1
    d_id = (await svc.list_directives(db_session, 0, status="proposed"))[0]["id"]
    await svc.set_status(db_session, d_id, "active", 0)

    # trash the source todo item → reconcile archives its directive
    it.deleted_at = datetime.now(timezone.utc)
    await db_session.commit()
    assert await svc.reconcile_sources(db_session, 0) == 1
    assert len(await svc.list_directives(db_session, 0, status="archived")) == 1
    assert len(await svc.list_directives(db_session, 0, status="active")) == 0


@pytest.mark.asyncio
async def test_run_daily_intake_adds_new_and_removes_gone(db_session):
    from app.models.todo_item import TodoItem

    a = TodoItem(content="ورزش روزانه", is_starred=True)
    db_session.add(a)
    await db_session.commit()

    r1 = await svc.run_daily_intake(db_session, 0)  # new starred item → proposed
    assert r1["proposed_added"] == 1 and r1["archived"] == 0

    d_id = (await svc.list_directives(db_session, 0, status="proposed"))[0]["id"]
    await svc.set_status(db_session, d_id, "active", 0)
    await db_session.delete(a)  # source removed entirely
    await db_session.commit()

    r2 = await svc.run_daily_intake(db_session, 0)  # gone source → archived
    assert r2["archived"] == 1


@pytest.mark.asyncio
async def test_config_strict_preset_and_update(db_session):
    cfg = await svc.get_config(db_session)
    assert cfg["mode"] == "strict" and cfg["daily_count"] == 5 and cfg["grad_streak"] == 21
    updated = await svc.update_config(db_session, {"mode": "gentle"})
    assert updated["mode"] == "gentle" and updated["daily_count"] == 3  # preset follows mode


# ── routes ────────────────────────────────────────────────────────────────────
def test_directives_endpoints_flow(api_client):
    assert api_client.post("/api/directives", json={"title": "هر روز قرآن"}).status_code == 200
    listed = api_client.get("/api/directives?status=active").json()
    assert listed["count"] == 1
    did = listed["directives"][0]["id"]

    today = api_client.get("/api/directives/today").json()
    assert any(c["id"] == did for c in today["commands"])

    done = api_client.post(f"/api/directives/{did}/done").json()
    assert done["ok"] is True and done["directive"]["strength"] > 0 and done["directive"]["streak"] == 1

    rep = api_client.get("/api/directives/report").json()["report"]
    assert rep["counts"]["active"] == 1 and rep["today"]["done"] == 1


def test_extract_endpoint_and_config(api_client):
    r = api_client.post("/api/directives/extract")
    assert r.status_code == 200, r.text
    body = r.json()  # now runs the full sync (add + remove)
    assert body["ok"] is True and "proposed_added" in body and "archived" in body
    cfg = api_client.get("/api/directives/config").json()["config"]
    assert cfg["mode"] == "strict" and cfg["channel"] == "both"


def test_archive_and_restore_via_routes(api_client):
    api_client.post("/api/directives", json={"title": "مراقبه"})
    did = api_client.get("/api/directives?status=active").json()["directives"][0]["id"]
    # «کنار بگذار» → archived, drops out of the active routine
    assert api_client.post(f"/api/directives/{did}/reject").json()["directive"]["status"] == "archived"
    assert api_client.get("/api/directives?status=active").json()["count"] == 0
    # «برگردان» → back to active
    assert api_client.post(f"/api/directives/{did}/approve").json()["directive"]["status"] == "active"
    assert api_client.get("/api/directives?status=active").json()["count"] == 1


def test_command_desk_exposes_today_commands(api_client):
    api_client.post("/api/directives", json={"title": "مراقبه شبانه"})
    desk = api_client.get("/api/command-center/today")
    assert desk.status_code == 200, desk.text
    commands = desk.json().get("commands", {})
    assert commands.get("count", 0) >= 1
    assert any("مراقبه" in c["title"] for c in commands.get("items", []))


def test_directive_mutations_require_auth_when_configured(api_client, monkeypatch):
    """Flipping REQUIRE_AUTH=true closes every directive mutation to anon
    callers (same seam as backup/finance). Reads stay open.

    Patch REQUIRE_AUTH on the EXACT object the gate dereferences
    (``app.dependencies.auth.settings``), not a fresh ``from app.config import
    settings`` — an earlier test in the full suite reloads/reassigns
    ``app.config.settings`` (see test_database.py), which would leave a
    config-imported reference pointing at a different object than the gate's,
    so the monkeypatch wouldn't reach the gate and it would wrongly allow the
    call (2026-07-21 full-suite flake)."""
    from app.dependencies import auth as _auth

    monkeypatch.setattr(_auth.settings, "REQUIRE_AUTH", True)
    assert api_client.post("/api/directives", json={"title": "x"}).status_code == 401
    assert api_client.post("/api/directives/extract").status_code == 401
    assert api_client.post("/api/directives/1/done").status_code == 401
    assert api_client.put("/api/directives/config", json={"mode": "gentle"}).status_code == 401
    # a read is still allowed
    assert api_client.get("/api/directives/report").status_code == 200
