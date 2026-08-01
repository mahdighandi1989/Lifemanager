"""«من که هستم» — منبعِ عادت‌ها، پایبندی و ضعف‌های خودنوشته.

این تست‌ها دقیقاً همان چیزهایی را میخ می‌کنند که در نسخهٔ قبل خراب بود:

* **مسیرِ خوشحال واقعاً اجرا می‌شود.** استخراج‌کنندهٔ قبلیِ «نقاط ضعف»
  ``select(TodoItem.title)`` می‌زد (ستون ``content`` است) و یک ``except``ِ
  لخت آن AttributeError را برای همیشه خورد. اینجا با دادهٔ واقعی بذر می‌شود
  و جملهٔ فارسیِ ساخته‌شده assert می‌شود، پس همان غلط نمی‌تواند پنهان بماند.
* **تطبیقِ نامِ لیست شُل نیست.** «دسترسی» نباید به‌خاطرِ زیررشتهٔ «ترس» ضعف
  حساب شود.
* **`tone` صادق است.** نرخِ پایین ``WATCH`` و نرخِ بالا ``GOOD`` — هر دو شاخهٔ
  هر بخش تست دارد. هیچ عددِ پایینی زیرِ عنوانِ «نقطهٔ قوت» نمی‌نشیند.
* **پایگاه‌دادهٔ خالی هیچ‌چیز نمی‌سازد.** «نمی‌دانم» جوابِ درستی است.
"""
import datetime as dt

import pytest
import pytest_asyncio

from app.services.owner_insight.base import FacetGroup, Kind, Tone

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


@pytest.fixture
def hb():
    from app.services.owner_insight.providers import habits

    return habits


def _by_key(facets, key):
    return next((f for f in (facets or []) if f.key == key), None)


# ── کمک‌کننده‌های بذر ───────────────────────────────────────────────────────

async def _seed_weakness_lists(db, *, completed=0):
    """دو لیستِ واقعیِ خودِ مالک + موردهایش (نام‌ها از بذرِ «توسعه فردی»)."""
    from app.models.todo_item import TodoItem
    from app.models.todo_list import TodoList, todo_list_items

    bad = TodoList(name="توسعه فردی - عادت‌های بد و مراحل بهبود")
    thieves = TodoList(name="توسعه فردی - دزدان انرژی و زمان")
    # لیستی که با تطبیقِ شُلِ قبلی («ترس» داخلِ «دسترسی») اشتباهی ضعف می‌شد
    decoy = TodoList(name="دسترسی‌های حساب کاربری")
    db.add_all([bad, thieves, decoy])
    await db.flush()

    texts = [
        ("باد معده خالی کردن", bad.id),
        ("دست توی دماغ کردن", bad.id),
        ("اینستاگرام", thieves.id),
        ("مصرف شکر", thieves.id),
        ("اخبار منفی دیدن", thieves.id),
        ("پرونده های باز", thieves.id),
        # سطرِ آموزشی — نباید به‌عنوان ضعف نقل شود
        ("مثال مقیاس: نوشتن یک جمله ← نوشتن یک پاراگراف ← نوشتن هزار کلمه", bad.id),
    ]
    real = 0
    for text, list_id in texts:
        is_done = "←" not in text and real < completed
        if "←" not in text:
            real += 1
        item = TodoItem(content=text, is_completed=is_done)
        db.add(item)
        await db.flush()
        await db.execute(
            todo_list_items.insert().values(todo_list_id=list_id, todo_item_id=item.id)
        )

    # یک موردِ بی‌ربط در لیستِ طعمه، تا اگر تطبیق شُل شد سر و صدا کند
    decoy_item = TodoItem(content="ساخت رمز عبور تازه")
    db.add(decoy_item)
    await db.flush()
    await db.execute(
        todo_list_items.insert().values(todo_list_id=decoy.id, todo_item_id=decoy_item.id)
    )
    await db.commit()


async def _seed_checkins(db, *, done_count, missed_count):
    from app.models.directive import DIRECTIVE_ACTIVE, Directive, DirectiveCheckin

    kept = Directive(title="هر روز نیم ساعت کتاب بخوان", status=DIRECTIVE_ACTIVE)
    slipped = Directive(title="بعد از نماز صبح بیدار بمان", status=DIRECTIVE_ACTIVE)
    db.add_all([kept, slipped])
    await db.flush()

    today = dt.date.today()
    day = 0
    for i in range(done_count):
        db.add(DirectiveCheckin(
            directive_id=kept.id, checkin_date=today - dt.timedelta(days=day),
            surfaced=True, done=True,
        ))
        day += 1
    for i in range(missed_count):
        db.add(DirectiveCheckin(
            directive_id=slipped.id, checkin_date=today - dt.timedelta(days=day),
            surfaced=True, done=False,
        ))
        day += 1
    await db.commit()
    return kept, slipped


# ── (الف) ضعف‌هایی که خودش نام برده ─────────────────────────────────────────

@pytest.mark.asyncio
async def test_his_own_weakness_items_are_quoted_back_as_a_sentence(db, hb):
    """مسیرِ خوشحال: نقلِ حرفِ خودش، با شمارش، و لحنِ صادق.

    این همان مسیری است که با ``TodoItem.title`` برای همیشه مرده بود.
    """
    await _seed_weakness_lists(db)

    facet = await hb._named_weaknesses_facet(db, 0)

    assert facet is not None, "مسیرِ خوشحال باید واقعاً اجرا شود"
    assert facet.statement == (
        "ضعف‌هایت را خودت نام برده‌ای، نه برنامه — ۶ مورد در لیست‌های خودت "
        "نوشته‌ای و ۶ تای آن‌ها هنوز دست‌نخورده مانده، از جمله «باد معده خالی کردن»، "
        "«دست توی دماغ کردن» و «اینستاگرام»."
    )
    assert facet.tone == Tone.WATCH.value        # هیچ ضعفی «نقطهٔ قوت» نیست
    assert facet.group == FacetGroup.SELF.value
    assert facet.kind == Kind.OWNER.value
    assert facet.owns_page == "/lists"
    assert facet.owner_locked is True
    # سطرِ آموزشیِ «مثال مقیاس … ← …» نقل نشده
    assert "←" not in facet.statement
    # و موردِ لیستِ «دسترسی‌ها» هم نه
    assert "رمز عبور" not in facet.statement


@pytest.mark.asyncio
async def test_crossing_them_off_flips_the_tone_to_good(db, hb):
    """شاخهٔ خوب: وقتی بیشترشان خط خورده، خبرِ خوب است — و گفته می‌شود."""
    await _seed_weakness_lists(db, completed=5)

    facet = await hb._named_weaknesses_facet(db, 0)

    assert facet is not None
    assert facet.tone == Tone.GOOD.value
    assert facet.statement.startswith("با ضعف‌هایی که خودت نام برده‌ای داری کنار می‌آیی")
    assert "۵ تا را خط زده‌ای" in facet.statement


def test_a_loose_keyword_match_would_call_dastresi_a_weakness(hb):
    """«دسترسی» شاملِ زیررشتهٔ «ترس» است — تطبیق باید روی مرزِ واژه باشد."""
    assert "ترس" in "دسترسی"                       # همان تلهٔ کدِ قبلی
    assert hb._matches_weakness_list("دسترسی‌های حساب کاربری") is False
    assert hb._matches_weakness_list("ترس‌های من") is True
    assert hb._matches_weakness_list("توسعه فردی - عادت‌های بد و مراحل بهبود") is True
    assert hb._matches_weakness_list("توسعه فردی - مبارزه با هوای نفس") is True
    assert hb._matches_weakness_list("خرید هفتگی") is False


@pytest.mark.asyncio
async def test_two_scraps_are_not_a_self_portrait(db, hb):
    """زیرِ حدِ نصاب، ادعای «ضعف‌هایت را نوشته‌ای» بزرگ‌تر از شواهد است."""
    from app.models.todo_item import TodoItem
    from app.models.todo_list import TodoList, todo_list_items

    lst = TodoList(name="توسعه فردی - عادت‌های بد و مراحل بهبود")
    db.add(lst)
    await db.flush()
    item = TodoItem(content="اینستاگرام")
    db.add(item)
    await db.flush()
    await db.execute(
        todo_list_items.insert().values(todo_list_id=lst.id, todo_item_id=item.id)
    )
    await db.commit()

    assert await hb._named_weaknesses_facet(db, 0) is None


# ── (ب) پایبندی ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_low_follow_through_is_a_watch_not_a_strength(db, hb):
    """«شاخص پشتکار ۱۰/۱۰۰» به‌عنوان نقطهٔ قوت — همان چیزی که نباید تکرار شود."""
    await _seed_checkins(db, done_count=2, missed_count=10)

    facet = await hb._followthrough_facet(db, 0)

    assert facet is not None
    assert facet.statement == (
        "پشتکارت این ماه پایین بوده — از ۱۲ فرمانی که سرِ راهت گذاشته شد فقط ۲ تا را "
        "نگه داشته‌ای و ۱۰ تا را جا گذاشته‌ای."
    )
    assert facet.tone == Tone.WATCH.value
    assert facet.group == FacetGroup.HABITS.value
    assert facet.kind == Kind.MEASURED.value
    assert facet.owns_page == "/directives"
    # نامِ فرمانی که بیش از همه جا مانده، در شواهد آمده — نه شناسهٔ عددی
    assert any("بعد از نماز صبح بیدار بمان" in e for e in facet.evidence)
    # هیچ شاهدی dumpِ JSON نیست
    assert all("{" not in e for e in facet.evidence)


@pytest.mark.asyncio
async def test_high_follow_through_is_good_news_and_says_so(db, hb):
    await _seed_checkins(db, done_count=10, missed_count=2)

    facet = await hb._followthrough_facet(db, 0)

    assert facet is not None
    assert facet.tone == Tone.GOOD.value
    assert facet.statement == (
        "این یک ماه پایِ حرفت ایستاده‌ای — از ۱۲ فرمانی که سرِ راهت گذاشته شد ۱۰ تا "
        "را نگه داشته‌ای."
    )


@pytest.mark.asyncio
async def test_three_answers_are_not_a_follow_through_rate(db, hb):
    await _seed_checkins(db, done_count=1, missed_count=2)
    assert await hb._followthrough_facet(db, 0) is None


@pytest.mark.asyncio
async def test_answers_older_than_the_window_are_not_counted(db, hb):
    """پنجرهٔ یک‌ماهه واقعاً اعمال می‌شود — وگرنه «این ماه» دروغ است."""
    from app.models.directive import DIRECTIVE_ACTIVE, Directive, DirectiveCheckin

    d = Directive(title="هر روز نیم ساعت کتاب بخوان", status=DIRECTIVE_ACTIVE)
    db.add(d)
    await db.flush()
    old = dt.date.today() - dt.timedelta(days=200)
    for i in range(12):
        db.add(DirectiveCheckin(
            directive_id=d.id, checkin_date=old + dt.timedelta(days=i),
            surfaced=True, done=False,
        ))
    await db.commit()

    assert await hb._followthrough_facet(db, 0) is None


# ── (ب) نهادینه‌شدن ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_a_graduated_habit_is_reported_as_good_by_name(db, hb):
    from app.models.directive import (
        DIRECTIVE_ACTIVE,
        DIRECTIVE_GRADUATED,
        Directive,
    )

    db.add_all([
        Directive(title="هر روز نیم ساعت کتاب بخوان", status=DIRECTIVE_GRADUATED),
        Directive(title="شب زود بخواب", status=DIRECTIVE_ACTIVE, strength=30, streak=3),
        Directive(title="روزی ده هزار قدم", status=DIRECTIVE_ACTIVE, strength=0, streak=0),
    ])
    await db.commit()

    facet = await hb._internalized_facet(db, 0)

    assert facet is not None
    assert facet.tone == Tone.GOOD.value
    assert "«هر روز نیم ساعت کتاب بخوان»" in facet.statement
    assert facet.owns_page == "/directives"
    assert facet.group == FacetGroup.HABITS.value


@pytest.mark.asyncio
async def test_a_pile_of_untouched_directives_is_a_watch(db, hb):
    from app.models.directive import DIRECTIVE_ACTIVE, Directive

    for i in range(6):
        db.add(Directive(title=f"فرمان شمارهٔ {i}", status=DIRECTIVE_ACTIVE,
                         strength=0, streak=0))
    await db.commit()

    facet = await hb._internalized_facet(db, 0)

    assert facet is not None
    assert facet.tone == Tone.WATCH.value
    assert facet.statement == (
        "۶ فرمانِ فعال روی دستت است و هیچ‌کدام هنوز حتی یک قدم جلو نرفته — همه‌شان "
        "از روزِ اول سرِ جای خودشان مانده‌اند."
    )


@pytest.mark.asyncio
async def test_two_directives_say_nothing_about_internalization(db, hb):
    from app.models.directive import DIRECTIVE_ACTIVE, Directive

    db.add_all([
        Directive(title="الف", status=DIRECTIVE_ACTIVE),
        Directive(title="ب", status=DIRECTIVE_ACTIVE),
    ])
    await db.commit()

    assert await hb._internalized_facet(db, 0) is None


# ── (ب) شروع در برابر تمام‌کردن ─────────────────────────────────────────────

@pytest.mark.asyncio
async def test_finishing_most_of_what_you_start_is_good(db, hb):
    from app.models.todo_item import TodoItem

    for i in range(20):
        db.add(TodoItem(content=f"کار {i}", is_completed=i < 15))
    await db.commit()

    facet = await hb._finish_rate_facet(db, 0)

    assert facet is not None
    assert facet.tone == Tone.GOOD.value
    assert facet.statement == (
        "آنچه شروع می‌کنی معمولاً تمام می‌شود — از ۲۰ کاری که برای خودت نوشته‌ای "
        "۱۵ تا را بسته‌ای و فقط ۵ تا باز مانده."
    )
    assert facet.owns_page == "/lists"


@pytest.mark.asyncio
async def test_a_backlog_of_abandoned_items_is_a_watch(db, hb):
    from app.models.todo_item import TodoItem

    stale = dt.datetime.now(UTC) - dt.timedelta(days=200)
    for i in range(20):
        db.add(TodoItem(content=f"کار {i}", is_completed=i < 3,
                        created_at=stale, updated_at=stale))
    await db.commit()

    facet = await hb._finish_rate_facet(db, 0)

    assert facet is not None
    assert facet.tone == Tone.WATCH.value
    assert "بیشتر از آنچه تمام کنی شروع می‌کنی" in facet.statement
    assert "۱۷ تای آن بیش از ۹۰ روز است دست نخورده" in facet.statement


@pytest.mark.asyncio
async def test_a_handful_of_items_is_not_a_finish_rate(db, hb):
    from app.models.todo_item import TodoItem

    for i in range(4):
        db.add(TodoItem(content=f"کار {i}"))
    await db.commit()

    assert await hb._finish_rate_facet(db, 0) is None


# ── (ب) بارِ عقب‌افتاده ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_missed_deadlines_are_a_watch(db, hb):
    from app.models.task import Task, TaskStatus
    from app.models.todo_item import TodoItem

    today = dt.date.today()
    for i in range(4):
        db.add(Task(title=f"کار {i}", status=TaskStatus.TODO,
                    due_date=today - dt.timedelta(days=10 + i)))
    db.add(TodoItem(content="پرداخت قبض", due_date=today + dt.timedelta(days=5)))
    await db.commit()

    facet = await hb._overdue_facet(db, 0)

    assert facet is not None
    assert facet.tone == Tone.WATCH.value
    assert facet.statement == (
        "از ۵ کارِ بازِ تاریخ‌دارت ۴ تا از موعدش گذشته — تاریخ‌هایی که خودت گذاشته‌ای "
        "دارند از دستت در می‌روند."
    )
    assert facet.owns_page == "/tasks"


@pytest.mark.asyncio
async def test_keeping_every_deadline_is_reported_as_good(db, hb):
    from app.models.task import Task, TaskStatus

    today = dt.date.today()
    for i in range(4):
        db.add(Task(title=f"کار {i}", status=TaskStatus.TODO,
                    due_date=today + dt.timedelta(days=3 + i)))
    await db.commit()

    facet = await hb._overdue_facet(db, 0)

    assert facet is not None
    assert facet.tone == Tone.GOOD.value
    assert "هیچ‌کدام از ۴ کارِ تاریخ‌دارت عقب نیفتاده" in facet.statement


@pytest.mark.asyncio
async def test_one_dated_task_is_not_an_overdue_load(db, hb):
    from app.models.task import Task, TaskStatus

    db.add(Task(title="کار", status=TaskStatus.TODO,
                due_date=dt.date.today() - dt.timedelta(days=2)))
    await db.commit()

    assert await hb._overdue_facet(db, 0) is None


# ── پایگاه‌دادهٔ خالی و قراردادِ provider ────────────────────────────────────

@pytest.mark.asyncio
async def test_an_empty_database_produces_nothing_at_all(db, hb):
    """«نمی‌دانم» جوابِ درستی است — کارتِ توخالی بدتر از خالی است."""
    assert await hb._collect(db, 0) is None


@pytest.mark.asyncio
async def test_a_seeded_database_produces_real_sentences_not_numbers(db, hb):
    """قراردادِ کلی: هر ادعا جمله است، منبع دارد، و درِ ورودی دارد."""
    await _seed_weakness_lists(db)
    await _seed_checkins(db, done_count=2, missed_count=10)

    facets = await hb._collect(db, 0)

    assert facets, "با این داده باید دستِ‌کم دو ادعا ساخته شود"
    keys = {f.key for f in facets}
    assert {"habits_named_weaknesses", "habits_followthrough"} <= keys
    for f in facets:
        assert f.owns_page in {"/lists", "/directives", "/tasks"}
        assert f.source_label
        assert f.evidence
        # جمله، نه عدد: دستِ‌کم چند واژه، و نه چیزی شبیهِ «۱۰/۱۰۰»
        assert len(f.statement.split()) >= 6
        assert "/۱۰۰" not in f.statement
        assert f.tone in {t.value for t in Tone}


def test_the_provider_is_registered_with_a_real_page(hb):
    """ثبت شده، و هر صفحه‌ای که به آن لینک می‌دهیم واقعاً مسیرِ موجودی است.

    رجیستری از راهِ ``_REGISTRY`` خوانده می‌شود، نه ``providers()``: در
    ``owner_insight/__init__.py`` نامِ تابعِ ``providers`` بعد از بارگذاری با
    زیرپکیجِ هم‌نام جایگزین می‌شود (جزئیات در گزارشِ همین کار).
    """
    from pathlib import Path

    import app.services.owner_insight as oi

    p = oi._REGISTRY["habits"]
    assert p.group_order == 50
    assert p.owns_page == "/directives"
    routes = Path(__file__).resolve().parents[1] / "frontend/src/lib/routesMeta.js"
    text = routes.read_text(encoding="utf-8")
    for page in (p.owns_page, "/lists", "/tasks"):
        assert f"path: '{page}'" in text
