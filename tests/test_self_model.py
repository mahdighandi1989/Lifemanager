"""Phase D — «علایق و اراده»: infer interests + a willpower/diligence index from
the owner's writings, tasks, and follow-through."""
import datetime as dt

import pytest
from sqlalchemy import select

from app.models.ai_assessment import AIAssessment
from app.models.personal_writing import PersonalWriting
from app.models.task import Task, TaskStatus
from app.models.todo_item import TodoItem
from app.services import self_model_service as sm


@pytest.mark.asyncio
async def test_interests_from_writings(db_session):
    db_session.add_all([
        PersonalWriting(user_id=0, title="برنامه‌نویسی", body="کد python برنامه نرم‌افزار داده", category="tech"),
        PersonalWriting(user_id=0, title="کدنویسی", body="python programming software data code"),
        PersonalWriting(user_id=0, title="ورزش", body="دویدن ورزش تمرین gym running"),
    ])
    await db_session.commit()
    interests = await sm.compute_interests(db_session, 0)
    cats = {c["category"] for c in interests["categories"]}
    assert "technology" in cats  # code/python/software recurred
    assert interests["top_terms"]  # some frequent terms surfaced


@pytest.mark.asyncio
async def test_diligence_index_from_followthrough(db_session):
    yesterday = dt.date.today() - dt.timedelta(days=1)
    db_session.add_all([
        Task(user_id=0, title="done1", status=TaskStatus.DONE),
        Task(user_id=0, title="done2", status=TaskStatus.DONE),
        Task(user_id=0, title="open-overdue", status=TaskStatus.TODO, due_date=yesterday),
        TodoItem(owner_id=0, content="c1", is_completed=True,
                 completed_at=dt.datetime.now(dt.timezone.utc)),
        TodoItem(owner_id=0, content="c2", is_completed=False),
    ])
    await db_session.commit()
    d = await sm.compute_diligence(db_session, 0)
    assert 0 <= d["score"] <= 100
    assert d["task_rate"] == pytest.approx(2 / 3, abs=0.01)  # 2 done / 3 total
    assert d["todo_rate"] == pytest.approx(0.5, abs=0.01)
    assert d["overdue"] == 1
    assert d["has_signal"] is True
    assert d["trend"] in ("صعودی", "نزولی", "پایدار")


@pytest.mark.asyncio
async def test_build_persists_and_history_accumulates(db_session):
    db_session.add(Task(user_id=0, title="t", status=TaskStatus.DONE))
    await db_session.commit()

    first = await sm.build_self_model(db_session, 0)
    assert "interests" in first and "diligence" in first and first["generated_at"]
    second = await sm.build_self_model(db_session, 0)  # a second snapshot
    assert second is not None

    rows = (
        await db_session.execute(
            select(AIAssessment).where(AIAssessment.assessment_type == "self_model")
        )
    ).scalars().all()
    assert len(rows) == 2  # history accumulates, one row per refresh

    latest = await sm.get_latest_self_model(db_session, 0)
    assert "history" in latest and len(latest["history"]) == 2
