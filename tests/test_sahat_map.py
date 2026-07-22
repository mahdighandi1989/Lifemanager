"""خداشهر — every entity buckets under a human dimension (placement), gets
staged and tracked; the map is a CALM organizer, never a judge (no moral
labels). Staging (مرحله‌بندی) is the «نخِ تسبیح» done right."""
import datetime as dt

import pytest

from app.models.personal_writing import PersonalWriting
from app.models.task import Task, TaskStatus
from app.models.todo_item import TodoItem
from app.models.todo_list import TodoList
from app.services import sahat_service as ss


def test_classify_and_backbone_rules():
    assert ss.classify_text("ورزش صبحگاهی") == "khod_jesm"
    assert ss.classify_text("نماز اول وقت") == "khoda"
    assert ss.classify_text("خواندن کتاب فلسفه") == "khod_aql"
    assert ss.classify_text("تماس با مادر") == "digaran"
    assert ss.classify_text("کاری بدون نشانه") == "khod_ravan"  # default = اراده
    assert ss.backbone_sahat_for_list("کارهایی که منو عاشق خدا میکنه") == "khoda"
    assert ss.backbone_sahat_for_list("خودسازی - محاسبه میان و پایان هفته") == "khod_ravan"
    assert ss.backbone_sahat_for_list("لیست ترس هایی که دارم") == "khod_ravan"
    assert ss.backbone_sahat_for_list("شخصیت یک مرد الهی – مردِ خدا") == "khoda"
    assert ss.backbone_sahat_for_list("لیست خرید") is None


@pytest.mark.asyncio
async def test_map_buckets_everything_and_weights(db_session):
    yesterday = dt.date.today() - dt.timedelta(days=1)
    # a person-linked overdue task ⇒ دیگران with حق‌الناس weight 5
    from app.models.person import Person
    from app.models.person_task import person_tasks

    p = Person(user_id=0, name="علی")
    t_haq = Task(user_id=0, title="تحویل پروژه", status=TaskStatus.TODO, due_date=yesterday)
    t_sport = Task(user_id=0, title="ورزش روزانه", status=TaskStatus.DONE)
    db_session.add_all([p, t_haq, t_sport])
    await db_session.flush()
    await db_session.execute(person_tasks.insert().values(person_id=p.id, task_id=t_haq.id))

    # backbone list with items
    lst = TodoList(user_id=0, name="کارهایی که منو عاشق خدا میکنه")
    it1 = TodoItem(owner_id=0, content="ذکر روزانه", is_completed=True)
    it2 = TodoItem(owner_id=0, content="سحرخیزی", is_completed=False)
    db_session.add_all([lst, it1, it2])
    await db_session.flush()
    from app.models.todo_list import todo_list_items

    await db_session.execute(todo_list_items.insert().values(todo_list_id=lst.id, todo_item_id=it1.id))
    await db_session.execute(todo_list_items.insert().values(todo_list_id=lst.id, todo_item_id=it2.id))

    # backbone writing → خدا
    db_session.add(PersonalWriting(user_id=0, title="تاریخچهٔ خداشناسی من", body="..."))
    await db_session.commit()

    data = await ss.build_sahat_map(db_session, 0)
    by_key = {s["key"]: s for s in data["sahats"]}
    assert set(by_key) == set(ss.SAHATS)

    # the overdue person-linked task shows in دیگران, plainly (someone waiting)
    dig = by_key["digaran"]
    assert any(a["kind"] == "waiting" and "تحویل پروژه" in a["label"] for a in dig["attention"])
    # no moral verdict is ever attached
    assert not any(a["kind"] in ("haq_probable", "zarar", "selleh") for a in dig["attention"])

    # backbone pinned under خدا with progress 1/2
    khoda = by_key["khoda"]
    bb = [b for b in khoda["backbone"] if "عاشق خدا" in b["label"]]
    assert bb and bb[0]["done"] == 1 and bb[0]["total"] == 2
    # the خداشناسی writing also counted under خدا
    assert any("خداشناسی" in b["label"] for b in khoda["backbone"])

    # the sport task landed in جسم
    assert by_key["khod_jesm"]["done"] >= 1
    assert data["generated_at"]


@pytest.mark.asyncio
async def test_emails_routed_plainly_no_verdict(db_session):
    """Emails are surfaced by NATURE, no moral label: a human awaiting a reply
    → «یک نفر منتظرته» (دیگران); a broker margin-call alert → account notice
    (محیط), deduped; nothing is ever branded حق‌الناس."""
    from app.models.personal_sync import PersonalEmail

    db_session.add_all([
        PersonalEmail(id="h1", from_addr="Ali Rezaei <ali.rezaei@gmail.com>",
                      subject="جواب پروژه رو میدی؟", needs_action=True),
        *[
            PersonalEmail(id=f"m{i}", from_addr="noreply@xm.com",
                          subject="Margin Call Notification Alert 8023605", needs_action=True)
            for i in range(5)
        ],
    ])
    await db_session.commit()

    data = await ss.build_sahat_map(db_session, 0)
    by_key = {s["key"]: s for s in data["sahats"]}
    dig_att = by_key["digaran"]["attention"]
    mohit_att = by_key["mohit"]["attention"]

    # human awaiting a reply → دیگران, kind "waiting"
    assert any(a["kind"] == "waiting" and "جواب پروژه" in a["label"] for a in dig_att)
    # margin alerts stay OUT of دیگران and carry no moral kind
    assert not any("Margin" in a["label"] for a in dig_att)
    assert not any(a["kind"] in ("haq_probable", "zarar") for a in dig_att + mohit_att)
    # deduped to ONE row in محیط
    margin_rows = [a for a in mohit_att if "Margin" in a["label"]]
    assert len(margin_rows) == 1


@pytest.mark.asyncio
async def test_threads_accrete_scattered_content(db_session):
    """زیرساختِ بارش: a NEW scattered writing naming a thread self-attaches —
    no re-filing, no manual tagging."""
    from app.models.todo_list import todo_list_items

    lst = TodoList(user_id=0, name="خودسازی - محاسبه میان و پایان هفته")
    it = TodoItem(owner_id=0, content="محاسبهٔ شب", is_completed=True)
    db_session.add_all([lst, it])
    await db_session.flush()
    await db_session.execute(todo_list_items.insert().values(todo_list_id=lst.id, todo_item_id=it.id))
    # a scattered NEW writing mentioning the thread token
    db_session.add(PersonalWriting(user_id=0, title="یادداشتِ تازه دربارهٔ محاسبه نفس", body="..."))
    await db_session.commit()

    data = await ss.build_sahat_map(db_session, 0)
    ravan = next(s for s in data["sahats"] if s["key"] == "khod_ravan")
    th = next(t for t in ravan["threads"] if t["key"] == "mohasebe")
    assert th["lists"] == 1 and th["done"] == 1 and th["total"] == 1
    assert th["writings"] == 1  # the scattered writing self-attached
    # every declared thread renders, even when empty (honest gaps)
    khoda = next(s for s in data["sahats"] if s["key"] == "khoda")
    assert {t["key"] for t in khoda["threads"]} >= {"khodashenasi", "barnameh_elahi"}


@pytest.mark.asyncio
async def test_snapshot_history_accumulates(db_session):
    db_session.add(Task(user_id=0, title="ورزش", status=TaskStatus.DONE))
    await db_session.commit()
    await ss.snapshot_sahat_map(db_session, 0)
    await ss.snapshot_sahat_map(db_session, 0)
    hist = await ss.get_sahat_history(db_session, 0)
    assert len(hist) == 2 and "scores" in hist[0]


def test_map_endpoint(api_client):
    r = api_client.get("/api/sahat/map")
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True and len(body["sahats"]) == 6


# ── خداشهر v2 — honest weights, stored-wins, districts, editable threads ─────


@pytest.mark.asyncio
async def test_no_moral_labels_anywhere(db_session):
    """Owner's third correction («اصلا اینا رو ول کن»): NOTHING is ever branded
    حق‌الناس/رشد/اتلاف. An overdue project task and a lapsed follow-up are
    surfaced plainly — overdue is «عقب‌افتاده», a follow-up is «منتظرته» — with
    no fiqhi kind on any attention item in any sahat."""
    from app.models.person import Person
    from app.models.project import Project

    yesterday = dt.date.today() - dt.timedelta(days=1)
    proj = Project(user_id=0, name="پروژه نرم افزاری")
    db_session.add(proj)
    await db_session.flush()
    db_session.add(Task(user_id=0, title="نوشتن ماژول جدید", status=TaskStatus.TODO,
                        due_date=yesterday, project_id=proj.id))
    db_session.add(Person(user_id=0, name="حسین", next_follow_up=yesterday))
    await db_session.commit()

    data = await ss.build_sahat_map(db_session, 0)
    moral = {"haq_probable", "ahd", "zarar", "selleh", "growth", "clutter"}
    calm = {"overdue", "waiting", "soon", "stale", "pile"}
    for s in data["sahats"]:
        for a in s["attention"]:
            assert a["kind"] in calm and a["kind"] not in moral
    dig = next(s for s in data["sahats"] if s["key"] == "digaran")
    assert next(a for a in dig["attention"] if "نوشتن ماژول" in a["label"])["kind"] == "overdue"
    assert next(a for a in dig["attention"] if "حسین" in a["label"])["kind"] == "waiting"


@pytest.mark.asyncio
async def test_fin_alert_beats_human_looking_sender(db_session):
    """The broker-email fix stays: a margin call from a NAMED address is routed
    to «محیط» (own account), not mistaken for a person awaiting a reply."""
    from app.models.personal_sync import PersonalEmail

    db_session.add(PersonalEmail(
        id="b1", from_addr="John Smith <john.smith@brokerx.com>",
        subject="Margin call: insufficient balance", needs_action=True,
    ))
    await db_session.commit()

    data = await ss.build_sahat_map(db_session, 0)
    mohit = next(s for s in data["sahats"] if s["key"] == "mohit")
    dig = next(s for s in data["sahats"] if s["key"] == "digaran")
    assert any("هشدارِ مالی" in a["label"] for a in mohit["attention"])
    assert not any("Margin" in a["label"] or "هشدار" in a["label"] for a in dig["attention"])


@pytest.mark.asyncio
async def test_stored_sahat_wins_over_classifier(db_session):
    """The owner's correction is final: a stored sahat beats every keyword."""
    t = Task(user_id=0, title="خواندن کتاب", status=TaskStatus.TODO, sahat="khoda")
    lst = TodoList(user_id=0, name="لیست خرید", sahat="khod_aql")
    db_session.add_all([t, lst])
    await db_session.commit()

    assert ss.effective_task_sahat(t) == "khoda"       # keyword would say عقل
    assert ss.effective_list_sahat(lst) == "khod_aql"  # keyword would say محیط
    data = await ss.build_sahat_map(db_session, 0)
    khoda = next(s for s in data["sahats"] if s["key"] == "khoda")
    assert khoda["total"] >= 1  # the reassigned task counts under خدا


@pytest.mark.asyncio
async def test_writing_is_presence_not_achievement(db_session):
    """v1 scored every writing as done/total (a fake 100%). v2 counts content
    MASS — a writing never inflates the follow-through score."""
    db_session.add(PersonalWriting(user_id=0, title="جستاری دربارهٔ کتاب", body="..."))
    await db_session.commit()

    data = await ss.build_sahat_map(db_session, 0)
    aql = next(s for s in data["sahats"] if s["key"] == "khod_aql")
    assert aql["writings"] == 1
    assert aql["total"] == 0 and aql["done"] == 0


@pytest.mark.asyncio
async def test_assign_and_db_thread_accretion(db_session):
    """assign_sahat persists the correction; a NEW DB-registry thread accretes
    matching content with no code change."""
    t = Task(user_id=0, title="کاری بدون نشانه", status=TaskStatus.TODO)
    db_session.add(t)
    await db_session.commit()

    assert await ss.assign_sahat(db_session, 0, "task", t.id, "mohit") is True
    await db_session.refresh(t)
    assert t.sahat == "mohit" and ss.effective_task_sahat(t) == "mohit"
    with pytest.raises(ValueError):
        await ss.assign_sahat(db_session, 0, "task", t.id, "ناشناخته")
    assert await ss.assign_sahat(db_session, 0, "task", 999999, "khoda") is False

    from app.models.sahat_thread import SahatThread

    db_session.add(SahatThread(user_id=None, key="tarikh_anbia", title="تاریخ انبیا",
                               sahat="khoda", tokens=["انبیا"], link="/lists", sort_order=99))
    db_session.add(TodoList(user_id=0, name="تاریخ انبیا"))
    await db_session.commit()

    data = await ss.build_sahat_map(db_session, 0)
    khoda = next(s for s in data["sahats"] if s["key"] == "khoda")
    th = next(x for x in khoda["threads"] if x["key"] == "tarikh_anbia")
    assert th["lists"] == 1


@pytest.mark.asyncio
async def test_district_builder(db_session):
    """'khod' aggregates the three facets; unknown keys return None."""
    db_session.add(Task(user_id=0, title="ورزش صبح", status=TaskStatus.TODO))
    await db_session.commit()

    d = await ss.build_sahat_district(db_session, 0, "khod")
    assert d is not None
    assert {s["key"] for s in d["sahats"]} == {"khod_ravan", "khod_aql", "khod_jesm"}
    jesm = next(s for s in d["sahats"] if s["key"] == "khod_jesm")
    assert any(t["title"] == "ورزش صبح" for t in jesm["detail"]["tasks"])
    assert await ss.build_sahat_district(db_session, 0, "nope") is None


def test_district_and_assign_endpoints(api_client):
    r = api_client.get("/api/sahat/district/khod")
    assert r.status_code == 200
    assert {s["key"] for s in r.json()["sahats"]} == {"khod_ravan", "khod_aql", "khod_jesm"}
    assert api_client.get("/api/sahat/district/nope").status_code == 404

    tid = api_client.post("/api/tasks", json={"title": "تست ساحت"}).json()["id"]
    r2 = api_client.post("/api/sahat/assign",
                         json={"entity_type": "task", "entity_id": tid, "sahat": "khoda"})
    assert r2.status_code == 200 and r2.json()["ok"] is True
    row = next(t for t in api_client.get("/api/tasks").json() if t["id"] == tid)
    assert row["sahat"] == "khoda" and row["sahat_source"] == "owner"
    # unknown sahat → 422; unknown entity → 404
    assert api_client.post("/api/sahat/assign",
                           json={"entity_type": "task", "entity_id": tid, "sahat": "x"}).status_code == 422
    assert api_client.post("/api/sahat/assign",
                           json={"entity_type": "task", "entity_id": 999999, "sahat": "khoda"}).status_code == 404


def test_threads_endpoints(api_client):
    r = api_client.get("/api/sahat/threads")
    assert r.status_code == 200
    keys = {t["key"] for t in r.json()["threads"]}
    assert {"mohasebe", "khodashenasi"} <= keys  # seeded from the code registry
    r2 = api_client.post("/api/sahat/threads",
                         json={"title": "خوشنویسی", "sahat": "khod_aql", "tokens": ["خوشنویسی"]})
    assert r2.status_code == 200 and r2.json()["ok"] is True
    tid = r2.json()["id"]
    # soft deactivate — quarantine, not delete
    r3 = api_client.patch(f"/api/sahat/threads/{tid}", json={"is_active": False})
    assert r3.status_code == 200
    row = next(t for t in api_client.get("/api/sahat/threads").json()["threads"] if t["id"] == tid)
    assert row["is_active"] is False


# ── مرحله‌بندی (staging) + auto-placement — the «heart» iteration ────────────


def test_steps_util_split_and_progress():
    from app.services import steps_util as su

    steps = su.split_into_steps("ارسال جنس به ایران", "خرید بسته\nبسته‌بندی\nتحویل به پست")
    assert [s["text"] for s in steps] == ["خرید بسته", "بسته‌بندی", "تحویل به پست"]
    prog = su.steps_progress([{"text": "a", "done": True}, {"text": "b", "done": False}])
    assert prog["steps_total"] == 2 and prog["steps_done"] == 1 and prog["current_step"] == "b"
    # single-line blob falls back to sentence-ish splitting; never raises
    assert su.split_into_steps("فقط یک کار", None)
    assert su.split_into_steps(None, None) == []


def test_task_steps_endpoints(api_client):
    tid = api_client.post("/api/tasks", json={"title": "راه‌اندازی سایت"}).json()["id"]
    # generate breaks it into stages (heuristic, keyless)
    r = api_client.post(
        f"/api/tasks/{tid}/steps",
        json={"steps": ["ثبت دامنه", "طراحی", "انتشار"]},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["steps_total"] == 3 and body["steps_done"] == 0
    assert body["current_step"] == "ثبت دامنه"
    # tick the first step → progress advances, next step moves on
    r2 = api_client.post(f"/api/tasks/{tid}/steps/toggle", json={"index": 0, "done": True})
    b2 = r2.json()
    assert b2["steps_done"] == 1 and b2["current_step"] == "طراحی"
    # the list endpoint carries the staging fields too
    row = next(t for t in api_client.get("/api/tasks").json() if t["id"] == tid)
    assert row["steps_total"] == 3 and row["steps_done"] == 1


def test_task_steps_generate_is_fill_empty(api_client):
    tid = api_client.post(
        "/api/tasks",
        json={"title": "کار", "description": "قدم اول\nقدم دوم"},
    ).json()["id"]
    first = api_client.post(f"/api/tasks/{tid}/steps/generate").json()
    assert first["steps_total"] == 2
    # a second generate must NOT overwrite an already-staged task
    api_client.post(f"/api/tasks/{tid}/steps/toggle", json={"index": 0, "done": True})
    again = api_client.post(f"/api/tasks/{tid}/steps/generate").json()
    assert again["steps_done"] == 1  # untouched


@pytest.mark.asyncio
async def test_capture_auto_places_task_under_sahat(db_session):
    """Every captured input lands in its district «مثل آب خوردن» — the filer
    stamps a sahat from the content (owner-correctable later)."""
    from app.services import inbox_service as ib

    res = await ib._file_as_task(db_session, {"title": "خواندن کتاب فلسفه"}, 0)
    from app.models.task import Task

    t = await db_session.get(Task, res["id"])
    assert t.sahat == "khod_aql"  # placed automatically, no manual tagging
