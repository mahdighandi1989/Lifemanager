"""مکان/الگو + پروفایلِ هویت (۲۰۲۶-۰۷-۳۱).

قیدهای مالک که اینجا میخ می‌شوند:
  * نقاطِ خام باید به «توقف» و «سفر» تبدیل شوند، با تشخیصِ اینکه با کدام گوشی.
  * خانه و محلِ کار خودشان کشف شوند (از الگویِ ساعت، نه از حدس).
  * **مسیری که الگویش آموخته شده دیگر پرسیده نشود** — فقط خلافِ الگو.
  * پروفایلِ هویت از داده‌های واقعی ساخته شود، دستی قابلِ ویرایش باشد، و
    ویرایشِ مالک را استخراجِ خودکار بازنویسی نکند.
"""
import datetime as dt

import pytest
import pytest_asyncio

from app.services import place_service as ps

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


def _pt(lat, lon, at, device="s24"):
    return {"lat": lat, "lon": lon, "at": at, "device": device}


# ── تبدیل نقطه به توقف ──────────────────────────────────────────────────────

def test_a_stay_needs_both_time_and_proximity():
    base = dt.datetime(2026, 7, 31, 8, 0, tzinfo=UTC)
    # ده نقطه در یک نقطه، طیِ ۹۰ دقیقه → یک توقف
    pts = [_pt(25.2048, 55.2708, base + dt.timedelta(minutes=10 * i)) for i in range(10)]
    stays = ps.segment_points(pts)
    assert len(stays) == 1
    assert stays[0]["minutes"] == pytest.approx(90, abs=1)
    assert stays[0]["device"] == "s24"


def test_a_quick_pass_through_is_not_a_stay():
    base = dt.datetime(2026, 7, 31, 8, 0, tzinfo=UTC)
    pts = [_pt(25.2048, 55.2708, base), _pt(25.2049, 55.2709, base + dt.timedelta(minutes=2))]
    assert ps.segment_points(pts) == []


def test_moving_far_away_closes_the_stay_and_opens_a_new_one():
    base = dt.datetime(2026, 7, 31, 8, 0, tzinfo=UTC)
    here = [_pt(25.2048, 55.2708, base + dt.timedelta(minutes=10 * i)) for i in range(4)]
    there = [_pt(25.3000, 55.3800, base + dt.timedelta(minutes=60 + 10 * i)) for i in range(4)]
    stays = ps.segment_points(here + there)
    assert len(stays) == 2
    assert ps.haversine_m(stays[0]["lat"], stays[0]["lon"],
                          stays[1]["lat"], stays[1]["lon"]) > 5000


def test_haversine_is_sane():
    # دو نقطه با ~۱ درجه اختلافِ عرض ≈ ۱۱۱ کیلومتر
    d = ps.haversine_m(25.0, 55.0, 26.0, 55.0)
    assert 110_000 < d < 112_000


# ── تشخیص خانه و محل کار ────────────────────────────────────────────────────

def test_night_hours_mean_home_and_work_hours_mean_work():
    night = {str(h): 120.0 for h in (22, 23, 0, 1, 2, 3)}
    assert ps.infer_kind(night, visit_count=5) == "home"
    work = {str(h): 120.0 for h in (9, 10, 11, 12, 13)}
    assert ps.infer_kind(work, visit_count=5) == "work"


def test_too_little_evidence_says_nothing_rather_than_guessing():
    """برچسبِ غلط بدتر از «نمی‌دانم» است — آن‌وقت پرسیده می‌شود."""
    assert ps.infer_kind({"22": 60.0}, visit_count=1) is None
    assert ps.infer_kind(None, visit_count=9) is None
    mixed = {"9": 60.0, "23": 60.0, "15": 60.0, "3": 60.0}
    assert ps.infer_kind(mixed, visit_count=5) is None


# ── الگوها: آموخته شد → دیگر نپرس ──────────────────────────────────────────

def test_pattern_key_buckets_similar_departure_times_together():
    """۷:۴۰ و ۸:۲۰ هر دو «رفتنِ صبحِ سرِ کار»اند و باید یک الگو باشند."""
    early = dt.datetime(2026, 7, 27, 7, 40, tzinfo=UTC)
    late = dt.datetime(2026, 7, 27, 8, 20, tzinfo=UTC)
    assert ps.pattern_key(1, 2, early) == ps.pattern_key(1, 2, late)
    evening = dt.datetime(2026, 7, 27, 18, 5, tzinfo=UTC)
    assert ps.pattern_key(1, 2, evening) != ps.pattern_key(1, 2, early)
    other_day = dt.datetime(2026, 7, 28, 7, 40, tzinfo=UTC)
    assert ps.pattern_key(1, 2, other_day) != ps.pattern_key(1, 2, early)


@pytest.mark.asyncio
async def test_a_repeated_route_is_learned_and_stops_being_an_anomaly(db):
    from app.models.place import RoutePattern, Trip

    key = ps.pattern_key(1, 2, dt.datetime(2026, 7, 27, 8, 0, tzinfo=UTC))
    for week in range(ps.LEARN_AFTER):
        start = dt.datetime(2026, 7, 6 + 7 * week, 8, 0, tzinfo=UTC)
        db.add(Trip(user_id=0, device="s24", from_place_id=1, to_place_id=2,
                    started_at=start, ended_at=start + dt.timedelta(minutes=35),
                    minutes=35, pattern_key=key))
    await db.commit()

    res = await ps.learn_patterns(db, 0)
    assert res["learned"] == 1
    from sqlalchemy import select

    row = (await db.execute(select(RoutePattern).where(RoutePattern.pattern_key == key))).scalars().first()
    assert row.learned is True and row.occurrences == ps.LEARN_AFTER
    trips = (await db.execute(select(Trip))).scalars().all()
    assert all(t.is_anomaly is False for t in trips)   # مسیرِ همیشگی = سکوت


@pytest.mark.asyncio
async def test_a_one_off_route_is_flagged_as_an_anomaly(db):
    from sqlalchemy import select

    from app.models.place import Trip

    known = ps.pattern_key(1, 2, dt.datetime(2026, 7, 27, 8, 0, tzinfo=UTC))
    for week in range(ps.LEARN_AFTER):
        start = dt.datetime(2026, 7, 6 + 7 * week, 8, 0, tzinfo=UTC)
        db.add(Trip(user_id=0, from_place_id=1, to_place_id=2, started_at=start,
                    minutes=30, pattern_key=known))
    odd_at = dt.datetime(2026, 7, 30, 23, 0, tzinfo=UTC)
    db.add(Trip(user_id=0, from_place_id=1, to_place_id=9, started_at=odd_at,
                minutes=50, pattern_key=ps.pattern_key(1, 9, odd_at)))
    await db.commit()

    await ps.learn_patterns(db, 0)
    trips = (await db.execute(select(Trip))).scalars().all()
    flagged = [t for t in trips if t.is_anomaly]
    assert len(flagged) == 1 and flagged[0].to_place_id == 9


@pytest.mark.asyncio
async def test_only_the_anomaly_gets_a_question(db):
    """قیدِ صریحِ مالک: برای مسیرِ کشف‌شده دیگر سؤال نشود."""
    from app.models.place import Trip

    known = ps.pattern_key(1, 2, dt.datetime(2026, 7, 27, 8, 0, tzinfo=UTC))
    for week in range(ps.LEARN_AFTER):
        start = dt.datetime(2026, 7, 6 + 7 * week, 8, 0, tzinfo=UTC)
        db.add(Trip(user_id=0, from_place_id=1, to_place_id=2, started_at=start,
                    minutes=30, pattern_key=known))
    odd_at = dt.datetime(2026, 7, 30, 23, 0, tzinfo=UTC)
    db.add(Trip(user_id=0, from_place_id=1, to_place_id=9, started_at=odd_at,
                minutes=50, pattern_key=ps.pattern_key(1, 9, odd_at)))
    await db.commit()
    await ps.learn_patterns(db, 0)

    res = await ps.ask_about_places(db, 0)
    assert len(res["asked"]) == 1
    assert res["asked"][0].startswith("trip:")


# ── ورودِ نقاط → مکان/بازدید/سفر، و ضدتکرار ────────────────────────────────

@pytest.mark.asyncio
async def test_ingest_builds_places_visits_and_trips_and_is_idempotent(db):
    from sqlalchemy import select

    from app.models.place import Place, Trip, Visit
    from app.models.user_location import UserLocation

    now = dt.datetime.now(UTC)
    base = now - dt.timedelta(hours=6)
    rows = []
    for i in range(5):        # خانه
        rows.append(UserLocation(user_id=0, latitude=25.2048, longitude=55.2708,
                                 device="s24", timestamp=base + dt.timedelta(minutes=10 * i)))
    for i in range(5):        # محل کار
        rows.append(UserLocation(user_id=0, latitude=25.3000, longitude=55.3800,
                                 device="s24", timestamp=base + dt.timedelta(minutes=90 + 10 * i)))
    db.add_all(rows)
    await db.commit()

    first = await ps.ingest_points(db, 0, since_hours=24)
    assert first["places"] == 2 and first["visits"] == 2 and first["trips"] == 1

    again = await ps.ingest_points(db, 0, since_hours=24)
    assert again["visits"] == 0 and again["trips"] == 0     # ضدتکرار
    assert len((await db.execute(select(Place))).scalars().all()) == 2
    assert len((await db.execute(select(Visit))).scalars().all()) == 2
    assert len((await db.execute(select(Trip))).scalars().all()) == 1


@pytest.mark.asyncio
async def test_the_device_that_moved_is_recorded(db):
    from sqlalchemy import select

    from app.models.place import Visit
    from app.models.user_location import UserLocation

    base = dt.datetime.now(UTC) - dt.timedelta(hours=3)
    for i in range(5):
        db.add(UserLocation(user_id=0, latitude=25.1, longitude=55.1,
                            device="tablet", timestamp=base + dt.timedelta(minutes=10 * i)))
    await db.commit()
    await ps.ingest_points(db, 0, since_hours=24)
    visits = (await db.execute(select(Visit))).scalars().all()
    assert visits and visits[0].device == "tablet"


@pytest.mark.asyncio
async def test_naming_a_place_locks_it_against_re_inference(db):
    from app.models.place import Place

    place = Place(user_id=0, latitude=25.2, longitude=55.2, radius_m=150,
                  visit_count=5, total_minutes=600,
                  hour_histogram={str(h): 100.0 for h in (9, 10, 11, 12)})
    db.add(place)
    await db.flush()

    filed = await ps.apply_place_answer(
        db, {"kind": "place", "place_id": place.id},
        {"label": "دفتر مرکزی", "kind": "محل کار"},
    )
    await db.commit()
    assert filed and filed[0]["where"] == "place"
    assert place.label == "دفتر مرکزی" and place.kind == "work"
    assert place.owner_locked is True


# ── پروفایلِ هویت ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_identity_is_derived_from_documents_and_computes_age(db):
    from app.models.identity_document import IdentityDocument
    from app.services import owner_identity_service as ident

    db.add(IdentityDocument(
        user_id=0, full_name="MOHAMMAD MEHDI GHANDI", profession="OFFICE CLERK",
        sponsor="BANK SADERAT IRAN", date_of_birth="08 Mar 1989", nationality="IRAN",
    ))
    await db.commit()

    await ident.refresh(db, 0)
    snapshot = await ident.get_identity(db, 0)
    by = {f["field"]: f for f in snapshot["fields"]}
    assert by["full_name"]["value"] == "MOHAMMAD MEHDI GHANDI"
    assert by["family_name"]["value"] == "GHANDI"
    assert by["occupation"]["value"] == "OFFICE CLERK"
    assert by["workplace"]["value"] == "BANK SADERAT IRAN"
    assert by["nationality"]["value"] == "IRAN"
    assert int(by["age"]["value"]) >= 36          # از تاریخ تولد حساب شد
    assert by["full_name"]["sources"]              # شواهد ذخیره شده


@pytest.mark.asyncio
async def test_the_owner_edit_wins_and_survives_a_refresh(db):
    from app.models.identity_document import IdentityDocument
    from app.services import owner_identity_service as ident

    db.add(IdentityDocument(user_id=0, full_name="MOHAMMAD MEHDI GHANDI"))
    await db.commit()
    await ident.refresh(db, 0)

    await ident.set_field(db, 0, "full_name", "محمدمهدی قندی")
    await ident.refresh(db, 0)                      # استخراجِ دوباره
    snapshot = await ident.get_identity(db, 0)
    row = next(f for f in snapshot["fields"] if f["field"] == "full_name")
    assert row["value"] == "محمدمهدی قندی"          # حرفِ مالک پاک نشد
    assert row["owner_locked"] is True


@pytest.mark.asyncio
async def test_birthplace_is_asked_not_guessed(db):
    """هیچ منبعِ قابل‌اعتمادی ندارد، پس حدس ممنوع و پرسش لازم است."""
    from app.services import owner_identity_service as ident

    await ident.refresh(db, 0)
    snapshot = await ident.get_identity(db, 0)
    birthplace = next(f for f in snapshot["fields"] if f["field"] == "birthplace")
    assert birthplace["value"] is None and birthplace["askable"] is True

    res = await ident.ask_missing(db, 0, limit=5)
    assert "birthplace" in res["asked"]
    # دوباره پرسیده نمی‌شود
    assert "birthplace" not in (await ident.ask_missing(db, 0, limit=5))["asked"]


@pytest.mark.asyncio
async def test_a_telegram_answer_lands_in_the_profile_and_locks_it(db):
    from app.services import owner_identity_service as ident

    filed = await ident.apply_clarification_answer(
        db, {"kind": "owner_identity", "field": "birthplace", "user_id": 0}, "تهران"
    )
    assert filed and filed[0]["where"] == "owner_identity"
    snapshot = await ident.get_identity(db, 0)
    row = next(f for f in snapshot["fields"] if f["field"] == "birthplace")
    assert row["value"] == "تهران" and row["owner_locked"] is True


@pytest.mark.asyncio
async def test_home_discovered_from_locations_becomes_the_residence(db):
    """اتصالِ واقعی: مکانِ کشف‌شده → فیلدِ «محل زندگی» در پروفایل."""
    from app.models.place import Place
    from app.services import owner_identity_service as ident

    db.add(Place(user_id=0, latitude=25.2, longitude=55.2, radius_m=150,
                 label="خانه", kind="home", visit_count=9, total_minutes=5000))
    await db.commit()
    await ident.refresh(db, 0)
    snapshot = await ident.get_identity(db, 0)
    row = next(f for f in snapshot["fields"] if f["field"] == "residence")
    assert row["value"] == "خانه"
    assert row["source"] == "location_pattern"


def test_identity_api_reads_edits_and_refreshes(api_client):
    listed = api_client.get("/api/identity-profile").json()
    assert listed["ok"] is True and listed["total"] == len(listed["fields"])

    res = api_client.put("/api/identity-profile/birthplace", json={"value": "تهران"})
    assert res.status_code == 200 and res.json()["owner_locked"] is True

    after = api_client.post("/api/identity-profile/refresh").json()
    row = next(f for f in after["fields"] if f["field"] == "birthplace")
    assert row["value"] == "تهران"          # refresh حرفِ مالک را پاک نکرد


def test_identity_api_rejects_an_unknown_field(api_client):
    assert api_client.put("/api/identity-profile/salary", json={"value": "x"}).status_code in (400, 422)
