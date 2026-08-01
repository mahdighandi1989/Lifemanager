"""پشتکار و علاقه‌ها — همان دو فیلدی که مالک روی «من که هستم» دید و عصبانی شد.

چه چیزی خراب بود
================
صفحهٔ قبلی زیرِ عنوانِ «نقاط قوت» می‌نوشت «شاخص پشتکار ۱۰/۱۰۰». سه خطای
جداگانه در یک رشته:

1. یک **عدد** به‌جای یک **جمله** — عدد به‌تنهایی دربارهٔ آدم چیزی نمی‌گوید.
2. هیچ **آستانه‌ای** نداشت، پس نمرهٔ ۱۰ (که خبرِ بدی است) زیرِ «نقاط قوت»
   می‌نشست. اینجا `tone` روی مقدار شاخه می‌خورَد و نمرهٔ پایین `WATCH` است.
3. `compute_diligence` یک پرچمِ `has_signal` برمی‌گرداند و کدِ قبلی نادیده‌اش
   می‌گرفت، پس روی پایگاه‌دادهٔ خالی هم «۰/۱۰۰» چاپ می‌کرد. اینجا نبودِ سیگنال
   یعنی **هیچ کارتی ساخته نمی‌شود** و رابط به‌جایش از مالک می‌پرسد.

علاقه‌ها هم همین‌طور مرده بود: کدِ قبلی کلیدهای `name`/`topic` را حدس زده بود،
حال آنکه `compute_interests` کلیدهای `category`/`score`/`terms` می‌دهد؛ یک
`except` هم صدای خطا را می‌خورد و نتیجه برای همیشه `[]` می‌ماند. هر کلیدی که
اینجا خوانده می‌شود مستقیماً از `app/services/self_model_service.py` تأیید شده
و تست‌های `tests/test_owner_insight_self_model.py` مسیرِ موفق را واقعاً اجرا
می‌کنند تا چنین غلطِ املایی‌ای دوباره پنهان نماند.

این ماژول چیزی ذخیره نمی‌کند؛ فقط آنچه «خودنگاره» (/self-portrait) از قبل
می‌داند را به جمله تبدیل می‌کند و درِ ورودی به همان صفحه می‌گذارد.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.owner_insight import register
from app.services.owner_insight.base import Facet, FacetGroup, Kind, Provider, Tone

logger = logging.getLogger(__name__)

PAGE = "/self-portrait"          # در frontend/src/lib/routesMeta.js موجود است
SOURCE = "خودنگاره — از فرمان‌ها، کارها، فهرست‌ها و نوشته‌های خودت"

# ── آستانه‌های پشتکار ────────────────────────────────────────────────────────
# `score` تقریباً میانگینِ نرخِ پایبندی در سه حوزه است (فرمان/کار/فهرست)، به‌علاوهٔ
# حداکثر +۱۰ بابتِ بلندترین زنجیره و منهای حداکثر −۱۵ بابتِ کارهای سررسیدگذشته.
# پس:
#   ≥ ۶۵  یعنی از هر سه چیزی که به گردن گرفته حدوداً دو تا را نگه داشته → خبرِ خوب.
#   < ۴۰  یعنی کمتر از نیمی — خبرِ بد است و باید صریح گفته شود.
#   بینِ این دو خنثی است؛ نه تعریف، نه هشدار.
GOOD_AT = 65
WATCH_BELOW = 40

# دو حوزه از سه حوزه لازم است تا «نرخ» معنا بدهد. یک تسکِ بازِ تنها هم
# `has_signal` را روشن می‌کند ولی هنوز «پشتکار» نیست — همان «نمی‌دانم»ی که
# مالک خواست به‌جای عددِ بی‌معنا گفته شود. زنجیرهٔ بلند به‌تنهایی هم شاهدِ
# کافیِ پیوستگی است.
MIN_RATE_DIMENSIONS = 2
MIN_STREAK_ALONE = 3

# ── آستانهٔ علاقه ────────────────────────────────────────────────────────────
# `score` یک دسته، جمعِ تکرارِ واژه‌هایی است که دستِ‌کم دو بار آمده‌اند. زیرِ ۶
# یعنی یک یادداشتِ کوتاه دو بار یک کلمه را تکرار کرده — این «علاقه» نیست.
MIN_INTEREST_SCORE = 6

_CATEGORY_FA = {
    "technology": "فناوری و برنامه‌نویسی",
    "sport": "ورزش",
    "art": "هنر",
    "reading": "کتاب و یادگیری",
    "cooking": "آشپزی",
    "travel": "سفر",
    "finance": "پول و سرمایه",
}

_RATE_FA = {
    "directive_rate": "فرمان‌هایی که برای خودت گذاشته‌ای",
    "task_rate": "کارهایت",
    "todo_rate": "قلم‌های فهرست‌هایت",
}

_DIGITS = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")


def _fa(n: Any) -> str:
    """عدد را با رقم‌های فارسی بنویس — جمله نباید وسطش جهت عوض کند."""
    return str(n).translate(_DIGITS)


def _pct(rate: float) -> str:
    return f"{_fa(int(round(rate * 100)))}٪"


def _rates(d: Dict[str, Any]) -> List[Tuple[str, float]]:
    """(کلید، نرخ) برای حوزه‌هایی که واقعاً داده دارند."""
    out: List[Tuple[str, float]] = []
    for key in ("directive_rate", "task_rate", "todo_rate"):
        val = d.get(key)
        if val is not None:
            out.append((key, float(val)))
    return out


def _diligence_facet(d: Dict[str, Any]) -> Optional[Facet]:
    """یک جملهٔ صادقانه دربارهٔ پشتکار، یا هیچ."""
    # ۱) پرچمِ خودِ سرویس. کدِ قبلی همین را رد کرد و «۰/۱۰۰» چاپ کرد.
    if not d.get("has_signal"):
        return None

    rates = _rates(d)
    best_streak = int(d.get("best_streak") or 0)
    if len(rates) < MIN_RATE_DIMENSIONS and best_streak < MIN_STREAK_ALONE:
        return None

    score = int(d.get("score") or 0)
    overdue = int(d.get("overdue") or 0)
    graduated = int(d.get("graduated") or 0)
    trend = str(d.get("trend") or "").strip()

    weakest_key, weakest_rate = min(rates, key=lambda kv: kv[1]) if rates else ("", 0.0)
    weakest_fa = _RATE_FA.get(weakest_key, "تعهدهایت")

    if score >= GOOD_AT:
        tone = Tone.GOOD.value
        parts = ["پشتکارت این دوره خوب بوده — بیشترِ چیزی که به گردن گرفته‌ای را تا آخر برده‌ای"]
        if best_streak >= 2:
            parts.append(f"بلندترین زنجیرهٔ پیوستگی‌ات {_fa(best_streak)} روز بوده")
        if graduated:
            parts.append(f"{_fa(graduated)} فرمان هم در تو نهادینه شده و دیگر یادآوری نمی‌خواهد")
        statement = "؛ ".join(parts) + "."
    elif score < WATCH_BELOW:
        tone = Tone.WATCH.value
        kept = int(round(weakest_rate * 10))
        head = (
            "پشتکارت این دوره پایین بوده؛ بیشترین افت از "
            f"{weakest_fa} است — از هر ۱۰ تا حدود {_fa(kept)} تا را نگه داشته‌ای"
        )
        statement = head + (
            f"، و {_fa(overdue)} کار هم از سررسید گذشته و باز مانده." if overdue else "."
        )
    else:
        tone = Tone.NEUTRAL.value
        statement = (
            "پشتکارت این دوره متوسط بوده — نه رهایش کرده‌ای نه تا آخر برده‌ای؛ "
            f"ضعیف‌ترین بخش {weakest_fa} است."
        )

    evidence: List[str] = []
    for key, rate in rates:
        evidence.append(f"از {_RATE_FA[key]} {_pct(rate)} را انجام داده‌ای.")
    if overdue:
        evidence.append(f"{_fa(overdue)} کار از سررسید گذشته و هنوز باز است.")
    if best_streak:
        evidence.append(f"بلندترین زنجیرهٔ پیوستگی‌ات {_fa(best_streak)} روز بوده.")
    if graduated:
        evidence.append(f"{_fa(graduated)} فرمان در تو نهادینه شده است.")
    if trend:
        evidence.append(f"روندِ انجامِ کارها نسبت به ماهِ پیش {trend} است.")

    # هرچه حوزه‌های بیشتری داده داشته باشند، ادعا محکم‌تر است.
    confidence = round(min(0.9, 0.4 + 0.2 * len(rates)), 2)

    return Facet(
        key="self_model_diligence",
        title="پشتکار و پایبندی",
        statement=statement,
        group=FacetGroup.HABITS.value,
        kind=Kind.MEASURED.value,
        tone=tone,
        confidence=confidence,
        evidence=evidence,
        source_label=SOURCE,
        owns_page=PAGE,
    )


def _interests_facet(data: Dict[str, Any]) -> Optional[Facet]:
    """کلیدها از `compute_interests` تأیید شده‌اند: categories/top_terms،
    و هر دسته category/score/terms — نه `name`، نه `topic`."""
    categories = data.get("categories") or []
    if not categories:
        return None
    top = categories[: 3]
    if int(top[0].get("score") or 0) < MIN_INTEREST_SCORE:
        return None

    names = [_CATEGORY_FA.get(c.get("category"), c.get("category") or "") for c in top]
    names = [n for n in names if n]
    if not names:
        return None

    lead_terms = [t for t in (top[0].get("terms") or []) if t][:3]
    statement = (
        f"بیشترِ چیزی که می‌نویسی و برای خودت کار تعریف می‌کنی حولِ {'، '.join(names)} می‌چرخد"
    )
    if lead_terms:
        statement += f"؛ پرتکرارترین واژه‌هایت {'، '.join(lead_terms)} هستند."
    else:
        statement += "."

    evidence: List[str] = []
    for c in top:
        fa = _CATEGORY_FA.get(c.get("category"), c.get("category") or "")
        terms = [t for t in (c.get("terms") or []) if t][:4]
        if terms:
            evidence.append(f"نشانه‌های «{fa}» در متن‌هایت: {'، '.join(terms)}.")
        else:
            evidence.append(f"«{fa}» در متن‌هایت تکرار شده است.")
    evidence.append("این برداشت از نوشته‌ها، کارها، فهرست‌ها و فرمان‌های خودت درآمده، نه از یک مدلِ بیرونی.")

    return Facet(
        key="self_model_interests",
        title="علاقه‌ها و چیزی که ذهنت را می‌گیرد",
        statement=statement,
        group=FacetGroup.SELF.value,
        kind=Kind.INFERRED.value,
        tone=Tone.NEUTRAL.value,
        confidence=round(min(0.85, 0.35 + 0.05 * len(categories)), 2),
        evidence=evidence,
        source_label=SOURCE,
        owns_page=PAGE,
    )


async def _collect(db: AsyncSession, uid: int) -> Optional[List[Facet]]:
    from app.services import self_model_service as sms

    facets: List[Facet] = []

    # هر محاسبه جدا مهار می‌شود تا خرابیِ یکی دیگری را نخورد — ولی هیچ‌کدام
    # بی‌صدا نیست: خطا در سطحِ warning ثبت می‌شود، چون همان `except`ِ ساکت بود
    # که سه فیلدِ مرده را ماه‌ها زنده نشان داد.
    try:
        diligence = await sms.compute_diligence(db, uid)
    except Exception as exc:
        logger.warning("owner-insight self_model: compute_diligence failed: %r", exc)
        diligence = None
    if diligence:
        facet = _diligence_facet(diligence)
        if facet:
            facets.append(facet)

    try:
        interests = await sms.compute_interests(db, uid)
    except Exception as exc:
        logger.warning("owner-insight self_model: compute_interests failed: %r", exc)
        interests = None
    if interests:
        facet = _interests_facet(interests)
        if facet:
            facets.append(facet)

    # «نمی‌دانم» جوابِ درستی است — کارتِ خالی نمی‌سازیم.
    return facets or None


register(
    Provider(
        key="self_model",
        label="خودنگاره (پشتکار و علاقه‌ها)",
        owns_page=PAGE,
        collect=_collect,
        group_order=30,
    )
)
