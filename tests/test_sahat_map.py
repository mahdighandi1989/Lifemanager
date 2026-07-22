"""نقشهٔ ساحت‌ها — every entity buckets under a human dimension; weights are
principled (حق‌الناس > اضرار به نفس > رشد > لغو); the backbone lists pin."""
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

    # حق‌الناس: the overdue person-linked task shows in دیگران at weight 5
    dig = by_key["digaran"]
    assert any(a["weight"] == ss.W_HAQ_NAS and "تحویل پروژه" in a["label"] for a in dig["attention"])

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
async def test_haq_nas_test_applied_to_emails(db_session):
    """The حق‌الناس TEST (owner's correction): only a real HUMAN awaiting a
    reply engages another person's right. A broker margin-call alert is
    اضرار به مالِ خود (محیط), never حق‌الناس — and duplicates collapse."""
    from app.models.personal_sync import PersonalEmail

    db_session.add_all([
        # a human waiting for a reply → دیگران / حق‌الناس
        PersonalEmail(id="h1", from_addr="Ali Rezaei <ali.rezaei@gmail.com>",
                      subject="جواب پروژه رو میدی؟", needs_action=True),
        # five copies of the same automated margin alert → محیط / ضرر به مالِ خود، یک‌بار
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
    # human → حق‌الناس in دیگران
    assert any(a["weight"] == ss.W_HAQ_NAS and "جواب پروژه" in a["label"] for a in dig_att)
    # margin alerts NEVER appear as حق‌الناس anywhere
    assert not any("Margin" in a["label"] and a["weight"] == ss.W_HAQ_NAS
                   for a in dig_att + mohit_att)
    # they appear ONCE in محیط as ضرر به مالِ خود (deduped by subject)
    margin_rows = [a for a in mohit_att if "Margin" in a["label"]]
    assert len(margin_rows) == 1 and margin_rows[0]["weight"] == ss.W_ZARAR_KHOD


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
