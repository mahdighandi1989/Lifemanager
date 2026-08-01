"""«آنچه واقعاً می‌کنم» — خواب، تحرک، روتین، گوشی (۲۰۲۶-۰۸-۰۱).

این تست‌ها دقیقاً همان چیزهایی را میخ می‌کنند که در نسخهٔ قبلِ «من که هستم»
شکسته بود:

* **جمله، نه عدد.** هر ادعا یک جملهٔ فارسی است؛ تست متنِ واقعی را می‌سنجد،
  نه فقط «چیزی برگشت».
* **`tone` صادق.** خوابِ دیرتر و کارکردِ صفحهٔ بالارونده `WATCH`اند و
  برعکسشان `GOOD`؛ هر سه شاخه تستِ جدا دارند.
* **پایگاه‌دادهٔ خالی → هیچ.** «نمی‌دانم» جوابِ درستی است.
* **مسیرِ موفق واقعاً اجرا می‌شود**، تا یک نامِ ستونِ غلط (بلایی که سرِ
  `select(TodoItem.title)` آمد — ستون `content` است) پشتِ یک `except` پنهان
  نماند.
* **ساعتِ محلی، نه UTC.** شبِ ۲۳:۳۰ باید ۲۳:۳۰ خوانده شود نه ۱۹:۳۰.
"""
import datetime as dt
import logging
import json
import pathlib

import pytest
import pytest_asyncio

from app.services.owner_insight.base import Tone
from app.services.owner_insight.providers import behaviour as bh

UTC = dt.timezone.utc
TZ = dt.timedelta(minutes=bh.TZ_OFFSET_MINUTES)


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


# ── کمک‌ها ──────────────────────────────────────────────────────────────────

def _today_local() -> dt.date:
    return (dt.datetime.now(UTC) + TZ).date()


def _utc(day: dt.date, hour: int, minute: int = 0) -> dt.datetime:
    """یک لحظهٔ **محلی** را به UTC ببر — همان کاری که `_local` برعکسش می‌کند."""
    return dt.datetime(day.year, day.month, day.day, hour, minute, tzinfo=UTC) - TZ


def _facet(facets, key):
    return next((f for f in (facets or []) if f.key == key), None)


async def _seed_nights(db, *, count, start=(23, 30), end=(7, 15), place_id=1,
                       drift_minutes=0, uid=0):
    """`count` شبِ متوالی که شبِ i-ام (از دورترین) `drift_minutes*i` دیرتر شروع
    می‌شود. شبِ «۱ روز پیش» آخرین شب است."""
    from app.models.place import Visit

    for i in range(count):
        night = _today_local() - dt.timedelta(days=count - i)
        shift = dt.timedelta(minutes=drift_minutes * i)
        arrived = _utc(night, *start) + shift
        left = _utc(night + dt.timedelta(days=1), *end)
        db.add(Visit(
            user_id=uid, place_id=place_id, device="s24",
            arrived_at=arrived, left_at=left,
            minutes=(left - arrived).total_seconds() / 60.0,
        ))
    await db.commit()


async def _seed_usage(db, *, days_ago_range, minutes_per_day, unlocks=40,
                      app="org.telegram.messenger", uid=0):
    from app.models.activity_log import ActivityLog

    for i in days_ago_range:
        day = _today_local() - dt.timedelta(days=i)
        db.add(ActivityLog(
            user_id=uid, action="mobile_usage", entity_type="usage",
            entity_id=day.isoformat(), entity_label=f"کارکرد موبایل {day}",
            detail=json.dumps({"apps": [{"app": app, "minutes": minutes_per_day}],
                               "unlocks": unlocks, "sessions": []}, ensure_ascii=False),
            context_type="device", context_id="phone",
        ))
    await db.commit()


async def _seed_trips(db, *, keys, distance_km=12.0, uid=0, within_days=6):
    """یک سفر به‌ازای هر کلید، پخش‌شده در `within_days` روزِ گذشته."""
    from app.models.place import Trip

    now = dt.datetime.now(UTC)
    for i, key in enumerate(keys):
        frm, to = (int(x) for x in key.split(":")[:2])
        started = now - dt.timedelta(days=(i % within_days), hours=2)
        db.add(Trip(
            user_id=uid, device="s24", from_place_id=frm, to_place_id=to,
            started_at=started, ended_at=started + dt.timedelta(minutes=25),
            minutes=25.0, distance_km=distance_km, pattern_key=key,
        ))
    await db.commit()


async def _seed_patterns(db, *, learned=(), unlearned=(), uid=0):
    from app.models.place import RoutePattern

    for key in learned:
        db.add(RoutePattern(user_id=uid, pattern_key=key, learned=True, occurrences=5))
    for key in unlearned:
        db.add(RoutePattern(user_id=uid, pattern_key=key, learned=False, occurrences=1))
    await db.commit()


# ── «نمی‌دانم» ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_an_empty_database_says_nothing_at_all(db):
    """هیچ کارتی از هیچ ساخته نمی‌شود — همان چیزی که «۰/۱۰۰» را تولید می‌کرد."""
    assert await bh._collect(db, 0) is None


@pytest.mark.asyncio
async def test_three_nights_are_not_enough_to_claim_a_habit(db):
    """زیرِ حدِ نصاب، «معمولاً» دروغ است؛ پس ساکت می‌مانیم."""
    await _seed_nights(db, count=3)
    assert bh.MIN_NIGHTS == 5
    assert await bh._collect(db, 0) is None


@pytest.mark.asyncio
async def test_two_days_of_phone_reports_do_not_make_an_average(db):
    await _seed_usage(db, days_ago_range=range(1, 3), minutes_per_day=200)
    facets = await bh._collect(db, 0)
    assert _facet(facets, "behaviour_screen_time") is None


# ── خواب ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_a_steady_sleeper_gets_a_sentence_in_local_time(db):
    from app.models.place import Place

    db.add(Place(id=1, user_id=0, label="خانه", kind="home",
                 latitude=25.2048, longitude=55.2708, radius_m=180.0,
                 visit_count=8, total_minutes=3720.0))
    await db.commit()
    await _seed_nights(db, count=8)

    facets = await bh._collect(db, 0)
    sleep = _facet(facets, "behaviour_sleep")
    assert sleep is not None, "مسیرِ موفق باید واقعاً اجرا شود"

    # ۲۳:۳۰ محلی — نه ۱۹:۳۰ که خواندنِ خامِ UTC می‌داد.
    assert sleep.statement == (
        "معمولاً حدودِ ۲۳:۳۰ شبت تمام می‌شود و حدودِ ۷:۱۵ روزت شروع می‌شود — "
        "تقریباً ۷ ساعت و ۴۵ دقیقه یک‌جا می‌مانی و در ۸ شبِ اخیر تقریباً سرِ همین ساعت مانده."
    )
    assert sleep.tone == Tone.NEUTRAL.value
    assert sleep.group == "behaviour"
    assert sleep.kind == "measured"
    assert sleep.owns_page == "/activity-log"
    assert any("۸ شبِ ثبت‌شده" in e for e in sleep.evidence)
    assert any("وقتِ محلیِ خودت" in e for e in sleep.evidence)
    assert any("«خانه»" in e for e in sleep.evidence)


@pytest.mark.asyncio
async def test_sleep_sliding_later_is_watch_not_a_compliment(db):
    """هر شب ۱۵ دقیقه دیرتر → نیمهٔ دوم حدودِ ۱٫۵ ساعت دیرتر از نیمهٔ اول."""
    await _seed_nights(db, count=8, drift_minutes=15)

    sleep = _facet(await bh._collect(db, 0), "behaviour_sleep")
    assert sleep is not None
    assert sleep.tone == Tone.WATCH.value
    assert "دیرتر شده" in sleep.statement
    assert "زودتر" not in sleep.statement


@pytest.mark.asyncio
async def test_sleep_moving_earlier_is_good_news(db):
    await _seed_nights(db, count=8, start=(1, 30), drift_minutes=-15)

    sleep = _facet(await bh._collect(db, 0), "behaviour_sleep")
    assert sleep is not None
    assert sleep.tone == Tone.GOOD.value
    assert "زودتر شده" in sleep.statement


@pytest.mark.asyncio
async def test_a_short_evening_visit_is_not_a_night(db):
    """۹۰ دقیقه ماندن در ساعت ۲۱ خواب نیست — نباید در الگوی خواب بیفتد."""
    from app.models.place import Visit

    for i in range(1, 9):
        day = _today_local() - dt.timedelta(days=i)
        arrived = _utc(day, 21, 0)
        db.add(Visit(user_id=0, place_id=2, arrived_at=arrived,
                     left_at=arrived + dt.timedelta(minutes=90), minutes=90.0))
    await db.commit()

    assert _facet(await bh._collect(db, 0), "behaviour_sleep") is None


# ── تحرک ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_a_normal_week_of_movement_is_described_not_judged(db):
    await _seed_nights(db, count=6)
    keys = ["1:2:0:6", "2:1:0:18", "1:2:1:6", "2:1:1:18", "1:2:2:6", "2:1:2:18"]
    await _seed_trips(db, keys=keys, distance_km=12.0)
    await _seed_patterns(db, learned=sorted(set(keys)))

    move = _facet(await bh._collect(db, 0), "behaviour_movement")
    assert move is not None
    assert move.tone == Tone.NEUTRAL.value
    assert move.statement == (
        "این هفته ۶ بار بینِ ۲ نقطهٔ متفاوت جابه‌جا شده‌ای و رویِ‌هم حدودِ ۷۲ کیلومتر "
        "راه رفته‌ای — و همه‌اش روی همان مسیرهای همیشگی‌ات بود."
    )
    assert move.owns_page == "/activity-log"
    assert any("ردِ مکانی" in e for e in move.evidence)


@pytest.mark.asyncio
async def test_off_pattern_trips_are_named_in_the_sentence(db):
    await _seed_nights(db, count=6)
    keys = ["1:2:0:6", "2:1:0:18", "1:2:1:6", "2:1:1:18", "1:3:2:6", "3:1:2:18"]
    await _seed_trips(db, keys=keys, distance_km=10.0)
    await _seed_patterns(db, learned=["1:2:0:6", "2:1:0:18", "1:2:1:6", "2:1:1:18"],
                         unlearned=["1:3:2:6", "3:1:2:18"])

    move = _facet(await bh._collect(db, 0), "behaviour_movement")
    assert move is not None
    assert "۲ تای آن مسیری بود که معمولاً نمی‌روی" in move.statement


@pytest.mark.asyncio
async def test_a_week_without_leaving_is_worth_noticing(db):
    """ردِ مکانی هست ولی هیچ سفری نیست → WATCH، با جمله‌ای که دلیلش را می‌گوید."""
    await _seed_nights(db, count=6)

    move = _facet(await bh._collect(db, 0), "behaviour_movement")
    assert move is not None
    assert move.tone == Tone.WATCH.value
    assert "از جایت تکان نخورده‌ای" in move.statement


@pytest.mark.asyncio
async def test_two_days_of_location_is_not_enough_for_a_weekly_claim(db):
    """نبودِ داده با نبودِ حرکت یکی نیست."""
    await _seed_nights(db, count=2)
    assert bh.MIN_LOCATION_DAYS == 4
    assert _facet(await bh._collect(db, 0), "behaviour_movement") is None


# ── روتین ───────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_a_settled_routine_is_good_news(db):
    keys = ["1:2:0:6"] * 8 + ["9:9:5:12", "9:9:6:12"]
    await _seed_trips(db, keys=keys)
    await _seed_patterns(db, learned=["1:2:0:6"], unlearned=["9:9:5:12", "9:9:6:12"])

    routine = _facet(await bh._collect(db, 0), "behaviour_routine")
    assert routine is not None
    assert routine.tone == Tone.GOOD.value
    assert routine.statement == (
        "رفت‌وآمدهایت الگوی جاافتاده‌ای دارند — ۱ مسیرِ تکراری شناخته شده و ۸۰٪ "
        "جابه‌جایی‌هایت روی همان‌هاست، یعنی روزهایت شکلِ مشخصی دارند."
    )


@pytest.mark.asyncio
async def test_no_settled_routine_is_watch(db):
    keys = [f"{i}:{i + 1}:{i % 7}:9" for i in range(1, 9)]
    await _seed_trips(db, keys=keys)
    await _seed_patterns(db, unlearned=keys)

    routine = _facet(await bh._collect(db, 0), "behaviour_routine")
    assert routine is not None
    assert routine.tone == Tone.WATCH.value
    assert "شکلِ ثابتی ندارند" in routine.statement


@pytest.mark.asyncio
async def test_trips_without_any_computed_pattern_stay_silent(db):
    """الگوها هنوز شمرده نشده‌اند؛ «روتین نداری» اینجا ادعای غلطی است."""
    await _seed_trips(db, keys=[f"{i}:{i + 1}:0:9" for i in range(1, 9)])
    assert _facet(await bh._collect(db, 0), "behaviour_routine") is None


# ── گوشی ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_screen_time_climbing_is_watch_with_a_real_sentence(db):
    await _seed_usage(db, days_ago_range=range(0, 5), minutes_per_day=240)
    await _seed_usage(db, days_ago_range=range(7, 12), minutes_per_day=120)

    screen = _facet(await bh._collect(db, 0), "behaviour_screen_time")
    assert screen is not None
    assert screen.tone == Tone.WATCH.value
    assert screen.statement == (
        "به‌طور میانگین روزی حدودِ ۴ ساعت با گوشی‌ات کار می‌کنی و این هفته نسبت به "
        "هفتهٔ پیش بالا رفته — روزی حدودِ ۲ ساعت بیشتر."
    )
    assert any("تلگرام" in e for e in screen.evidence)
    assert any("قفلِ گوشی" in e for e in screen.evidence)


@pytest.mark.asyncio
async def test_screen_time_falling_is_good_news(db):
    await _seed_usage(db, days_ago_range=range(0, 5), minutes_per_day=90)
    await _seed_usage(db, days_ago_range=range(7, 12), minutes_per_day=200)

    screen = _facet(await bh._collect(db, 0), "behaviour_screen_time")
    assert screen is not None
    assert screen.tone == Tone.GOOD.value
    assert "پایین آمده" in screen.statement


@pytest.mark.asyncio
async def test_steady_screen_time_is_plain_description(db):
    await _seed_usage(db, days_ago_range=range(0, 5), minutes_per_day=125)
    await _seed_usage(db, days_ago_range=range(7, 12), minutes_per_day=120)

    screen = _facet(await bh._collect(db, 0), "behaviour_screen_time")
    assert screen is not None
    assert screen.tone == Tone.NEUTRAL.value
    assert "تقریباً همان‌قدر مانده" in screen.statement


@pytest.mark.asyncio
async def test_a_usage_day_reported_twice_by_two_devices_is_summed_not_doubled_up(db):
    """یک ردیف به‌ازای هر (روز، دستگاه) — هر دو باید در همان روز جمع شوند."""
    await _seed_usage(db, days_ago_range=range(0, 5), minutes_per_day=60, app="com.whatsapp")
    await _seed_usage(db, days_ago_range=range(0, 5), minutes_per_day=60,
                      app="com.android.chrome", unlocks=0)

    screen = _facet(await bh._collect(db, 0), "behaviour_screen_time")
    assert screen is not None
    assert "۲ ساعت" in screen.statement


@pytest.mark.asyncio
async def test_unreadable_usage_rows_do_not_invent_a_number(db, caplog):
    """JSONِ خراب نباید بی‌سروصدا «۰ دقیقه» بسازد — باید ساکت بماند و صدا کند."""
    from app.models.activity_log import ActivityLog

    for i in range(1, 6):
        day = _today_local() - dt.timedelta(days=i)
        db.add(ActivityLog(user_id=0, action="mobile_usage", entity_type="usage",
                           entity_id=day.isoformat(), detail="{not json"))
    await db.commit()

    # هندلر را مستقیم به لاگرِ همین ماژول می‌بندیم و نه به caplog.
    # چرا: caplog هندلرش را روی لاگرِ ریشه می‌گذارد، و اجرای کاملِ سوئیت
    # پیکربندیِ لاگ را عوض می‌کند (app/main.py:82 basicConfig می‌زند)، پس این
    # تست تنها اجرا سبز بود و در سوئیتِ کامل قرمز — بدونِ اینکه رفتارِ محصول
    # فرقی کرده باشد. حالا ادعا به پیکربندیِ سراسری وابسته نیست.
    records = []

    class _Capture(logging.Handler):
        def emit(self, record):
            records.append(record.getMessage())

    handler = _Capture()
    bh.logger.addHandler(handler)
    previous = bh.logger.level
    bh.logger.setLevel(logging.WARNING)
    try:
        assert _facet(await bh._collect(db, 0), "behaviour_screen_time") is None
    finally:
        bh.logger.removeHandler(handler)
        bh.logger.setLevel(previous)

    assert any("mobile_usage rows unreadable" in m for m in records), records


# ── قرارداد ─────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_the_provider_is_registered_and_its_registered_callable_works(db):
    """از خودِ رجیستری خوانده می‌شود، نه از ماژول — تا اگر امضای ثبت عوض شد
    اینجا بترکد.

    عمداً `owner_insight.collect()` صدا زده نمی‌شود: در نسخهٔ فعلیِ ستون
    فقرات، import شدنِ زیرپکیجِ `providers` نامِ تابعِ `providers()` را در
    فضای نامِ `owner_insight` بازمی‌نویسد و `collect()` را از کار می‌اندازد
    (جزئیات در گزارشِ این کار). آن فایل «ثابت» است و اینجا دست نمی‌خورد.
    """
    from app.services.owner_insight import _REGISTRY

    provider = _REGISTRY["behaviour"]
    assert provider.owns_page == "/activity-log"
    assert provider.group_order == 40
    assert provider.label

    await _seed_nights(db, count=8)
    facets = await provider.collect(db, 0)
    assert facets is not None
    assert "behaviour_sleep" in {f.key for f in facets}
    assert all(f.group == "behaviour" for f in facets)


def test_owns_page_is_a_real_route():
    """`/activity-log` باید در همان رجیستریِ واحدِ مسیرها باشد."""
    meta = (pathlib.Path(__file__).resolve().parents[1]
            / "frontend" / "src" / "lib" / "routesMeta.js").read_text(encoding="utf-8")
    assert "path: '/activity-log'" in meta


@pytest.mark.asyncio
async def test_no_statement_is_a_bare_number(db):
    """قاعدهٔ اصلی: «شاخص پشتکار ۱۰/۱۰۰» دیگر نباید ممکن باشد."""
    from app.models.place import Place

    db.add(Place(id=1, user_id=0, label="خانه", kind="home",
                 latitude=25.2, longitude=55.2, radius_m=180.0))
    await db.commit()
    await _seed_nights(db, count=8)
    keys = ["1:2:0:6"] * 6
    await _seed_trips(db, keys=keys)
    await _seed_patterns(db, learned=["1:2:0:6"])
    await _seed_usage(db, days_ago_range=range(0, 5), minutes_per_day=150)
    await _seed_usage(db, days_ago_range=range(7, 12), minutes_per_day=150)

    facets = await bh._collect(db, 0)
    assert facets and len(facets) == 4
    for f in facets:
        assert len(f.statement) > 30, f.key
        assert f.statement.endswith("."), f.key
        assert f.statement[0] not in "۰۱۲۳۴۵۶۷۸۹0123456789", f.key
        assert f.tone in {"good", "neutral", "watch"}
        assert f.owns_page == "/activity-log"
        assert f.evidence and all(len(e) > 8 for e in f.evidence)
