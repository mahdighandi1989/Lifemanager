"""آنچه واقعاً می‌کند: خواب، تحرک، روتین، و گوشی.

چرا این منبع اینجاست
====================
مالک روی «من که هستم» تصویرِ کارتِ شناساییِ خودش را دید، نه تصویرِ خودش را.
چیزی که یک آدم در خودش می‌شناسد این‌هاست: کِی می‌خوابد، چقدر از خانه بیرون
می‌زند، روزهایش شبیهِ هم هستند یا نه، و چقدر به گوشی چسبیده. همهٔ این داده‌ها
از قبل در برنامه بود و هیچ‌کجا خوانده نمی‌شد — دقیقاً همان «جزیره»ای که مالک
از آن شکایت کرد.

این ماژول **هیچ چیزی ذخیره نمی‌کند**؛ فقط `places`/`place_visits`/`place_trips`/
`route_patterns` و ردیف‌های `mobile_usage`ِ لاگِ فعالیت را می‌خواند و به جمله
تبدیل می‌کند، با درِ ورودی به `/activity-log` که صاحبِ این ردهاست.

قیدهایی که از خرابیِ نسخهٔ قبل درآمده‌اند
========================================
* **جمله، نه عدد.** «شاخص پشتکار ۱۰/۱۰۰» شکستِ مرجع است. اینجا عدد فقط
  داخلِ جمله یا در `evidence` می‌آید.
* **`tone` صادق.** خوابی که دیرتر می‌شود و کارکردِ صفحه‌ای که بالا می‌رود
  `WATCH` هستند؛ همان‌ها وقتی برعکس شوند `GOOD` می‌شوند. هر سه شاخه واقعاً
  شاخه دارند و تست دارند.
* **«نمی‌دانم» جوابِ درستی است.** هر بخش حدِ نصابِ خودش را دارد (پایین‌تر،
  کنارِ هر ثابت) و زیرِ آن هیچ کارتی ساخته نمی‌شود.
* **هیچ `except`ِ ساکتی.** هر بخش جدا مهار می‌شود ولی خطا در سطحِ warning
  ثبت می‌شود، تا غلطِ املاییِ یک نامِ ستون (همان بلایی که سرِ
  `select(TodoItem.title)` آمد، حال آنکه ستون `content` است) نتواند پنهان شود.

ساعتِ محلی، نه UTC
==================
`TZ_OFFSET_MINUTES` از `place_service` گرفته می‌شود. با UTC، شبِ مالک (۲۳ محلی)
می‌افتد در سطلِ ۱۹ یعنی «ساعتِ اداری» — همان باگی که امروز در تشخیصِ خانه/محلِ
کار پیدا و رفع شد. هیچ ساعتی در این فایل بدونِ عبور از `_local` استفاده نمی‌شود.

روزِ کارکردِ گوشی از `entity_id` خوانده می‌شود نه از `created_at`
================================================================
`POST /api/mobile/usage` روزِ گزارش (`YYYY-MM-DD`) را در `entity_id` می‌گذارد و
`occurred_at` را پر نمی‌کند، پس `created_at` فقط «کِی همگام شد» را می‌گوید.
گزارشی که با تأخیر بالا می‌آید با `created_at` در هفتهٔ غلط می‌افتد؛ با
`entity_id` نه. `build_mobile_summary` برای خلاصهٔ یک‌پنجره‌ای عالی است ولی
دو پنجرهٔ مقایسه‌ای (این هفته در برابر هفتهٔ پیش) نمی‌دهد، پس روند اینجا
مستقیم از همان ردیف‌ها ساخته می‌شود.
"""
from __future__ import annotations

import datetime as _dt
import json
import logging
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.owner_insight import register
from app.services.owner_insight.base import Facet, FacetGroup, Kind, Provider, Tone
from app.services.place_service import TZ_OFFSET_MINUTES

logger = logging.getLogger(__name__)

try:  # نامِ خواناىِ اپ‌ها از همان جایی که خلاصهٔ موبایل استفاده می‌کند
    from app.services.mobile_insights_service import _app_fa
except Exception as _exc:  # pragma: no cover - فقط اگر آن ماژول جابه‌جا شود
    logger.warning("owner-insight behaviour: app-name map unavailable: %r", _exc)

    def _app_fa(pkg: str) -> str:
        return pkg


PAGE = "/activity-log"       # در frontend/src/lib/routesMeta.js موجود است
SOURCE = "رد‌های واقعی: مکان‌ها و سفرها + گزارشِ کارکردِ گوشی"

UTC = _dt.timezone.utc

# ── حدِ نصاب‌ها ──────────────────────────────────────────────────────────────
# همه از یک منطق درمی‌آیند: کمتر از این مقدار، جمله دربارهٔ «معمولاً» دروغ است.

# خواب: یک اقامتِ شبانه یعنی رسیدن در بازهٔ شب و ماندنِ دستِ‌کم ۴ ساعت.
NIGHT_ARRIVAL_HOURS = set(range(20, 24)) | {0, 1, 2, 3}
MIN_SLEEP_MINUTES = 240.0
MIN_NIGHTS = 5              # زیرِ ۵ شب «معمولاً» معنا ندارد
MIN_NIGHTS_FOR_DRIFT = 6    # برای «دیرتر/زودتر شده» دستِ‌کم ۳ شب در هر نیمه
DRIFT_HOURS = 0.75          # کمتر از ۴۵ دقیقه جابه‌جایی یعنی نویز، نه روند

# تحرک: پنجرهٔ هفتگی + این‌که اصلاً چند روزِ همین هفته ردِ مکانی داریم.
# دروازه عمداً روی **همان پنجره** است: اگر گوشی سه روز خاموش بوده، «این هفته
# تکان نخورده‌ای» ادعای غلطی است — نبودِ داده با نبودِ حرکت یکی نیست.
MOVE_WINDOW_DAYS = 7
MIN_LOCATION_DAYS = 4       # از ۷ روز، دستِ‌کم ۴ روز ردِ مکانی
LOW_MOVEMENT_TRIPS = 2      # ≤۲ جابه‌جایی و
LOW_MOVEMENT_KM = 15.0      # <۱۵ کیلومتر در هفته → تقریباً بی‌تحرک

# روتین: الگوها روی کلِ ردِ ثبت‌شده سنجیده می‌شوند، نه یک هفته.
MIN_TRIPS_FOR_ROUTINE = 6
ROUTINE_STABLE_AT = 0.60    # ≥۶۰٪ روی مسیرِ آموخته → روتینِ جاافتاده
ROUTINE_LOOSE_BELOW = 0.30  # <۳۰٪ → هنوز الگویی در کار نیست

# گوشی: روزهای متمایزِ دارای گزارشِ کارکرد.
SCREEN_WINDOW_DAYS = 7
MIN_USAGE_DAYS = 4          # زیرِ ۴ روز، میانگینِ روزانه بی‌معناست
MIN_USAGE_DAYS_PER_SIDE = 3 # برای مقایسهٔ دو هفته
SCREEN_TREND_RATIO = 1.15   # ≥۱۵٪ تغییر و
SCREEN_TREND_MINUTES = 20.0 # ≥۲۰ دقیقه در روز → روند، نه نوسان
SCREEN_HEAVY_MINUTES = 300.0  # میانگینِ بیش از ۵ ساعت در روز، فارغ از روند

_DIGITS = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")


# ── ابزارهای کوچک ───────────────────────────────────────────────────────────

def _fa(n: Any) -> str:
    """عدد با رقم‌های فارسی — جمله نباید وسطش جهت عوض کند."""
    return str(n).translate(_DIGITS)


def _pct(x: float) -> str:
    return f"{_fa(int(round(x * 100)))}٪"


def _scope(col, uid: int):
    """همان قاعدهٔ دامنهٔ کلِ برنامه: uid=0 ردیف‌های بی‌صاحبِ قدیمی را هم می‌بیند."""
    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


def _aware(value: Optional[_dt.datetime]) -> Optional[_dt.datetime]:
    if value is None:
        return None
    return value if value.tzinfo else value.replace(tzinfo=UTC)


def _local(value: Optional[_dt.datetime]) -> Optional[_dt.datetime]:
    """UTC → ساعتِ محلیِ مالک. هیچ ساعتی در این فایل بدونِ این تابع خوانده نمی‌شود."""
    aware = _aware(value)
    if aware is None:
        return None
    return aware + _dt.timedelta(minutes=TZ_OFFSET_MINUTES)


def _local_today() -> _dt.date:
    return (_dt.datetime.now(UTC) + _dt.timedelta(minutes=TZ_OFFSET_MINUTES)).date()


def _median(values: Sequence[float]) -> float:
    ordered = sorted(values)
    n = len(ordered)
    mid = n // 2
    return ordered[mid] if n % 2 else (ordered[mid - 1] + ordered[mid]) / 2.0


def _clock(hour_float: float) -> str:
    """۲۳٫۶۶ → «۲۳:۴۰». ورودی می‌تواند >۲۴ باشد (شبِ بعد از نیمه‌شب)."""
    total = int(round((hour_float % 24) * 60))
    total %= 24 * 60
    return f"{_fa(total // 60)}:{_fa(f'{total % 60:02d}')}"


def _dur(minutes: float) -> str:
    """۴۵۰ دقیقه → «۷ ساعت و ۳۰ دقیقه»."""
    total = int(round(max(0.0, minutes)))
    h, m = divmod(total, 60)
    if h and m:
        return f"{_fa(h)} ساعت و {_fa(m)} دقیقه"
    if h:
        return f"{_fa(h)} ساعت"
    return f"{_fa(m)} دقیقه"


def _km(value: float) -> str:
    if value < 1:
        return "کمتر از ۱ کیلومتر"
    return f"{_fa(int(round(value)))} کیلومتر"


# ── خواب ────────────────────────────────────────────────────────────────────

async def _sleep_facet(db: AsyncSession, uid: int) -> Optional[Facet]:
    """کِی می‌خوابد و آیا اخیراً جابه‌جا شده.

    «شب» = اقامتی که در بازهٔ ۲۰ تا ۳ **به وقتِ محلی** شروع شده و دستِ‌کم
    ۴ ساعت طول کشیده. برای هر شب فقط بلندترین اقامت شمرده می‌شود.
    """
    from app.models.place import Place, Visit

    rows = (
        await db.execute(
            select(Visit)
            .where(
                _scope(Visit.user_id, uid),
                Visit.arrived_at.is_not(None),
                Visit.left_at.is_not(None),
                Visit.minutes >= MIN_SLEEP_MINUTES,
            )
            .order_by(Visit.arrived_at.asc())
            .limit(500)
        )
    ).scalars().all()
    if not rows:
        return None

    # night_date → (شروعِ خطی، پایان، دقیقه، مکان)
    nights: Dict[_dt.date, Tuple[float, float, float, Optional[int]]] = {}
    for row in rows:
        start = _local(row.arrived_at)
        end = _local(row.left_at)
        if start is None or end is None:
            continue
        if start.hour not in NIGHT_ARRIVAL_HOURS:
            continue
        start_h = start.hour + start.minute / 60.0
        # ۰..۳ متعلق به شبِ روزِ قبل است؛ خطی‌اش می‌کنیم تا میانه معنا بدهد.
        if start_h < 12:
            start_h += 24.0
            night_date = start.date() - _dt.timedelta(days=1)
        else:
            night_date = start.date()
        minutes = float(row.minutes or 0.0)
        kept = nights.get(night_date)
        if kept is not None and kept[2] >= minutes:
            continue
        nights[night_date] = (start_h, end.hour + end.minute / 60.0, minutes, row.place_id)

    if len(nights) < MIN_NIGHTS:
        return None

    ordered = sorted(nights.items())
    starts = [v[0] for _, v in ordered]
    ends = [v[1] for _, v in ordered]
    lengths = [v[2] for _, v in ordered]

    med_start, med_end, med_len = _median(starts), _median(ends), _median(lengths)

    tone = Tone.NEUTRAL.value
    drift_clause = ""
    if len(ordered) >= MIN_NIGHTS_FOR_DRIFT:
        half = len(ordered) // 2
        older = _median(starts[:half])
        newer = _median(starts[half:])
        delta = newer - older
        if delta >= DRIFT_HOURS:
            tone = Tone.WATCH.value
            drift_clause = (
                f" و تازگی دیرتر شده — در {_fa(len(starts) - half)} شبِ آخر حدودِ "
                f"{_dur(delta * 60)} دیرتر از شب‌های اولِ همین بازه"
            )
        elif delta <= -DRIFT_HOURS:
            tone = Tone.GOOD.value
            drift_clause = (
                f" و تازگی زودتر شده — در {_fa(len(starts) - half)} شبِ آخر حدودِ "
                f"{_dur(-delta * 60)} زودتر از شب‌های اولِ همین بازه"
            )
        else:
            drift_clause = f" و در {_fa(len(ordered))} شبِ اخیر تقریباً سرِ همین ساعت مانده"

    statement = (
        f"معمولاً حدودِ {_clock(med_start)} شبت تمام می‌شود و حدودِ {_clock(med_end)} "
        f"روزت شروع می‌شود — تقریباً {_dur(med_len)} یک‌جا می‌مانی{drift_clause}."
    )

    span = (ordered[-1][0] - ordered[0][0]).days + 1
    evidence = [
        f"از {_fa(len(ordered))} شبِ ثبت‌شده در {_fa(span)} روزِ گذشته حساب شده.",
        f"دیرترین شبت {_clock(max(starts))} بوده و زودترینش {_clock(min(starts))}.",
        "ساعت‌ها به وقتِ محلیِ خودت حساب شده‌اند، نه UTC.",
    ]

    # اگر بیشترِ این شب‌ها یک‌جا بوده و آن‌جا اسم دارد، اسمش را بگو.
    place_ids = [v[3] for _, v in ordered if v[3]]
    if place_ids:
        dominant = max(set(place_ids), key=place_ids.count)
        if place_ids.count(dominant) >= len(ordered) / 2:
            place = (
                await db.execute(select(Place).where(Place.id == dominant))
            ).scalars().first()
            if place is not None and place.label:
                evidence.append(
                    f"{_fa(place_ids.count(dominant))} شب از این‌ها در «{place.label}» بوده‌ای."
                )

    return Facet(
        key="behaviour_sleep",
        title="ساعتِ خواب و بیداری",
        statement=statement,
        group=FacetGroup.BEHAVIOUR.value,
        kind=Kind.MEASURED.value,
        tone=tone,
        confidence=round(min(0.9, 0.4 + 0.05 * len(ordered)), 2),
        evidence=evidence,
        source_label=SOURCE,
        owns_page=PAGE,
    )


# ── تحرکِ هفتگی ─────────────────────────────────────────────────────────────

async def _movement_facet(db: AsyncSession, uid: int) -> Optional[Facet]:
    """چقدر در هفته جابه‌جا شده و چقدرش روی مسیرهای آشنا بوده."""
    from app.models.place import RoutePattern, Trip, Visit

    now = _dt.datetime.now(UTC)

    # دروازه: اصلاً چند روزِ متمایزِ همین هفته ردِ مکانی داریم؟ بدونِ این،
    # «این هفته تکان نخورده‌ای» با «گوشی خاموش بوده» یکی می‌شود.
    visits = (
        await db.execute(
            select(Visit.arrived_at)
            .where(
                _scope(Visit.user_id, uid),
                Visit.arrived_at >= now - _dt.timedelta(days=MOVE_WINDOW_DAYS),
            )
            .limit(2000)
        )
    ).all()
    days_seen = {
        local.date()
        for (arrived,) in visits
        if (local := _local(arrived)) is not None
    }
    if len(days_seen) < MIN_LOCATION_DAYS:
        return None

    trips = (
        await db.execute(
            select(Trip)
            .where(
                _scope(Trip.user_id, uid),
                Trip.started_at >= now - _dt.timedelta(days=MOVE_WINDOW_DAYS),
            )
            .limit(1000)
        )
    ).scalars().all()

    learned_keys = {
        key
        for (key,) in (
            await db.execute(
                select(RoutePattern.pattern_key).where(
                    _scope(RoutePattern.user_id, uid), RoutePattern.learned.is_(True)
                )
            )
        ).all()
        if key
    }

    total_km = sum(float(t.distance_km or 0.0) for t in trips)
    spots = {pid for t in trips for pid in (t.from_place_id, t.to_place_id) if pid}
    on_pattern = sum(1 for t in trips if t.pattern_key and t.pattern_key in learned_keys)
    off_pattern = len(trips) - on_pattern

    evidence = [
        f"در {_fa(len(days_seen))} روزِ متمایزِ هفتهٔ گذشته ردِ مکانی داشته‌ای.",
    ]

    if len(trips) <= LOW_MOVEMENT_TRIPS and total_km < LOW_MOVEMENT_KM:
        tone = Tone.WATCH.value
        if not trips:
            statement = (
                f"این هفته اصلاً از جایت تکان نخورده‌ای — با اینکه {_fa(len(days_seen))} "
                "روز ردِ مکانی داشته‌ای، هیچ جابه‌جایی بینِ دو مکانِ متفاوت ثبت نشده."
            )
        else:
            statement = (
                f"این هفته تقریباً بی‌تحرک بوده‌ای — فقط {_fa(len(trips))} بار جابه‌جا "
                f"شده‌ای و رویِ‌هم {_km(total_km)} راه رفته‌ای."
            )
        evidence.append(f"{_fa(len(trips))} جابه‌جایی در {_fa(MOVE_WINDOW_DAYS)} روزِ گذشته.")
        if total_km:
            evidence.append(f"مجموعِ مسافت {_km(total_km)}.")
    else:
        tone = Tone.NEUTRAL.value
        if off_pattern == 0:
            tail = "و همه‌اش روی همان مسیرهای همیشگی‌ات بود"
        elif on_pattern == 0:
            tail = "و هیچ‌کدام روی مسیرهای همیشگی‌ات نبود"
        else:
            tail = f"و {_fa(off_pattern)} تای آن مسیری بود که معمولاً نمی‌روی"
        statement = (
            f"این هفته {_fa(len(trips))} بار بینِ {_fa(len(spots))} نقطهٔ متفاوت جابه‌جا "
            f"شده‌ای و رویِ‌هم حدودِ {_km(total_km)} راه رفته‌ای — {tail}."
        )
        evidence.append(f"{_fa(len(trips))} جابه‌جایی و {_km(total_km)} در {_fa(MOVE_WINDOW_DAYS)} روز.")
        if learned_keys:
            evidence.append(
                f"{_fa(on_pattern)} تای این جابه‌جایی‌ها روی مسیرهایی بود که برنامه یادشان گرفته."
            )

    return Facet(
        key="behaviour_movement",
        title="تحرکِ این هفته",
        statement=statement,
        group=FacetGroup.BEHAVIOUR.value,
        kind=Kind.MEASURED.value,
        tone=tone,
        confidence=round(min(0.85, 0.4 + 0.05 * len(days_seen)), 2),
        evidence=evidence,
        source_label=SOURCE,
        owns_page=PAGE,
    )


# ── ثباتِ روتین ─────────────────────────────────────────────────────────────

async def _routine_facet(db: AsyncSession, uid: int) -> Optional[Facet]:
    """آیا رفت‌وآمدهایش قابلِ پیش‌بینی است — روی کلِ ردِ ثبت‌شده، نه یک هفته."""
    from app.models.place import RoutePattern, Trip

    trips = (
        await db.execute(
            select(Trip.pattern_key)
            .where(_scope(Trip.user_id, uid))
            .order_by(Trip.id.desc())
            .limit(2000)
        )
    ).all()
    if len(trips) < MIN_TRIPS_FOR_ROUTINE:
        return None

    patterns = (
        await db.execute(
            select(RoutePattern.pattern_key, RoutePattern.learned, RoutePattern.occurrences)
            .where(_scope(RoutePattern.user_id, uid))
            .limit(2000)
        )
    ).all()
    learned_keys = {key for key, learned, _occ in patterns if key and learned}
    if not patterns:
        # سفر هست ولی هنوز الگویی شمرده نشده — کارِ دوره‌ای هنوز نرسیده.
        # ادعای «روتین نداری» اینجا دروغ است.
        return None

    on_pattern = sum(1 for (key,) in trips if key and key in learned_keys)
    share = on_pattern / len(trips)
    busiest = max((occ or 0) for _k, _l, occ in patterns)

    evidence = [
        f"{_fa(len(trips))} جابه‌جایی ثبت‌شده در {_fa(len(patterns))} مسیرِ متمایز.",
        f"{_fa(len(learned_keys))} مسیر آن‌قدر تکرار شده که برنامه دیگر دربارهٔ آن نمی‌پرسد.",
    ]
    if busiest:
        evidence.append(f"پرتکرارترین مسیرت {_fa(busiest)} بار تکرار شده.")

    if share >= ROUTINE_STABLE_AT and learned_keys:
        tone = Tone.GOOD.value
        statement = (
            f"رفت‌وآمدهایت الگوی جاافتاده‌ای دارند — {_fa(len(learned_keys))} مسیرِ تکراری "
            f"شناخته شده و {_pct(share)} جابه‌جایی‌هایت روی همان‌هاست، یعنی روزهایت "
            "شکلِ مشخصی دارند."
        )
    elif share < ROUTINE_LOOSE_BELOW:
        tone = Tone.WATCH.value
        statement = (
            f"روزهایت هنوز شکلِ ثابتی ندارند — فقط {_pct(share)} جابه‌جایی‌هایت روی مسیرِ "
            "شناخته‌شده بوده و بقیه هر بار جای تازه‌ای است."
        )
    else:
        tone = Tone.NEUTRAL.value
        statement = (
            f"روتینت نیمه‌ثابت است — {_pct(share)} جابه‌جایی‌هایت روی مسیرهای همیشگی است "
            "و بقیه هر بار فرق می‌کند."
        )

    return Facet(
        key="behaviour_routine",
        title="ثباتِ روتین",
        statement=statement,
        group=FacetGroup.BEHAVIOUR.value,
        kind=Kind.MEASURED.value,
        tone=tone,
        confidence=round(min(0.85, 0.35 + 0.02 * len(trips)), 2),
        evidence=evidence,
        source_label=SOURCE,
        owns_page=PAGE,
    )


# ── گوشی ────────────────────────────────────────────────────────────────────

def _usage_by_day(rows: Iterable[Tuple[Any, Any]]) -> Tuple[
    Dict[_dt.date, float], Dict[_dt.date, int], Dict[str, float], int
]:
    """ردیف‌های mobile_usage → دقیقه/روز، قفل‌گشایی/روز، دقیقه‌به‌ازای‌اپ.

    آخرین مقدارِ برگشتی تعدادِ ردیف‌هایی است که خوانده نشدند (روزِ نامعتبر یا
    JSONِ خراب) تا در سطحِ فراخوان بشود دربارهٔ سکوتِ کامل هشدار داد.
    """
    minutes: Dict[_dt.date, float] = {}
    unlocks: Dict[_dt.date, int] = {}
    apps: Dict[str, float] = {}
    skipped = 0
    for entity_id, detail in rows:
        try:
            day = _dt.date.fromisoformat(str(entity_id))
            payload = json.loads(detail or "{}")
        except (TypeError, ValueError) as exc:
            logger.debug("owner-insight behaviour: unreadable usage row %r: %r", entity_id, exc)
            skipped += 1
            continue
        total = 0.0
        for item in payload.get("apps") or []:
            if not isinstance(item, dict):
                continue
            mins = float(item.get("minutes") or 0)
            total += mins
            name = item.get("app")
            if name:
                apps[str(name)] = apps.get(str(name), 0.0) + mins
        minutes[day] = minutes.get(day, 0.0) + total
        unlocks[day] = unlocks.get(day, 0) + int(payload.get("unlocks") or 0)
    return minutes, unlocks, apps, skipped


async def _screen_facet(db: AsyncSession, uid: int) -> Optional[Facet]:
    """چقدر با گوشی کار می‌کند و آیا بالا می‌رود.

    روز از `entity_id` می‌آید (ببین توضیحِ بالای فایل)، پس گزارشی که با تأخیر
    همگام شده در هفتهٔ درست می‌نشیند.
    """
    from app.models.activity_log import ActivityLog

    rows = (
        await db.execute(
            select(ActivityLog.entity_id, ActivityLog.detail)
            .where(_scope(ActivityLog.user_id, uid), ActivityLog.action == "mobile_usage")
            .order_by(ActivityLog.id.desc())
            .limit(400)
        )
    ).all()
    if not rows:
        return None

    by_day, unlocks, apps, skipped = _usage_by_day(rows)
    if not by_day:
        # ردیف هست ولی هیچ‌کدام خوانده نشد — این یک خرابیِ ساختاری است، نه
        # «داده نداریم». باید صدا کند، نه اینکه بی‌سروصدا خالی برگردد.
        logger.warning(
            "owner-insight behaviour: all %d mobile_usage rows unreadable", skipped
        )
        return None

    today = _local_today()
    recent_days = {today - _dt.timedelta(days=i) for i in range(SCREEN_WINDOW_DAYS)}
    prior_days = {
        today - _dt.timedelta(days=i)
        for i in range(SCREEN_WINDOW_DAYS, SCREEN_WINDOW_DAYS * 2)
    }
    recent = {d: m for d, m in by_day.items() if d in recent_days}
    prior = {d: m for d, m in by_day.items() if d in prior_days}
    if len(recent) < MIN_USAGE_DAYS:
        return None

    avg = sum(recent.values()) / len(recent)

    tone = Tone.NEUTRAL.value
    trend_clause = ""
    if len(recent) >= MIN_USAGE_DAYS_PER_SIDE and len(prior) >= MIN_USAGE_DAYS_PER_SIDE:
        prior_avg = sum(prior.values()) / len(prior)
        delta = avg - prior_avg
        if prior_avg > 0 and avg >= prior_avg * SCREEN_TREND_RATIO and delta >= SCREEN_TREND_MINUTES:
            tone = Tone.WATCH.value
            trend_clause = (
                f" و این هفته نسبت به هفتهٔ پیش بالا رفته — روزی حدودِ "
                f"{_dur(delta)} بیشتر"
            )
        elif avg * SCREEN_TREND_RATIO <= prior_avg and -delta >= SCREEN_TREND_MINUTES:
            tone = Tone.GOOD.value
            trend_clause = (
                f" و این هفته نسبت به هفتهٔ پیش پایین آمده — روزی حدودِ "
                f"{_dur(-delta)} کمتر"
            )
        else:
            trend_clause = " و نسبت به هفتهٔ پیش تقریباً همان‌قدر مانده"

    if tone == Tone.NEUTRAL.value and avg >= SCREEN_HEAVY_MINUTES:
        tone = Tone.WATCH.value

    statement = (
        f"به‌طور میانگین روزی حدودِ {_dur(avg)} با گوشی‌ات کار می‌کنی{trend_clause}."
    )

    evidence = [
        f"از {_fa(len(recent))} روزِ گزارش‌شده در {_fa(SCREEN_WINDOW_DAYS)} روزِ گذشته حساب شده.",
    ]
    top = sorted(apps.items(), key=lambda kv: -kv[1])[:3]
    if top:
        evidence.append(
            "بیشترین وقتت روی "
            + "، ".join(f"{_app_fa(a)} ({_dur(m)})" for a, m in top)
            + " رفته."
        )
    unlock_total = sum(unlocks.get(d, 0) for d in recent)
    if unlock_total:
        evidence.append(
            f"روزی حدودِ {_fa(int(round(unlock_total / len(recent))))} بار قفلِ گوشی را باز کرده‌ای."
        )
    if skipped:
        evidence.append(f"{_fa(skipped)} گزارشِ ناخوانا کنار گذاشته شد.")

    return Facet(
        key="behaviour_screen_time",
        title="کارکردِ گوشی",
        statement=statement,
        group=FacetGroup.BEHAVIOUR.value,
        kind=Kind.MEASURED.value,
        tone=tone,
        confidence=round(min(0.85, 0.35 + 0.07 * len(recent)), 2),
        evidence=evidence,
        source_label=SOURCE,
        owns_page=PAGE,
    )


# ── گردآوری ─────────────────────────────────────────────────────────────────

_PARTS = (
    ("sleep", _sleep_facet),
    ("movement", _movement_facet),
    ("routine", _routine_facet),
    ("screen", _screen_facet),
)


async def _collect(db: AsyncSession, uid: int) -> Optional[List[Facet]]:
    facets: List[Facet] = []
    for name, builder in _PARTS:
        try:
            facet = await builder(db, uid)
        except Exception as exc:
            # مهار می‌شود تا یک بخش بقیه را زمین نزند — ولی **ساکت نیست**.
            logger.warning("owner-insight behaviour: %s failed: %r", name, exc)
            continue
        if facet is not None:
            facets.append(facet)
    # «نمی‌دانم» جوابِ درستی است؛ کارتِ توخالی نمی‌سازیم.
    return facets or None


register(
    Provider(
        key="behaviour",
        label="رفتارِ واقعی (خواب، تحرک، روتین، گوشی)",
        owns_page=PAGE,
        collect=_collect,
        group_order=40,
    )
)
