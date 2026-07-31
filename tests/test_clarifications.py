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

def test_form_is_editable_stable_numbering_and_prefilled_answers():
    """فرم باید *قابلِ ویرایش* باشد: همهٔ فیلدها با شمارهٔ ثابت، جوابِ قبلی
    جلوی خطش. اگر فقط بی‌جواب‌ها شماره می‌خوردند، «۲)» در هر ارسال سؤالِ
    دیگری می‌شد و جواب روی فیلدِ اشتباه می‌نشست."""
    class _Fake:
        topic = "موضوعِ آزمایشی"
        context = "متنِ زمینه"
        questions = [
            {"key": "a", "label": "جوابش را دادم", "type": "short", "answer": "بله"},
            {"key": "b", "label": "کدام است؟", "type": "choice",
             "choices": ["اول", "دوم"], "answer": None},
        ]

    text = clar.render_form(_Fake())
    assert "1) جوابش را دادم: <b>بله</b>" in text   # جوابِ قبلی، قابل تغییر
    assert "2) کدام است؟" in text                   # شمارهٔ فیلدِ باز ثابت مانده
    assert "اول / دوم" in text
    assert "خالی" in text
    assert "به‌روز" in text                          # صریح گفته که ویرایش ممکن است
    assert "<b>موضوع:</b>" in text                   # قالبِ خودمان


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


# ── ویرایشِ جوابِ داده‌شده ──────────────────────────────────────────────────
# «آیا بعداً می‌شود جواب‌های داده‌شده را از داخل سیستم یا تلگرام ویرایش کرد؟»

@pytest.mark.asyncio
async def test_replying_again_edits_a_previous_answer(db):
    """از تلگرام: همان فرم را دوباره ریپلای کن و مقدار را عوض کن."""
    c = await clar.ask(db, topic="t", source_ref="ed1", questions=_fields("مبلغ؟", "بابتِ چه؟"))
    first = await clar.parse_reply(db, c, "1) ۱۰۰ هزار\n2) تاکسی")
    await clar.record_answers(db, c, first, raw="…")
    await db.commit()
    assert c.status == "answered"

    again = await clar.parse_reply(db, c, "1) ۲۵۰ هزار")
    out = await clar.record_answers(db, c, again, raw="۲۵۰")
    await db.commit()
    assert out["edited"] == 1
    assert out["filled"] == 0                      # فیلدِ تازه‌ای پر نشد
    assert c.questions[0]["answer"] == "۲۵۰ هزار"
    assert c.questions[1]["answer"] == "تاکسی"     # بقیه دست‌نخورده
    assert out["edits"]["f1"]["before"] == "۱۰۰ هزار"


@pytest.mark.asyncio
async def test_resending_the_same_value_is_not_counted_as_an_edit(db):
    """فرمِ پرشده را عیناً برگرداند → هیچ تغییری ثبت نمی‌شود (نویزِ الکی ممنوع)."""
    c = await clar.ask(db, topic="t", source_ref="ed2", questions=_fields("مبلغ؟"))
    await clar.record_answers(db, c, {"f1": "۱۰۰"}, raw="۱۰۰")
    out = await clar.record_answers(db, c, {"f1": "۱۰۰"}, raw="۱۰۰")
    await db.commit()
    assert out["edited"] == 0 and out["filled"] == 0


@pytest.mark.asyncio
async def test_edit_api_can_retract_an_answer_and_reopen_the_question(db):
    """از داخلِ برنامه: مقدارِ خالی یعنی «این جواب را پس گرفتم» → دوباره باز."""
    c = await clar.ask(db, topic="t", source_ref="ed3", questions=_fields("کِی؟", "کجا؟"))
    await clar.record_answers(db, c, {"f1": "دیروز", "f2": "تهران"}, raw="…")
    await db.commit()

    res = await clar.edit_answers(db, c.id, {"f1": ""})
    assert res["edited"] == 1
    assert res["remaining"] == 1
    assert c.questions[0]["answer"] is None
    assert c.status == "partial"
    assert c.attempts == 0                          # دوباره پرسیده خواهد شد


@pytest.mark.asyncio
async def test_an_edited_answer_is_re_filed_into_the_system(db):
    """ویرایش باید سیستم را هم به‌روز کند، وگرنه مقدارِ غلطِ قبلی جا می‌ماند."""
    import json

    from app.models.finance import FinancialAccount

    a = FinancialAccount(user_id=0, name="ملت — اول", kind="bank",
                         institution="mellat", currency="IRR", balance=1)
    b = FinancialAccount(user_id=0, name="ملت — دوم", kind="bank",
                         institution="mellat", currency="IRR", balance=2)
    db.add_all([a, b])
    await db.flush()

    c = await clar.ask(
        db, topic="کدام کارت؟", source="finance", source_ref="ed4",
        target={"kind": "finance_account", "institution": "mellat",
                "balance": "900000", "currency": "IRR"},
        questions=[{"key": "account_name", "label": "کدام کارت؟", "type": "choice",
                    "choices": ["ملت — اول", "ملت — دوم"]}],
    )
    await clar.record_answers(db, c, {"account_name": "ملت — اول"}, raw="اول")
    await clar.file_answers(db, c)
    await db.commit()
    assert float(a.balance) == 900_000.0

    # اشتباه بود — کارتِ دوم درست است
    await clar.edit_answers(db, c.id, {"account_name": "ملت — دوم"})
    assert float(b.balance) == 900_000.0
    assert json.loads(b.extra or "{}").get("owner_balance_at")


def test_edit_endpoint_updates_and_reports(api_client):
    made = api_client.post("/api/clarifications/ask", json={
        "topic": "این هزینه بابتِ چه بود؟", "source_ref": "api-edit",
        "questions": [{"key": "purpose", "label": "بابتِ چه؟", "type": "short"}],
    }).json()
    cid = made["item"]["id"]
    api_client.post(f"/api/clarifications/{cid}/answer",
                    json={"answers": {"purpose": "تعمیر ماشین"}})
    res = api_client.post(f"/api/clarifications/{cid}/edit",
                          json={"answers": {"purpose": "تعمیر موتور"}})
    assert res.status_code == 200
    body = res.json()
    assert body["edited"] == 1
    assert body["changed"]["purpose"]["before"] == "تعمیر ماشین"
    assert body["item"]["questions"][0]["answer"] == "تعمیر موتور"


@pytest.mark.asyncio
async def test_answers_actually_reach_the_database_not_just_memory():
    """دامِ ستونِ JSON: تغییرِ درجا در حافظه دیده می‌شود ولی UPDATE صادر
    نمی‌شود. این تست عمداً با **نشستِ تازه** می‌خواند تا آن حالت دوباره
    پنهان نشود (یک بار واقعاً اتفاق افتاد)."""
    from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

    from app.database import Base
    from app.models.clarification import Clarification

    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async with factory() as s1:
        c = await clar.ask(s1, topic="t", source_ref="persist",
                           questions=_fields("سؤال یک", "سؤال دو"))
        await s1.commit()
        cid = c.id
        await clar.record_answers(s1, c, {"f1": "جوابِ ماندگار"}, raw="…")
        await s1.commit()

    async with factory() as s2:                       # نشستِ کاملاً تازه
        row = await s2.get(Clarification, cid)
        assert row.questions[0]["answer"] == "جوابِ ماندگار"
        assert row.questions[1]["answer"] in (None, "")
        assert row.status == "partial"
        # و ویرایش هم باید در دیتابیس بنشیند
        await clar.edit_answers(s2, cid, {"f1": "جوابِ اصلاح‌شده"}, refile=False)

    async with factory() as s3:
        row = await s3.get(Clarification, cid)
        assert row.questions[0]["answer"] == "جوابِ اصلاح‌شده"
        assert any(h.get("via") == "edit" for h in (row.answers or []))
    await engine.dispose()


# ── اصلاحاتِ ممیزیِ ۲۰۲۶-۰۷-۳۱ ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_correcting_the_card_reverts_the_wrong_one(db):
    """اصلاحِ «کدام کارت؟» باید کارتِ اشتباه را هم برگرداند — وگرنه یک کارت
    موجودیِ ساختگی با مهرِ مالک نگه می‌دارد که هیچ سیگنالی هم اصلاحش نمی‌کند."""
    import json

    from app.models.finance import FinancialAccount

    a = FinancialAccount(user_id=0, name="ملت — اول", kind="bank",
                         institution="mellat", currency="IRR", balance=1)
    b = FinancialAccount(user_id=0, name="ملت — دوم", kind="bank",
                         institution="mellat", currency="IRR", balance=2)
    db.add_all([a, b])
    await db.flush()

    c = await clar.ask(
        db, topic="کدام کارت؟", source="finance", source_ref="revert",
        target={"kind": "finance_account", "institution": "mellat",
                "balance": "900000", "currency": "IRR"},
        questions=[{"key": "account_name", "label": "کدام؟", "type": "choice",
                    "choices": ["ملت — اول", "ملت — دوم"]}],
    )
    await clar.record_answers(db, c, {"account_name": "ملت — اول"}, raw="اول")
    await clar.file_answers(db, c)
    await db.commit()
    assert float(a.balance) == 900_000.0

    await clar.edit_answers(db, c.id, {"account_name": "ملت — دوم"})
    assert float(b.balance) == 900_000.0
    assert float(a.balance) == 1.0                                   # برگشت
    assert "owner_balance_at" not in json.loads(a.extra or "{}")     # مهر هم برداشته شد


@pytest.mark.asyncio
async def test_partial_replies_do_not_create_duplicate_inbox_items(db):
    """جوابِ نصفه طبیعی است، پس ثبت باید idempotent باشد — نه یک کپیِ ناقص
    به‌ازای هر جواب."""
    from sqlalchemy import select

    from app.models.inbox_item import InboxItem

    c = await clar.ask(db, topic="یک چیزِ مبهم", source_ref="idem",
                       questions=_fields("این چیست؟", "برای که؟"))
    await clar.record_answers(db, c, {"f1": "قبضِ برق"}, raw="…")
    await clar.file_answers(db, c)
    await clar.record_answers(db, c, {"f2": "برای خانه"}, raw="…")
    await clar.file_answers(db, c)
    await db.commit()

    items = (await db.execute(select(InboxItem))).scalars().all()
    assert len(items) == 1                       # یک آیتم، نه دو
    assert "برای خانه" in (items[0].content or "")   # و کامل‌ترین نسخه


@pytest.mark.asyncio
async def test_an_undelivered_form_does_not_burn_its_attempt_budget(db, monkeypatch):
    """اگر ارسال شکست بخورد، تلاش نباید شمرده شود — وگرنه فرمی که هرگز تحویل
    نشده بعد از ۵ بار «رهاشده» می‌شود و دیگر پرسیده نمی‌شود."""
    class _Bot:
        chat_id = "1"

        def is_configured(self):
            return True

        async def send(self, *a, **k):
            return {"ok": False, "error": "HTTP 400"}

    import app.services.telegram_service as ts
    monkeypatch.setattr(ts, "get_telegram_bot", lambda: _Bot())

    c = await clar.ask(db, topic="t", source_ref="undeliv", questions=_fields("س"))
    assert await clar.send_form(db, c) is False
    assert c.attempts == 0
    assert c.message_id is None


def test_a_bare_answer_containing_a_colon_is_kept_whole():
    """«ساعت ۹: قرار با دکتر» یک جوابِ کامل است، نه «عنوان: مقدار»."""
    assert clar._strip_prefix("ساعت ۹: قرار با دکتر", "کِی و کجا؟") == "ساعت ۹: قرار با دکتر"
    # ولی وقتی قبل از «:» واقعاً متنِ همان پرسش است، بریده می‌شود
    assert clar._strip_prefix("کِی بود: دیروز", "کِی بود؟") == "دیروز"


def test_owns_rejects_another_users_form():
    class _C:
        user_id = 7

    assert clar.owns(_C(), 7) is True
    assert clar.owns(_C(), 9) is False
    assert clar.owns(_C(), None) is True     # مسیرهای داخلی (تلگرام تک‌مالکی)


# ── بازسازیِ فرم پس از بازخوردِ مالک (۲۰۲۶-۰۷-۳۱) ────────────────────────────
# مالک تصویرِ فرمِ واقعی را فرستاد: موضوعش «Project_manager: Project_manager
# 📎 scan_bundle_<uuid>.pdf» بود، Markdown روی «_» شکسته بود، و پرسش‌ها از او
# می‌خواستند خودش دسته‌بندی کند.

def test_a_filename_topic_becomes_something_a_human_can_read():
    raw = ("Project_manager: Project_manager 📎 "
           "scan_bundle_c9e90b2b-4141-4012-b343-5a5f60b0268a_be398aa6.pdf")
    topic = clar.humanize_topic(raw)
    assert "c9e90b2b" not in topic and "5a5f60b0268a" not in topic   # شناسهٔ ماشینی
    assert "scan" not in topic.lower() and "bundle" not in topic.lower()
    assert topic.count("Project") == 1                              # تکرار حذف شد
    assert topic.startswith("PDF")                                  # نوعِ فایل گفته شد
    assert len(topic) < 60


@pytest.mark.parametrize("topic", [
    "پیامک بانک ملت — واریز ۲٬۵۰۰٬۰۰۰ ریال",
    "موجودیِ 1,000,000 IRR از «mellat» مالِ کدام کارت است؟",
    "واریز 1.500.000 ریال",
    "فاکتور شماره 1002345 شرکت آلفا",
    "تماس با 09121234567 درباره قرارداد",
    "گزارش مالی 1403.06 شرکت",
])
def test_humanize_never_touches_a_real_topic(topic):
    """متنِ آدمیزاد باید **عیناً** بماند. نسخهٔ اول ارقام را می‌خورد و
    «1,000,000» را «1 000» می‌کرد — یعنی مالک دربارهٔ مبلغی هزار برابر
    کوچک‌تر سؤال می‌شد (ممیزی ۲۰۲۶-۰۷-۳۱)."""
    assert clar.humanize_topic(topic) == topic


def test_the_form_is_html_and_escapes_hostile_content():
    """نامِ فایل پر از «_» است و Markdown را می‌شکست؛ HTML با escape امن است."""
    class _Fake:
        id = 1
        topic = "a_b_c <script>"
        context = "متن & نشانه <b>"
        questions = [{"key": "x", "label": "چه چیزی_مهم است؟", "type": "short", "answer": None}]

    text = clar.render_form(_Fake())
    assert "&lt;script&gt;" in text          # escape شده
    assert "<script>" not in text
    assert "&amp;" in text
    assert "<b>موضوع:</b>" in text           # قالبِ خودمان سالم مانده


def test_choice_questions_become_one_tap_buttons():
    class _Fake:
        id = 5
        topic = "t"
        context = ""
        questions = [
            {"key": "a", "label": "کدام کارت؟", "type": "choice",
             "choices": ["ملت", "ملی"], "answer": None},
            {"key": "b", "label": "توضیح بده", "type": "short", "answer": None},
        ]

    markup = clar._form_markup(_Fake())
    flat = [b for row in markup["inline_keyboard"] for b in row]
    picks = [b for b in flat if b["callback_data"].startswith("clar:pick:")]
    assert [b["text"] for b in picks] == ["ملت", "ملی"]      # فیلدِ متنی دکمه ندارد
    assert any(b["callback_data"] == "clar:ask:5" for b in flat)   # «سؤال دارم»
    assert any(b["callback_data"] == "clar:skip:5" for b in flat)


@pytest.mark.asyncio
async def test_one_tap_answer_records_and_files(db):
    c = await clar.ask(db, topic="t", source_ref="tap",
                       questions=[{"key": "a", "label": "کدام؟", "type": "choice",
                                   "choices": ["اول", "دوم"]}])
    out = await clar.answer_field(db, c, 0, "دوم")
    await db.commit()
    assert out["filled"] == 1
    assert c.questions[0]["answer"] == "دوم"
    assert c.status == "filed"


@pytest.mark.asyncio
async def test_asking_back_is_remembered_and_never_loses_the_questions(db):
    """خواستهٔ صریحِ مالک: چند دور پرسشِ متقابل، بدونِ گم‌شدنِ موضوع و سؤال‌ها."""
    c = await clar.ask(db, topic="موضوعِ اصلی", context="متنِ اصلی", source_ref="qa",
                       questions=_fields("پرسشِ یک", "پرسشِ دو"))
    await db.commit()

    a1 = await clar.discuss(db, c, "منظورت از پرسشِ یک چیست؟")
    a2 = await clar.discuss(db, c, "هنوز نفهمیدم، مثال بزن")
    await db.commit()

    assert a1 and a2
    roles = [t["role"] for t in c.discussion]
    assert roles == ["owner", "assistant", "owner", "assistant"]   # نخ حفظ شده
    assert c.discussion[0]["text"] == "منظورت از پرسشِ یک چیست؟"
    # و مهم‌تر: موضوع و پرسش‌های اصلی دست‌نخورده‌اند
    assert c.topic == "موضوعِ اصلی"
    assert [q["label"] for q in c.questions] == ["پرسشِ یک", "پرسشِ دو"]
    assert clar.to_dict(c)["open_count"] == 2
    # گفتگو یعنی مالک درگیر است → یادآوری از نو، نه «هنوز جواب نگرفتم»
    assert c.attempts == 0
    assert "پرسشِ یک" in clar.render_form(c)      # فرم هنوز کامل است


def test_discuss_endpoint_answers_and_keeps_the_form(api_client):
    made = api_client.post("/api/clarifications/ask", json={
        "topic": "این هزینه بابتِ چه بود؟", "source_ref": "api-qa",
        "questions": [{"key": "p", "label": "بابتِ چه؟", "type": "short"}],
    }).json()
    cid = made["item"]["id"]
    res = api_client.post(f"/api/clarifications/{cid}/discuss",
                          json={"question": "منظورت کدام هزینه است؟"})
    assert res.status_code == 200
    body = res.json()
    assert body["answer"]
    assert len(body["discussion"]) == 2
    assert body["item"]["open_count"] == 1        # پرسشِ اصلی هنوز باز است


# ── اصلاحاتِ ممیزیِ دومِ ۲۰۲۶-۰۷-۳۱ ─────────────────────────────────────────

@pytest.mark.asyncio
async def test_correcting_twice_still_restores_the_original_balance(db):
    """اگر یک کارت دو بار ثبت شده باشد، بازگردانی باید **قدیمی‌ترین** عکس را
    برگرداند — وگرنه عددِ ساختگی به‌عنوان «مقدار قبلی» می‌ماند."""
    import json

    from app.models.finance import FinancialAccount

    a = FinancialAccount(user_id=0, name="ملت — اول", kind="bank",
                         institution="mellat", currency="IRR", balance=1)
    b = FinancialAccount(user_id=0, name="ملت — دوم", kind="bank",
                         institution="mellat", currency="IRR", balance=2)
    db.add_all([a, b])
    await db.flush()

    c = await clar.ask(
        db, topic="کدام کارت؟", source="finance", source_ref="twice",
        target={"kind": "finance_account", "field": "account_name",
                "institution": "mellat", "balance": "900000", "currency": "IRR"},
        questions=[{"key": "account_name", "label": "کدام؟", "type": "choice",
                    "choices": ["ملت — اول", "ملت — دوم"]}],
    )
    await clar.record_answers(db, c, {"account_name": "ملت — اول"}, raw="اول")
    await clar.file_answers(db, c)
    await clar.edit_answers(db, c.id, {"account_name": "اول"})      # تطبیقِ نرم، همان کارت
    await clar.edit_answers(db, c.id, {"account_name": "ملت — دوم"})
    await db.commit()

    assert float(b.balance) == 900_000.0
    assert float(a.balance) == 1.0                                  # عددِ اصلی
    assert "owner_balance_at" not in json.loads(a.extra or "{}")


@pytest.mark.asyncio
async def test_the_account_is_taken_from_the_account_question_not_the_first_one(db):
    """فیلدی که زودتر جواب می‌گیرد نباید انتخابِ حساب را برُباید."""
    from app.models.finance import FinancialAccount

    acc = FinancialAccount(user_id=0, name="ملت — دوم", kind="bank",
                           institution="mellat", currency="IRR", balance=5)
    db.add(acc)
    await db.flush()

    c = await clar.ask(
        db, topic="t", source="finance", source_ref="fieldpick",
        target={"kind": "finance_account", "field": "account_name",
                "institution": "mellat", "balance": "700000", "currency": "IRR"},
        questions=[
            {"key": "note", "label": "توضیح؟", "type": "short"},
            {"key": "account_name", "label": "کدام کارت؟", "type": "choice",
             "choices": ["ملت — دوم"]},
        ],
    )
    await clar.record_answers(db, c, {"note": "بابت اجاره"}, raw="…")
    await clar.record_answers(db, c, {"account_name": "ملت — دوم"}, raw="…")
    await clar.file_answers(db, c)
    await db.commit()
    assert float(acc.balance) == 700_000.0      # نه اینکه «بابت اجاره» را حساب بگیرد


def test_a_huge_form_still_fits_telegram_and_keeps_its_footer():
    class _Fake:
        id = 1
        topic = "موضوع " * 20
        context = "متنِ زمینه " * 60
        questions = [
            {"key": f"k{i}", "label": "پرسشِ خیلی طولانی " * 15, "type": "short",
             "why": "دلیلِ خیلی طولانی " * 15, "answer": None}
            for i in range(8)
        ]

    text = clar.render_form(_Fake())
    assert len(text) <= 3600
    assert "❓ سؤال دارم" in text                # راهنما هرگز قربانی نمی‌شود
    assert text.count("<b>") == text.count("</b>")   # هیچ تگی نصفه بریده نشده
