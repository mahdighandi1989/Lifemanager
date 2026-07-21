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
async def test_extraction_scope_all_covers_content_but_heuristic_stays_safe(db_session):
    """scope=all sees EVERYTHING (non-starred items + writing BODIES), fixing
    «فقط همین ۱۲ تا؟». But with no AI the heuristic proposes ONLY the
    high-signal starred subset, so a broad scope can't dump every trivial
    list item as a proposal."""
    from app.models.personal_writing import PersonalWriting
    from app.models.todo_item import TodoItem

    db_session.add(TodoItem(content="هر روز قرآن", is_starred=True))
    db_session.add(TodoItem(content="شیر بخر", is_starred=False))
    db_session.add(
        PersonalWriting(title="دنیا و آخرت", body="باید هر روز محاسبه کنم.\n\nآرزو دارم قوی شوم.")
    )
    await db_session.commit()

    cands = await svc._gather_candidates(db_session, 0, 80, scope="all")
    texts = [c["text"] for c in cands]
    assert "شیر بخر" in texts  # a non-starred list item is now seen
    assert any("محاسبه" in t for t in texts)  # a writing BODY chunk is mined

    await svc.extract_directives(db_session, 0, use_ai=False, scope="all")
    props = {p["title"] for p in await svc.list_directives(db_session, 0, status="proposed")}
    assert "هر روز قرآن" in props  # starred kept
    assert "شیر بخر" not in props  # trivial non-starred NOT dumped (safe heuristic)


@pytest.mark.asyncio
async def test_config_defaults_extraction_scope_all(db_session):
    cfg = await svc.get_config(db_session)
    assert cfg["extraction_scope"] == "all" and int(cfg["extraction_limit"]) >= 40


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
async def test_steps_generate_fallback_and_current_step(db_session):
    """Layer 2: a directive breaks into ordered steps; the FIRST undone step is
    the «قدمِ الان». With no AI the next_step becomes a single step so the
    feature still does something."""
    d = await svc.add_manual(db_session, 0, title="در فارکس معامله کن", next_step="یک دموِ رایگان باز کن")
    res = await svc.generate_steps(db_session, d.id, 0, use_ai=False)
    assert [s["text"] for s in res["steps"]] == ["یک دموِ رایگان باز کن"]
    assert res["current_step"] == "یک دموِ رایگان باز کن"

    # richer steps → current advances as they're checked off
    d.steps = [{"text": "دمو باز کن", "done": False}, {"text": "استراتژی بنویس", "done": False}]
    await db_session.commit()
    r1 = await svc.set_step_done(db_session, d.id, 0, True, 0)
    assert r1["current_step"] == "استراتژی بنویس"
    assert r1["steps_done"] == 1 and r1["steps_total"] == 2
    # today's command carries the current step (not just the title)
    cmd = (await svc.select_today_commands(db_session, 0))["commands"]
    assert cmd and cmd[0]["current_step"] == "استراتژی بنویس"


def test_steps_routes(api_client):
    api_client.post("/api/directives", json={"title": "زبان یاد بگیر"})
    did = api_client.get("/api/directives?status=active").json()["directives"][0]["id"]
    gen = api_client.post(f"/api/directives/{did}/steps/generate")
    assert gen.status_code == 200, gen.text
    # no AI configured in tests → empty steps (no next_step); toggle out of range is a no-op
    tog = api_client.post(f"/api/directives/{did}/steps/toggle", json={"index": 0, "done": True})
    assert tog.status_code == 200


@pytest.mark.asyncio
async def test_schedule_assign_order_and_reminders(db_session):
    """Layer 3: a directive gets a WHEN (time window), the day's commands are
    ordered morning→night, and an in-window undone command fires a one-per-day
    reminder."""
    a = await svc.add_manual(db_session, 0, title="قرآن بخوان", domain="معنوی")   # → morning
    b = await svc.add_manual(db_session, 0, title="ورزش کن", domain="سلامت")      # → evening
    ra = await svc.assign_schedule(db_session, a.id, 0, use_ai=False)
    rb = await svc.assign_schedule(db_session, b.id, 0, use_ai=False)
    assert ra["preferred_time"] == "morning" and ra["time_label"] == "صبح"
    assert rb["preferred_time"] == "evening" and rb["time_label"] == "عصر"

    now = datetime(2026, 7, 22, 4, 0, tzinfo=timezone.utc)  # local 08:00 (morning)
    sel = await svc.select_today_commands(db_session, 0, now=now, persist=True)
    assert [c["title"] for c in sel["commands"]] == ["قرآن بخوان", "ورزش کن"]  # morning first

    r1 = await svc.run_time_reminders(db_session, 0, now=now)
    assert r1["reminded"] == 1  # only the morning one is in-window
    r2 = await svc.run_time_reminders(db_session, 0, now=now)
    assert r2["reminded"] == 0  # deduped for the rest of the day


@pytest.mark.asyncio
async def test_set_schedule_manual_and_clear(db_session):
    d = await svc.add_manual(db_session, 0, title="مطالعه")
    r = await svc.set_schedule(db_session, d.id, preferred_time="night", preferred_context="قبل خواب", user_id=0)
    assert r["preferred_time"] == "night" and r["preferred_context"] == "قبل خواب"
    r2 = await svc.set_schedule(db_session, d.id, preferred_time="", user_id=0)
    assert r2["preferred_time"] is None  # cleared


def test_schedule_routes(api_client):
    api_client.post("/api/directives", json={"title": "دعا بخوان"})
    did = api_client.get("/api/directives?status=active").json()["directives"][0]["id"]
    auto = api_client.post(f"/api/directives/{did}/schedule/auto")
    assert auto.status_code == 200 and auto.json()["directive"]["preferred_time"]
    man = api_client.put(f"/api/directives/{did}/schedule", json={"preferred_time": "morning"})
    assert man.json()["directive"]["preferred_time"] == "morning"


@pytest.mark.asyncio
async def test_context_load_scales_daily_count(db_session):
    """Layer 4: on a heavy day (many overdue tasks) the engine surfaces FEWER
    commands, and the /today payload carries the load context."""
    from app.models.task import Task, TaskStatus

    for i in range(8):
        await svc.add_manual(db_session, 0, title=f"عادت {i}")
    ctx0 = await svc.build_directive_context(db_session, 0)
    assert ctx0["load"] in ("light", "normal")  # no tasks yet

    # 6 overdue tasks → heavy day
    from datetime import date as _date
    for i in range(6):
        db_session.add(Task(title=f"t{i}", status=TaskStatus.TODO, due_date=_date(2020, 1, 1)))
    await db_session.commit()
    ctx = await svc.build_directive_context(db_session, 0)
    assert ctx["load"] == "heavy" and ctx["overdue_tasks"] >= 5

    now = datetime(2026, 7, 22, 8, 0, tzinfo=timezone.utc)
    sel = await svc.select_today_commands(db_session, 0, now=now, persist=True)
    assert sel["context"]["load"] == "heavy"
    assert len(sel["commands"]) == 3  # strict base 5, heavy → 5-2 = 3


def test_context_route(api_client):
    r = api_client.get("/api/directives/context")
    assert r.status_code == 200, r.text
    ctx = r.json()["context"]
    assert "load" in ctx and "open_tasks" in ctx


def test_token_set_stems_and_dedups():
    # possessive/verb suffixes collapse: «بیانت» ≈ «بیان»
    assert svc._token_set("فن بیانت را تمرین کن") == svc._token_set("فن بیان را تمرین کن")
    # near-dupes score high, distinct ones score 0 (no false merge)
    assert svc._jaccard(
        svc._token_set("حین نوشتن از کتاب رونویسی کن"),
        svc._token_set("هنگام نوشتن از کتاب رونویسی کن"),
    ) >= 0.6
    assert svc._jaccard(
        svc._token_set("محاسبهٔ نفس روزانه را انجام بده"),
        svc._token_set("در فارکس معامله و تمرین کن"),
    ) == 0.0


@pytest.mark.asyncio
async def test_fuzzy_dedup_blocks_near_duplicates(db_session):
    """Re-running extraction / intake must not pile up rewordings of what's
    already in play (owner 2026-07-21 «قاطی شدن»)."""
    assert await svc.auto_intake_from_text(db_session, 0, "فن بیان را تمرین کن") is not None
    # a slightly-reworded near-duplicate is blocked...
    assert await svc.auto_intake_from_text(db_session, 0, "فن بیانت را تمرین کن") is None
    # ...but a genuinely distinct directive still gets in.
    assert await svc.auto_intake_from_text(db_session, 0, "حفظ قرآن را ادامه بده") is not None


@pytest.mark.asyncio
async def test_bulk_approve_and_reject(db_session):
    for t in ["a", "b", "c"]:
        await svc.auto_intake_from_text(db_session, 0, t)  # proposed
    n = await svc.bulk_set_status(db_session, 0, from_status="proposed", to_status="active")
    assert n == 3
    assert len(await svc.list_directives(db_session, 0, status="active")) == 3
    assert len(await svc.list_directives(db_session, 0, status="proposed")) == 0


def test_bulk_routes(api_client):
    # reject-all / approve-all on an empty proposed set are safe no-ops (0 moved)
    r = api_client.post("/api/directives/reject-all")
    assert r.status_code == 200 and r.json()["ok"] is True and r.json()["moved"] == 0
    a = api_client.post("/api/directives/approve-all")
    assert a.status_code == 200 and a.json()["moved"] == 0


@pytest.mark.asyncio
async def test_steps_stay_faithful_to_owner_subitems(db_session):
    """The owner's OWN breakdown wins: a todo item's child items become the
    directive's steps verbatim (no AI) rather than invented ones."""
    from app.models.todo_item import TodoItem

    parent = TodoItem(content="کسب درآمد", is_starred=True)
    db_session.add(parent)
    await db_session.commit()
    await db_session.refresh(parent)
    for s in ["واردات را یاد بگیر", "بازار هدف را پیدا کن", "نمونه سفارش بده"]:
        db_session.add(TodoItem(content=s, parent_id=parent.id))
    await db_session.commit()

    d = await svc.add_manual(db_session, 0, title="کسب درآمد")
    d.source_type = "todo_item"
    d.source_ref = str(parent.id)
    await db_session.commit()

    src = await svc._source_context(db_session, d)
    assert src["existing"] == ["واردات را یاد بگیر", "بازار هدف را پیدا کن", "نمونه سفارش بده"]
    res = await svc.generate_steps(db_session, d.id, 0, use_ai=False)
    assert [s["text"] for s in res["steps"]] == src["existing"]  # verbatim, faithful


def test_extract_written_steps_parses_owner_lists():
    body = "مقدمه.\n۱. اول این\n2) بعد آن\n- و این\n* و آن\nمتن عادی که قدم نیست."
    steps = svc._extract_written_steps(body)
    assert steps == ["اول این", "بعد آن", "و این", "و آن"]


# ── review 2026-07-21 regression fixes ────────────────────────────────────────
@pytest.mark.asyncio
async def test_same_day_toggle_reverses_strength_and_streak(db_session):
    """Finding #1: re-answering the same day fully REVERSES the prior answer's
    strength+streak (not just the counter) and is idempotent."""
    d = await svc.add_manual(db_session, 0, title="ذکر")
    await svc.mark(db_session, d.id, True, 0, now=_now(day=1))
    await svc.mark(db_session, d.id, True, 0, now=_now(day=2))
    r = await svc.mark(db_session, d.id, True, 0, now=_now(day=3))
    assert r["directive"]["strength"] == 21 and r["directive"]["streak"] == 3

    # toggle day-3 done → miss: reverse the done (21-7=14, streak 3-1=2), then
    # apply miss (streak 0, 14-12=2). NOT the buggy 21-12=9.
    r2 = await svc.mark(db_session, d.id, False, 0, now=_now(day=3))
    assert r2["directive"]["strength"] == 2 and r2["directive"]["streak"] == 0
    assert r2["directive"]["times_done"] == 2 and r2["directive"]["times_missed"] == 1

    # re-sending the SAME (miss) answer is idempotent — no drift.
    r3 = await svc.mark(db_session, d.id, False, 0, now=_now(day=3))
    assert r3["directive"]["strength"] == 2 and r3["directive"]["times_missed"] == 1


@pytest.mark.asyncio
async def test_evening_tick_does_not_sweep_freshly_surfaced(db_session):
    """Finding #2: a first tick that lands in the evening surfaces the day's
    commands but must NOT immediately sweep them as missed in the same tick."""
    d = await svc.add_manual(db_session, 0, title="ورزش")
    await svc.mark(db_session, d.id, True, 0, now=_now(day=4))  # strength 7

    # day 5: app was asleep all day, first tick at local 21:00 (UTC 17 + 4h)
    await svc.directive_tick(db_session, now=_now(day=5, hour=17))
    after = (await svc.list_directives(db_session, 0, status="active"))[0]
    assert after["strength"] == 7  # NOT swept (a miss would be max(0, 7-12)=0)
    cmds = (await svc.select_today_commands(db_session, 0, now=_now(day=5, hour=17)))["commands"]
    assert cmds and cmds[0]["done"] is None  # surfaced, unanswered


@pytest.mark.asyncio
async def test_mark_and_today_ignore_non_active(db_session):
    """Findings #3/#4: mark() is a no-op on a non-active directive, and a
    directive archived after surfacing drops off today's command list."""
    p = await svc.auto_intake_from_text(db_session, 0, "زبان")  # proposed
    r = await svc.mark(db_session, p.id, True, 0, now=_now())
    assert r.get("skipped") == "not_active" and r["directive"]["strength"] == 0

    a = await svc.add_manual(db_session, 0, title="نماز اول وقت")
    await svc.select_today_commands(db_session, 0, now=_now(day=6), persist=True)  # surfaces a
    await svc.set_status(db_session, a.id, "archived", 0)  # archived after surfacing
    cmds = (await svc.select_today_commands(db_session, 0, now=_now(day=6)))["commands"]
    assert all(c["id"] != a.id for c in cmds)  # archived one dropped off


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
