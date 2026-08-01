"""«من که هستم» → منبعِ خودنگاره: پشتکار و علاقه‌ها (۲۰۲۶-۰۸-۰۱).

این تست‌ها دقیقاً همان چیزی را میخ می‌کنند که مالک روی صفحهٔ قبلی دید و
درست هم بود:

* «شاخص پشتکار ۱۰/۱۰۰» زیرِ عنوانِ «نقاط قوت» — عددِ خام، بدون آستانه، با
  لحنِ غلط. حالا نمرهٔ پایین **جمله** است و لحنش `watch` است، نه `good`.
* روی پایگاه‌دادهٔ خالی هم چیزی چاپ می‌شد. حالا هیچ کارتی ساخته نمی‌شود.
* علاقه‌ها برای همیشه خالی بود چون کلیدهای دیکشنری حدس زده شده بودند و یک
  `except` صدایشان را می‌خورد. تستِ مسیرِ موفق اینجا واقعاً اجرا می‌شود، پس
  یک نامِ غلط بی‌سروصدا نمی‌مانَد.
"""
import datetime as dt

import pytest
import pytest_asyncio

from app.services.owner_insight.providers.self_model import _collect

UTC = dt.timezone.utc


@pytest_asyncio.fixture
async def db():
    from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

    from app.database import Base

    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as session:
        yield session
    await engine.dispose()


def _by_key(facets, key):
    return next((f for f in (facets or []) if f.key == key), None)


async def _seed_low(db):
    """کسی که تعهد زیاد داده و کم نگه داشته — همان تصویرِ نمرهٔ پایین."""
    from app.models.directive import Directive
    from app.models.task import Task, TaskStatus
    from app.models.todo_item import TodoItem

    today = dt.date.today()
    for i in range(12):
        db.add(Directive(user_id=0, title=f"فرمانِ {i}", domain="خودسازی",
                         status="active", times_done=1, times_missed=9, best_streak=1))
    for _ in range(10):
        db.add(Task(user_id=0, title="کارِ عقب‌افتاده", status=TaskStatus.TODO,
                    due_date=today - dt.timedelta(days=5)))
    for _ in range(3):
        db.add(Task(user_id=0, title="کارِ تمام‌شده", status=TaskStatus.DONE))
    for _ in range(3):
        db.add(TodoItem(owner_id=0, content="قلمِ تیک‌خورده", is_completed=True))
    for _ in range(5):
        db.add(TodoItem(owner_id=0, content="قلمِ تیک‌نخورده", is_completed=False))
    await db.commit()


async def _seed_high(db):
    from app.models.directive import Directive
    from app.models.task import Task, TaskStatus
    from app.models.todo_item import TodoItem

    for i in range(6):
        db.add(Directive(user_id=0, title=f"فرمانِ {i}", domain="خودسازی",
                         status="graduated", times_done=18, times_missed=2, best_streak=20))
    for _ in range(9):
        db.add(Task(user_id=0, title="کارِ تمام‌شده", status=TaskStatus.DONE))
    db.add(Task(user_id=0, title="کارِ باز", status=TaskStatus.TODO))
    for _ in range(9):
        db.add(TodoItem(owner_id=0, content="قلمِ تیک‌خورده", is_completed=True))
    db.add(TodoItem(owner_id=0, content="قلمِ باز", is_completed=False))
    await db.commit()


async def _seed_corpus(db):
    """متنِ واقعی و به‌قدرِ کافی، برای اینکه دسته‌بندیِ علاقه معنا پیدا کند."""
    from app.models.personal_writing import PersonalWriting

    db.add(PersonalWriting(
        user_id=0, title="کتاب و مطالعه", category="دانش",
        body=("کتاب خواندن و مطالعه و یادگیری برایم مهم است. "
              "هر شب کتاب می‌خوانم و از مطالعه لذت می‌برم. "
              "برنامه نویسی و کد و فناوری هم بخشی از یادگیری من است. "
              "برنامه نویسی را با کد زدن یاد گرفتم و فناوری را دنبال می‌کنم."),
    ))
    await db.commit()


# ── پشتکار: شاخهٔ خبرِ بد ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_a_low_diligence_is_a_sentence_and_its_tone_is_watch(db):
    """قلبِ ماجرا: «۱۰/۱۰۰» دیگر «نقطهٔ قوت» نیست."""
    await _seed_low(db)
    facets = await _collect(db, 0)
    f = _by_key(facets, "self_model_diligence")
    assert f is not None, "با این‌همه شاهد باید حرفی برای گفتن داشته باشد"

    assert f.tone == "watch", "نمرهٔ پایین هرگز خبرِ خوب نیست"
    assert f.group == "habits" and f.kind == "measured"
    assert f.owns_page == "/self-portrait"

    # جمله است، نه عدد: فعل دارد، خطاب دارد، و علتِ افت را نام می‌برد.
    assert f.statement.startswith("پشتکارت این دوره پایین بوده")
    assert "فرمان‌هایی که برای خودت گذاشته‌ای" in f.statement
    assert "از سررسید گذشته" in f.statement
    assert not f.statement.strip().replace("/", "").replace("۰", "").isdigit()

    joined = " | ".join(f.evidence)
    assert "کارهایت" in joined and "قلم‌های فهرست‌هایت" in joined
    assert "۱۰ کار از سررسید گذشته و هنوز باز است." in f.evidence


# ── پشتکار: شاخهٔ خبرِ خوب ───────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_a_high_diligence_is_reported_as_good_news(db):
    await _seed_high(db)
    facets = await _collect(db, 0)
    f = _by_key(facets, "self_model_diligence")
    assert f is not None
    assert f.tone == "good"
    assert f.statement.startswith("پشتکارت این دوره خوب بوده")
    assert "بلندترین زنجیرهٔ پیوستگی‌ات ۲۰ روز بوده" in f.statement
    assert "نهادینه شده" in f.statement       # ۶ فرمانِ graduated


# ── پشتکار: شاخهٔ میانه ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_a_middling_diligence_is_neutral_not_praised(db):
    from app.models.task import Task, TaskStatus
    from app.models.todo_item import TodoItem

    for _ in range(5):
        db.add(Task(user_id=0, title="کارِ تمام‌شده", status=TaskStatus.DONE))
    for _ in range(5):
        db.add(Task(user_id=0, title="کارِ باز", status=TaskStatus.TODO))
    for _ in range(5):
        db.add(TodoItem(owner_id=0, content="تیک‌خورده", is_completed=True))
    for _ in range(5):
        db.add(TodoItem(owner_id=0, content="تیک‌نخورده", is_completed=False))
    await db.commit()

    f = _by_key(await _collect(db, 0), "self_model_diligence")
    assert f is not None
    assert f.tone == "neutral"
    assert "متوسط" in f.statement


# ── «نمی‌دانم» ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_an_empty_database_produces_nothing_at_all(db):
    """کدِ قبلی اینجا «شاخص پشتکار ۰/۱۰۰» چاپ می‌کرد."""
    assert await _collect(db, 0) is None


@pytest.mark.asyncio
async def test_one_lonely_task_is_not_enough_to_claim_a_work_ethic(db):
    """`has_signal` با یک تسک هم روشن می‌شود؛ ولی یک تسک «پشتکار» نیست."""
    from app.models.task import Task, TaskStatus

    db.add(Task(user_id=0, title="تنها کار", status=TaskStatus.TODO))
    await db.commit()

    facets = await _collect(db, 0)
    assert _by_key(facets, "self_model_diligence") is None
    assert facets is None


@pytest.mark.asyncio
async def test_the_has_signal_gate_is_actually_respected(db, monkeypatch):
    """اگر سرویس بگوید شاهدی ندارم، نمره هرچه باشد نادیده گرفته می‌شود."""
    import app.services.self_model_service as sms

    async def _fake(_db, _uid=0):
        return {"score": 88, "trend": "پایدار", "directive_rate": 0.9,
                "task_rate": 0.9, "todo_rate": 0.9, "graduated": 0,
                "best_streak": 9, "overdue": 0, "recent_completions": 0,
                "prior_completions": 0, "has_signal": False}

    monkeypatch.setattr(sms, "compute_diligence", _fake)
    assert _by_key(await _collect(db, 0), "self_model_diligence") is None


# ── علاقه‌ها ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_interests_name_the_real_categories_in_persian(db):
    """کلیدهای واقعی `category/score/terms` — نه `name`/`topic`ی که حدس زده
    شده بود و برای همیشه [] می‌داد."""
    await _seed_corpus(db)
    f = _by_key(await _collect(db, 0), "self_model_interests")
    assert f is not None, "با این متن باید علاقه‌ای پیدا شود — اگر نشد، کلید یا مسیر عوض شده"

    assert f.group == "self" and f.kind == "inferred" and f.tone == "neutral"
    assert f.owns_page == "/self-portrait"
    assert f.statement.startswith("بیشترِ چیزی که می‌نویسی")
    assert "کتاب و یادگیری" in f.statement
    assert "فناوری و برنامه‌نویسی" in f.statement
    assert "پرتکرارترین واژه‌هایت" in f.statement
    assert any("نشانه‌های «کتاب و یادگیری»" in e for e in f.evidence)
    assert all(len(e) < 200 and "{" not in e for e in f.evidence)


@pytest.mark.asyncio
async def test_a_two_word_corpus_is_not_an_interest(db):
    from app.models.personal_writing import PersonalWriting

    db.add(PersonalWriting(user_id=0, title="یادداشت", body="کتاب کتاب."))
    await db.commit()
    assert _by_key(await _collect(db, 0), "self_model_interests") is None


# ── ثبت در رجیستری ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_the_provider_is_registered_and_links_to_the_page_that_owns_it(db):
    # از رجیستری خوانده می‌شود، نه از `owner_insight.providers()`: بعد از
    # بارگذاریِ زیرپکیجِ providers آن نام در فضای‌نامِ پکیج با خودِ ماژول
    # جایگزین می‌شود (نقصِ فایلِ مشترک؛ گزارش شده، اینجا اصلاح نمی‌شود).
    import app.services.owner_insight as oi

    oi._load_providers()
    p = oi._REGISTRY.get("self_model")
    assert p is not None
    assert p.owns_page == "/self-portrait" and p.group_order == 30
    assert p.collect is _collect

    await _seed_low(db)
    facets = await p.collect(db, 0)
    card = next(f.as_dict() for f in facets if f.key == "self_model_diligence")
    assert card["tone"] == "watch" and card["owns_page"] == "/self-portrait"
    assert card["group"] == "habits" and card["statement"]
    assert len(card["evidence"]) <= 6
