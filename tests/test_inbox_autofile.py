"""«مگه هوش مصنوعی تشخیص نمیده؟» — می‌دهد؛ تا امروز جوابش دور ریخته می‌شد.

تا ۲۰۲۶-۰۸-۰۲ **هیچ مسیرِ ثبتِ خودکاری وجود نداشت**: `apply_classification`
فقط پیشنهاد را ذخیره می‌کرد و ردیف `pending` می‌ماند؛ تنها راهِ خروجش کلیکِ
مالک بود. یعنی هر سیگنالِ گوشی — هرقدر هم مدل مطمئن — یک سؤال روی میز فرمان
می‌شد. این تست‌ها همان حلقه را می‌بندند و مرزهایش را پین می‌کنند.
"""
import pytest
import pytest_asyncio

from app.services import inbox_service


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


def _fake_classify(kind: str, confidence, title="یک کار"):
    async def _inner(db_, content, *, user_id=0):
        return {
            "suggested_type": kind,
            "suggestion": {"type": kind, "title": title, "description": content,
                           "priority": "normal", "due_date": None, "list_name": None,
                           "category": None, "person_name": None, "section": None,
                           "reason": "تست", "confidence": confidence},
            "ai_model": "fake",
        }
    return _inner


async def _item(db, content="یادت باشد شیر بخری"):
    from app.models.inbox_item import InboxItem

    row = InboxItem(user_id=0, content=content, status="pending")
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row


def test_confidence_is_normalised_never_trusted_blindly():
    n = inbox_service._norm_confidence
    assert n(0.9) == 0.9
    assert n("۰٫۸".replace("۰", "0").replace("۸", "8")) == 0.8
    assert n(85) == 0.85          # درصد
    assert n(9) == 0.9            # مقیاسِ ۰ تا ۱۰
    assert n("چه می‌دانم") == 0.0  # ناخوانا = بپرس، نه حدس بزن
    assert n(None) == 0.0
    assert n(-3) == 0.0
    assert n(9999) == 0.0
    # جهتِ خطا: مبهم باید **زیرِ** آستانه بیفتد تا بپرسد، نه اینکه خودکار ثبت شود
    assert n("چرت") < inbox_service._autofile_threshold()


@pytest.mark.asyncio
async def test_a_confident_task_is_filed_without_asking(db, monkeypatch):
    monkeypatch.setattr(inbox_service, "classify_content", _fake_classify("task", 0.92))
    item = await _item(db)
    out = await inbox_service.apply_classification(db, item, user_id=0)
    assert out.status == "filed", "مدل مطمئن بود — نباید سؤال می‌شد"
    assert out.filed_entity_type and out.filed_entity_id
    assert (out.suggestion or {}).get("filed_by") == "ai"


@pytest.mark.asyncio
async def test_an_unsure_model_still_asks(db, monkeypatch):
    """آستانه واقعی است: شکِ مدل یعنی سؤال، نه حدسِ خودکار."""
    monkeypatch.setattr(inbox_service, "classify_content", _fake_classify("task", 0.4))
    item = await _item(db)
    out = await inbox_service.apply_classification(db, item, user_id=0)
    assert out.status == "pending"
    assert (out.suggestion or {}).get("filed_by") is None


@pytest.mark.asyncio
async def test_identity_and_money_are_never_filed_automatically(db, monkeypatch):
    """آدم/حساب/سند هویت و پول می‌سازند — اشتباهشان گران است، پس می‌پرسد."""
    for kind in ("person", "finance_account", "document", "transaction"):
        monkeypatch.setattr(inbox_service, "classify_content", _fake_classify(kind, 0.99))
        item = await _item(db, content=f"محتوای {kind}")
        out = await inbox_service.apply_classification(db, item, user_id=0)
        assert out.status == "pending", f"{kind} نباید خودکار ثبت شود"


@pytest.mark.asyncio
async def test_autofile_can_be_turned_off_per_call(db, monkeypatch):
    monkeypatch.setattr(inbox_service, "classify_content", _fake_classify("task", 0.99))
    item = await _item(db)
    out = await inbox_service.apply_classification(db, item, user_id=0, autofile=False)
    assert out.status == "pending"


@pytest.mark.asyncio
async def test_a_failure_while_filing_leaves_the_item_safe(db, monkeypatch):
    """ثبتِ خودکار هرگز نباید ورودی را از بین ببرد."""
    monkeypatch.setattr(inbox_service, "classify_content", _fake_classify("task", 0.99))

    async def _boom(*a, **kw):
        raise RuntimeError("filing exploded")

    monkeypatch.setattr(inbox_service, "file_item", _boom)
    item = await _item(db)
    out = await inbox_service.apply_classification(db, item, user_id=0)
    assert out.status == "pending", "باید منتظر بماند، نه اینکه گم شود"


def test_the_dashboard_can_read_the_live_destination_list(api_client):
    """میز فرمان ۷ گزینهٔ هاردکد داشت که از FILERS عقب افتاده بود."""
    r = api_client.get("/api/inbox/targets")
    assert r.status_code == 200, r.text
    body = r.json()
    keys = {t["key"] for t in body["targets"]}
    assert {"task", "todo", "note", "subscription"} <= keys, keys
    assert "lists" in body and "pages" in body


def test_an_ai_filed_item_can_be_taken_back(api_client, monkeypatch):
    """ثبتِ خودکار فقط وقتی مجاز است که برگشت‌پذیر باشد."""
    created = api_client.post("/api/inbox", json={"content": "شیر بخر"})
    assert created.status_code in (200, 201), created.text
    item_id = created.json()["item"]["id"]
    api_client.post(f"/api/inbox/{item_id}/file", json={"target_type": "task"})
    r = api_client.post(f"/api/inbox/{item_id}/unfile")
    assert r.status_code == 200, r.text
    assert r.json()["item"]["status"] == "pending"
