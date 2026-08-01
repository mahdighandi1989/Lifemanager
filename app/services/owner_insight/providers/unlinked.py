"""داده‌هایی که هنوز وصل نیستند — سیاههٔ صادقانهٔ انبارهای مردهٔ پروفایل.

چرا این منبع وجود دارد
======================
مالک پرسید پیش از آنکه تصمیم بگیرد کدام انبارِ خوابیده را وصل کند، **ببیند**
داخلشان چیست. این منبع دقیقاً همان جواب است و کارش گزارش‌کردن است، نه تعریف
کردن: هر انباری که محتوا دارد ولی هیچ صفحه‌ای نشانش نمی‌دهد یک خبرِ بد است
(`Tone.WATCH`) — دادهٔ او جایی افتاده که خودش هرگز نمی‌بیندش. انباری که خالی
است خبرِ بد نیست (`Tone.NEUTRAL`)، ولی باز هم گفته می‌شود، چون «خالی بودن»
هم بخشی از همان تصویری است که خواسته بود.

این تنها منبعی است که روی دادهٔ کم هم حرف می‌زند؛ بقیه باید سکوت کنند. با این
حال یک مرزِ روشن دارد: اگر **اصلاً ردی از مالک در پایگاه‌داده نباشد** (نه سطرِ
کاربری، نه هیچ ارزیابی‌ای) این منبع هم `None` برمی‌گرداند — دربارهٔ سطری که
وجود ندارد نمی‌شود گفت «خالی است»؛ آن ادعا هم ساختنِ خبر از هیچ است.

آنچه پیش از نوشتنِ این فایل راستی‌آزمایی شد (نه حدس)
====================================================
* ``users.bio`` و ``users.display_name``: فقط ``POST /api/users/profile``
  می‌نویسدشان (app/routes/users.py:90)؛ هیچ فایلی در ``frontend/src`` این
  مسیر را صدا نمی‌زند و ``UserPublic`` (app/schemas/user_schema.py:38) اصلاً
  این دو ستون را در خروجی ندارد. یعنی صفر پیکسل.
* ``users.interests``: تنها نویسنده‌اش
  ``interest_identification_service.py:108`` است و هیچ خواننده‌ای ندارد.
* ``users.personality_traits``: تنها نویسنده‌اش ``personality_service.py:130``
  است (یک رونوشت کنارِ تحلیلِ اصلی)؛ صفحهٔ «شخصیت» نسخهٔ اصلی را از جدولِ
  ``personality_assessments`` می‌خواند، نه از این ستون.
* ``users.mood_patterns``: نه نویسنده دارد نه خواننده.
* ``ai_assessments``: از میانِ ``assessment_type``ها فقط دو تا در برنامه دیده
  می‌شوند — ``self_model`` روی «خودنگاره» (``/ai/self_model``) و ``sahat_map``
  روی «نقشهٔ خداشهر» (``/sahat/map``). بقیه (``holistic_profile``،
  ``sentiment`` و هر نوعِ تازه) فقط API دارند و هیچ صفحه‌ای ندارند.
* ``personality_assessments``: **وصل است** — ``PersonalityProfilePage`` آن را
  از ``/ai/personality/profile`` می‌گیرد. پس اگر سطر داشته باشد اینجا با لحنِ
  خنثی و با تصریحِ همین وصل‌بودن گزارش می‌شود؛ چپاندنش زیرِ «وصل نیست» همان‌قدر
  دروغ بود که «شاخص پشتکار ۱۰/۱۰۰» زیرِ «نقاط قوت».

هیچ محتوایی اینجا ساخته نمی‌شود: هر چیزی که در جمله می‌آید عیناً از همان ستون
خوانده شده و فقط کوتاه شده است. این ماژول چیزی نمی‌نویسد و چیزی پاک نمی‌کند.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Sequence, Tuple

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.owner_insight import register
from app.services.owner_insight.base import Facet, FacetGroup, Kind, Provider, Tone

logger = logging.getLogger(__name__)

# صاحبِ این گزارش «نقشهٔ سیستم» است: همان صفحه‌ای که نشان می‌دهد چه چیزی به چه
# چیزی وصل است. مسیر در frontend/src/lib/routesMeta.js موجود است.
PAGE = "/system-map"
SOURCE = "خواندنِ زندهٔ ستون‌های پروفایلِ users و جدول‌های ارزیابی"

_MAX_TEXT = 120          # طولِ پیش‌نمایشِ متنِ بلند
_MAX_SCALAR = 40         # طولِ هر قلمِ داخلِ فهرست/دیکشنری
_MAX_KEYS = 4            # چند کلید از یک دیکشنری در جمله بیاید

# assessment_typeهایی که واقعاً یک صفحه صاحبشان است (راستی‌آزمایی‌شده).
_SURFACED_ASSESSMENT_TYPES: Dict[str, str] = {
    "self_model": "خودنگاره",
    "sahat_map": "نقشهٔ خداشهر",
}

_DIGITS = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")


def _fa(n: Any) -> str:
    """عدد با رقم‌های فارسی — جمله نباید وسطش جهت عوض کند."""
    return str(n).translate(_DIGITS)


def _fa_num(value: Any) -> str:
    if isinstance(value, bool):
        return "بله" if value else "خیر"
    if isinstance(value, float):
        return _fa(f"{round(value, 2):g}").replace(".", "٫")
    return _fa(value)


# ── تشخیصِ «خالی» ────────────────────────────────────────────────────────────
# بازگشتی است چون یک ستونِ JSON می‌تواند ظاهراً پر باشد و باطناً هیچ‌چیز نداشته
# باشد: ``{"verified": []}`` دقیقاً همان چیزی است که سرویسِ علاقه‌ها وقتی چیزی
# پیدا نمی‌کند می‌نویسد. اگر آن را «محتوا» بشماریم، این کارت هم مثل «شاخص
# پشتکار ۱۰/۱۰۰» خبرِ توخالی می‌سازد.
def _is_empty(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        return not value.strip()
    if isinstance(value, dict):
        return not value or all(_is_empty(v) for v in value.values())
    if isinstance(value, (list, tuple, set)):
        return not value or all(_is_empty(v) for v in value)
    return False  # عدد و بولین محتوا هستند — نمرهٔ ۰٫۰ هم یک نمره است


def _scalar(value: Any) -> str:
    if isinstance(value, (int, float, bool)):
        return _fa_num(value)
    text = " ".join(str(value).split())
    return text[:_MAX_SCALAR].rstrip() + "…" if len(text) > _MAX_SCALAR else text


def _inline(value: Any) -> str:
    """یک قلم در دلِ ظرفِ دیگر. ظرفِ تودرتو باز می‌شود، نه اینکه ``str()`` شود:
    ``str(['برنامه‌نویسی', 'کتاب'])`` همان dumpِ خامی است که قرار بود نباشد."""
    if isinstance(value, (dict, list, tuple, set)):
        return _preview(value)
    return _scalar(value)


def _preview(value: Any) -> str:
    """پیش‌نمایشِ کوتاه و وفادار از محتوای واقعی — بدونِ dumpِ JSON."""
    if isinstance(value, str):
        text = " ".join(value.split())
        if len(text) > _MAX_TEXT:
            text = text[:_MAX_TEXT].rstrip() + "…"
        return f"«{text}»"

    if isinstance(value, dict):
        items = [(k, v) for k, v in value.items() if not _is_empty(v)]
        shown = ["{}: {}".format(k, _inline(v)) for k, v in items[:_MAX_KEYS]]
        out = "، ".join(shown)
        if len(items) > _MAX_KEYS:
            out += f" و {_fa(len(items) - _MAX_KEYS)} کلیدِ دیگر"
        return out

    if isinstance(value, (list, tuple, set)):
        items = [v for v in value if not _is_empty(v)]
        shown = [_inline(v) for v in items[:_MAX_KEYS]]
        out = "، ".join(shown)
        if len(items) > _MAX_KEYS:
            out += f" و {_fa(len(items) - _MAX_KEYS)} قلمِ دیگر"
        return out

    return _scalar(value)


# ── سیاههٔ ستون‌های پروفایلِ users ────────────────────────────────────────────
# (نامِ صفت روی مدل، کلیدِ facet، عنوان، نامِ ستون، آغازِ جمله، دلیلِ وصل‌نبودن)
# هر «دلیل» از روی کدِ واقعی نوشته شده — بالای فایل مرجع‌هایش آمده است.
_USER_STORES: Sequence[Tuple[str, str, str, str, str, str]] = (
    (
        "bio",
        "unlinked_users_bio",
        "متنِ معرفیِ خودت",
        "users.bio",
        "یک متنِ معرفی از خودت",
        "هیچ صفحه‌ای در برنامه آن را نشان نمی‌دهد؛ تنها راهِ نوشتنش «POST /api/users/profile» "
        "است که هیچ صفحه‌ای صدایش نمی‌زند، و خروجیِ کاربر (UserPublic) اصلاً این ستون را ندارد",
    ),
    (
        "display_name",
        "unlinked_users_display_name",
        "نامِ نمایشی",
        "users.display_name",
        "یک نامِ نمایشی برای خودت",
        "هیچ‌جای برنامه این نام را نمایش نمی‌دهد؛ همه‌جا نامِ کاربری نشان داده می‌شود، "
        "چون خروجیِ کاربر این ستون را ندارد",
    ),
    (
        "interests",
        "unlinked_users_interests",
        "رونوشتِ علاقه‌ها",
        "users.interests",
        "خلاصه‌ای از علاقه‌هایت",
        "این رونوشت را فقط سرویسِ شناساییِ علاقه‌ها می‌نویسد و هیچ کدِ دیگری در برنامه "
        "آن را نمی‌خواند",
    ),
    (
        "personality_traits",
        "unlinked_users_personality_traits",
        "رونوشتِ ویژگی‌های شخصیتی",
        "users.personality_traits",
        "نمرهٔ ویژگی‌های شخصیتی‌ات",
        "این فقط یک رونوشت است: صفحهٔ «شخصیت» نسخهٔ اصلی را از جدولِ personality_assessments "
        "می‌خواند و این ستون هیچ خواننده‌ای ندارد",
    ),
    (
        "mood_patterns",
        "unlinked_users_mood_patterns",
        "الگوی خلق‌وخو",
        "users.mood_patterns",
        "الگویی از خلق‌وخویت",
        "این ستون در کلِ برنامه نه نویسنده‌ای دارد نه خواننده‌ای",
    ),
)


def _user_store_facet(key: str, title: str, column: str, lead: str, why: str, value: Any) -> Facet:
    return Facet(
        key=key,
        title=title,
        statement=(
            f"{lead} در پایگاه‌داده ذخیره شده — {_preview(value)} — ولی امروز روی هیچ صفحه‌ای "
            f"دیده نمی‌شود: {why}."
        ),
        group=FacetGroup.UNLINKED.value,
        kind=Kind.FACT.value,
        tone=Tone.WATCH.value,
        evidence=[
            f"محلِ ذخیره: ستونِ {column} در جدولِ users.",
            "این متن عیناً از همان ستون خوانده شده و فقط کوتاه شده است.",
            "تا وقتی خودت تصمیم نگرفته‌ای، این گزارش چیزی را وصل یا پاک نمی‌کند.",
        ],
        source_label=SOURCE,
        owns_page=PAGE,
    )


# ── ارزیابی‌ها ───────────────────────────────────────────────────────────────

def _assessment_scope(col, uid: int, resolved_id: Optional[int]):
    """دامنهٔ کاربر، با همان قرارِ بقیهٔ برنامه: uid=۰ یعنی حالتِ تک‌کاربره و
    سطرهای قدیمیِ بی‌صاحب (``user_id IS NULL``) هم مالِ اوست."""
    if uid:
        return col == uid
    ids = [0] + ([resolved_id] if resolved_id else [])
    return or_(col.in_(ids), col.is_(None))


async def _resolve_user(db: AsyncSession, uid: int):
    """سطرِ کاربر، یا None.

    در حالتِ تک‌کاربرهٔ برنامه (uid=۰) سطرِ کاربر فقط وقتی برداشته می‌شود که
    **یک** کاربر بیشتر نباشد؛ وگرنه انتخابِ دلبخواهی یعنی نسبت‌دادنِ متنِ یک
    نفر به دیگری.
    """
    from app.models.user import User

    if uid:
        return (
            await db.execute(select(User).where(User.id == uid))
        ).scalars().first()
    rows = (
        await db.execute(select(User).order_by(User.id).limit(2))
    ).scalars().all()
    return rows[0] if len(rows) == 1 else None


async def _assessment_counts(db: AsyncSession, uid: int, rid: Optional[int]) -> List[Tuple[Optional[str], int]]:
    """شمارشِ ارزیابی‌های کاربرمحور به تفکیکِ نوع.

    سطرهای شخص‌محور (``person_id`` دارند) کنار گذاشته می‌شوند: آن‌ها صاحب دارند
    و روی پروفایلِ همان فرد دیده می‌شوند.
    """
    from app.models.ai_assessment import AIAssessment

    rows = (
        await db.execute(
            select(AIAssessment.assessment_type, func.count(AIAssessment.id))
            .where(
                _assessment_scope(AIAssessment.user_id, uid, rid),
                AIAssessment.person_id.is_(None),
            )
            .group_by(AIAssessment.assessment_type)
        )
    ).all()
    return [(r[0], int(r[1])) for r in rows]


def _assessment_facet(counts: List[Tuple[Optional[str], int]]) -> Optional[Facet]:
    unlinked = [(t, n) for t, n in counts if t not in _SURFACED_ASSESSMENT_TYPES and n]
    if not unlinked:
        return None
    unlinked.sort(key=lambda tn: -tn[1])
    total = sum(n for _, n in unlinked)

    def _name(t: Optional[str]) -> str:
        return t if t else "بدونِ نوع"

    listed = "، ".join(f"{_name(t)} ({_fa(n)} سطر)" for t, n in unlinked[:4])
    statement = (
        f"{_fa(total)} ارزیابیِ ذخیره‌شده دربارهٔ تو در جدولِ ai_assessments هست — {listed} — "
        "و هیچ صفحه‌ای در برنامه هیچ‌کدامشان را نشان نمی‌دهد؛ فقط یک API دارند."
    )

    evidence = [f"نوعِ «{_name(t)}»: {_fa(n)} سطر." for t, n in unlinked[:4]]
    shown = [t for t, n in counts if t in _SURFACED_ASSESSMENT_TYPES and n]
    if shown:
        evidence.append(
            "از همین جدول، این نوع‌ها صفحه دارند و اینجا شمرده نشده‌اند: "
            + "، ".join(_SURFACED_ASSESSMENT_TYPES[t] for t in shown)
            + "."
        )
    evidence.append("سطرهای مربوط به آدم‌های دیگر کنار گذاشته شده‌اند؛ این‌ها فقط دربارهٔ خودِ توست.")

    return Facet(
        key="unlinked_ai_assessments",
        title="ارزیابی‌های بی‌صفحه",
        statement=statement,
        group=FacetGroup.UNLINKED.value,
        kind=Kind.FACT.value,
        tone=Tone.WATCH.value,
        evidence=evidence,
        source_label=SOURCE,
        owns_page=PAGE,
    )


async def _personality_facet(db: AsyncSession, uid: int, rid: Optional[int]) -> Optional[Facet]:
    """جدولِ ``personality_assessments`` — تنها موردی که در این سیاهه **وصل** است.

    مالک اسمش را برد، پس جوابش داده می‌شود؛ ولی لحن باید صادق بماند: این یکی
    جزیره نیست و WATCH نمی‌گیرد.
    """
    from app.models.personality import PersonalityAssessment

    rows = (
        await db.execute(
            select(PersonalityAssessment)
            .where(_assessment_scope(PersonalityAssessment.user_id, uid, rid))
            .order_by(PersonalityAssessment.id.desc())
            .limit(1)
        )
    ).scalars().all()
    if not rows:
        return None

    total = int(
        (
            await db.execute(
                select(func.count(PersonalityAssessment.id)).where(
                    _assessment_scope(PersonalityAssessment.user_id, uid, rid)
                )
            )
        ).scalar()
        or 0
    )
    latest = rows[0]

    evidence: List[str] = [f"شمارِ تحلیل‌های ذخیره‌شده: {_fa(total)}."]
    summary = (latest.summary or "").strip()
    if summary:
        evidence.append(f"خلاصهٔ تازه‌ترین تحلیل: {_preview(summary)}.")
    traits = latest.traits
    if not _is_empty(traits):
        evidence.append(f"نمره‌های همان تحلیل: {_preview(traits)}.")
    evidence.append("این جدول برخلافِ بقیهٔ این فهرست خواننده دارد و در برنامه دیده می‌شود.")

    return Facet(
        key="unlinked_personality_assessments",
        title="تحلیل‌های شخصیت (این یکی وصل است)",
        statement=(
            f"{_fa(total)} تحلیلِ شخصیت از تو ذخیره شده و این یکی برخلافِ بقیهٔ این فهرست "
            "جزیره نیست — صفحهٔ «شخصیت» همین جدول را می‌خواند و نشانت می‌دهد."
        ),
        group=FacetGroup.UNLINKED.value,
        kind=Kind.FACT.value,
        tone=Tone.NEUTRAL.value,
        evidence=evidence,
        source_label=SOURCE,
        owns_page=PAGE,
    )


def _empty_facet(names: List[str]) -> Facet:
    return Facet(
        key="unlinked_empty_stores",
        title="نگه‌دارنده‌های خالی",
        statement=(
            "این نگه‌دارنده‌های پروفایل امروز خالی‌اند و هیچ‌چیزی از تو در آن‌ها نیست: "
            + "، ".join(names)
            + " — پس دربارهٔ این‌ها چیزی برای وصل‌کردن یا نگران‌شدن وجود ندارد."
        ),
        group=FacetGroup.UNLINKED.value,
        kind=Kind.FACT.value,
        tone=Tone.NEUTRAL.value,
        evidence=[
            "خالی‌بودن هم یک یافته است؛ اگر انتظار داشتی چیزی در آن‌ها باشد، نیست.",
            "هیچ حدسی زده نشده — هرکدام همین حالا خوانده شد.",
        ],
        source_label=SOURCE,
        owns_page=PAGE,
    )


async def _collect(db: AsyncSession, uid: int) -> Optional[List[Facet]]:
    # یک مهارِ سراسری، ولی نه بی‌صدا: خطا در سطحِ warning ثبت می‌شود. همان
    # `except: pass`ِ خاموش بود که سه فیلدِ مرده را ماه‌ها زنده نشان داد.
    try:
        user = await _resolve_user(db, uid)
        rid = int(user.id) if user is not None else None
        counts = await _assessment_counts(db, uid, rid)
        personality = await _personality_facet(db, uid, rid)
    except Exception as exc:
        logger.warning("owner-insight unlinked: inventory failed: %r", exc)
        return None

    facets: List[Facet] = []
    empty: List[str] = []

    if user is not None:
        for attr, key, title, column, lead, why in _USER_STORES:
            value = getattr(user, attr, None)
            if _is_empty(value):
                empty.append(column)
            else:
                facets.append(_user_store_facet(key, title, column, lead, why, value))

    assessments = _assessment_facet(counts)
    if assessments is not None:
        facets.append(assessments)
    elif not counts and user is not None:
        # هیچ سطری نیست ← واقعاً خالی. اگر سطر هست ولی همه‌اش از نوعِ صفحه‌دار
        # است، «خالی» گفتن دروغ می‌شد؛ آنجا فقط چیزی گفته نمی‌شود.
        empty.append("ai_assessments")

    if personality is not None:
        facets.append(personality)
    elif user is not None:
        empty.append("personality_assessments")

    # هیچ ردی از مالک نیست: نه سطرِ کاربری، نه ارزیابی‌ای. دربارهٔ سطری که وجود
    # ندارد نمی‌شود گفت «خالی است» — این هم ساختنِ خبر از هیچ بود.
    if user is None and not facets:
        return None

    if empty:
        facets.append(_empty_facet(empty))

    return facets or None


register(
    Provider(
        key="unlinked",
        label="داده‌هایی که هنوز وصل نیستند",
        owns_page=PAGE,
        collect=_collect,
        group_order=90,
    )
)
