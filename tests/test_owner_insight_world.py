"""«آدم‌ها و پول» — رابطهٔ مالک با بیرون (۲۰۲۶-۰۸-۰۱).

این تست‌ها دقیقاً همان چیزهایی را میخ می‌کنند که در نسخهٔ قبلِ «من که هستم»
شکسته بود:

* **جمله، نه عدد.** «شاخص پشتکار ۱۰/۱۰۰» شکستِ مرجع است؛ اینجا متنِ واقعیِ
  هر ادعا سنجیده می‌شود، نه فقط «چیزی برگشت».
* **`tone` صادق.** رابطهٔ خوابیده و دستهٔ خرجی که بالا زده `WATCH`اند و
  برعکسشان `GOOD`؛ هر شاخه تستِ جدا دارد.
* **پایگاه‌دادهٔ خالی → هیچ.** «نمی‌دانم» جوابِ درستی است، و لاگِ نیمه‌جان
  هم «نمی‌دانم» است: سکوت با نبودِ داده یکی نیست.
* **مسیرِ موفق واقعاً اجرا می‌شود**، تا یک نامِ ستونِ غلط (بلایی که سرِ
  `select(TodoItem.title)` آمد — ستون `content` است) پشتِ یک `except` پنهان
  نماند.
* **هرگز جمعِ بین‌ارزی** (audit #20) و **هرگز روند از ماهِ ناتمام**.
"""
import datetime as dt
import re

import pytest
import pytest_asyncio

from app.services.owner_insight.base import Kind, Tone
from app.services.owner_insight.providers import world as w

UTC = dt.timezone.utc


@pytest_asyncio.fixture
async def db():
    from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

    from app.database import Base
    import app.models  # noqa: F401 — همهٔ جدول‌ها باید ثبت شده باشند

    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as session:
        yield session
    await engine.dispose()


# ── کمک‌ها ──────────────────────────────────────────────────────────────────

def _facet(facets, key):
    return next((f for f in (facets or []) if f.key == key), None)


def _month_day(offset: int, day: int = 15) -> dt.date:
    """روزِ `day` از ماهی که `offset` ماه با ماهِ جاری فاصله دارد."""
    now = dt.datetime.now(UTC)
    y, m = w._shift_month(now.year, now.month, offset)
    return dt.date(y, m, min(day, 28))


async def _person(db, name, *, uid=0, relationship=None, added_days_ago=400):
    from app.models.person import Person
    from app.models.person_profile import PersonProfile

    row = Person(
        user_id=uid,
        name=name,
        created_at=dt.datetime.now(UTC) - dt.timedelta(days=added_days_ago),
    )
    db.add(row)
    await db.flush()
    if relationship is not None:
        db.add(PersonProfile(person_id=row.id, relationship_type=relationship))
        await db.flush()
    return row


async def _interactions(db, person, *, days_ago, count=1, type_="call"):
    from app.models.interaction import Interaction, InteractionType

    for i in range(count):
        db.add(
            Interaction(
                person_id=person.id,
                type=InteractionType(type_),
                date=dt.datetime.now(UTC) - dt.timedelta(days=days_ago + i),
                summary="تماسِ کاری",
            )
        )
    await db.flush()


async def _account(db, *, currency="AED", uid=0, name="حسابِ اصلی"):
    from app.models.finance import FinancialAccount

    row = FinancialAccount(user_id=uid, name=name, currency=currency, balance=0)
    db.add(row)
    await db.flush()
    return row


async def _spend(db, account, *, amount, category, month_offset, currency=None,
                 kind="expense"):
    from app.models.finance import Transaction

    db.add(
        Transaction(
            account_id=account.id,
            amount=amount,
            transaction_type=kind,
            category=category,
            description="خریدِ روزمره",
            occurred_on=_month_day(month_offset),
            currency=currency,
        )
    )
    await db.flush()


async def _live_contact_log(db):
    """حداقلِ لازم تا دروازهٔ «لاگِ تعامل زنده است» باز شود."""
    other = await _person(db, "همکار")
    await _interactions(db, other, days_ago=5, count=w.MIN_INTERACTIONS_WINDOW)
    return other


# ── «نمی‌دانم» جوابِ درستی است ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_empty_database_produces_nothing_at_all(db):
    assert await w._collect(db, 0) is None


@pytest.mark.asyncio
async def test_a_half_dead_interaction_log_produces_no_people_claim(db):
    """۴ نفر ثبت شده ولی فقط ۳ تعامل: «با کسی در تماس نیستی» ادعایی دربارهٔ
    جدولِ خالی است، نه دربارهٔ مالک."""
    people = [await _person(db, n) for n in ("سارا", "علی", "رضا", "مینا")]
    await _interactions(db, people[0], days_ago=3, count=3)
    await db.commit()

    assert await w._collect(db, 0) is None


@pytest.mark.asyncio
async def test_a_person_added_yesterday_is_never_called_neglected(db):
    """کسی که دیروز اضافه شده و هنوز تعاملی ندارد «بی‌خبر مانده» نیست."""
    await _live_contact_log(db)
    await _person(db, "دوستِ تازه", relationship="close", added_days_ago=1)
    await db.commit()

    facets = await w._collect(db, 0)
    assert _facet(facets, "world_close_contact") is None


# ── دایرهٔ تماس ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_contact_circle_names_who_he_actually_talks_to(db):
    sara = await _person(db, "سارا")
    ali = await _person(db, "علی")
    reza = await _person(db, "رضا")
    await _person(db, "مینا")          # ثبت شده ولی خبری ازش نیست
    await _interactions(db, sara, days_ago=2, count=6)
    await _interactions(db, ali, days_ago=10, count=3, type_="message")
    await _interactions(db, reza, days_ago=20, count=2, type_="meeting")
    await db.commit()

    facet = _facet(await w._collect(db, 0), "world_contact_circle")
    assert facet is not None
    assert facet.statement == (
        "در ۹۰ روزِ گذشته با ۳ نفر از ۴ نفری که ثبت کرده‌ای واقعاً در تماس "
        "بوده‌ای؛ بیشترین رفت‌وآمدت با «سارا» بوده."
    )
    assert facet.tone == Tone.NEUTRAL.value
    assert facet.kind == Kind.MEASURED.value
    assert facet.group == "world"
    assert facet.owns_page == "/people-profiles"
    assert any("تماس ۶" in e for e in facet.evidence)
    assert any("۱ نفرِ دیگر" in e and "هیچ تعاملی" in e for e in facet.evidence)


@pytest.mark.asyncio
async def test_contact_circle_stays_silent_with_only_two_people(db):
    """«۱ نفر از ۲ نفر» تصویری از دایرهٔ تماس نیست."""
    sara = await _person(db, "سارا")
    await _person(db, "علی")
    await _interactions(db, sara, days_ago=2, count=w.MIN_INTERACTIONS_WINDOW)
    await db.commit()

    assert _facet(await w._collect(db, 0), "world_contact_circle") is None


# ── رابطهٔ نزدیکی که خوابیده — هر دو شاخه ───────────────────────────────────

@pytest.mark.asyncio
async def test_a_close_relationship_gone_quiet_is_watch(db):
    await _live_contact_log(db)
    sara = await _person(db, "سارا", relationship="close")
    await _interactions(db, sara, days_ago=70, count=1)
    await db.commit()

    facet = _facet(await w._collect(db, 0), "world_close_contact")
    assert facet is not None
    assert facet.tone == Tone.WATCH.value
    assert facet.statement == (
        "با «سارا» که رابطه‌اش را نزدیک ثبت کرده‌ای نزدیکِ ۲ ماه است تماسی نداشته‌ای."
    )
    assert facet.owns_page == "/people-profiles"
    assert any("آخرین تعامل" in e for e in facet.evidence)


@pytest.mark.asyncio
async def test_two_quiet_close_people_are_counted_in_the_sentence(db):
    await _live_contact_log(db)
    sara = await _person(db, "سارا", relationship="close")
    ali = await _person(db, "علی", relationship="close")
    await _interactions(db, sara, days_ago=80, count=1)
    await _interactions(db, ali, days_ago=60, count=1)
    await db.commit()

    facet = _facet(await w._collect(db, 0), "world_close_contact")
    assert facet.tone == Tone.WATCH.value
    assert facet.statement.startswith("با «سارا»")          # دورترین اول
    assert "۱ نفرِ نزدیکِ دیگر هم همین‌طور مانده‌اند" in facet.statement


@pytest.mark.asyncio
async def test_a_close_person_never_contacted_says_so_honestly(db):
    await _live_contact_log(db)
    await _person(db, "دایی", relationship="close", added_days_ago=200)
    await db.commit()

    facet = _facet(await w._collect(db, 0), "world_close_contact")
    assert facet.tone == Tone.WATCH.value
    assert "هیچ تعاملی ثبت نشده" in facet.statement
    assert "«دایی»" in facet.statement


@pytest.mark.asyncio
async def test_close_relationships_all_alive_is_good(db):
    await _live_contact_log(db)
    sara = await _person(db, "سارا", relationship="close")
    ali = await _person(db, "علی", relationship="close")
    await _interactions(db, sara, days_ago=4, count=1)
    await _interactions(db, ali, days_ago=20, count=1)
    await db.commit()

    facet = _facet(await w._collect(db, 0), "world_close_contact")
    assert facet is not None
    assert facet.tone == Tone.GOOD.value
    assert facet.statement == (
        "با هر ۲ نفری که رابطه‌شان را نزدیک ثبت کرده‌ای در ۴۵ روزِ گذشته در تماس "
        "بوده‌ای؛ تازه‌ترینش ۴ روز پیش با «سارا» بوده."
    )


@pytest.mark.asyncio
async def test_the_owners_own_verdict_beats_the_computed_relationship(db):
    """`relationship_override` همان قاعدهٔ stored-wins را دارد؛ اینجا هم
    از `effective_relationship` خوانده می‌شود، نه از ستونِ محاسبه‌شده."""
    from app.models.person_profile import PersonProfile
    from sqlalchemy import select

    await _live_contact_log(db)
    sara = await _person(db, "سارا", relationship="distant")
    profile = (
        await db.execute(select(PersonProfile).where(PersonProfile.person_id == sara.id))
    ).scalar_one()
    profile.relationship_override = "close"
    await _interactions(db, sara, days_ago=90, count=1)
    await db.commit()

    facet = _facet(await w._collect(db, 0), "world_close_contact")
    assert facet is not None and facet.tone == Tone.WATCH.value
    assert "«سارا»" in facet.statement


# ── شکلِ خرج ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_spending_shape_describes_priorities_as_a_sentence(db):
    acc = await _account(db, currency="AED")
    await _spend(db, acc, amount=5000, category="خوراک", month_offset=0)
    await _spend(db, acc, amount=3000, category="حمل‌ونقل", month_offset=0)
    await _spend(db, acc, amount=2000, category="تفریح", month_offset=0)
    await _spend(db, acc, amount=12000, category=None, month_offset=0, kind="income")
    await db.commit()

    facet = _facet(await w._collect(db, 0), "world_spending_shape")
    assert facet is not None
    assert facet.statement == (
        "تا اینجای این ماه بیشترِ خرجت در «خوراک» بوده — ۵٬۰۰۰ از ۱۰٬۰۰۰ درهم، "
        "یعنی ۵۰٪ از کلِ هزینه‌ات؛ بعد از آن «حمل‌ونقل»."
    )
    assert facet.tone == Tone.NEUTRAL.value
    assert facet.owns_page == "/budget"
    assert any("درآمدِ ثبت‌شدهٔ همین ماه ۱۲٬۰۰۰ درهم" in e for e in facet.evidence)


@pytest.mark.asyncio
async def test_spending_shape_is_silent_when_the_ledger_is_uncategorised(db):
    acc = await _account(db, currency="AED")
    await _spend(db, acc, amount=9000, category=None, month_offset=0)
    await _spend(db, acc, amount=600, category="خوراک", month_offset=0)
    await _spend(db, acc, amount=400, category="تفریح", month_offset=0)
    await db.commit()

    assert _facet(await w._collect(db, 0), "world_spending_shape") is None


@pytest.mark.asyncio
async def test_a_stale_finance_record_makes_no_claim_about_priorities(db):
    """آخرین خرجِ ثبت‌شده چهار ماه پیش است؛ «اولویت‌هایت» از آن درنمی‌آید."""
    acc = await _account(db, currency="AED")
    await _spend(db, acc, amount=5000, category="خوراک", month_offset=-4)
    await _spend(db, acc, amount=3000, category="مسکن", month_offset=-4)
    await db.commit()

    assert await w._collect(db, 0) is None


@pytest.mark.asyncio
async def test_two_currencies_are_never_summed_together(db):
    aed = await _account(db, currency="AED")
    usd = await _account(db, currency="USD", name="حسابِ دلاری")
    await _spend(db, aed, amount=6000, category="خوراک", month_offset=0)
    await _spend(db, aed, amount=4000, category="مسکن", month_offset=0)
    await _spend(db, usd, amount=900, category="سفر", month_offset=0)
    await _spend(db, usd, amount=100, category="خوراک", month_offset=0)
    await db.commit()

    facet = _facet(await w._collect(db, 0), "world_spending_shape")
    assert facet is not None
    # کلِ جمله دربارهٔ درهم است: ۱۰٬۰۰۰ — نه ۱۱٬۰۰۰ و نه هیچ عددِ ترکیبی.
    assert "۱۰٬۰۰۰ درهم" in facet.statement
    assert "۱۱٬۰۰۰" not in facet.statement
    assert "دلار" not in facet.statement
    assert any("ارزهای دیگر جدا حساب شده‌اند" in e and "۱٬۰۰۰ دلار" in e
               for e in facet.evidence)


# ── روندِ خرج — هر دو شاخه ──────────────────────────────────────────────────

async def _seed_trend(db, *, last_month, priors, currency="AED"):
    """`last_month` و هر عضوِ `priors` یک dict از دسته→مبلغ است."""
    acc = await _account(db, currency=currency)
    for category, amount in last_month.items():
        await _spend(db, acc, amount=amount, category=category, month_offset=-1)
    for index, month in enumerate(priors, start=2):
        for category, amount in month.items():
            await _spend(db, acc, amount=amount, category=category,
                         month_offset=-index)
    await db.commit()
    return acc


@pytest.mark.asyncio
async def test_a_climbing_category_is_watch_and_names_it(db):
    await _seed_trend(
        db,
        last_month={"خوراک": 5000, "مسکن": 2000},
        priors=[{"خوراک": 1000, "مسکن": 2000}] * 3,
    )

    facet = _facet(await w._collect(db, 0), "world_spending_trend")
    assert facet is not None
    assert facet.tone == Tone.WATCH.value
    assert facet.statement == (
        "خرجِ «خوراک» ماهِ گذشته از روالت بالا زده — ۵٬۰۰۰ درهم در برابرِ میانگینِ "
        "۱٬۰۰۰ درهم در ۳ ماهِ پیش از آن."
    )
    assert facet.owns_page == "/budget"
    assert any("ماهِ جاری چون ناتمام است وارد این مقایسه نشده" in e
               for e in facet.evidence)


@pytest.mark.asyncio
async def test_a_brand_new_spending_line_is_watch_too(db):
    await _seed_trend(
        db,
        last_month={"قسط": 4000, "خوراک": 2000},
        priors=[{"خوراک": 2000}] * 3,
    )

    facet = _facet(await w._collect(db, 0), "world_spending_trend")
    assert facet.tone == Tone.WATCH.value
    assert facet.statement == (
        "ماهِ گذشته «قسط» به خرجت اضافه شده — ۴٬۰۰۰ درهم که در ۳ ماهِ پیش از آن "
        "اصلاً نداشتی."
    )


@pytest.mark.asyncio
async def test_a_calmer_month_is_good(db):
    await _seed_trend(
        db,
        last_month={"خوراک": 1200, "مسکن": 800},
        priors=[{"خوراک": 3000, "مسکن": 2000}] * 3,
    )

    facet = _facet(await w._collect(db, 0), "world_spending_trend")
    assert facet is not None
    assert facet.tone == Tone.GOOD.value
    assert facet.statement == (
        "ماهِ گذشته هیچ دسته‌ای از خرجت از روالِ قبل بالا نزده و مجموعِ هزینه‌ات "
        "۶۰٪ کمتر از میانگینِ ۳ ماهِ پیش بوده — ۲٬۰۰۰ در برابرِ ۵٬۰۰۰ درهم."
    )


@pytest.mark.asyncio
async def test_a_month_on_the_usual_track_is_neutral(db):
    await _seed_trend(
        db,
        last_month={"خوراک": 3000, "مسکن": 2000},
        priors=[{"خوراک": 3000, "مسکن": 2000}] * 3,
    )

    facet = _facet(await w._collect(db, 0), "world_spending_trend")
    assert facet.tone == Tone.NEUTRAL.value
    assert "تقریباً همان روالِ ۳ ماهِ پیش" in facet.statement


@pytest.mark.asyncio
async def test_the_unfinished_current_month_never_drives_the_trend(db):
    """در روزِ سومِ ماه، «کمتر خرج کرده‌ای» یک دروغِ آماری است."""
    acc = await _seed_trend(
        db,
        last_month={"خوراک": 3000, "مسکن": 2000},
        priors=[{"خوراک": 3000, "مسکن": 2000}] * 3,
    )
    await _spend(db, acc, amount=90000, category="خوراک", month_offset=0)
    await db.commit()

    facet = _facet(await w._collect(db, 0), "world_spending_trend")
    assert facet is not None
    assert facet.tone == Tone.NEUTRAL.value          # نه WATCHِ ساختگی
    assert "ماهِ گذشته" in facet.statement
    assert "۹۰٬۰۰۰" not in facet.statement


@pytest.mark.asyncio
async def test_one_prior_month_is_not_an_average(db):
    await _seed_trend(
        db,
        last_month={"خوراک": 5000, "مسکن": 2000},
        priors=[{"خوراک": 1000, "مسکن": 2000}],
    )

    assert _facet(await w._collect(db, 0), "world_spending_trend") is None


# ── قرارداد ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_both_worlds_land_together_each_with_its_own_door(db):
    sara = await _person(db, "سارا", relationship="close")
    ali = await _person(db, "علی")
    await _person(db, "رضا")
    await _interactions(db, sara, days_ago=3, count=6)
    await _interactions(db, ali, days_ago=9, count=4, type_="email")
    await _seed_trend(
        db,
        last_month={"خوراک": 5000, "مسکن": 2000},
        priors=[{"خوراک": 1000, "مسکن": 2000}] * 3,
    )

    facets = await w._collect(db, 0)
    keys = {f.key for f in facets}
    assert keys == {
        "world_contact_circle", "world_close_contact",
        "world_spending_shape", "world_spending_trend",
    }
    pages = {f.key: f.owns_page for f in facets}
    assert pages["world_contact_circle"] == "/people-profiles"
    assert pages["world_close_contact"] == "/people-profiles"
    assert pages["world_spending_shape"] == "/budget"
    assert pages["world_spending_trend"] == "/budget"

    for f in facets:
        assert f.group == "world"
        assert f.kind == Kind.MEASURED.value
        assert f.source_label
        assert f.evidence and all(len(e) > 8 for e in f.evidence)
        # جمله، نه عدد — «شاخص پشتکار ۱۰/۱۰۰» دقیقاً همین را رد می‌کرد.
        assert len(f.statement) > 30
        assert not re.fullmatch(r"[\s\d۰-۹/٪٬.،:-]+", f.statement)


@pytest.mark.asyncio
async def test_the_provider_is_registered_on_the_world_shelf(db):
    """از رجیستری خوانده می‌شود، نه از `owner_insight.providers`.

    آن نام بعد از اولین بارگذاری دیگر تابع نیست: `_load_providers` زیرپکیجِ
    `providers` را import می‌کند و ماشینِ import همان نام را روی پکیجِ والد
    می‌نشاند و تابع را می‌پوشاند (گزارش شد؛ اصلاحش در فایلِ مشترک است و
    این تست نباید به آن گره بخورد).
    """
    import app.services.owner_insight as oi

    oi._load_providers()
    entry = oi._REGISTRY["world"]
    assert entry.group_order == 60
    assert entry.owns_page == "/people-profiles"
    assert entry.collect is w._collect


@pytest.mark.asyncio
async def test_another_users_rows_are_never_read(db):
    """دامنهٔ داده همان قاعدهٔ کلِ برنامه است: uid=۰ ردیفِ کاربرِ ۹ را نمی‌بیند."""
    sara = await _person(db, "سارا", uid=9)
    other = await _person(db, "علی", uid=9)
    await _person(db, "رضا", uid=9)
    await _interactions(db, sara, days_ago=3, count=6)
    await _interactions(db, other, days_ago=9, count=4)
    acc = await _account(db, currency="AED", uid=9)
    await _spend(db, acc, amount=5000, category="خوراک", month_offset=0)
    await _spend(db, acc, amount=3000, category="مسکن", month_offset=0)
    await db.commit()

    assert await w._collect(db, 0) is None
    assert await w._collect(db, 9) is not None
