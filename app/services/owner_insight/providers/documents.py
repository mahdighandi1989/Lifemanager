"""واقعیت‌های سختِ هویتی — از روی خودِ مدارک، زنده خوانده می‌شوند.

این منبع چهار چیز را می‌گوید که «سند» پشتشان است و نه استنباط: نام آن‌طور که
روی مدرک نوشته شده، تاریخ تولد، ملیت، و عنوانِ شغلی/کفیلِ ویزا. منبعِ داده دو
جدولِ موجود است — ``uae_driving_licenses`` و ``identity_documents`` — و
**هیچ‌چیز اینجا ذخیره یا رونویسی نمی‌شود**؛ هر بار از همان جایی خوانده می‌شود
که صفحهٔ «پروندهٔ زندگی» صاحبش است.

سه اصلاحِ صریح نسبت به نسخهٔ قبل (ممیزیِ ۲۰۲۶-۰۸-۰۱)
--------------------------------------------------
1. **نام، بدونِ ادعای اضافه.** قبلاً همان املای لاتینِ تمام‌بزرگِ گذرنامه
   («MOHAMMAD MEHDI …») به‌عنوانِ «نامِ او» نشان داده می‌شد، بی هیچ اشاره‌ای
   به اینکه این نوشتهٔ روی سند است. حالا خودِ جمله می‌گوید این املای روی کدام
   مدرک است، و اگر مدرکِ دیگری املای دیگری دارد همان‌جا به‌عنوان شاهد می‌آید.
2. **محلِ زندگی اینجا اصلاً تولید نمی‌شود.** استخراجِ قبلی وقتی مکانِ واقعی
   نداشت، ``identity_documents.issue_place`` — یعنی امارتی که مدرک آنجا *صادر*
   شده — را به‌عنوان «محلِ زندگی» می‌فروخت. آن یک حدسِ اشتباه بود که شکلِ
   واقعیت داشت. صاحبِ «کجا زندگی می‌کنم» منبعِ مکان است، نه این منبع؛ اگر
   شاهدی نباشد، اینجا سکوت می‌کند.
3. **شغل و کفیل، با برچسبِ درست.** ``profession`` و ``sponsor`` عنوان و کفیلِ
   *حقوقیِ ویزا* هستند. جمله همین را می‌گوید و ادعا نمی‌کند که او واقعاً هر روز
   این کار را می‌کند.

ترتیبِ اعتماد همان ترتیبِ قبلی است: گواهینامهٔ رانندگی (دوزبانه و ماشین‌خوان)
جلوتر از کارتِ هویت. اگر هیچ مدرکی ثبت نشده باشد، این منبع ``None`` برمی‌گرداند
تا رابط به‌جای ساختنِ جملهٔ توخالی، از مالک بپرسد.
"""
from __future__ import annotations

import logging
from datetime import date, datetime, timezone
from typing import Any, List, Optional, Tuple

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.owner_insight import register
from app.services.owner_insight.base import Facet, FacetGroup, Kind, Provider, Tone
# همان تاریخ‌خوانِ «۰۸ Mar ۱۹۸۹»ی که مسیرِ هویت از قبل دارد — دو پیاده‌سازیِ
# موازیِ تاریخ یعنی دو رفتارِ متفاوت برای یک رشته.
from app.services.owner_identity_service import parse_loose_date

logger = logging.getLogger(__name__)

PAGE = "/life-file"

_LICENCE_LABEL = "گواهینامهٔ رانندگیِ امارات"
_ID_LABEL = "کارتِ هویتِ امارات"

_FA_DIGITS = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")
_MONTHS_FA = (
    "ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوئن",
    "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر",
)
# فقط برای خواناتر شدنِ جمله. هر مقداری که اینجا نباشد **همان‌طور که هست** و
# داخلِ گیومه نشان داده می‌شود؛ ترجمهٔ حدسی ممنوع.
_NATIONALITY_FA = {
    "IRAN": "ایران",
    "IRANIAN": "ایران",
    "IRN": "ایران",
    "ISLAMIC REPUBLIC OF IRAN": "ایران",
    "UAE": "امارات متحدهٔ عربی",
    "UNITED ARAB EMIRATES": "امارات متحدهٔ عربی",
    "EMIRATI": "امارات متحدهٔ عربی",
}


def _fa(value: Any) -> str:
    return str(value).translate(_FA_DIGITS)


def _clean(value: Any) -> str:
    return str(value or "").strip()


def _scope(col, uid: int):
    """دادهٔ قدیمی ``user_id IS NULL`` دارد؛ در دامنهٔ ناشناس هم دیده می‌شود."""
    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


def _fmt_date_fa(value: date) -> str:
    return f"{_fa(value.day)} {_MONTHS_FA[value.month - 1]} {_fa(value.year)}"


def _age_years(born: date) -> Optional[int]:
    today = datetime.now(timezone.utc).date()
    years = today.year - born.year - ((today.month, today.day) < (born.month, born.day))
    return years if 0 < years < 130 else None


async def _licences(db: AsyncSession, uid: int) -> List[Any]:
    from app.models.uae_license import UAEDrivingLicenseRecord

    rows = await db.execute(
        select(UAEDrivingLicenseRecord)
        .where(_scope(UAEDrivingLicenseRecord.user_id, uid))
        .order_by(UAEDrivingLicenseRecord.id.desc())
    )
    return list(rows.scalars().all())


async def _docs(db: AsyncSession, uid: int) -> List[Any]:
    from app.models.identity_document import IdentityDocument

    rows = await db.execute(
        select(IdentityDocument)
        .where(_scope(IdentityDocument.user_id, uid))
        .order_by(IdentityDocument.id.desc())
    )
    return list(rows.scalars().all())


def _first(rows: List[Any], attr: str) -> Tuple[Any, Any]:
    """اولین ردیفی که این ستون را پر دارد، همراه با خودِ مقدار."""
    for row in rows:
        value = getattr(row, attr, None)
        if isinstance(value, str):
            value = value.strip()
        if value:
            return row, value
    return None, None


# ── ادعاها ─────────────────────────────────────────────────────────────────

def _name_facet(licences: List[Any], docs: List[Any]) -> Optional[Facet]:
    """نام، با گفتنِ اینکه این «نوشتهٔ روی کدام سند» است."""
    _, lic_en = _first(licences, "name_en")
    _, lic_ar = _first(licences, "name_ar")
    _, doc_name = _first(docs, "full_name")

    if lic_en:
        chosen, source, confidence = lic_en, _LICENCE_LABEL, 0.95
        where = "روی گواهینامهٔ رانندگیِ امارات"
    elif lic_ar:
        chosen, source, confidence = lic_ar, _LICENCE_LABEL, 0.9
        where = "روی گواهینامهٔ رانندگیِ امارات (املای عربی)"
    elif doc_name:
        chosen, source, confidence = doc_name, _ID_LABEL, 0.9
        where = "روی کارتِ هویتِ امارات"
    else:
        return None

    evidence = [f"از {source} که در پروندهٔ زندگی ثبت شده."]
    for other in (lic_ar, doc_name, lic_en):
        if other and other != chosen:
            evidence.append(f"املای دیگری که در مدارکت ثبت شده: «{other}».")
    # املاهای تکراری حذف، ترتیب حفظ.
    seen, unique = set(), []
    for item in evidence:
        if item not in seen:
            seen.add(item)
            unique.append(item)

    return Facet(
        key="doc_full_name",
        title="نامِ روی مدارک",
        statement=(
            f"نامت {where} این‌طور نوشته شده: «{chosen}» — این املای خودِ سند "
            f"است، نه لزوماً شکلی که خودت اسمت را می‌نویسی."
        ),
        group=FacetGroup.FACTS.value,
        kind=Kind.FACT.value,
        tone=Tone.NEUTRAL.value,
        confidence=confidence,
        evidence=unique[:4],
        source_label=source,
        owns_page=PAGE,
    )


def _dob_facet(licences: List[Any], docs: List[Any]) -> Optional[Facet]:
    lic_row, lic_dob = _first(licences, "date_of_birth")
    doc_row, doc_dob = _first(docs, "date_of_birth")

    if lic_dob is not None:
        raw, source, confidence = lic_dob, _LICENCE_LABEL, 0.97
    elif doc_dob is not None:
        raw, source, confidence = doc_dob, _ID_LABEL, 0.93
    else:
        return None

    parsed = parse_loose_date(raw)
    if parsed is None:
        # تاریخِ ناخوانا هم یک واقعیتِ ثبت‌شده است؛ فقط سن از آن درنمی‌آید.
        statement = f"طبقِ {source}، تاریخِ تولدت «{_clean(raw)}» ثبت شده است."
        evidence = [f"همان‌طور که روی {source} نوشته شده: {_clean(raw)}."]
    else:
        pretty = _fmt_date_fa(parsed)
        age = _age_years(parsed)
        if age is None:
            statement = f"طبقِ {source}، تاریخِ تولدت {pretty} است."
        else:
            statement = f"طبقِ {source}، تاریخِ تولدت {pretty} است — الان {_fa(age)} سالت است."
        evidence = [f"از {source} خوانده شد؛ سن از همین تاریخ حساب می‌شود."]

    return Facet(
        key="doc_date_of_birth",
        title="تاریخ تولد",
        statement=statement,
        group=FacetGroup.FACTS.value,
        kind=Kind.FACT.value,
        tone=Tone.NEUTRAL.value,
        confidence=confidence,
        evidence=evidence,
        source_label=source,
        owns_page=PAGE,
    )


def _nationality_facet(licences: List[Any], docs: List[Any]) -> Optional[Facet]:
    _, lic_nat = _first(licences, "nationality")
    _, doc_nat = _first(docs, "nationality")

    if lic_nat:
        raw, source, confidence = lic_nat, _LICENCE_LABEL, 0.95
    elif doc_nat:
        raw, source, confidence = doc_nat, _ID_LABEL, 0.9
    else:
        return None

    known = _NATIONALITY_FA.get(raw.upper())
    shown = known or f"«{raw}»"
    return Facet(
        key="doc_nationality",
        title="ملیت",
        statement=f"در مدارکِ رسمی‌ات ملیتت {shown} ثبت شده است.",
        group=FacetGroup.FACTS.value,
        kind=Kind.FACT.value,
        tone=Tone.NEUTRAL.value,
        confidence=confidence,
        evidence=[f"روی {source} نوشته شده: {raw}."],
        source_label=source,
        owns_page=PAGE,
    )


def _visa_facet(docs: List[Any]) -> Optional[Facet]:
    """عنوانِ شغلی و کفیلِ ویزا — و صراحتاً نه «کاری که واقعاً می‌کنی»."""
    _, profession = _first(docs, "profession")
    _, sponsor = _first(docs, "sponsor")

    if profession and sponsor:
        statement = (
            f"روی ویزای اقامتت عنوانِ شغلی «{profession}» و کفیل «{sponsor}» ثبت "
            f"شده — این عنوان و کفیلِ حقوقیِ ویزاست، نه شرحِ کاری که واقعاً هر "
            f"روز انجام می‌دهی."
        )
    elif profession:
        statement = (
            f"روی ویزای اقامتت عنوانِ شغلی «{profession}» ثبت شده — این عنوانِ "
            f"حقوقیِ ویزاست، نه شرحِ کاری که واقعاً هر روز انجام می‌دهی."
        )
    elif sponsor:
        statement = (
            f"کفیلِ ویزای اقامتت «{sponsor}» ثبت شده — یعنی اقامتت حقوقاً به این "
            f"کارفرما وصل است؛ این ادعایی دربارهٔ کارِ واقعی‌ات نیست."
        )
    else:
        return None

    evidence = [f"از بخشِ اطلاعاتِ ویزا در {_ID_LABEL}."]
    return Facet(
        key="doc_visa_job",
        title="شغل و کفیلِ ویزا",
        statement=statement,
        group=FacetGroup.FACTS.value,
        kind=Kind.FACT.value,
        tone=Tone.NEUTRAL.value,
        confidence=0.9,
        evidence=evidence,
        source_label=_ID_LABEL,
        owns_page=PAGE,
    )


async def _collect(db: AsyncSession, uid: int) -> Optional[List[Facet]]:
    try:
        licences = await _licences(db, uid)
        docs = await _docs(db, uid)
    except Exception as exc:  # noqa: BLE001 — بلعیده نمی‌شود: لاگ + غیبتِ صادقانه
        logger.warning("owner-insight documents provider could not read documents: %r", exc)
        return None

    if not licences and not docs:
        return None

    facets = [
        f
        for f in (
            _name_facet(licences, docs),
            _dob_facet(licences, docs),
            _nationality_facet(licences, docs),
            _visa_facet(docs),
        )
        if f is not None
    ]
    # ردیفِ خالی (مثلاً گواهینامه‌ای که فقط شماره دارد) ادعایی نمی‌سازد.
    return facets or None


register(
    Provider(
        key="documents",
        label="مدارکِ هویتی",
        owns_page=PAGE,
        collect=_collect,
        group_order=10,
    )
)
