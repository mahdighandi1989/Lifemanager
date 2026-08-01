"""اسکلتِ گردآورندهٔ «من که هستم» — قیدهای ساختاری‌اش.

این فایل رفتارِ خودِ رجیستری را می‌سنجد، نه محتوای هیچ منبعی. سه قید اینجا
پین می‌شوند، و هر سه از یک اشتباهِ واقعی آمده‌اند:

۱. `registered_providers()` باید **بارها** قابلِ فراخوانی باشد. نسخهٔ اول
   `providers` نام داشت، هم‌نامِ زیرپکیجِ کنارش؛ پایتون ماژول را روی همان نام
   می‌نشاند و فراخوانیِ دوم `TypeError` می‌داد. یعنی روت در **درخواستِ دوم**
   ۵۰۰ می‌گرفت — باگی که یک بار کار می‌کند و بعد می‌شکند، و تستِ یک‌باره
   هرگز نمی‌دیدش.
۲. یک منبعِ خراب نباید بقیه را زمین بزند.
۳. هر منبع باید درِ ورودی (`owns_page`) داشته باشد — همان قیدی که گردآورنده
   را از «جزیرهٔ تازه» جدا می‌کند.
"""
import pytest
import pytest_asyncio

import app.services.owner_insight as oi
from app.services.owner_insight.base import Facet, Provider


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


def test_the_registry_survives_being_called_more_than_once():
    """رگرسیونِ سایه‌افتادنِ نام: بار دوم و سوم هم باید کار کند."""
    first = oi.registered_providers()
    second = oi.registered_providers()
    third = oi.registered_providers()
    assert len(first) == len(second) == len(third) >= 1
    assert callable(oi.registered_providers)


def test_every_provider_declares_a_door_back_to_its_owning_page():
    """بدونِ این قید، صفحه دوباره جزیره می‌شود."""
    import pathlib
    import re

    meta = pathlib.Path("frontend/src/lib/routesMeta.js").read_text()
    known = set(re.findall(r"path:\s*'([^']+)'", meta))
    for p in oi.registered_providers():
        assert p.owns_page, f"{p.key} بدونِ owns_page ثبت شده"
        assert p.owns_page in known, f"{p.key} به مسیرِ ناشناختهٔ {p.owns_page} اشاره می‌کند"


@pytest.mark.asyncio
async def test_a_broken_provider_cannot_take_the_page_down(db, monkeypatch):
    async def _explode(_db, _uid):
        raise RuntimeError("این منبع خراب است")

    async def _fine(_db, _uid):
        return [Facet(key="ok", title="سالم", statement="این یکی کار می‌کند")]

    monkeypatch.setattr(
        oi, "_REGISTRY",
        {
            "boom": Provider(key="boom", label="خراب", owns_page="/x", collect=_explode),
            "fine": Provider(key="fine", label="سالم", owns_page="/y", collect=_fine),
        },
    )
    monkeypatch.setattr(oi, "_LOADED", True)
    out = await oi.collect(db, 0)
    assert [f["key"] for f in out["facets"]] == ["ok"]
    assert out["unavailable"] == ["boom"]
    # منبعِ خراب پنهان نمی‌شود — صادقانه علامت می‌خورد
    assert {s["key"]: s["ok"] for s in out["sources"]} == {"boom": False, "fine": True}


@pytest.mark.asyncio
async def test_an_empty_database_produces_no_invented_facts(db):
    """هیچ منبعی حق ندارد از دیتابیسِ خالی ادعایی بسازد.

    «نمی‌دانم» جوابِ درستی است؛ عددِ بی‌معنا — همان «شاخص پشتکار ۱۰/۱۰۰» زیرِ
    عنوانِ نقاط قوت — چیزی بود که مالک از آن شکایت کرد.
    """
    out = await oi.collect(db, 0)
    invented = [
        f for f in out["facets"]
        # منبعِ «وصل‌نشده‌ها» عمداً خالی‌بودن را هم گزارش می‌کند؛ بقیه نباید.
        if f["group"] != "unlinked"
    ]
    assert invented == [], f"از دیتابیسِ خالی ادعا ساخته شد: {invented}"


@pytest.mark.asyncio
async def test_the_route_returns_the_aggregate_and_keeps_the_old_contract(api_client):
    """روت باید هم قراردادِ قدیمی (`fields`) را نگه دارد و هم تصویرِ تازه را
    بدهد — و مهم‌تر: **دو بار پشتِ سرِ هم** جواب بدهد.

    باگِ سایه‌افتادنِ نام دقیقاً همین‌جا خودش را نشان می‌داد: درخواستِ اول
    درست بود و درخواستِ دوم ۵۰۰ می‌گرفت.
    """
    first = api_client.get("/api/identity-profile")
    second = api_client.get("/api/identity-profile")
    assert first.status_code == 200, first.text
    assert second.status_code == 200, second.text
    body = second.json()
    assert body["ok"] is True
    # قراردادِ قدیمی دست‌نخورده
    assert "fields" in body and "known" in body and "total" in body
    # و تصویرِ گردآوری‌شده
    assert "groups" in body and "sources" in body
    assert {s["key"] for s in body["sources"]} >= {"documents", "writings", "habits"}
    # هر منبع درِ ورودی دارد
    assert all(s["owns_page"] for s in body["sources"])
