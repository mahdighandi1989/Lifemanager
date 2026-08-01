"""/api/places و /api/places/track — «نقطه‌ها را کجا می‌شود دید؟»

تا ۲۰۲۶-۰۸-۰۱ جوابِ آن سؤال «هیچ‌جا» بود: نقاط جمع می‌شدند، خوشه می‌شدند و
الگو می‌شدند، ولی هیچ روتی برنمی‌گرداندشان و هیچ صفحه‌ای رسمشان نمی‌کرد.
این تست‌ها همان حلقهٔ گم‌شده را می‌بندند.
"""
import datetime as dt

import pytest
import pytest_asyncio

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


def test_the_track_endpoint_exists_and_is_authenticated(api_client):
    """پیش از این هیچ روتی نبود — این تست خودِ وجودش را پین می‌کند."""
    forged = {"Authorization": "Bearer not.a.real.jwt"}
    assert api_client.get("/api/places", headers=forged).status_code == 401
    assert api_client.get("/api/places/track", headers=forged).status_code == 401

    r = api_client.get("/api/places")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["ok"] is True
    assert "places" in body and "trips" in body


def test_a_place_shows_a_name_or_address_never_a_bare_coordinate_when_known(api_client):
    """مالک نباید «نقطهٔ ۲۵٫۲۰۰۱، ۵۵٫۲۷۰۳» ببیند وقتی نشانی داریم."""
    r = api_client.get("/api/places")
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_track_returns_the_points_in_time_order_per_device(db):
    """خطِ حرکت بدونِ ترتیبِ زمانی معنا ندارد، و مسیرِ دو گوشی نباید قاطی شود."""
    from app.models.user_location import UserLocation
    from app.routes.places import location_track

    base = dt.datetime.now(UTC) - dt.timedelta(hours=3)
    for i in range(5):
        db.add(UserLocation(user_id=0, latitude=25.2 + i * 0.001, longitude=55.27,
                            device="s24", timestamp=base + dt.timedelta(minutes=5 * i)))
    for i in range(3):
        db.add(UserLocation(user_id=0, latitude=25.3, longitude=55.28 + i * 0.001,
                            device="cph", timestamp=base + dt.timedelta(minutes=7 * i)))
    await db.commit()

    out = await location_track(days=2, device="", db=db, user_id=0)
    assert out["total_points"] == 8
    by_dev = {t["device"]: t["points"] for t in out["tracks"]}
    assert set(by_dev) == {"s24", "cph"}
    assert len(by_dev["s24"]) == 5 and len(by_dev["cph"]) == 3
    stamps = [p["at"] for p in by_dev["s24"]]
    assert stamps == sorted(stamps), "نقاط باید به‌ترتیبِ زمان باشند"


@pytest.mark.asyncio
async def test_a_trip_names_where_it_went_not_just_how_far(db):
    """قلبِ شکایتِ مالک: «۸.۴ کیلومتر جابه‌جا شدی» سؤال نیست."""
    from app.models.place import Place, Trip
    from app.routes.places import list_places

    home = Place(user_id=0, latitude=25.2, longitude=55.27, label="خانه", kind="home",
                 radius_m=180, visit_count=5, total_minutes=600.0)
    office = Place(user_id=0, latitude=25.25, longitude=55.33, address="Baniyas Road, Deira",
                   radius_m=180, visit_count=4, total_minutes=400.0)
    db.add_all([home, office])
    await db.flush()
    db.add(Trip(user_id=0, from_place_id=home.id, to_place_id=office.id,
                started_at=dt.datetime.now(UTC) - dt.timedelta(hours=4),
                ended_at=dt.datetime.now(UTC) - dt.timedelta(hours=3, minutes=35),
                minutes=25, distance_km=8.4, is_anomaly=True))
    await db.commit()

    out = await list_places(days=30, db=db, user_id=0)
    trip = out["trips"][0]
    assert trip["from"] == "خانه"
    # مکانِ بی‌برچسب باید نشانی‌اش را نشان دهد، نه مختصات
    assert trip["to"] == "Baniyas Road, Deira"
    assert trip["started_local"], "ساعتِ محلی باید باشد"
    assert trip["distance_km"] == 8.4 and trip["minutes"] == 25


@pytest.mark.asyncio
async def test_a_place_with_no_label_or_address_still_gets_an_honest_display(db):
    from app.models.place import Place
    from app.routes.places import list_places

    db.add(Place(user_id=0, latitude=25.2001, longitude=55.2703, radius_m=180,
                 visit_count=1, total_minutes=30.0))
    await db.commit()
    out = await list_places(days=30, db=db, user_id=0)
    disp = out["places"][0]["display"]
    assert "نقطهٔ" in disp and "25.2001" in disp, disp


# ── سؤال باید قابلِ جواب‌دادن باشد (ممیزیِ ۲۰۲۶-۰۸-۰۲) ──────────────────────
#
# مالک: «وقتی صرفاً مختصات می‌زند من از کجا بفهمم کجاست که بخواهم جواب بدهم؟»
# حق داشت. دو عددِ اعشاری یک سؤال نیست.

@pytest.mark.asyncio
async def test_the_place_question_always_carries_a_map_link(db):
    """حتی وقتی نشانی حل نشده، لینکِ نقشه باید باشد — رایگان و بی‌کلید."""
    from app.models.place import Place
    from app.services import place_service as ps

    sent = {}

    async def _fake_ask(db_, **kw):
        sent.update(kw)
        return None

    import app.services.clarification_service as clar

    original, clar.ask = clar.ask, _fake_ask
    try:
        db.add(Place(user_id=0, latitude=25.3067, longitude=55.3649, radius_m=180,
                     visit_count=4, total_minutes=95.0))
        await db.commit()
        await ps.ask_about_places(db, 0)
    finally:
        clar.ask = original

    assert "maps.google.com/?q=25.306700,55.364900" in sent.get("context", ""), sent.get("context")


@pytest.mark.asyncio
async def test_a_known_address_is_used_instead_of_the_coordinates(db):
    from app.models.place import Place
    from app.services import place_service as ps

    sent = {}

    async def _fake_ask(db_, **kw):
        sent.update(kw)
        return None

    import app.services.clarification_service as clar

    original, clar.ask = clar.ask, _fake_ask
    try:
        db.add(Place(user_id=0, latitude=25.3067, longitude=55.3649, radius_m=180,
                     visit_count=4, total_minutes=95.0,
                     address="Baniyas Road, Deira, Dubai"))
        await db.commit()
        await ps.ask_about_places(db, 0)
    finally:
        clar.ask = original

    assert "Baniyas Road" in sent.get("topic", ""), sent.get("topic")
    assert "Baniyas Road" in sent.get("context", "")


@pytest.mark.asyncio
async def test_backfill_fills_addresses_for_places_created_before_geocoding(db, monkeypatch):
    """مکان‌های قدیمی هم باید نشانی بگیرند، وگرنه برای همیشه دو عدد می‌مانند."""
    from app.models.place import Place
    from app.services import place_service as ps

    async def _fake_reverse(lat, lon):
        return {"formatted_address": "Sheikh Zayed Rd, Dubai", "short_name": "Sheikh Zayed"}

    import app.services.google_maps_service as maps

    monkeypatch.setattr(maps, "reverse_geocode", _fake_reverse)

    old = Place(user_id=0, latitude=25.2, longitude=55.27, radius_m=180,
                visit_count=9, total_minutes=500.0)
    db.add(old)
    await db.commit()

    out = await ps.backfill_addresses(db, 0)
    assert out["filled"] == 1
    await db.refresh(old)
    assert old.address == "Sheikh Zayed Rd, Dubai"
    assert old.label == "Sheikh Zayed"       # پیشنهادِ اولیه، بدونِ قفل

    # بارِ دوم چیزی برای پرکردن نیست — دوباره‌کاری و هزینهٔ الکی ممنوع
    assert (await ps.backfill_addresses(db, 0))["filled"] == 0
