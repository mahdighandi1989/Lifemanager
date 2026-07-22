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
