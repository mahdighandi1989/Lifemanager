"""از نقاطِ خامِ GPS تا «خانه، محلِ کار، و الگوهای رفت‌وآمد».

خواستهٔ مالک (۲۰۲۶-۰۷-۳۱) و قیدهایش:

* لحظه‌به‌لحظه ثبت شود، با تشخیصِ **کدام گوشی** جابه‌جا شده.
* خانه و محلِ کار خودش کشف شوند (و در پروفایلِ هویت بنشینند).
* «فلان‌جا چه کردی؟» پرسیده شود — ولی **فقط یک بار** برای هر مکان.
* الگوهای رفت‌وآمد کشف شوند و **برای مسیرِ آموخته‌شده دیگر سؤال نشود، مگر
  خلافِ الگو**. این مهم‌ترین قید است و کلِ طراحیِ زیر حولِ آن است.

روشِ کار — عمداً بدونِ وابستگیِ تازه (نه numpy، نه scikit، نه pgvector):

1. نقاطِ خام (`user_locations`) به‌ترتیبِ زمان خوانده می‌شوند.
2. «توقف» = چند نقطهٔ پشت‌سرهم در شعاعِ کوچک و بیشتر از حدِ زمانی →
   یک `Visit`. حرکت بینِ دو توقف → یک `Trip`.
3. توقف‌ها به نزدیک‌ترین `Place` می‌چسبند (فاصلهٔ هاورساین)، وگرنه مکانِ
   تازه ساخته می‌شود.
4. نوعِ مکان از **هیستوگرامِ ساعت** حدس زده می‌شود: شب‌ها → خانه،
   ساعاتِ کاریِ روزهای هفته → محلِ کار. حدس فقط وقتی شواهد کافی است.
5. هر سفر یک `pattern_key` می‌سازد؛ وقتی تکرارش به حدِ نصاب رسید، الگو
   **آموخته** می‌شود. از آن به بعد سفرِ منطبق سکوت است و فقط سفرِ
   نامنطبق «خلافِ الگو» علامت می‌خورد.
"""
from __future__ import annotations

import logging
import math
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

# چقدر نزدیک = «همان مکان»
PLACE_RADIUS_M = 180.0
# کمترین ماندن تا یک «توقف» حساب شود (دقیقه)
MIN_STAY_MINUTES = 8.0
# فاصلهٔ زمانیِ بیشتر از این بینِ دو نقطه، رشته را می‌شکند (دقیقه)
MAX_GAP_MINUTES = 45.0
# چند بار تکرار تا یک مسیر «آموخته» شود و دیگر پرسیده نشود
LEARN_AFTER = 3
# سقفِ پرسش‌ها، تا کشفِ اولیه سیل نسازد
MAX_PLACE_QUESTIONS = 2


def _scope(col, uid: int):
    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """فاصلهٔ دو نقطه بر حسب متر. بدونِ کتابخانهٔ بیرونی."""
    r = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(min(1.0, math.sqrt(a)))


def _aware(value):
    if value is None:
        return None
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


# ── مرحلهٔ ۱: نقاطِ خام → توقف‌ها و حرکت‌ها ─────────────────────────────────

def segment_points(points: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """رشتهٔ نقاط → فهرستِ توقف‌ها. تابعِ خالص، تا بشود مستقیم تستش کرد.

    هر نقطه: {lat, lon, at (datetime), device}
    خروجی: [{lat, lon, start, end, minutes, device, points}]
    """
    stays: List[Dict[str, Any]] = []
    current: List[Dict[str, Any]] = []

    def _flush():
        if len(current) < 2:
            current.clear()
            return
        start, end = current[0]["at"], current[-1]["at"]
        minutes = (end - start).total_seconds() / 60.0
        if minutes < MIN_STAY_MINUTES:
            current.clear()
            return
        stays.append({
            "lat": sum(p["lat"] for p in current) / len(current),
            "lon": sum(p["lon"] for p in current) / len(current),
            "start": start, "end": end, "minutes": minutes,
            "device": current[-1].get("device"),
            "points": len(current),
        })
        current.clear()

    for p in points:
        if not current:
            current.append(p)
            continue
        gap = (p["at"] - current[-1]["at"]).total_seconds() / 60.0
        anchor = current[0]
        far = haversine_m(anchor["lat"], anchor["lon"], p["lat"], p["lon"]) > PLACE_RADIUS_M
        if gap > MAX_GAP_MINUTES or far:
            _flush()
            current.append(p)
            continue
        current.append(p)
    _flush()
    return stays


# ── مرحلهٔ ۲: توقف → مکان ──────────────────────────────────────────────────

async def _nearest_place(db: AsyncSession, uid: int, lat: float, lon: float):
    from app.models.place import Place

    rows = (
        await db.execute(select(Place).where(_scope(Place.user_id, uid)))
    ).scalars().all()
    best, best_d = None, None
    for row in rows:
        d = haversine_m(lat, lon, row.latitude, row.longitude)
        if d <= max(row.radius_m or PLACE_RADIUS_M, PLACE_RADIUS_M) and (best_d is None or d < best_d):
            best, best_d = row, d
    return best


# ساعتِ محلیِ مالک، نه UTC. همان پیش‌فرضِ موتورِ توجه و فرمان‌ها (امارات، +۴).
# چرا مهم است: هیستوگرام با ساعتِ UTC پر می‌شد ولی `infer_kind` آن را با
# ساعت‌های «شب» و «اداری»ِ **محلی** می‌سنجید. با اختلافِ ۴ ساعت، خوابِ شب
# (۲۳ محلی = ۱۹ UTC) در سطلِ اداری می‌افتاد و خانه به‌جای خانه، «محل کار»
# برچسب می‌خورد — یعنی هم پروفایل غلط می‌شد و هم سؤالِ «اینجا کجاست؟»
# پرسیده نمی‌شد. (ممیزیِ ۲۰۲۶-۰۸-۰۱)
TZ_OFFSET_MINUTES = 240


def _local_hour(moment: datetime) -> int:
    return (_aware(moment) + timedelta(minutes=TZ_OFFSET_MINUTES)).hour


def _bump_histogram(
    hist: Optional[Dict[str, Any]], start: datetime, minutes: float
) -> Dict[str, float]:
    out = {str(h): 0.0 for h in range(24)}
    for k, v in (hist or {}).items():
        try:
            out[str(int(k))] = float(v)
        except Exception:
            continue
    hour = _local_hour(start)
    out[str(hour)] = out.get(str(hour), 0.0) + float(minutes or 0)
    return out


_NIGHT_HOURS = {22, 23, 0, 1, 2, 3, 4, 5, 6}
_WORK_HOURS = {9, 10, 11, 12, 13, 14, 15, 16, 17}


def infer_kind(hist: Optional[Dict[str, Any]], visit_count: int) -> Optional[str]:
    """خانه یا محلِ کار؟ از الگویِ ساعتِ حضور — نه از حدس.

    حدس فقط وقتی زده می‌شود که شواهد کافی باشد؛ وگرنه None برمی‌گردد و
    سؤال می‌شود. «نمی‌دانم» بهتر از برچسبِ غلط است."""
    if visit_count < 3 or not hist:
        return None
    night = sum(float(v) for k, v in hist.items() if int(k) in _NIGHT_HOURS)
    work = sum(float(v) for k, v in hist.items() if int(k) in _WORK_HOURS)
    total = sum(float(v) for v in hist.values()) or 1.0
    # برنده باید هم سهمِ کافی داشته باشد و هم **آشکارا** جلوتر باشد. تساوی
    # یعنی مبهم، و مبهم باید پرسیده شود نه اینکه به اولین شرط بیفتد.
    if night / total >= 0.5 and night > work * 1.25:
        return "home"
    if work / total >= 0.5 and work > night * 1.25:
        return "work"
    return None


async def _resolve_address(place) -> None:
    """نشانیِ خواندنی را روی مکان بنشان. هرگز استثنا نمی‌دهد.

    ستونِ ``places.address`` از ابتدا وجود داشت و هیچ‌وقت پر نمی‌شد؛ نتیجه‌اش
    این بود که مالک در هر گزارشی «نقطهٔ ۲۵٫۲۰۰۱، ۵۵٫۲۷۰۳» می‌دید.
    """
    if place is None or place.address:
        return
    try:
        from app.services.google_maps_service import reverse_geocode

        hit = await reverse_geocode(place.latitude, place.longitude)
        if hit and hit.get("formatted_address"):
            place.address = str(hit["formatted_address"])[:400]
            # نامِ کوتاه فقط پیشنهادِ اولیه است — تا مالک خودش اسمی نگذاشته،
            # بهتر از مختصات است؛ و چون owner_locked نمی‌شود، حرفِ او بعداً
            # جایگزینش می‌کند.
            if not place.label and hit.get("short_name"):
                place.label = str(hit["short_name"])[:160]
    except Exception as exc:
        logger.debug("address lookup skipped for place %s: %r", getattr(place, "id", None), exc)


async def ingest_points(db: AsyncSession, uid: int = 0, *, since_hours: int = 48) -> Dict[str, Any]:
    """نقاطِ خامِ اخیر را به مکان/بازدید/سفر تبدیل کن. idempotent است:
    بازدیدی که بازه‌اش قبلاً ثبت شده دوباره ساخته نمی‌شود."""
    from app.models.place import Place, Trip, Visit
    from app.models.user_location import UserLocation

    now = datetime.now(timezone.utc)
    rows = (
        await db.execute(
            select(UserLocation)
            .where(_scope(UserLocation.user_id, uid),
                   UserLocation.timestamp >= now - timedelta(hours=max(1, int(since_hours))))
            .order_by(UserLocation.timestamp.asc())
            .limit(5000)
        )
    ).scalars().all()
    points = [
        {"lat": r.latitude, "lon": r.longitude, "at": _aware(r.timestamp),
         "device": getattr(r, "device", None)}
        for r in rows if r.latitude is not None and r.longitude is not None and r.timestamp
    ]
    stays = segment_points(points)
    if not stays:
        return {"points": len(points), "stays": 0, "places": 0, "visits": 0, "trips": 0}

    made_places = made_visits = made_trips = 0
    previous: Optional[Tuple[Any, Dict[str, Any]]] = None

    for stay in stays:
        place = await _nearest_place(db, uid, stay["lat"], stay["lon"])
        if place is None:
            place = Place(
                user_id=uid, latitude=stay["lat"], longitude=stay["lon"],
                radius_m=PLACE_RADIUS_M, visit_count=0, total_minutes=0.0,
                first_seen_at=stay["start"],
            )
            db.add(place)
            await db.flush()
            made_places += 1
            # نشانی را **یک بار برای هر مکان** حل کن، نه برای هر نقطه.
            # یک شبِ خواب صدها نقطه دارد ولی یک مکان است، پس این یعنی چند
            # فراخوانی در کل — نه هزاران. بدونِ کلیدِ نقشه بی‌سروصدا None
            # می‌ماند و مختصات نمایش داده می‌شود.
            await _resolve_address(place)

        # ضدتکرار بر اساسِ **هم‌پوشانی**، نه برابریِ دقیقِ لحظهٔ ورود.
        #
        # چرا (ممیزیِ ۲۰۲۶-۰۸-۰۱): پنجرهٔ ورودی غلتان است (پیش‌فرض ۴۸ ساعت) و
        # کارِ دوره‌ای هر ساعت اجرا می‌شود. وقتی لبهٔ پنجره از **وسطِ** یک
        # اقامتِ طولانی رد می‌شود، اولین نقطهٔ باقی‌مانده هر بار عوض می‌شود، پس
        # `arrived_at` هرگز برابر نمی‌شد و یک شبِ خوابِ ۹ ساعته هر ساعت یک
        # بازدیدِ تازه می‌ساخت: ۹ ردیف، `visit_count=9` و `total_minutes` تقریباً
        # ۵ برابرِ واقعیت. و در جهتِ عکس، اقامتی که هنوز **ادامه دارد** چون
        # `arrived_at`ش عوض نمی‌شد هرگز به‌روز نمی‌شد و روی دقیقه‌های اجرای اول
        # یخ می‌زد.
        #
        # حالا هر بازدیدی که بازه‌اش با این اقامت هم‌پوشانی دارد، **همان** بازدید
        # است: کِش می‌آید و فقط تفاضلِ دقیقه‌ها به مجموع اضافه می‌شود.
        # `visit_count` فقط برای بازدیدِ واقعاً تازه بالا می‌رود.
        existing = (
            await db.execute(
                select(Visit).where(
                    Visit.place_id == place.id,
                    Visit.arrived_at <= stay["end"],
                    Visit.left_at >= stay["start"],
                ).order_by(Visit.arrived_at.asc()).limit(1)
            )
        ).scalar_one_or_none()

        if existing is not None:
            before = float(existing.minutes or 0)
            existing.arrived_at = min(_aware(existing.arrived_at), _aware(stay["start"]))
            existing.left_at = max(_aware(existing.left_at), _aware(stay["end"]))
            existing.minutes = round(
                (_aware(existing.left_at) - _aware(existing.arrived_at)).total_seconds() / 60.0, 2
            )
            delta = float(existing.minutes) - before
            if delta > 0:
                place.total_minutes = float(place.total_minutes or 0) + delta
                place.hour_histogram = _bump_histogram(
                    place.hour_histogram, existing.arrived_at, delta
                )
            place.last_seen_at = max(_aware(place.last_seen_at or existing.left_at),
                                     _aware(existing.left_at))
        else:
            db.add(Visit(
                user_id=uid, place_id=place.id, device=stay.get("device"),
                arrived_at=stay["start"], left_at=stay["end"], minutes=stay["minutes"],
            ))
            made_visits += 1
            place.visit_count = int(place.visit_count or 0) + 1
            place.total_minutes = float(place.total_minutes or 0) + stay["minutes"]
            place.hour_histogram = _bump_histogram(place.hour_histogram, stay["start"], stay["minutes"])
            place.last_seen_at = stay["end"]

        if not place.owner_locked:
            guessed = infer_kind(place.hour_histogram, place.visit_count)
            if guessed:
                place.kind = guessed
                if not place.label:
                    place.label = "خانه" if guessed == "home" else "محل کار"

        if previous is not None:
            prev_place, prev_stay = previous
            if prev_place.id != place.id:
                started, ended = prev_stay["end"], stay["start"]
                key = pattern_key(prev_place.id, place.id, started)
                exists = (
                    await db.execute(
                        select(Trip.id).where(
                            Trip.from_place_id == prev_place.id,
                            Trip.to_place_id == place.id,
                            Trip.started_at == started,
                        ).limit(1)
                    )
                ).first()
                if exists is None:
                    db.add(Trip(
                        user_id=uid, device=stay.get("device"),
                        from_place_id=prev_place.id, to_place_id=place.id,
                        started_at=started, ended_at=ended,
                        minutes=(ended - started).total_seconds() / 60.0,
                        distance_km=haversine_m(prev_place.latitude, prev_place.longitude,
                                                place.latitude, place.longitude) / 1000.0,
                        pattern_key=key,
                    ))
                    made_trips += 1
        previous = (place, stay)

    await db.commit()
    return {"points": len(points), "stays": len(stays), "places": made_places,
            "visits": made_visits, "trips": made_trips}


# ── مرحلهٔ ۳: الگوها — «آموخته شد، دیگر نپرس» ───────────────────────────────

def pattern_key(from_id: int, to_id: int, when: datetime) -> str:
    """امضای یک سفر: مبدأ→مقصد، روزِ هفته، و بازهٔ سه‌ساعته.

    بازهٔ سه‌ساعته (نه ساعتِ دقیق) عمدی است: «رفتنِ سرِ کار» ممکن است ۷:۴۰
    یا ۸:۲۰ باشد و هر دو همان الگویند."""
    w = _aware(when).weekday()
    bucket = (_aware(when).hour // 3) * 3
    return f"{from_id}:{to_id}:{w}:{bucket}"


async def learn_patterns(db: AsyncSession, uid: int = 0) -> Dict[str, Any]:
    """سفرها را در الگوها بشمار؛ الگویی که به حدِ نصاب رسید «آموخته» می‌شود
    و سفرِ منطبق با آن دیگر سؤال/هشدار ندارد. سفرِ نامنطبق «خلافِ الگو»
    علامت می‌خورد — و **فقط همان** بعداً پرسیده می‌شود."""
    from app.models.place import RoutePattern, Trip

    trips = (
        await db.execute(
            select(Trip).where(_scope(Trip.user_id, uid)).order_by(Trip.id.asc()).limit(2000)
        )
    ).scalars().all()
    patterns = {
        p.pattern_key: p
        for p in (
            await db.execute(select(RoutePattern).where(_scope(RoutePattern.user_id, uid)))
        ).scalars().all()
    }
    learned = anomalies = 0
    counted: Dict[str, int] = {}

    for trip in trips:
        key = trip.pattern_key or (
            pattern_key(trip.from_place_id, trip.to_place_id, trip.started_at)
            if trip.from_place_id and trip.to_place_id and trip.started_at else None
        )
        if not key:
            continue
        row = patterns.get(key)
        if row is None:
            parts = key.split(":")
            row = RoutePattern(
                user_id=uid, pattern_key=key,
                from_place_id=trip.from_place_id, to_place_id=trip.to_place_id,
                weekday=int(parts[2]) if len(parts) > 3 else None,
                hour_bucket=int(parts[3]) if len(parts) > 3 else None,
                occurrences=0,
            )
            db.add(row)
            patterns[key] = row
        counted[key] = counted.get(key, 0) + 1

    for key, count in counted.items():
        row = patterns[key]
        row.occurrences = count
        row.last_seen_at = datetime.now(timezone.utc)
        was = bool(row.learned)
        row.learned = count >= LEARN_AFTER
        if row.learned and not was:
            learned += 1

    # حالا «خلافِ الگو» را علامت بزن: سفری که الگویش هنوز آموخته نشده و
    # تک‌افتاده است. سفرِ آموخته‌شده هرگز anomaly نیست — قیدِ صریحِ مالک.
    for trip in trips:
        if trip.explained_at is not None:
            # مالک این سفر را توضیح داده. «دیگر نپرس مگر خلافِ الگو» یعنی
            # چیزی که یک بار توضیح داده شد، با اجرای بعدیِ کار دوباره
            # غیرعادی نشود — وگرنه همان سؤال هر ساعت برمی‌گشت.
            trip.is_anomaly = False
            continue
        key = trip.pattern_key
        row = patterns.get(key) if key else None
        anomaly = bool(key) and (row is None or not row.learned) and (counted.get(key, 0) <= 1)
        if trip.is_anomaly != anomaly:
            trip.is_anomaly = anomaly
        if anomaly:
            anomalies += 1

    await db.commit()
    return {"patterns": len(counted), "learned": learned, "anomalies": anomalies}


# ── مرحلهٔ ۴: پرسیدن — کم، و فقط جایی که واقعاً لازم است ────────────────────

async def _place_name(db: AsyncSession, place_id: Optional[int]) -> str:
    """نامِ خواندنیِ یک مکان: برچسبِ مالک ← نشانی ← مختصات.

    هیچ‌وقت رشتهٔ خالی برنمی‌گرداند؛ «جایی ناشناس» صادقانه‌تر از سکوت است.
    """
    from app.models.place import Place

    if not place_id:
        return "جایی ناشناس"
    row = await db.get(Place, int(place_id))
    if row is None:
        return "جایی ناشناس"
    if row.label:
        return str(row.label)
    if row.address:
        return str(row.address)[:80]
    return f"نقطهٔ {row.latitude:.4f}, {row.longitude:.4f}"


def _clock(moment) -> str:
    if not moment:
        return ""
    local = _aware(moment) + timedelta(minutes=TZ_OFFSET_MINUTES)
    return local.strftime("%H:%M")


async def _trip_topic(db: AsyncSession, trip) -> str:
    frm = await _place_name(db, trip.from_place_id)
    to = await _place_name(db, trip.to_place_id)
    when = _clock(trip.started_at)
    at = f"ساعت {when} " if when else ""
    return f"{at}از «{frm}» رفتی به «{to}» — آنجا چه بود؟"[:300]


async def _trip_context(db: AsyncSession, trip) -> str:
    frm = await _place_name(db, trip.from_place_id)
    to = await _place_name(db, trip.to_place_id)
    start, end = _clock(trip.started_at), _clock(trip.ended_at)
    bits = [f"از «{frm}» به «{to}»"]
    if start:
        bits.append(f"از {start}" + (f" تا {end}" if end else ""))
    if trip.minutes:
        bits.append(f"{round(trip.minutes)} دقیقه")
    if trip.distance_km:
        bits.append(f"{round(trip.distance_km, 1)} کیلومتر")
    return "این مسیر با الگوهای همیشگی‌ات نمی‌خواند — " + "، ".join(bits) + "."


async def ask_about_places(db: AsyncSession, uid: int = 0) -> Dict[str, Any]:
    """دو نوع پرسش، هر دو یک‌بارمصرف:

    * مکانِ پرتکرارِ بی‌نام → «اینجا کجاست؟»
    * سفرِ خلافِ الگو → «این‌بار کجا رفتی و چرا؟»

    مکان/سفرِ آموخته‌شده هرگز پرسیده نمی‌شود؛ `source_ref` یکتاست پس تکرار
    هم ممکن نیست."""
    from app.models.place import Place, Trip
    from app.services import clarification_service as clar

    asked: List[str] = []

    unnamed = (
        await db.execute(
            select(Place)
            .where(_scope(Place.user_id, uid), Place.label.is_(None),
                   Place.asked_at.is_(None), Place.visit_count >= 3)
            .order_by(Place.visit_count.desc())
            .limit(MAX_PLACE_QUESTIONS)
        )
    ).scalars().all()
    for place in unnamed:
        c = await clar.ask(
            db,
            topic=f"این مکان کجاست؟ ({place.visit_count} بار آنجا بوده‌ای)",
            context=f"مختصات {place.latitude:.4f}, {place.longitude:.4f} — "
                    f"مجموعاً {round(place.total_minutes or 0)} دقیقه.",
            source="location",
            source_ref=f"place:{uid}:{place.id}",
            target={"kind": "place", "place_id": place.id},
            questions=[
                {"key": "label", "label": "اسم این مکان چیست؟", "type": "short",
                 "why": "تا در گزارش‌ها به‌جای مختصات، اسمش را ببینی."},
                {"key": "kind", "label": "چه جور جایی است؟", "type": "choice",
                 "choices": ["خانه", "محل کار", "ورزش", "خرید", "دیدار", "جای دیگر"],
                 "why": "خانه و محل کار در پروفایلت ثبت می‌شوند."},
            ],
            priority=1, user_id=uid,
        )
        if c is not None:
            place.asked_at = datetime.now(timezone.utc)
            asked.append(f"place:{place.id}")

    odd = (
        await db.execute(
            select(Trip)
            .where(_scope(Trip.user_id, uid), Trip.is_anomaly.is_(True))
            .order_by(Trip.id.desc())
            .limit(1)
        )
    ).scalars().all()
    for trip in odd:
        # سؤال باید بگوید **از کجا به کجا و کِی** — نه فقط «چند کیلومتر».
        # نسخهٔ اول با اینکه from_place_id/to_place_id/started_at را در دست
        # داشت، هیچ‌کدام را استفاده نمی‌کرد و می‌پرسید «۸.۴ کیلومتر جابه‌جا
        # شدی، کجا بودی؟» — سؤالی که خودِ مالک نمی‌توانست جوابش را به یاد
        # بیاورد چون هیچ نشانه‌ای در آن نبود. (۲۰۲۶-۰۸-۰۱)
        c = await clar.ask(
            db,
            topic=await _trip_topic(db, trip),
            context=await _trip_context(db, trip),
            source="location",
            source_ref=f"trip:{uid}:{trip.id}",
            target={"kind": "trip", "trip_id": trip.id},
            questions=[{"key": "note", "label": "آنجا چه کردی؟", "type": "short",
                        "why": "مسیرهای همیشگی‌ات را دیگر نمی‌پرسم؛ فقط همین‌های غیرعادی را."}],
            priority=1, user_id=uid,
        )
        if c is not None:
            asked.append(f"trip:{trip.id}")

    await db.commit()
    return {"asked": asked}


async def apply_place_answer(db: AsyncSession, target: Dict[str, Any], answers: Dict[str, str]) -> List[Dict[str, Any]]:
    """جوابِ فرم → نامِ مکان / یادداشتِ سفر. حرفِ مالک قفل می‌شود."""
    from app.models.place import Place, Trip

    kind_map = {"خانه": "home", "محل کار": "work", "ورزش": "gym",
                "خرید": "shopping", "دیدار": "social", "جای دیگر": "other"}
    # مالکِ فرم (که کلیرفیکیشن از توکن روی مقصد مهر می‌زند) تنها مرجعِ دامنه
    # است. شناسهٔ مکان/سفر می‌تواند از بدنهٔ درخواست آمده باشد، پس ردیفی که
    # مالِ این کاربر نیست باید انگار وجود نداشته باشد.
    uid = int(target.get("user_id") or 0)

    def _mine(row) -> bool:
        return row is not None and (getattr(row, "user_id", None) or 0) == uid

    if target.get("kind") == "place":
        place = await db.get(Place, int(target.get("place_id") or 0))
        if not _mine(place):
            return []
        if answers.get("label"):
            place.label = str(answers["label"])[:160]
        if answers.get("kind"):
            place.kind = kind_map.get(str(answers["kind"]).strip(), "other")
        place.owner_locked = True
        await db.flush()
        return [{"where": "place", "id": place.id,
                 "label": f"مکان «{place.label or '—'}» ثبت شد"}]
    if target.get("kind") == "trip":
        trip = await db.get(Trip, int(target.get("trip_id") or 0))
        if not _mine(trip):
            return []
        note = answers.get("note")
        if note:
            trip.note = str(note)[:2000]
            trip.is_anomaly = False          # توضیح داده شد، دیگر غیرعادی نیست
            # مهرِ «توضیح داده شد» — همین است که `learn_patterns` را از
            # علامت‌زدنِ دوبارهٔ این سفر بازمی‌دارد.
            trip.explained_at = datetime.now(timezone.utc)
            await db.flush()
            return [{"where": "trip", "id": trip.id,
                     "label": f"سفر توضیح داده شد: {trip.note[:40]}"}]
    return []


async def get_named_place(db: AsyncSession, uid: int, *, kind: str) -> Optional[Dict[str, Any]]:
    """خانه/محلِ کارِ کشف‌شده — ورودیِ پروفایلِ هویت."""
    from app.models.place import Place

    row = (
        await db.execute(
            select(Place)
            .where(_scope(Place.user_id, uid), Place.kind == kind)
            .order_by(Place.owner_locked.desc(), Place.total_minutes.desc())
            .limit(1)
        )
    ).scalars().first()
    if row is None:
        return None
    return {"id": row.id, "label": row.label, "address": row.address,
            "lat": row.latitude, "lon": row.longitude, "kind": row.kind}


async def summary_lines(db: AsyncSession, uid: int = 0, *, days: int = 7) -> List[str]:
    """خطوطِ فارسی برای گزارش روزانه و دستیار — تا این داده هم به‌کار برود."""
    from app.models.place import Place, Trip

    now = datetime.now(timezone.utc)
    since = now - timedelta(days=max(1, int(days)))
    places = (
        await db.execute(
            select(Place).where(_scope(Place.user_id, uid), Place.last_seen_at >= since)
            .order_by(Place.total_minutes.desc()).limit(5)
        )
    ).scalars().all()
    trips = (
        await db.execute(
            select(Trip).where(_scope(Trip.user_id, uid), Trip.started_at >= since)
        )
    ).scalars().all()
    lines: List[str] = []
    if places:
        top = "، ".join(
            f"{p.label or 'مکانِ بی‌نام'} ({round((p.total_minutes or 0) / 60)}س)" for p in places
        )
        lines.append(f"📍 بیشترین حضور: {top}")
    if trips:
        odd = sum(1 for t in trips if t.is_anomaly)
        lines.append(f"🚗 {len(trips)} جابه‌جایی در {days} روز"
                     + (f" — {odd} موردِ غیرعادی" if odd else " — همه طبقِ الگو"))
    return lines
