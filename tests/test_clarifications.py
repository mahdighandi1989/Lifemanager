"""حلقهٔ رفعِ ابهام (۲۰۲۶-۰۷-۳۱) — «وقتی شک داری، بپرس».

قرارداد (مستقیماً از خواستهٔ مالک):
  • فیلدها هاردکد نیستند و برحسب موضوع ساخته می‌شوند.
  • جوابِ نصفه/خالی طبیعی است؛ فیلدِ بی‌جواب باز می‌ماند و دوباره پرسیده می‌شود.
  • سؤالِ تازه به همان فرم اضافه می‌شود، نه یک فرمِ موازی.
  • جوابِ کوتاه، بلند و بی‌قالب همه باید فهمیده شوند.
  • هیچ سؤالی حذف نمی‌شود — رهاشده park می‌شود.
  • جوابِ مالک در بخشِ واقعی ثبت می‌شود و فیدبک برمی‌گردد.

تست‌ها روی مسیرِ **بدونِ مدل** اجرا می‌شوند (کلیدی در محیط تست نیست) — یعنی
همان مسیرِ قاعده‌ایِ قطعی که باید همیشه کار کند.
"""
import datetime as dt

import pytest
import pytest_asyncio

from app.services import clarification_service as clar


def _fields(*labels):
    return [{"key": f"f{i}", "label": lbl, "type": "short"} for i, lbl in enumerate(labels, 1)]


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


# ── ساخت و ادغام ────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_ask_creates_a_form_with_the_given_fields(db):
    c = await clar.ask(
        db, topic="خرید ۲٬۰۰۰٬۰۰۰ ریالی", context="پیامک بانک",
        source="finance", source_ref="s1",
        questions=_fields("این خرید برای چه بود؟", "از کدام کارت؟"),
    )
    await db.commit()
    assert c is not None
    assert [q["label"] for q in c.questions] == ["این خرید برای چه بود؟", "از کدام کارت؟"]
    assert c.status == "open"
    assert clar.to_dict(c)["open_count"] == 2


@pytest.mark.asyncio
async def test_the_same_ambiguity_does_not_create_a_second_form(db):
    a = await clar.ask(db, topic="t", source_ref="same", questions=_fields("سؤال یک"))
    b = await clar.ask(db, topic="t", source_ref="same", questions=_fields("سؤال یک"))
    await db.commit()
    assert a.id == b.id
    assert len(b.questions) == 1


@pytest.mark.asyncio
async def test_a_new_question_is_merged_into_the_open_form(db):
    """«اگر در ارسال مجدد سوال‌های بیشتری بود اضافه بشه و پرسیده بشه»."""
    c = await clar.ask(db, topic="t", source_ref="same", questions=_fields("سؤال یک"))
    await clar.record_answers(db, c, {"f1": "جوابِ یک"}, raw="جوابِ یک")
    c2 = await clar.ask(
        db, topic="t", source_ref="same",
        questions=[{"key": "f2", "label": "سؤال دو", "type": "short"}],
    )
    await db.commit()
    assert c2.id == c.id
    assert len(c2.questions) == 2
    # جوابِ قبلی سرِ جایش مانده و فقط سؤالِ تازه باز است
    assert c2.questions[0]["answer"] == "جوابِ یک"
    assert clar.to_dict(c2)["open_count"] == 1
    assert c2.status == "partial"


@pytest.mark.asyncio
async def test_a_reworded_duplicate_question_is_not_asked_twice(db):
    c = await clar.ask(db, topic="t", source_ref="same", questions=_fields("مبلغ چقدر بود؟"))
    again = await clar.ask(
        db, topic="t", source_ref="same",
        questions=[{"key": "other_key", "label": "مبلغ چقدر بود", "type": "short"}],
    )
    await db.commit()
    assert len(again.questions) == 1


# ── جواب‌دادن: کوتاه، بلند، خالی، بی‌قالب ────────────────────────────────────

@pytest.mark.asyncio
async def test_partial_answers_leave_the_rest_open(db):
    """«هر قسمتی جواب ندادم بعدا دوباره ارسال بشه»."""
    c = await clar.ask(db, topic="t", source_ref="p",
                       questions=_fields("سؤال یک", "سؤال دو", "سؤال سه"))
    mapped = await clar.parse_reply(db, c, "1) جوابِ اول\n2)\n3) جوابِ سوم")
    out = await clar.record_answers(db, c, mapped, raw="…")
    await db.commit()
    assert out["filled"] == 2
    assert out["remaining"] == 1
    assert c.status == "partial"
    assert [q["label"] for q in c.questions if not q["answer"]] == ["سؤال دو"]


@pytest.mark.asyncio
async def test_a_long_answer_is_kept_whole_and_a_short_one_is_not_padded(db):
    c = await clar.ask(db, topic="t", source_ref="l", questions=_fields("چه شد؟", "کِی؟"))
    long_text = "این یک توضیحِ خیلی بلند است " * 12
    mapped = await clar.parse_reply(db, c, f"1) {long_text}\n2) دیروز")
    await clar.record_answers(db, c, mapped, raw="…")
    await db.commit()
    assert c.questions[0]["answer"].startswith("این یک توضیحِ خیلی بلند است")
    assert len(c.questions[0]["answer"]) > 200
    assert c.questions[1]["answer"] == "دیروز"


@pytest.mark.asyncio
async def test_i_dont_know_counts_as_unanswered(db):
    """«نمی‌دانم» جواب نیست — نباید فیلد را ببندد و باید دوباره پرسیده شود."""
    c = await clar.ask(db, topic="t", source_ref="idk", questions=_fields("کِی بود؟"))
    mapped = await clar.parse_reply(db, c, "1) نمی‌دانم")
    out = await clar.record_answers(db, c, mapped, raw="نمی‌دانم")
    await db.commit()
    assert out["filled"] == 0
    assert out["remaining"] == 1
    assert c.status == "open"


@pytest.mark.asyncio
async def test_an_answer_by_label_without_numbering_is_understood(db):
    c = await clar.ask(db, topic="t", source_ref="lbl",
                       questions=_fields("مبلغ چقدر بود؟", "برای چه کسی؟"))
    mapped = await clar.parse_reply(db, c, "برای چه کسی: علی\nمبلغ چقدر بود: ۵۰۰ هزار")
    await clar.record_answers(db, c, mapped, raw="…")
    await db.commit()
    answers = {q["label"]: q["answer"] for q in c.questions}
    assert answers["برای چه کسی؟"] == "علی"
    assert answers["مبلغ چقدر بود؟"] == "۵۰۰ هزار"


@pytest.mark.asyncio
async def test_a_bare_answer_to_a_single_question_form_is_understood(db):
    c = await clar.ask(db, topic="t", source_ref="bare", questions=_fields("این مالِ کیست؟"))
    mapped = await clar.parse_reply(db, c, "مالِ شرکت است")
    await clar.record_answers(db, c, mapped, raw="مالِ شرکت است")
    await db.commit()
    assert c.questions[0]["answer"] == "مالِ شرکت است"
    assert c.status == "answered"


# ── دوباره‌پرسی ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_backoff_controls_when_a_form_is_re_sent(db):
    """«اگر پیام رو ندیدم و رفته بود بالا، بعدا دوباره ارسال بشه» — ولی نه
    بی‌وقفه: فاصلهٔ ارسالِ مجدد فزاینده است."""
    now = dt.datetime.now(dt.timezone.utc)
    c = await clar.ask(db, topic="t", source_ref="bo", questions=_fields("سؤال"))
    assert clar._due(c, now) is True             # هنوز نرفته → همین حالا

    c.attempts, c.last_sent_at = 1, now
    assert clar._due(c, now) is False            # تازه فرستاده شده
    assert clar._due(c, now + dt.timedelta(hours=7)) is True

    c.attempts, c.last_sent_at = 2, now
    assert clar._due(c, now + dt.timedelta(hours=7)) is False   # فاصله بلندتر شد
    assert clar._due(c, now + dt.timedelta(hours=25)) is True

    c.attempts = clar.MAX_ATTEMPTS
    assert clar._due(c, now + dt.timedelta(days=30)) is False   # بس است


@pytest.mark.asyncio
async def test_an_answered_form_is_never_re_sent(db):
    c = await clar.ask(db, topic="t", source_ref="done", questions=_fields("سؤال"))
    await clar.record_answers(db, c, {"f1": "جواب"}, raw="جواب")
    await db.commit()
    assert clar._due(c, dt.datetime.now(dt.timezone.utc) + dt.timedelta(days=9)) is False


@pytest.mark.asyncio
async def test_snoozed_form_waits(db):
    now = dt.datetime.now(dt.timezone.utc)
    c = await clar.ask(db, topic="t", source_ref="sn", questions=_fields("سؤال"))
    await db.commit()
    await clar.snooze(db, c.id, hours=24)
    assert clar._due(c, now) is False
    assert clar._due(c, now + dt.timedelta(hours=25)) is True


@pytest.mark.asyncio
async def test_an_abandoned_form_is_parked_not_deleted(db):
    from app.models.clarification import Clarification

    c = await clar.ask(db, topic="t", source_ref="park", questions=_fields("سؤال"))
    c.attempts = clar.MAX_ATTEMPTS
    await db.commit()
    res = await clar.dispatch_pending(db)
    assert res["parked"] == 1
    assert (await db.get(Clarification, c.id)).status == "parked"   # هست، حذف نشده


@pytest.mark.asyncio
async def test_a_new_question_revives_a_parked_form(db):
    c = await clar.ask(db, topic="t", source_ref="revive", questions=_fields("سؤال یک"))
    c.status = "parked"
    c.attempts = clar.MAX_ATTEMPTS
    await db.commit()
    again = await clar.ask(
        db, topic="t", source_ref="revive",
        questions=[{"key": "f2", "label": "سؤال دو", "type": "short"}],
    )
    await db.commit()
    assert again.id == c.id
    assert again.status == "open"
    assert len(again.questions) == 2


# ── ثبت در بخش‌های واقعی + فیدبک ────────────────────────────────────────────

@pytest.mark.asyncio
async def test_answers_are_filed_into_the_inbox_by_default(db):
    from sqlalchemy import select

    from app.models.inbox_item import InboxItem

    c = await clar.ask(db, topic="یک چیزِ مبهم", source_ref="file",
                       questions=_fields("این چیست؟"))
    await clar.record_answers(db, c, {"f1": "قبضِ برق است"}, raw="…")
    filed = await clar.file_answers(db, c)
    await db.commit()
    assert filed and filed[0]["where"] == "inbox"
    items = (await db.execute(select(InboxItem))).scalars().all()
    assert any("قبضِ برق است" in (i.content or "") for i in items)
    assert c.status == "filed"


@pytest.mark.asyncio
async def test_choosing_the_right_card_writes_the_balance_as_an_owner_decision(db):
    """جوابِ مالک به «کدام کارت؟» باید موجودی را روی همان کارت بنشاند و مثل
    ورودِ دستیِ خودش معتبر باشد (owner_balance_at)، نه یک حدسِ خودکار."""
    import json

    from app.models.finance import FinancialAccount

    a = FinancialAccount(user_id=0, name="ملت — کارت اول", kind="bank",
                         institution="mellat", currency="IRR", balance=100)
    b = FinancialAccount(user_id=0, name="ملت — کارت دوم", kind="bank",
                         institution="mellat", currency="IRR", balance=200)
    db.add_all([a, b])
    await db.flush()

    c = await clar.ask(
        db, topic="این موجودی مالِ کدام کارت است؟", source="finance", source_ref="amb",
        target={"kind": "finance_account", "institution": "mellat",
                "balance": "5000000", "currency": "IRR"},
        questions=[{"key": "account_name", "label": "کدام کارت؟", "type": "choice",
                    "choices": ["ملت — کارت اول", "ملت — کارت دوم"]}],
    )
    await clar.record_answers(db, c, {"account_name": "ملت — کارت دوم"}, raw="دوم")
    filed = await clar.file_answers(db, c)
    await db.commit()

    assert filed[0]["where"] == "finance_account"
    assert float(b.balance) == 5_000_000.0
    assert float(a.balance) == 100.0          # کارتِ دیگر دست‌نخورده
    assert json.loads(b.extra or "{}").get("owner_balance_at")


@pytest.mark.asyncio
async def test_feedback_says_what_landed_where_and_what_is_still_open(db):
    c = await clar.ask(db, topic="موضوع", source_ref="fb",
                       questions=_fields("سؤال یک", "سؤال دو"))
    out = await clar.record_answers(db, c, {"f1": "جواب"}, raw="جواب")
    filed = await clar.file_answers(db, c)
    text = clar.feedback_text(c, out, filed)
    await db.commit()
    assert "۱" in text or "1 جواب ثبت شد" in text or "جواب ثبت شد" in text
    assert "بی‌جواب" in text                   # صادق: هنوز یکی باز است
    assert "🎉" not in text


@pytest.mark.asyncio
async def test_feedback_is_honest_when_nothing_was_understood(db):
    c = await clar.ask(db, topic="موضوع", source_ref="fb2", questions=_fields("سؤال"))
    out = await clar.record_answers(db, c, {}, raw="???")
    text = clar.feedback_text(c, out, [])
    await db.commit()
    assert "برداشت نکردم" in text


# ── رندرِ فرم ───────────────────────────────────────────────────────────────

def test_form_lists_only_unanswered_questions_and_shows_choices():
    class _Fake:
        topic = "موضوعِ آزمایشی"
        context = "متنِ زمینه"
        questions = [
            {"key": "a", "label": "جوابش را دادم", "type": "short", "answer": "بله"},
            {"key": "b", "label": "کدام است؟", "type": "choice",
             "choices": ["اول", "دوم"], "answer": None},
        ]

    text = clar.render_form(_Fake())
    assert "کدام است؟" in text
    assert "جوابش را دادم" not in text        # سؤالِ جواب‌داده دوباره پرسیده نمی‌شود
    assert "اول / دوم" in text
    assert "خالی" in text                     # اجازهٔ خالی‌گذاشتن صریح گفته شده


def test_reminder_form_says_it_is_a_reminder():
    class _Fake:
        topic = "t"
        context = None
        questions = [{"key": "a", "label": "س", "type": "short", "answer": None}]

    assert "یادآوری" in clar.render_form(_Fake(), reminder=True)


# ── API ─────────────────────────────────────────────────────────────────────

def test_api_lists_answers_and_files(api_client):
    made = api_client.post("/api/clarifications/ask", json={
        "topic": "این هزینه برای چه بود؟",
        "source_ref": "api-1",
        "questions": [{"key": "purpose", "label": "بابتِ چه؟", "type": "short"},
                      {"key": "who", "label": "برای چه کسی؟", "type": "short"}],
    }).json()
    assert made["created"] is True
    cid = made["item"]["id"]

    listed = api_client.get("/api/clarifications").json()
    assert any(i["id"] == cid for i in listed["items"])
    assert listed["open"] >= 1

    # جوابِ نصفه از داخلِ برنامه
    ans = api_client.post(f"/api/clarifications/{cid}/answer",
                          json={"answers": {"purpose": "تعمیر ماشین", "who": ""}}).json()
    assert ans["filled"] == 1
    assert ans["remaining"] == 1
    assert ans["item"]["status"] == "partial"
    assert "بی‌جواب" in ans["feedback"]


def test_api_skip_keeps_the_record(api_client):
    made = api_client.post("/api/clarifications/ask", json={
        "topic": "بی‌ربط", "source_ref": "api-2",
        "questions": [{"key": "x", "label": "س", "type": "short"}],
    }).json()
    cid = made["item"]["id"]
    assert api_client.post(f"/api/clarifications/{cid}/skip").json()["skipped"] is True
    # از فهرستِ پرسش‌های باز بیرون می‌رود، ولی رکورد هست
    listed = api_client.get("/api/clarifications").json()
    assert not any(i["id"] == cid for i in listed["items"])
    assert api_client.post(f"/api/clarifications/{cid}/skip").status_code == 200


def test_api_rejects_a_form_without_a_topic(api_client):
    r = api_client.post("/api/clarifications/ask", json={"topic": ""})
    assert r.status_code in (400, 422)
