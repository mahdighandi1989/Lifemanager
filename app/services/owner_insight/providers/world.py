"""آدم‌ها و پول — رابطهٔ مالک با بیرون.

چرا این منبع اینجاست
====================
مالک روی «من که هستم» چیزی جز رونوشتِ کارتِ شناسایی‌اش ندید. اما دو چیز
هست که واقعاً می‌گوید یک آدم با بیرونِ خودش چه می‌کند: **با چه کسانی
واقعاً در تماس است** و **پولش کجا می‌رود**. هر دو داده از قبل در برنامه
بود — `persons`/`person_profiles`/`interactions` و `financial_accounts`/
`transactions` — و هیچ‌کدام به تصویرِ خودِ مالک وصل نبود. همان «جزیره»ای
که مالک از آن شکایت کرد.

این ماژول **هیچ چیزی ذخیره نمی‌کند**. فقط می‌خواند، به جمله تبدیل می‌کند،
و هر کارت را به صفحه‌ای که صاحبِ آن داده است وصل می‌کند: کارت‌های آدم‌ها
به `/people-profiles` و کارت‌های پول به `/budget`.

قیدهایی که از خرابیِ نسخهٔ قبل درآمده‌اند
========================================
* **جمله، نه عدد.** «شاخص پشتکار ۱۰/۱۰۰» شکستِ مرجع است. اینجا هیچ کارتی
  یک عدد نیست؛ عدد فقط داخلِ جمله یا در `evidence` می‌آید.
* **`tone` صادق.** رابطه‌ای که خوابیده و دسته‌ای از خرج که بالا زده
  `WATCH` هستند؛ همان‌ها وقتی برعکس شوند `GOOD` می‌شوند. هر دو شاخه
  واقعاً شاخه دارند و تستِ جدا دارند.
* **«نمی‌دانم» جوابِ درستی است.** هر بخش حدِ نصابِ خودش را دارد و زیرِ آن
  هیچ کارتی ساخته نمی‌شود.
* **هیچ `except`ِ ساکتی.** هر بخش جدا مهار می‌شود ولی خطا در سطحِ warning
  ثبت می‌شود، تا غلطِ املاییِ یک نامِ ستون (بلایی که سرِ
  `select(TodoItem.title)` آمد، حال آنکه ستون `content` است) نتواند پنهان
  بماند. تستِ مسیرِ موفق هم دقیقاً برای همین وجود دارد.

سه تصمیمِ ریز که جملهٔ دروغ را جلو می‌گیرند
==========================================
۱. **سکوت با نبودِ داده یکی نیست.** اگر لاگِ تعامل اصلاً زنده نباشد
   (کمتر از ``MIN_INTERACTIONS_WINDOW`` تعامل در ۹۰ روز)، جملهٔ «با فلانی
   بی‌خبر مانده‌ای» ادعایی دربارهٔ خالی‌بودنِ جدول است، نه دربارهٔ مالک.
   پس هر دو کارتِ آدم‌ها پشتِ همین یک دروازه‌اند. برای کسی که هیچ تعاملی
   ندارد، مبدأ `created_at`ِ خودِ او است — آدمی که دیروز اضافه شده «بی‌خبر
   مانده» نیست.
۲. **هرگز جمعِ بین‌ارزی.** `finance_report_service` عمداً هر ماه را
   **به‌تفکیکِ ارز** می‌دهد (audit #20) و اینجا هم همان قاعده حفظ می‌شود:
   جمله دربارهٔ ارزِ غالبِ همان ماه است و بقیهٔ ارزها جداگانه در `evidence`
   می‌آیند. هیچ‌جا دو ارز با هم جمع نمی‌شوند.
۳. **ماهِ ناتمام روند نمی‌سازد.** «این ماه کمتر خرج کرده‌ای» در روزِ سومِ
   ماه یک دروغِ آماری است. پس کارتِ *روند* فقط روی **ماهِ کاملِ گذشته**
   کار می‌کند و آن را با میانگینِ ماه‌های پیش از آن می‌سنجد؛ کارتِ *شکلِ
   خرج* که فقط توصیف است می‌تواند ماهِ جاری را هم بگوید، ولی آن‌وقت
   صریحاً می‌گوید «تا اینجای این ماه». اگر تازه‌ترین ماهِ دارای تراکنش نه
   این ماه باشد نه ماهِ گذشته، پروندهٔ مالی بیات است و هیچ کارتی ساخته
   نمی‌شود.
"""
from __future__ import annotations

import datetime as _dt
import logging
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.finance import Transaction  # noqa: F401  (سند: منبعِ کارتِ پول)
from app.models.interaction import Interaction
from app.models.person import Person
from app.models.person_profile import PersonProfile
from app.services.finance_report_service import build_report
from app.services.owner_insight import register
from app.services.owner_insight.base import Facet, FacetGroup, Kind, Provider, Tone
from app.services.person_profile_service import REL_FA, effective_relationship

logger = logging.getLogger(__name__)

UTC = _dt.timezone.utc

# هر دو مسیر در frontend/src/lib/routesMeta.js موجودند.
PAGE_PEOPLE = "/people-profiles"
PAGE_MONEY = "/budget"
SOURCE_PEOPLE = "افراد و تعامل‌های ثبت‌شده"
SOURCE_MONEY = "حساب‌ها و تراکنش‌های ثبت‌شده"

# ── حدِ نصاب‌ها ──────────────────────────────────────────────────────────────
# همه از یک منطق درمی‌آیند: زیرِ این مقدار، جمله دربارهٔ داده است نه دربارهٔ مالک.

CONTACT_WINDOW_DAYS = 90       # پنجرهٔ «واقعاً در تماس بوده‌ای»
MIN_INTERACTIONS_WINDOW = 8    # زیرِ این، لاگِ تعامل زنده نیست → سکوت
MIN_PEOPLE_FOR_CIRCLE = 3      # «۵ نفر از ۲۳ نفر» با دو نفر معنا ندارد
QUIET_DAYS = 45                # رابطهٔ «نزدیک» که این‌قدر بی‌خبر مانده باشد

CATEGORY_MIN_SHARE = 0.10      # دسته‌ای که <۱۰٪ ماه است، نوسان است نه روند
NAMED_MIN_SHARE = 0.50         # اگر بیشترِ خرج بی‌دسته باشد، «اولویت» نمی‌دانیم
MIN_NAMED_CATEGORIES = 2       # با یک دسته، «بیشترِ خرجت آنجاست» بی‌معناست
TREND_RATIO = 1.40             # ≥۴۰٪ بالاتر از میانگین → بالا زده
NEW_CATEGORY_SHARE = 0.15      # دستهٔ تازه‌ای که یک‌باره ۱۵٪ ماه شده
CALM_RATIO = 0.90              # مجموعِ ≤۹۰٪ میانگین → واقعاً کمتر
MIN_PRIOR_MONTHS = 2           # میانگین با یک ماه، میانگین نیست
MAX_PRIOR_MONTHS = 3

UNCATEGORISED = "بدون دسته"    # همان برچسبی که finance_report_service می‌سازد

_DIGITS = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")

TYPE_FA = {
    "call": "تماس",
    "meeting": "دیدار",
    "message": "پیام",
    "email": "ایمیل",
    "other": "سایر",
}

CURRENCY_FA = {
    "AED": "درهم",
    "USD": "دلار",
    "EUR": "یورو",
    "GBP": "پوند",
    "IRR": "ریال",
    "IRT": "تومان",
    "TOMAN": "تومان",
    "TRY": "لیر",
}


# ── ابزارهای کوچک ───────────────────────────────────────────────────────────

def _now() -> _dt.datetime:
    return _dt.datetime.now(UTC)


def _fa(n: Any) -> str:
    """عدد با رقم‌های فارسی — جمله نباید وسطش جهت عوض کند."""
    return str(n).translate(_DIGITS)


def _money(value: float) -> str:
    """مبلغ با جداکنندهٔ فارسی. هرگز بدونِ نامِ ارز استفاده نمی‌شود."""
    return f"{value:,.0f}".translate(_DIGITS).replace(",", "٬")


def _cur_fa(code: str) -> str:
    return CURRENCY_FA.get((code or "").upper(), code or "")


def _pct(x: float) -> str:
    return f"{_fa(int(round(x * 100)))}٪"


def _scope(col, uid: int):
    """همان قاعدهٔ دامنهٔ کلِ برنامه: uid=0 ردیف‌های بی‌صاحبِ قدیمی را هم می‌بیند."""
    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


def _aware(value: Optional[_dt.datetime]) -> Optional[_dt.datetime]:
    """SQLite تاریخ را بی‌منطقه برمی‌گرداند و Postgres با منطقه؛ یک شکل کن."""
    if value is None:
        return None
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)


def _days_since(value: Optional[_dt.datetime], now: _dt.datetime) -> Optional[int]:
    aware = _aware(value)
    if aware is None:
        return None
    return max(0, (now - aware).days)


def _duration_fa(days: int) -> str:
    if days <= 0:
        return "امروز"
    if days < 60:
        return f"{_fa(days)} روز"
    months = days // 30
    if months < 12:
        return f"نزدیکِ {_fa(months)} ماه"
    return f"بیش از {_fa(months // 12)} سال"


def _month_key(year: int, month: int) -> str:
    return f"{year:04d}-{month:02d}"


def _shift_month(year: int, month: int, delta: int) -> Tuple[int, int]:
    total = year * 12 + (month - 1) + delta
    return total // 12, total % 12 + 1


def _type_fa(raw: Any) -> str:
    key = str(getattr(raw, "value", raw) or "other")
    return TYPE_FA.get(key, key)


# ── آدم‌ها ──────────────────────────────────────────────────────────────────

async def _people_facets(db: AsyncSession, uid: int) -> List[Facet]:
    """دو ادعا دربارهٔ آدم‌ها، هر دو پشتِ یک دروازه: لاگِ تعامل باید زنده باشد."""
    people = (
        await db.execute(select(Person).where(_scope(Person.user_id, uid)))
    ).scalars().all()
    if not people:
        return []

    by_id = {p.id: p for p in people}
    interactions = (
        await db.execute(
            select(Interaction).where(Interaction.person_id.in_(list(by_id.keys())))
        )
    ).scalars().all()

    now = _now()
    window_start = now - _dt.timedelta(days=CONTACT_WINDOW_DAYS)
    recent = [
        i for i in interactions
        if (_aware(i.date) is not None and _aware(i.date) >= window_start)
    ]
    # سکوت با نبودِ داده یکی نیست: با لاگِ نیمه‌جان، هر جمله‌ای دربارهٔ
    # «با چه کسانی در تماسی» ادعایی دربارهٔ جدولِ خالی است.
    if len(recent) < MIN_INTERACTIONS_WINDOW:
        return []

    facets: List[Facet] = []
    facet = _circle_facet(by_id, recent, len(people))
    if facet is not None:
        facets.append(facet)
    facet = _quiet_facet(db_people=by_id, interactions=interactions, now=now,
                         profiles=await _profiles(db, list(by_id.keys())))
    if facet is not None:
        facets.append(facet)
    return facets


async def _profiles(db: AsyncSession, person_ids: List[int]) -> Dict[int, PersonProfile]:
    rows = (
        await db.execute(
            select(PersonProfile).where(PersonProfile.person_id.in_(person_ids))
        )
    ).scalars().all()
    return {p.person_id: p for p in rows}


def _circle_facet(
    by_id: Dict[int, Person], recent: List[Interaction], total_people: int
) -> Optional[Facet]:
    """«با چه کسانی واقعاً در تماسی» — توصیف است، پس `NEUTRAL`."""
    if total_people < MIN_PEOPLE_FOR_CIRCLE:
        return None

    per_person: Dict[int, int] = {}
    per_type: Dict[str, int] = {}
    for i in recent:
        per_person[i.person_id] = per_person.get(i.person_id, 0) + 1
        label = _type_fa(i.type)
        per_type[label] = per_type.get(label, 0) + 1
    if not per_person:
        return None

    ranked = sorted(per_person.items(), key=lambda kv: (-kv[1], kv[0]))
    top_id, top_count = ranked[0]
    top_name = getattr(by_id.get(top_id), "name", "") or "یک نفر"
    contacted = len(ranked)

    statement = (
        f"در {_fa(CONTACT_WINDOW_DAYS)} روزِ گذشته با {_fa(contacted)} نفر از "
        f"{_fa(total_people)} نفری که ثبت کرده‌ای واقعاً در تماس بوده‌ای؛ "
        f"بیشترین رفت‌وآمدت با «{top_name}» بوده."
    )

    evidence: List[str] = [
        f"{_fa(len(recent))} تعامل در این بازه ثبت شده: "
        + "، ".join(
            f"{label} {_fa(count)}"
            for label, count in sorted(per_type.items(), key=lambda kv: -kv[1])
        )
        + "."
    ]
    if len(ranked) > 1:
        evidence.append(
            "پرتماس‌ترین‌ها: "
            + "، ".join(
                f"{getattr(by_id.get(pid), 'name', '') or '—'} ({_fa(count)})"
                for pid, count in ranked[:3]
            )
            + "."
        )
    silent = total_people - contacted
    if silent > 0:
        evidence.append(
            f"{_fa(silent)} نفرِ دیگر که ثبت کرده‌ای در این بازه هیچ تعاملی نداشته‌اند."
        )
    evidence.append(f"پرتماس‌ترین نفر {_fa(top_count)} بار در این بازه ثبت شده.")

    return Facet(
        key="world_contact_circle",
        title="دایرهٔ تماسِ واقعی",
        statement=statement,
        group=FacetGroup.WORLD.value,
        kind=Kind.MEASURED.value,
        tone=Tone.NEUTRAL.value,
        confidence=round(min(0.85, 0.40 + 0.02 * len(recent)), 2),
        evidence=evidence,
        source_label=SOURCE_PEOPLE,
        owns_page=PAGE_PEOPLE,
    )


def _quiet_facet(
    *,
    db_people: Dict[int, Person],
    interactions: List[Interaction],
    now: _dt.datetime,
    profiles: Dict[int, PersonProfile],
) -> Optional[Facet]:
    """رابطهٔ «نزدیک» که خوابیده → `WATCH`؛ همه‌شان زنده → `GOOD`."""
    close_ids = [
        pid for pid, prof in profiles.items()
        if effective_relationship(prof) == "close" and pid in db_people
    ]
    if not close_ids:
        return None

    last_seen: Dict[int, _dt.datetime] = {}
    for i in interactions:
        aware = _aware(i.date)
        if aware is None:
            continue
        if i.person_id not in last_seen or aware > last_seen[i.person_id]:
            last_seen[i.person_id] = aware

    quiet: List[Tuple[str, int, bool]] = []   # (نام، روز، هرگز تماسی نبوده)
    fresh: List[Tuple[str, int]] = []
    for pid in close_ids:
        name = getattr(db_people[pid], "name", "") or "—"
        if pid in last_seen:
            days = _days_since(last_seen[pid], now)
            if days is None:
                continue
            (quiet.append((name, days, False)) if days > QUIET_DAYS
             else fresh.append((name, days)))
            continue
        # هیچ تعاملی ثبت نشده: مبدأ، روزی است که خودش اضافه شده — وگرنه
        # کسی که دیروز اضافه شده «بی‌خبر مانده» شمرده می‌شود.
        since_added = _days_since(getattr(db_people[pid], "created_at", None), now)
        if since_added is not None and since_added > QUIET_DAYS:
            quiet.append((name, since_added, True))

    if not quiet and not fresh:
        return None

    close_count = len(close_ids)
    label = REL_FA.get("close", "نزدیک")

    if quiet:
        quiet.sort(key=lambda item: -item[1])
        name, days, never = quiet[0]
        if never:
            head = (
                f"با «{name}» که رابطه‌اش را {label} ثبت کرده‌ای هیچ تعاملی ثبت نشده، "
                f"و {_duration_fa(days)} است که در فهرستِ افرادت هست."
            )
        else:
            head = (
                f"با «{name}» که رابطه‌اش را {label} ثبت کرده‌ای "
                f"{_duration_fa(days)} است تماسی نداشته‌ای."
            )
        if len(quiet) > 1:
            head += f" {_fa(len(quiet) - 1)} نفرِ نزدیکِ دیگر هم همین‌طور مانده‌اند."
        evidence = [
            f"«{n}»: "
            + ("هیچ تعاملی ثبت نشده" if nev else f"آخرین تعامل {_duration_fa(d)} پیش")
            + "."
            for n, d, nev in quiet[:4]
        ]
        evidence.append(
            f"از {_fa(close_count)} نفری که {label} ثبت کرده‌ای، "
            f"{_fa(len(fresh))} نفر در {_fa(QUIET_DAYS)} روزِ گذشته تعامل داشته‌اند."
        )
        tone = Tone.WATCH.value
        statement = head
    else:
        fresh.sort(key=lambda item: item[1])
        name, days = fresh[0]
        statement = (
            f"با هر {_fa(close_count)} نفری که رابطه‌شان را {label} ثبت کرده‌ای در "
            f"{_fa(QUIET_DAYS)} روزِ گذشته در تماس بوده‌ای؛ تازه‌ترینش "
            f"{_duration_fa(days)} پیش با «{name}» بوده."
        )
        evidence = [
            f"«{n}»: آخرین تعامل {_duration_fa(d)} پیش." for n, d in fresh[:4]
        ]
        tone = Tone.GOOD.value

    return Facet(
        key="world_close_contact",
        title="رابطه‌های نزدیک",
        statement=statement,
        group=FacetGroup.WORLD.value,
        kind=Kind.MEASURED.value,
        tone=tone,
        confidence=round(min(0.85, 0.50 + 0.08 * close_count), 2),
        evidence=evidence,
        source_label=SOURCE_PEOPLE,
        owns_page=PAGE_PEOPLE,
    )


# ── پول ─────────────────────────────────────────────────────────────────────

def _dominant_currency(month_row: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """ارزی که بیشترین هزینه را در آن ماه دارد. هرگز جمعِ بین‌ارزی."""
    cells = [c for c in month_row.get("currencies", []) if (c.get("expense") or 0) > 0]
    if not cells:
        return None
    return max(cells, key=lambda c: c["expense"])


def _other_currency_note(month_row: Dict[str, Any], chosen: str) -> Optional[str]:
    others = [
        c for c in month_row.get("currencies", [])
        if c["currency"] != chosen and (c.get("expense") or 0) > 0
    ]
    if not others:
        return None
    return (
        "ارزهای دیگر جدا حساب شده‌اند (هیچ‌وقت با هم جمع نمی‌شوند): "
        + "، ".join(f"{_money(c['expense'])} {_cur_fa(c['currency'])}" for c in others)
        + "."
    )


def _by_category(cell: Dict[str, Any]) -> Dict[str, float]:
    return {c["category"]: float(c["amount"]) for c in cell.get("by_category", [])}


async def _money_facets(db: AsyncSession, uid: int) -> List[Facet]:
    report = await build_report(db, user_id=uid, months=6)
    if not report:
        return []

    now = _now()
    this_key = _month_key(now.year, now.month)
    prev_year, prev_month = _shift_month(now.year, now.month, -1)
    prev_key = _month_key(prev_year, prev_month)

    facets: List[Facet] = []
    facet = _shape_facet(report, this_key=this_key, prev_key=prev_key)
    if facet is not None:
        facets.append(facet)
    facet = _trend_facet(report, prev_key=prev_key)
    if facet is not None:
        facets.append(facet)
    return facets


def _shape_facet(
    report: List[Dict[str, Any]], *, this_key: str, prev_key: str
) -> Optional[Facet]:
    """«پولت کجا می‌رود» — توصیف است، پس `NEUTRAL`."""
    latest = report[-1]
    month = latest.get("month")
    if month == this_key:
        when = "تا اینجای این ماه"
    elif month == prev_key:
        when = "ماهِ گذشته"
    else:
        # پروندهٔ مالی بیات است؛ «اولویت‌هایت» از خرجِ چهار ماه پیش، ادعا نیست.
        return None

    cell = _dominant_currency(latest)
    if cell is None:
        return None
    total = float(cell["expense"])
    cats = _by_category(cell)
    named = {c: v for c, v in cats.items() if c != UNCATEGORISED and v > 0}
    if len(named) < MIN_NAMED_CATEGORIES:
        return None
    if sum(named.values()) < NAMED_MIN_SHARE * total:
        # بیشترِ خرج بی‌دسته است؛ «اولویت» را نمی‌دانیم و حدس نمی‌زنیم.
        return None

    ranked = sorted(named.items(), key=lambda kv: (-kv[1], kv[0]))
    top_cat, top_amount = ranked[0]
    cur = _cur_fa(cell["currency"])

    statement = (
        f"{when} بیشترِ خرجت در «{top_cat}» بوده — {_money(top_amount)} از "
        f"{_money(total)} {cur}، یعنی {_pct(top_amount / total)} از کلِ هزینه‌ات"
    )
    if len(ranked) > 1:
        statement += f"؛ بعد از آن «{ranked[1][0]}»."
    else:
        statement += "."

    evidence: List[str] = []
    if len(ranked) > 1:
        evidence.append(
            "دسته‌های بعدی: "
            + "، ".join(f"{c} ({_money(v)} {cur})" for c, v in ranked[1:4])
            + "."
        )
    unnamed = cats.get(UNCATEGORISED, 0.0)
    if unnamed > 0:
        evidence.append(f"{_money(unnamed)} {cur} هنوز بدونِ دسته ثبت شده.")
    income = float(cell.get("income") or 0)
    if income > 0:
        evidence.append(f"درآمدِ ثبت‌شدهٔ همین ماه {_money(income)} {cur} بوده.")
    note = _other_currency_note(latest, cell["currency"])
    if note:
        evidence.append(note)

    return Facet(
        key="world_spending_shape",
        title="شکلِ خرج",
        statement=statement,
        group=FacetGroup.WORLD.value,
        kind=Kind.MEASURED.value,
        tone=Tone.NEUTRAL.value,
        confidence=round(min(0.85, 0.45 + 0.08 * len(named)), 2),
        evidence=evidence,
        source_label=SOURCE_MONEY,
        owns_page=PAGE_MONEY,
    )


def _trend_facet(report: List[Dict[str, Any]], *, prev_key: str) -> Optional[Facet]:
    """دسته‌ای که بالا زده → `WATCH`؛ خرجِ کمتر از روال → `GOOD`؛ وگرنه `NEUTRAL`.

    فقط روی **ماهِ کاملِ گذشته**؛ ماهِ جاری ناتمام است و مقایسه‌اش با ماه‌های
    کامل، «کمتر خرج کرده‌ای»ِ دروغ می‌سازد.
    """
    index = {row.get("month"): row for row in report}
    reference = index.get(prev_key)
    if reference is None:
        return None
    cell = _dominant_currency(reference)
    if cell is None:
        return None
    currency = cell["currency"]
    cur = _cur_fa(currency)

    priors: List[Dict[str, Any]] = []
    for row in reversed(report):
        month = row.get("month")
        if month is None or month >= prev_key:
            continue
        match = next(
            (c for c in row.get("currencies", [])
             if c["currency"] == currency and (c.get("expense") or 0) > 0),
            None,
        )
        if match is not None:
            priors.append(match)
        if len(priors) >= MAX_PRIOR_MONTHS:
            break
    if len(priors) < MIN_PRIOR_MONTHS:
        return None

    n = len(priors)
    total = float(cell["expense"])
    prior_total_avg = sum(float(p["expense"]) for p in priors) / n
    cats = _by_category(cell)
    prior_cats: List[Dict[str, float]] = [_by_category(p) for p in priors]

    climbing: List[Tuple[str, float, float, bool]] = []  # (دسته، حالا، میانگین، تازه)
    for cat, amount in cats.items():
        if cat == UNCATEGORISED or amount < CATEGORY_MIN_SHARE * total:
            continue
        avg = sum(pc.get(cat, 0.0) for pc in prior_cats) / n
        if avg <= 0:
            if amount >= NEW_CATEGORY_SHARE * total:
                climbing.append((cat, amount, 0.0, True))
        elif amount >= TREND_RATIO * avg:
            climbing.append((cat, amount, avg, False))

    evidence: List[str] = [
        f"مقایسه با میانگینِ {_fa(n)} ماهِ پیش از آن، فقط در {cur} — "
        "ماهِ جاری چون ناتمام است وارد این مقایسه نشده."
    ]
    note = _other_currency_note(reference, currency)
    if note:
        evidence.append(note)

    if climbing:
        climbing.sort(key=lambda item: -(item[1] - item[2]))
        cat, amount, avg, is_new = climbing[0]
        if is_new:
            statement = (
                f"ماهِ گذشته «{cat}» به خرجت اضافه شده — {_money(amount)} {cur} که در "
                f"{_fa(n)} ماهِ پیش از آن اصلاً نداشتی."
            )
        else:
            statement = (
                f"خرجِ «{cat}» ماهِ گذشته از روالت بالا زده — {_money(amount)} {cur} در "
                f"برابرِ میانگینِ {_money(avg)} {cur} در {_fa(n)} ماهِ پیش از آن."
            )
        if len(climbing) > 1:
            statement += f" {_fa(len(climbing) - 1)} دستهٔ دیگر هم بالا رفته‌اند."
        for c, a, av, new in climbing[:4]:
            evidence.append(
                f"«{c}»: {_money(a)} {cur} در برابرِ "
                + ("نداشتنِ کامل" if new else f"میانگینِ {_money(av)} {cur}")
                + "."
            )
        tone = Tone.WATCH.value
    elif total <= CALM_RATIO * prior_total_avg:
        statement = (
            f"ماهِ گذشته هیچ دسته‌ای از خرجت از روالِ قبل بالا نزده و مجموعِ هزینه‌ات "
            f"{_pct(1 - total / prior_total_avg)} کمتر از میانگینِ {_fa(n)} ماهِ پیش "
            f"بوده — {_money(total)} در برابرِ {_money(prior_total_avg)} {cur}."
        )
        tone = Tone.GOOD.value
    else:
        statement = (
            f"الگوی خرجت ماهِ گذشته تقریباً همان روالِ {_fa(n)} ماهِ پیش بوده — "
            f"{_money(total)} در برابرِ میانگینِ {_money(prior_total_avg)} {cur}، "
            "بدونِ دسته‌ای که بالا زده باشد."
        )
        tone = Tone.NEUTRAL.value

    return Facet(
        key="world_spending_trend",
        title="روندِ خرج",
        statement=statement,
        group=FacetGroup.WORLD.value,
        kind=Kind.MEASURED.value,
        tone=tone,
        confidence=round(min(0.85, 0.45 + 0.10 * n), 2),
        evidence=evidence,
        source_label=SOURCE_MONEY,
        owns_page=PAGE_MONEY,
    )


# ── گردآوری ─────────────────────────────────────────────────────────────────

_PARTS = (
    ("people", _people_facets),
    ("money", _money_facets),
)


async def _collect(db: AsyncSession, uid: int) -> Optional[List[Facet]]:
    facets: List[Facet] = []
    for name, builder in _PARTS:
        try:
            built = await builder(db, uid)
        except Exception as exc:
            # مهار می‌شود تا یک بخش بقیه را زمین نزند — ولی **ساکت نیست**.
            logger.warning("owner-insight world: %s failed: %r", name, exc)
            continue
        facets.extend(built or [])
    # «نمی‌دانم» جوابِ درستی است؛ کارتِ توخالی نمی‌سازیم.
    return facets or None


register(
    Provider(
        key="world",
        label="آدم‌ها و پول (تماس‌های واقعی و شکلِ خرج)",
        # هر کارت `owns_page`ِ خودش را دارد (افراد → /people-profiles،
        # پول → /budget)؛ این یکی درِ پیش‌فرضِ خودِ منبع است.
        owns_page=PAGE_PEOPLE,
        collect=_collect,
        group_order=60,
    )
)
