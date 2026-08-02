"""حرفِ خودش — آنچه نوشته‌های خودِ مالک دربارهٔ او می‌گویند.

چرا این منبع وجود دارد
======================
غنی‌ترین دادهٔ شخصیِ این برنامه، خودِ نوشته‌های اوست: یک شرحِ حالِ حدوداً
۵۳٬۰۰۰ نویسه‌ای و یک سندِ اهدافِ بلند، در جدول ``personal_writings``. تا امروز
تنها چیزی که برنامه از این متن‌ها بیرون می‌کشید **تعدادِ نویسه‌ها** بود
(``body_chars`` در فهرستِ «نوشته‌های من») و یک شمارشِ کلیدواژه در خودنگاره.
یعنی متنی که خودِ آدم دربارهٔ خودش نوشته، خوانده نمی‌شد.

قاعده‌هایی که اینجا میخ شده‌اند (از همان نقدی که صفحهٔ قبلی را ساقط کرد)
=====================================================================
1. **هر ادعا یک جمله است، نه یک عدد و نه یک برچسبِ تک‌کلمه‌ای.** «شاخص
   پشتکار ۱۰/۱۰۰» دقیقاً همان چیزی است که اینجا ممنوع است. جمله‌ای که ثبت
   می‌شود باید دربارهٔ *او* حرف بزند.
2. **لحن با محتوا می‌خواند.** نقاطِ قوت `GOOD` است و ضعف‌ها `WATCH`؛ هیچ
   خبرِ بدی زیرِ عنوانِ خوب نمی‌نشیند.
3. **هر ادعا به جملهٔ خودش برمی‌گردد.** هر قلم باید یک نقلِ کلمه‌به‌کلمه
   (حداکثر ۱۲۰ نویسه) از متنِ خودش داشته باشد و آن نقل **واقعاً در متن
   بررسی می‌شود**؛ نقلی که در نوشته‌هایش پیدا نشود، ادعایش هم دور ریخته
   می‌شود. مدل حق ندارد شاهد بسازد.
4. **«نمی‌دانم» جوابِ درستی است.** اگر متنِ کافی نباشد (کمتر از
   ``MIN_TOTAL_CHARS`` نویسه) این منبع ``None`` برمی‌گرداند و رابط به‌جای
   بافتن، از خودش می‌پرسد.
5. **بدونِ مدل، ادعایی ساخته نمی‌شود.** روشِ کار همان الگوی
   ``google_sync/triage_service`` است: prompt → JSON → استخراج با regex →
   اعتبارسنجی → ثبتِ نامِ مدلی که جواب داده. اگر مدلی وصل نباشد (یا جوابش
   قابلِ‌استفاده نباشد) این ماژول **شخصیت نمی‌بافد**؛ فقط یک کارتِ صادقانه
   می‌سازد که می‌گوید «این‌قدر نوشته داری و هنوز خوانده نشده»، با لحنِ
   `WATCH`. شمردنِ کلیدواژه و فروختنش به‌عنوانِ «تحلیلِ شخصیت» همان
   کم‌عمقی‌ای است که مالک از آن شکایت کرد.

اینجا هیچ چیزی ذخیره نمی‌شود؛ هر بار از همان جدولی خوانده می‌شود که صفحهٔ
«نوشته‌های من» (/writings) صاحبش است، و هر کارت به همان صفحه لینک دارد.
"""
from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.owner_insight import register
from app.services.owner_insight.base import Facet, FacetGroup, Kind, Provider, Tone

logger = logging.getLogger(__name__)

PAGE = "/writings"                      # در frontend/src/lib/routesMeta.js موجود است
SOURCE = "نوشته‌های خودت (نوشته‌های من)"
AI_TASK = "personality"                 # ردیفِ موجود در catalog.TASK_TYPES

# ── آستانه‌ها ────────────────────────────────────────────────────────────────
# زیرِ این حجم، «نوشته‌های او» یک یادداشتِ کوتاه است نه متنی که بشود از رویش
# دربارهٔ شخصیت حرف زد. یک پاراگرافِ ۳۰۰ نویسه‌ای هیچ ادعایی را تحمل نمی‌کند.
MIN_TOTAL_CHARS = 1200
# سهمِ هر نوشته در prompt؛ سرِ متن + یک برشِ میانی، تا مقدمه کلِ تصویر نشود.
HEAD_CHARS = 2200
MIDDLE_CHARS = 800
MAX_WRITINGS_IN_PROMPT = 6
MAX_QUOTE_CHARS = 120
MIN_QUOTE_CHARS = 12
MIN_STATEMENT_CHARS = 15
MAX_STATEMENT_CHARS = 400
MAX_ITEMS_PER_SECTION = 3

_DIGITS = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")

# (کلیدِ JSON، پسوندِ کلیدِ facet، عنوانِ فارسی، لحن)
_SECTIONS: Tuple[Tuple[str, str, str, Tone], ...] = (
    ("traits", "personality", "شخصیت — از روی نوشته‌های خودت", Tone.NEUTRAL),
    ("values", "values", "ارزش‌ها و آنچه برایت مهم است", Tone.NEUTRAL),
    ("themes", "themes", "موضوع‌هایی که مدام به آن‌ها برمی‌گردی", Tone.NEUTRAL),
    ("strengths", "strengths", "نقاط قوت — به قلمِ خودت", Tone.GOOD),
    ("weaknesses", "weaknesses", "ضعف‌هایی که خودت به آن‌ها اشاره کرده‌ای", Tone.WATCH),
)


def _fa(value: Any) -> str:
    """عدد با رقم‌های فارسی و جداکنندهٔ هزارگان — جمله نباید وسطش جهت عوض کند."""
    try:
        text = f"{int(value):,}".replace(",", "٬")
    except (TypeError, ValueError):
        text = str(value)
    return text.translate(_DIGITS)


def _scope(col, uid: int):
    """دادهٔ قدیمی ``user_id IS NULL`` دارد؛ در دامنهٔ ناشناس هم دیده می‌شود."""
    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


def _norm(text: str) -> str:
    """شکلِ مقایسه‌ایِ متن: فاصله‌های یکدست، «ي/ك» عربی → فارسی، بی نیم‌فاصله.

    برای **راستی‌آزماییِ نقل‌قول** است، نه برای نمایش: مدل ممکن است همان جمله
    را با یایِ عربی یا نیم‌فاصلهٔ متفاوت پس بدهد و آن نباید «نقلِ جعلی» شمرده
    شود؛ در عوض جمله‌ای که اصلاً در متن نیست باید قطعاً رد شود.
    """
    text = (text or "").replace("‌", " ").replace("‏", " ").replace("‎", " ")
    text = text.replace("ي", "ی").replace("ك", "ک").replace("ۀ", "ه").replace("أ", "ا")
    text = re.sub(r"[«»\"'`ـ]", "", text)
    return re.sub(r"\s+", " ", text).strip()


def _excerpt(body: str, limit: int = MAX_QUOTE_CHARS) -> str:
    """یک تکهٔ کوتاه و خوانا از سرِ متن — برای شاهدِ کارتِ «تحلیل‌نشده»."""
    flat = re.sub(r"\s+", " ", (body or "").strip())
    if len(flat) <= limit:
        return flat
    cut = flat[:limit]
    space = cut.rfind(" ")
    if space > limit // 2:
        cut = cut[:space]
    return cut.rstrip(" ،؛.") + "…"


def _sample(body: str) -> str:
    """سرِ متن + یک برشِ میانی. مقدمهٔ یک شرحِ حال، خودِ شرحِ حال نیست."""
    body = (body or "").strip()
    if len(body) <= HEAD_CHARS + MIDDLE_CHARS:
        return body
    mid_start = max(HEAD_CHARS, (len(body) - MIDDLE_CHARS) // 2)
    return body[:HEAD_CHARS] + "\n[…]\n" + body[mid_start:mid_start + MIDDLE_CHARS]


async def _writings(db: AsyncSession, uid: int) -> List[Any]:
    """ستون‌ها از خودِ مدل تأیید شده‌اند: ``body`` (نه ``content``/``text``)،
    ``deleted_at`` برای سطلِ زباله. تستِ مسیرِ موفق همین شمارشِ نویسه‌ها را
    ادعا می‌کند، پس نامِ غلطِ ستون نمی‌تواند بی‌سروصدا بماند."""
    from app.models.personal_writing import PersonalWriting

    rows = await db.execute(
        select(PersonalWriting)
        .where(_scope(PersonalWriting.user_id, uid), PersonalWriting.deleted_at.is_(None))
        .order_by(PersonalWriting.sort_order.asc(), PersonalWriting.id.asc())
    )
    return list(rows.scalars().all())


# ── مسیرِ مدل ────────────────────────────────────────────────────────────────

_PROMPT = """این‌ها نوشته‌های بلندِ شخصیِ یک نفر است، به قلمِ خودش.
از روی همین متن‌ها دربارهٔ نویسنده بنویس. فقط چیزی بگو که در متن شاهد دارد.

فقط یک JSON برگردان، بدون هیچ توضیحِ اضافه، با این کلیدها:
- traits: ویژگی‌های شخصیتی
- values: ارزش‌ها و چیزهایی که برایش مهم است
- themes: موضوع‌هایی که مدام به آن‌ها برمی‌گردد
- strengths: نقاط قوت
- weaknesses: ضعف‌ها و چیزهایی که خودش به آن‌ها اعتراف کرده

هر کلید یک آرایه است (حداکثر {max_items} قلم) و هر قلم یک شیء با دو کلید:
- statement: یک جملهٔ کاملِ فارسی خطاب به خودِ او («تو ...»)، نه عدد و نه برچسبِ تک‌کلمه‌ای
- quote: یک نقلِ کلمه‌به‌کلمه از متنِ زیر (حداکثر {max_quote} نویسه) که همان جمله را ثابت می‌کند

نقل‌قول باید عیناً در متن باشد. اگر برای چیزی شاهدِ کافی نیست، آرایه‌اش را
خالی بگذار. چیزی از خودت نساز.

متن‌ها:
{corpus}
"""


def _build_prompt(writings: List[Any]) -> str:
    blocks: List[str] = []
    for w in writings[:MAX_WRITINGS_IN_PROMPT]:
        head = f"### «{(w.title or 'بی‌عنوان').strip()}»"
        if (w.category or "").strip():
            head += f" (دستهٔ «{w.category.strip()}»)"
        blocks.append(f"{head}\n{_sample(w.body or '')}")
    return _PROMPT.format(
        max_items=MAX_ITEMS_PER_SECTION,
        max_quote=MAX_QUOTE_CHARS,
        corpus="\n\n".join(blocks),
    )


async def _ai_read(
    db: AsyncSession, writings: List[Any]
) -> Optional[Tuple[Dict[str, Any], Optional[str]]]:
    """(دادهٔ JSON، نامِ مدلی که جواب داد) یا ``None`` اگر مدلی جواب نداد.

    همان الگوی ``triage_service._ai_triage``. خطا بلعیده نمی‌شود: در سطحِ
    warning ثبت می‌شود و مسیرِ صادقانهٔ «تحلیل نشده» فعال می‌ماند.
    """
    try:
        from app.services.ai.inference_gateway import complete

        res = await complete(db, _build_prompt(writings), task=AI_TASK, max_tokens=900)
    except Exception as exc:  # noqa: BLE001 — لاگ می‌شود، پنهان نمی‌ماند
        logger.warning("owner-insight writings: inference failed: %r", exc)
        return None

    if not (res.get("ok") and res.get("text")):
        # نبودِ کلید/مدل حالتِ عادیِ استقرارِ بی‌کلید است — هشدار نیست.
        logger.debug("owner-insight writings: no model answer (%r)", res.get("error"))
        return None

    match = re.search(r"\{.*\}", str(res["text"]), re.S)
    if not match:
        logger.warning("owner-insight writings: model answer had no JSON object")
        return None
    try:
        data = json.loads(match.group(0))
    except (ValueError, TypeError) as exc:
        logger.warning("owner-insight writings: model answer was not valid JSON: %r", exc)
        return None
    if not isinstance(data, dict):
        logger.warning("owner-insight writings: model answer was not an object")
        return None
    return data, (res.get("model") or None)


# ── اعتبارسنجی و ساختِ کارت‌ها ───────────────────────────────────────────────

def _clean_statement(raw: Any) -> Optional[str]:
    """جمله باید جمله باشد. عدد، برچسبِ تک‌کلمه‌ای و رشتهٔ خالی رد می‌شوند."""
    text = re.sub(r"\s+", " ", str(raw or "")).strip()
    if len(text) < MIN_STATEMENT_CHARS or len(text) > MAX_STATEMENT_CHARS:
        return None
    stripped = re.sub(r"[\d\s۰-۹/٪.,،٬-]", "", text)
    if not stripped:            # «۱۰/۱۰۰» و هم‌خانواده‌هایش
        return None
    if " " not in text:         # یک کلمه، یعنی برچسب نه ادعا
        return None
    return text


def _clean_quote(raw: Any, corpus_norm: str) -> Optional[str]:
    """نقل باید کوتاه باشد و **واقعاً** در نوشته‌های خودش پیدا شود."""
    text = re.sub(r"\s+", " ", str(raw or "")).strip().strip("«»\"'")
    if len(text) < MIN_QUOTE_CHARS:
        return None
    if len(text) > MAX_QUOTE_CHARS:
        text = text[:MAX_QUOTE_CHARS].rstrip()
    probe = _norm(text)
    if len(probe) < MIN_QUOTE_CHARS or probe not in corpus_norm:
        return None
    return text


def _section_facet(
    json_key: str,
    facet_suffix: str,
    title: str,
    tone: Tone,
    data: Dict[str, Any],
    corpus_norm: str,
    model: Optional[str],
) -> Optional[Facet]:
    items = data.get(json_key)
    if not isinstance(items, list):
        return None

    statements: List[str] = []
    evidence: List[str] = []
    for item in items[:MAX_ITEMS_PER_SECTION]:
        if not isinstance(item, dict):
            continue
        statement = _clean_statement(item.get("statement"))
        if not statement:
            continue
        quote = _clean_quote(item.get("quote"), corpus_norm)
        if not quote:
            # ادعای بی‌شاهد ثبت نمی‌شود؛ «از کجا آوردی؟» باید جواب داشته باشد.
            logger.debug("owner-insight writings: dropped unsourced claim in %s", json_key)
            continue
        statements.append(statement.rstrip(" .؛،"))
        evidence.append(f"به قلمِ خودت: «{quote}»")

    if not statements:
        return None

    statement = "؛ ".join(statements) + "."
    if model:
        evidence.append(f"این برداشت را مدلِ «{model}» از روی متنِ خودت نوشته، نه از یک قالبِ آماده.")

    return Facet(
        key=f"writings_{facet_suffix}",
        title=title,
        statement=statement,
        group=FacetGroup.SELF.value,
        kind=Kind.INFERRED.value,
        tone=tone.value,
        # استنباط از نمونه‌ای از متن است، نه از کلِ متن؛ اطمینان عمداً بالا نمی‌رود.
        confidence=round(min(0.75, 0.5 + 0.05 * len(statements)), 2),
        evidence=evidence,
        source_label=SOURCE,
        owns_page=PAGE,
    )


def _unanalysed_facet(writings: List[Any], total_chars: int, *, reason: str) -> Facet:
    """کارتِ صادقانه: «این‌قدر نوشته داری و هنوز خوانده نشده».

    این جایگزینِ **بافتنِ شخصیت از شمارشِ کلیدواژه** است. حجم را می‌گوید،
    نمی‌گوید چه کسی هستی.
    """
    longest = max(writings, key=lambda w: len(w.body or ""))
    count_fa = _fa(len(writings))
    chars_fa = _fa(total_chars)
    title_fa = (longest.title or "بی‌عنوان").strip()

    head = (
        f"{count_fa} نوشتهٔ بلند به قلمِ خودت اینجا هست — روی‌هم {chars_fa} نویسه، "
        f"که بلندترینش «{title_fa}» است"
    )
    if reason == "unusable":
        tail = (
            "؛ متن به مدل داده شد ولی هیچ‌کدام از برداشت‌هایش به جمله‌ای در نوشتهٔ "
            "خودت قابلِ ردیابی نبود، پس هیچ ادعایی دربارهٔ شخصیت و ارزش‌هایت ثبت نشد."
        )
    else:
        tail = (
            "؛ هنوز هیچ‌کدام خوانده و تحلیل نشده‌اند، چون مدلِ زبانی‌ای وصل نیست. "
            "تا آن‌وقت این برنامه از روی نوشته‌هایت هیچ ادعایی دربارهٔ شخصیت، "
            "ارزش‌ها یا ضعف‌هایت ندارد."
        )

    evidence: List[str] = []
    for w in writings[:4]:
        evidence.append(f"«{(w.title or 'بی‌عنوان').strip()}» — {_fa(len(w.body or ''))} نویسه.")
    opening = _excerpt(longest.body or "")
    if opening:
        evidence.append(f"از سرِ «{title_fa}»: «{opening}»")
    evidence.append("برای تحلیل، در تنظیماتِ AI یک مدل برای «پروفایل شخصیت» وصل کن.")

    return Facet(
        key="writings_corpus_unanalysed",
        title="نوشته‌های خودت — هنوز خوانده نشده",
        statement=head + tail,
        group=FacetGroup.SELF.value,
        # شمارشِ واقعیِ نویسه‌هاست، نه استنباط: ادعای این کارت فقط «چقدر متن
        # داری» است و همان اندازه‌گیری شده.
        kind=Kind.MEASURED.value,
        tone=Tone.WATCH.value,
        confidence=1.0,
        evidence=evidence,
        source_label=SOURCE,
        owns_page=PAGE,
        # این کارت یک نوشتهٔ مشخص را نام می‌برد («بلندترینش …»), پس در
        # خروجی‌اش هم باید به همان برسد نه به سرِ فهرست. `/writings` قبلاً
        # `useFocusTarget` را دارد، پس این لینک همین حالا واقعاً فرود می‌آید.
        focus_kind="writing",
        focus_id=longest.id,
    )


async def _collect(db: AsyncSession, uid: int) -> Optional[List[Facet]]:
    try:
        rows = await _writings(db, uid)
    except Exception as exc:  # noqa: BLE001 — لاگ + غیبتِ صادقانه، نه سکوت
        logger.warning("owner-insight writings: could not read personal_writings: %r", exc)
        return None

    writings = [w for w in rows if (w.body or "").strip()]
    total_chars = sum(len(w.body or "") for w in writings)
    if not writings or total_chars < MIN_TOTAL_CHARS:
        # «نمی‌دانم» — یک یادداشتِ کوتاه شاهدِ هیچ ادعایی دربارهٔ شخصیت نیست.
        return None

    read = await _ai_read(db, writings)
    if read is None:
        return [_unanalysed_facet(writings, total_chars, reason="no_model")]

    data, model = read
    corpus_norm = _norm("\n".join((w.body or "") for w in writings))
    facets = [
        f
        for f in (
            _section_facet(json_key, suffix, title, tone, data, corpus_norm, model)
            for json_key, suffix, title, tone in _SECTIONS
        )
        if f is not None
    ]
    if not facets:
        return [_unanalysed_facet(writings, total_chars, reason="unusable")]
    return facets


register(
    Provider(
        key="writings",
        label="نوشته‌های خودت",
        owns_page=PAGE,
        collect=_collect,
        group_order=20,
    )
)
