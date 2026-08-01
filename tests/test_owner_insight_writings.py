"""«من که هستم» → منبعِ «نوشته‌های خودت» (۲۰۲۶-۰۸-۰۱).

این تست‌ها همان چیزهایی را میخ می‌کنند که صفحهٔ قبلی را ساقط کرد:

* **جمله، نه عدد.** ادعایی که فقط یک عدد باشد («۱۰/۱۰۰») اصلاً ثبت نمی‌شود.
* **لحنِ صادق.** نقاطِ قوت `good` است و ضعف‌ها `watch`؛ هر دو شاخه تست دارند.
* **پایگاه‌دادهٔ خالی یعنی سکوت.** هیچ کارتی از هیچ ساخته نمی‌شود.
* **ستونِ درست.** خطای واقعیِ `select(TodoItem.title)` (ستون `content` بود) زیرِ
  یک `except` ماه‌ها زنده ماند. اینجا مسیرِ موفق واقعاً اجرا می‌شود و روی
  شمارشِ نویسه‌های ``body`` ادعا می‌کند، پس نامِ غلطِ ستون قرمز می‌شود.
* **شاهد جعلی نمی‌شود.** نقلی که در متنِ خودش نباشد، ادعایش دور ریخته می‌شود.
* **بدونِ مدل، شخصیت بافته نمی‌شود** — فقط یک کارتِ صادقانهٔ «هنوز خوانده نشده».
"""
import json

import pytest
import pytest_asyncio

from app.services.owner_insight.providers import writings as W

GATEWAY = "app.services.ai.inference_gateway.complete"


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


# ── متنِ واقع‌نما: دو نوشتهٔ بلند، مثلِ همان‌هایی که در برنامه هست ────────────

SENT_NIGHT = "من از کودکی عادت داشتم شب‌ها بنشینم و از خودم حساب بکشم"
SENT_ABANDON = "هر کاری را با شوق شروع می‌کنم و بیشترشان را نیمه‌کاره رها می‌کنم"
SENT_DEBT = "برایم از هر چیزی مهم‌تر است که به کسی بدهکار نمانم"

_PARA = (
    f"{SENT_NIGHT}. اوایل فکر می‌کردم این وسواس است، بعدها فهمیدم تنها راهی است که "
    "با آن می‌توانم خودم را جدی بگیرم. سال‌ها طول کشید تا بپذیرم که این حساب‌کشی "
    "اگر به عمل نرسد، فقط عذاب است و نه اصلاح.\n\n"
    f"{SENT_ABANDON}. این را نه به‌عنوان تعارف می‌نویسم و نه برای اینکه کسی دلداری‌ام "
    "بدهد؛ می‌نویسم چون هر بار که فهرست کارهای نیمه‌تمامم را نگاه می‌کنم، همین یک "
    "الگو را می‌بینم که تکرار شده است.\n\n"
    f"{SENT_DEBT}. پدرم می‌گفت آدم می‌تواند فقیر باشد اما بدهکار نه، و من این جمله را "
    "بی‌آنکه بخواهم، سالِ ها بعد در تصمیم‌های مالی‌ام تکرار کرده‌ام.\n\n"
)

BODY_A = "تاریخچهٔ کوتاهی از خودم و آنچه بر من گذشت.\n\n" + _PARA * 3
BODY_B = "اهدافم برای این‌جهان و آن‌جهان، همراه با فلسفه‌ای که پشتشان است.\n\n" + _PARA * 2


async def _add(db, title, body, *, category=None, deleted=False, uid=0):
    import datetime as dt

    from app.models.personal_writing import PersonalWriting

    row = PersonalWriting(
        user_id=uid,
        title=title,
        category=category,
        body=body,
        deleted_at=dt.datetime(2026, 7, 1, tzinfo=dt.timezone.utc) if deleted else None,
    )
    db.add(row)
    await db.commit()
    return row


async def _seed_corpus(db):
    await _add(db, "تاریخچهٔ خداشناسی من", BODY_A, category="خداشناسی و شرح حال")
    await _add(db, "اهداف دنیا و آخرت", BODY_B, category="اهداف")


def _fake_model(payload, *, ok=True, model="Claude Opus 4.8", calls=None):
    """جایگزینِ ``inference_gateway.complete`` با همان امضا و همان شکلِ خروجی."""

    async def _complete(db, prompt, *, task="chat", system=None, max_tokens=1024,
                        temperature=None, model_id=None):
        if calls is not None:
            calls.append({"task": task, "prompt": prompt, "max_tokens": max_tokens})
        if not ok:
            return {"ok": False, "error": "no_model", "text": "", "model": None}
        text = payload if isinstance(payload, str) else json.dumps(payload, ensure_ascii=False)
        return {"ok": True, "text": "این هم نتیجه:\n" + text, "model": model,
                "provider": "anthropic"}

    return _complete


def _by_key(facets, key):
    return next((f for f in (facets or []) if f.key == key), None)


# ── ۱) «نمی‌دانم» جوابِ درستی است ────────────────────────────────────────────

@pytest.mark.asyncio
async def test_empty_database_produces_nothing_at_all(db, monkeypatch):
    calls = []
    monkeypatch.setattr(GATEWAY, _fake_model({}, calls=calls))

    assert await W._collect(db, 0) is None
    # و اصلاً سراغِ مدل هم نمی‌رود — از هیچ، ادعایی ساخته نمی‌شود.
    assert calls == []


@pytest.mark.asyncio
async def test_a_single_short_note_is_not_a_corpus(db, monkeypatch):
    calls = []
    monkeypatch.setattr(GATEWAY, _fake_model({}, calls=calls))
    await _add(db, "یادداشت کوتاه", "امروز حالم خوب بود و کمی قدم زدم.")

    assert await W._collect(db, 0) is None
    assert calls == []


@pytest.mark.asyncio
async def test_a_trashed_writing_does_not_count_as_evidence(db, monkeypatch):
    monkeypatch.setattr(GATEWAY, _fake_model({}, ok=False))
    await _add(db, "تاریخچهٔ خداشناسی من", BODY_A, deleted=True)

    assert await W._collect(db, 0) is None


# ── ۲) بدونِ مدل: کارتِ صادقانه، نه شخصیتِ بافته‌شده ─────────────────────────

@pytest.mark.asyncio
async def test_without_a_model_it_says_plainly_how_much_is_unread(db, monkeypatch):
    monkeypatch.setattr(GATEWAY, _fake_model({}, ok=False))
    await _seed_corpus(db)

    facets = await W._collect(db, 0)
    assert facets is not None and len(facets) == 1
    f = facets[0]

    assert f.key == "writings_corpus_unanalysed"
    assert f.tone == "watch"                 # نه «good»، نه «neutral»
    assert f.group == "self"
    assert f.owns_page == "/writings"
    assert f.source_label

    # جمله است، نه عدد: فاصله دارد، بلند است، و با نقطه/جملهٔ فارسی تمام می‌شود.
    assert " " in f.statement and len(f.statement) > 80
    assert not f.statement.strip().isdigit()

    # حجمِ واقعی — همین ادعا ثابت می‌کند ستونِ `body` واقعاً خوانده شده است.
    total = len(BODY_A) + len(BODY_B)
    assert W._fa(total) in f.statement
    assert W._fa(2) in f.statement
    assert "تاریخچهٔ خداشناسی من" in f.statement
    assert "تحلیل نشده" in f.statement

    # و هیچ ادعای شخصیتی نمی‌سازد.
    for forbidden in ("شخصیتت", "نقطهٔ قوتت", "ضعفت"):
        assert forbidden not in f.statement

    # شواهد: جمله‌های کوتاهِ خواندنی، با یک نقل از سرِ خودِ متن.
    assert f.evidence
    assert all(len(e) <= 200 for e in f.evidence)
    assert any("تاریخچهٔ خداشناسی من" in e for e in f.evidence)


@pytest.mark.asyncio
async def test_a_broken_gateway_degrades_to_the_same_honest_card(db, monkeypatch):
    async def _boom(*a, **kw):
        raise RuntimeError("provider down")

    monkeypatch.setattr(GATEWAY, _boom)
    await _seed_corpus(db)

    facets = await W._collect(db, 0)
    assert [f.key for f in facets] == ["writings_corpus_unanalysed"]
    assert facets[0].tone == "watch"


# ── ۳) با مدل: هر دو شاخهٔ خبرِ خوب و خبرِ بد ────────────────────────────────

_GOOD_AND_BAD = {
    "traits": [{
        "statement": "تو آدمی هستی که شب‌ها با خودت خلوت می‌کنی و بی‌رحمانه از خودت حساب می‌کشی",
        "quote": SENT_NIGHT,
    }],
    "values": [{
        "statement": "بدهکار نبودن برایت یک اصلِ اخلاقی است، نه یک ترجیحِ مالی",
        "quote": SENT_DEBT,
    }],
    "themes": [],
    "strengths": [{
        "statement": "خودآگاهی‌ات بالاست: ضعف‌هایت را بدونِ توجیه و با اسمِ خودشان می‌نویسی",
        "quote": SENT_NIGHT,
    }],
    "weaknesses": [{
        "statement": "کارها را با شوق شروع می‌کنی و بیشترشان نیمه‌کاره می‌مانند — این را خودت هم دیده‌ای",
        "quote": SENT_ABANDON,
    }],
}


@pytest.mark.asyncio
async def test_strengths_come_back_as_good_news_in_his_own_words(db, monkeypatch):
    calls = []
    monkeypatch.setattr(GATEWAY, _fake_model(_GOOD_AND_BAD, calls=calls))
    await _seed_corpus(db)

    facets = await W._collect(db, 0)
    f = _by_key(facets, "writings_strengths")
    assert f is not None
    assert f.tone == "good"
    assert f.group == "self"
    assert f.kind == "inferred"
    assert f.owns_page == "/writings"
    assert "خودآگاهی‌ات بالاست" in f.statement
    # هر ادعا به جملهٔ خودش برمی‌گردد، و نقل کوتاه است.
    assert any(SENT_NIGHT in e for e in f.evidence)
    assert all(len(e) <= 200 for e in f.evidence)
    # مدلی که جواب داده ثبت شده است.
    assert any("Claude Opus 4.8" in e for e in f.evidence)

    # از مسیرِ AIِ خودِ برنامه رفته، با taskِ ثبت‌شده در کاتالوگ.
    assert calls and calls[0]["task"] == "personality"
    assert SENT_ABANDON in calls[0]["prompt"]


@pytest.mark.asyncio
async def test_weaknesses_come_back_as_watch_never_as_a_strength(db, monkeypatch):
    monkeypatch.setattr(GATEWAY, _fake_model(_GOOD_AND_BAD))
    await _seed_corpus(db)

    facets = await W._collect(db, 0)
    f = _by_key(facets, "writings_weaknesses")
    assert f is not None
    assert f.tone == "watch"            # ← همان خطایی که مالک دید، برعکسش
    assert "نیمه‌کاره" in f.statement
    assert any(SENT_ABANDON in e for e in f.evidence)

    # خبرِ بد زیرِ کارتِ «نقاط قوت» نرفته است.
    strengths = _by_key(facets, "writings_strengths")
    assert "نیمه‌کاره" not in (strengths.statement if strengths else "")


@pytest.mark.asyncio
async def test_personality_and_values_are_sentences_not_labels(db, monkeypatch):
    monkeypatch.setattr(GATEWAY, _fake_model(_GOOD_AND_BAD))
    await _seed_corpus(db)

    facets = await W._collect(db, 0)
    keys = {f.key for f in facets}
    assert {"writings_personality", "writings_values"} <= keys
    # آرایهٔ خالیِ themes هیچ کارتی نمی‌سازد.
    assert "writings_themes" not in keys

    for f in facets:
        assert len(f.statement) > 30 and " " in f.statement
        assert f.confidence and 0 < f.confidence <= 0.75
        assert f.evidence


# ── ۴) ضدِ جعل: عددِ خام و نقلِ ساختگی رد می‌شوند ────────────────────────────

@pytest.mark.asyncio
async def test_a_bare_number_is_never_accepted_as_a_claim(db, monkeypatch):
    payload = {
        "traits": [
            {"statement": "۱۰/۱۰۰", "quote": SENT_NIGHT},                 # همان خرابیِ اصلی
            {"statement": "درون‌گرا", "quote": SENT_NIGHT},               # برچسب، نه جمله
            {"statement": "تو شب‌ها با خودت خلوت می‌کنی و از خودت حساب می‌کشی",
             "quote": SENT_NIGHT},
        ]
    }
    monkeypatch.setattr(GATEWAY, _fake_model(payload))
    await _seed_corpus(db)

    facets = await W._collect(db, 0)
    f = _by_key(facets, "writings_personality")
    assert f is not None
    assert "۱۰/۱۰۰" not in f.statement
    assert "درون‌گرا" not in f.statement
    assert "با خودت خلوت می‌کنی" in f.statement


@pytest.mark.asyncio
async def test_a_quote_he_never_wrote_takes_its_claim_down_with_it(db, monkeypatch):
    payload = {
        "traits": [{
            "statement": "تو آدمِ ریسک‌پذیری هستی و از شکست نمی‌ترسی",
            "quote": "من همیشه بی‌محابا وارد هر ریسکی شده‌ام و هیچ‌وقت نترسیده‌ام",
        }],
        "values": [{
            "statement": "بدهکار نبودن برایت یک اصلِ اخلاقی است",
            "quote": SENT_DEBT,
        }],
    }
    monkeypatch.setattr(GATEWAY, _fake_model(payload))
    await _seed_corpus(db)

    facets = await W._collect(db, 0)
    keys = {f.key for f in facets}
    assert "writings_personality" not in keys      # شاهدِ جعلی → ادعا حذف
    assert "writings_values" in keys               # شاهدِ واقعی → ادعا می‌ماند


@pytest.mark.asyncio
async def test_when_nothing_survives_validation_it_admits_it(db, monkeypatch):
    payload = {"traits": [{"statement": "تو آدمِ ریسک‌پذیری هستی",
                           "quote": "جمله‌ای که هرگز ننوشته‌ام و در متن نیست"}]}
    monkeypatch.setattr(GATEWAY, _fake_model(payload))
    await _seed_corpus(db)

    facets = await W._collect(db, 0)
    assert [f.key for f in facets] == ["writings_corpus_unanalysed"]
    assert facets[0].tone == "watch"
    assert "قابلِ ردیابی نبود" in facets[0].statement
    assert "ریسک‌پذیر" not in facets[0].statement


@pytest.mark.asyncio
async def test_a_non_json_answer_is_not_silently_swallowed(db, monkeypatch):
    monkeypatch.setattr(GATEWAY, _fake_model("متأسفم، نمی‌توانم کمک کنم."))
    await _seed_corpus(db)

    facets = await W._collect(db, 0)
    assert [f.key for f in facets] == ["writings_corpus_unanalysed"]
    assert "مدلِ زبانی‌ای وصل نیست" in facets[0].statement


# ── ۵) ثبت در رجیستری ───────────────────────────────────────────────────────

def test_provider_is_registered_and_points_at_a_real_page():
    from app.services.owner_insight import _REGISTRY

    p = _REGISTRY["writings"]
    assert p.owns_page == "/writings"      # در frontend/src/lib/routesMeta.js هست
    assert p.group_order == 20
    assert p.label
