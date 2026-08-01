"""عادت‌ها، پایبندی، و چیزهایی که خودش دربارهٔ خودش نوشته.

چرا این منبع اینجاست
====================
دو تکه از تصویرِ مالک در برنامه بود و هیچ‌جا خوانده نمی‌شد:

1. **حرفِ خودش.** او لیست‌هایی دارد که *دقیقاً* دربارهٔ ضعف‌هایش است —
   «توسعه فردی - عادت‌های بد و مراحل بهبود»، «... دزدان انرژی و زمان»،
   «... مبارزه با هوای نفس». اینجا چیزی حدس زده نمی‌شود؛ جمله‌های خودش به
   خودش برگردانده می‌شود.
2. **آنچه واقعاً می‌کند.** چه‌قدر از آنچه شروع می‌کند تمام می‌شود، چند فرمانِ
   روزانه را نگه می‌دارد و چند تا را جا می‌گذارد، چه‌قدر عقب‌افتاده روی دستش
   مانده.

سه اشتباهِ نسخهٔ قبل که اینجا عمداً تکرار نمی‌شود
================================================
* **ستونِ اشتباه.** استخراج‌کنندهٔ قبلیِ «نقاط ضعف» ``select(TodoItem.title)``
  می‌زد، حال آنکه ستون ``content`` است. یک ``except``ِ لخت صدایش را می‌خورد و
  آن فیلد برای همیشه خالی ماند بی‌آنکه کسی بفهمد. اینجا هر نامِ ستون با
  اجرای واقعی راستی‌آزمایی شده و تستِ مسیرِ درست وجود دارد، پس همان غلط
  دیگر نمی‌تواند پنهان بماند.
* **تطبیقِ شُل.** آن کد نامِ لیست را با ``"ترس" in name`` می‌سنجید و
  «دسترسی» را هم ضعف حساب می‌کرد (د-س-**ت-ر-س**-ی). اینجا تطبیق روی مرزِ
  واژه است — ``_matches_weakness_list`` و تستش.
* **عددِ بی‌آستانه.** «شاخص پشتکار ۱۰/۱۰۰» زیرِ عنوانِ «نقاط قوت» نشست.
  اینجا هیچ facetی بدونِ شاخهٔ صریح روی مقدار ساخته نمی‌شود: نرخِ پایین
  ``WATCH`` است و نرخِ بالا ``GOOD``، و هر دو شاخه تست دارند.

«نمی‌دانم» جوابِ درستی است
==========================
هر بخش حدِ نصابِ خودش را دارد (کنارِ هر ثابت نوشته شده). روی پایگاه‌دادهٔ
خالی هیچ کارتی ساخته نمی‌شود و provider ``None`` برمی‌گرداند تا رابط از
خودِ مالک بپرسد.

هر کارت به صفحهٔ صاحبِ دادهٔ خودش لینک می‌شود
============================================
ادعایی که از فرمان‌ها آمده به ``/directives`` می‌رود، آنکه از لیست‌های خودش
آمده به ``/lists`` و آنکه از کارها آمده به ``/tasks``. هدفِ کلِ این صفحه
همین است: هیچ کارتی بن‌بست نباشد.
"""
from __future__ import annotations

import datetime as _dt
import logging
import re
from typing import Any, Dict, List, Optional, Sequence, Tuple

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.owner_insight import register
from app.services.owner_insight.base import Facet, FacetGroup, Kind, Provider, Tone
from app.services.place_service import TZ_OFFSET_MINUTES

logger = logging.getLogger(__name__)

UTC = _dt.timezone.utc

# صفحه‌هایی که صاحبِ این داده‌ها هستند — هر سه در
# frontend/src/lib/routesMeta.js ثبت شده‌اند.
PAGE_DIRECTIVES = "/directives"
PAGE_LISTS = "/lists"
PAGE_TASKS = "/tasks"

SRC_OWN_LISTS = "لیست‌های خودت (نوشتهٔ خودت، بی‌دخالتِ برنامه)"
SRC_DIRECTIVES = "موتورِ نهادینه‌سازی: فرمان‌های روزانه و پاسخ‌هایشان"
SRC_ITEMS = "لیست‌ها و کارهای ثبت‌شده"

# ── حدِ نصاب‌ها ──────────────────────────────────────────────────────────────
# منطقِ همه یکی است: زیرِ این مقدار، جمله‌ای که بسازیم دربارهٔ «معمولاً» دروغ
# است و عددِ بی‌معنا بدتر از خالی است.

MIN_WEAKNESS_ITEMS = 3      # زیرِ ۳ مورد، «ضعف‌هایت را نوشته‌ای» ادعای بزرگی است
WEAKNESS_HANDLED_AT = 0.60  # ≥۶۰٪ خط‌خورده → دارد کنار می‌آید
WEAKNESS_STUCK_BELOW = 0.25 # <۲۵٪ خط‌خورده → عملاً دست‌نخورده

FOLLOWUP_WINDOW_DAYS = 30
MIN_ANSWERED_CHECKINS = 6   # زیرِ ۶ پاسخ، نرخِ پایبندی نویز است
FOLLOWUP_GOOD_AT = 0.70
FOLLOWUP_WATCH_BELOW = 0.45

MIN_DIRECTIVES = 3          # زیرِ ۳ فرمان، حرف‌زدن از «نهادینه‌شدن» زود است
STREAK_GOOD_AT = 7          # یک هفته پشتِ‌هم = واقعاً یک رشته
IDLE_DIRECTIVES_AT = 5      # ≥۵ فرمانِ فعال که هیچ‌کدام تکان نخورده‌اند

MIN_ITEMS_FOR_RATE = 15     # زیرِ ۱۵ مورد، «چه‌قدر تمام می‌کنی» معنا ندارد
FINISH_GOOD_AT = 0.60
FINISH_WATCH_BELOW = 0.30
STALE_DAYS = 90             # بازِ دست‌نخورده بیش از سه ماه = رهاشده
STALE_SHARE_WATCH = 0.40

MIN_DATED_ITEMS = 3         # زیرِ ۳ موردِ تاریخ‌دار، «عقب‌افتادگی» عدد نیست
OVERDUE_WATCH_AT = 3
OVERDUE_SHARE_WATCH = 0.50

MAX_QUOTES = 3              # چند نمونه از حرفِ خودش داخلِ جمله بیاید

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


def _not_archived(col):
    """``is_archived`` در ردیف‌های قدیمی ممکن است NULL باشد؛ NULL یعنی بایگانی‌نشده."""
    return or_(col.is_(False), col.is_(None))


def _local_today() -> _dt.date:
    return (_dt.datetime.now(UTC) + _dt.timedelta(minutes=TZ_OFFSET_MINUTES)).date()


def _aware(value: Optional[_dt.datetime]) -> Optional[_dt.datetime]:
    if value is None:
        return None
    return value if value.tzinfo else value.replace(tzinfo=UTC)


def _quote_list(texts: Sequence[str]) -> str:
    """«الف»، «ب» و «ج» — نقلِ حرفِ خودش، نه dump."""
    quoted = [f"«{t}»" for t in texts]
    if len(quoted) == 1:
        return quoted[0]
    return "، ".join(quoted[:-1]) + " و " + quoted[-1]


# ── (الف) ضعف‌هایی که خودش نام برده ─────────────────────────────────────────

# نامِ لیست‌هایی که مالک خودش دربارهٔ ضعف‌هایش ساخته. تطبیق روی **مرزِ واژه**
# است، نه زیررشته: با تطبیقِ شُل «ترس» داخلِ «دسترسی» می‌افتد و لیستِ
# «دسترسی‌ها» ضعف حساب می‌شود — همان باگی که در نسخهٔ قبل بود.
_WEAKNESS_KEYS = (
    "عادت‌های بد",
    "عادت بد",
    "دزدان انرژی",
    "دزدان زمان",
    "هوای نفس",
    "نقاط ضعف",
    "ضعف‌های من",
    "ترس",
    "ترس‌ها",
)

_ZWNJ = "‌"


def _norm_fa(text: str) -> str:
    """نیم‌فاصله → فاصله، عربی → فارسی، فاصله‌های تکراری جمع. (تطبیقِ باثبات)"""
    t = (text or "").replace(_ZWNJ, " ")
    t = t.replace("ي", "ی").replace("ك", "ک").replace("ۀ", "ه").replace("ة", "ه")
    return re.sub(r"\s+", " ", t).strip()


_WEAKNESS_PATTERNS = tuple(
    re.compile(r"(?<!\w)" + re.escape(_norm_fa(k)) + r"(?!\w)") for k in _WEAKNESS_KEYS
)


def _matches_weakness_list(name: str) -> bool:
    """آیا نامِ این لیست واقعاً دربارهٔ ضعف‌های خودش است؟

    مرزِ واژه اجباری است: «دسترسی» شاملِ «ترس» نمی‌شود.
    """
    normalized = _norm_fa(name)
    if not normalized:
        return False
    return any(p.search(normalized) for p in _WEAKNESS_PATTERNS)


def _usable_quote(content: str) -> Optional[str]:
    """یک موردِ لیست را به نقل‌قولِ کوتاه تبدیل کن، یا رد کن.

    این لیست‌ها کنارِ ضعف‌های واقعی چند سطرِ **آموزشی** هم دارند («مقیاس
    دشواری عادت: … ← … ← …»). نقلِ آن‌ها به‌عنوان ضعف مسخره است.
    """
    text = _norm_fa(content)
    if not text or len(text) < 3 or len(text) > 120:
        return None
    if "←" in text or "→" in text:   # نمودارِ مقیاس، نه یک عادت
        return None
    if text.endswith(":") or text.endswith("："):  # تیترِ داخلِ لیست
        return None
    return text


async def _named_weaknesses_facet(db: AsyncSession, uid: int) -> Optional[Facet]:
    """چیزی که خودش دربارهٔ خودش نوشته — نقل، نه حدس."""
    from app.models.todo_item import TodoItem
    from app.models.todo_list import TodoList, todo_list_items

    lists = (
        await db.execute(
            select(TodoList.id, TodoList.name).where(
                _scope(TodoList.user_id, uid), _not_archived(TodoList.is_archived)
            )
        )
    ).all()
    wanted = [(lid, name) for lid, name in lists if _matches_weakness_list(name or "")]
    if not wanted:
        return None

    wanted_ids = [lid for lid, _ in wanted]
    rows = (
        await db.execute(
            # ستون ``content`` است، نه ``title`` — اینجا بود که نسخهٔ قبل مرد.
            select(TodoItem.content, TodoItem.is_completed)
            .join(todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id)
            .where(
                todo_list_items.c.todo_list_id.in_(wanted_ids),
                TodoItem.deleted_at.is_(None),
            )
            .order_by(TodoItem.id.asc())
            .limit(300)
        )
    ).all()

    open_quotes: List[str] = []
    done_quotes: List[str] = []
    for content, is_completed in rows:
        quote = _usable_quote(content or "")
        if quote is None:
            continue
        (done_quotes if is_completed else open_quotes).append(quote)

    total = len(open_quotes) + len(done_quotes)
    if total < MIN_WEAKNESS_ITEMS:
        return None

    handled = len(done_quotes) / total
    list_names = [_norm_fa(name) for _, name in wanted]

    if handled >= WEAKNESS_HANDLED_AT:
        tone = Tone.GOOD.value
        statement = (
            f"با ضعف‌هایی که خودت نام برده‌ای داری کنار می‌آیی — از {_fa(total)} موردی که "
            f"در لیست‌های خودت نوشته‌ای {_fa(len(done_quotes))} تا را خط زده‌ای، از جمله "
            f"{_quote_list(done_quotes[:MAX_QUOTES])}."
        )
    elif handled < WEAKNESS_STUCK_BELOW:
        tone = Tone.WATCH.value
        statement = (
            f"ضعف‌هایت را خودت نام برده‌ای، نه برنامه — {_fa(total)} مورد در لیست‌های خودت "
            f"نوشته‌ای و {_fa(len(open_quotes))} تای آن‌ها هنوز دست‌نخورده مانده، از جمله "
            f"{_quote_list(open_quotes[:MAX_QUOTES])}."
        )
    else:
        tone = Tone.NEUTRAL.value
        statement = (
            f"با ضعف‌هایی که خودت نام برده‌ای درگیری — از {_fa(total)} موردی که نوشته‌ای "
            f"{_fa(len(done_quotes))} تا را خط زده‌ای و {_fa(len(open_quotes))} تا مانده، "
            f"از جمله {_quote_list(open_quotes[:MAX_QUOTES])}."
        )

    evidence = [
        "این جمله‌ها نوشتهٔ خودِ توست؛ برنامه چیزی به آن اضافه نکرده.",
        f"از {_fa(len(wanted))} لیستِ خودت خوانده شده: {_quote_list(list_names[:3])}.",
        f"{_fa(total)} مورد شمرده شد؛ سطرهای توضیحی و نمودارهای مقیاس کنار گذاشته شدند.",
    ]

    return Facet(
        key="habits_named_weaknesses",
        title="ضعف‌هایی که خودت نام برده‌ای",
        statement=statement,
        group=FacetGroup.SELF.value,
        kind=Kind.OWNER.value,
        tone=tone,
        confidence=0.95,      # نقلِ مستقیمِ حرفِ خودش — بالاترین اطمینان
        evidence=evidence,
        source_label=SRC_OWN_LISTS,
        owns_page=PAGE_LISTS,
        owner_locked=True,
    )


# ── (ب) پایبندی به فرمان‌های روزانه ─────────────────────────────────────────

async def _followthrough_facet(db: AsyncSession, uid: int) -> Optional[Facet]:
    """از فرمان‌هایی که سرِ راهش گذاشته شد، چند تا را نگه داشت."""
    from app.models.directive import Directive, DirectiveCheckin

    since = _local_today() - _dt.timedelta(days=FOLLOWUP_WINDOW_DAYS)
    rows = (
        await db.execute(
            select(DirectiveCheckin.directive_id, DirectiveCheckin.done)
            .where(
                _scope(DirectiveCheckin.user_id, uid),
                DirectiveCheckin.checkin_date >= since,
                DirectiveCheckin.done.is_not(None),
            )
            .limit(2000)
        )
    ).all()
    if len(rows) < MIN_ANSWERED_CHECKINS:
        return None

    answered = len(rows)
    kept = sum(1 for _did, done in rows if done)
    missed = answered - kept
    rate = kept / answered

    evidence = [
        f"از {_fa(FOLLOWUP_WINDOW_DAYS)} روزِ گذشته حساب شده — {_fa(answered)} فرمان که "
        "جوابش را داده‌ای (چه انجام، چه جاماندن).",
    ]

    # پرتکرارترین جاماندن — اسمِ خودِ فرمان، نه شناسه.
    if missed:
        miss_counts: Dict[int, int] = {}
        for did, done in rows:
            if not done and did is not None:
                miss_counts[did] = miss_counts.get(did, 0) + 1
        worst_id = max(miss_counts, key=lambda k: miss_counts[k])
        worst = (
            await db.execute(select(Directive.title).where(Directive.id == worst_id))
        ).scalars().first()
        if worst:
            evidence.append(
                f"بیش از همه «{_norm_fa(worst)[:80]}» را جا گذاشته‌ای — "
                f"{_fa(miss_counts[worst_id])} بار."
            )

    if rate >= FOLLOWUP_GOOD_AT:
        tone = Tone.GOOD.value
        statement = (
            f"این یک ماه پایِ حرفت ایستاده‌ای — از {_fa(answered)} فرمانی که سرِ راهت "
            f"گذاشته شد {_fa(kept)} تا را نگه داشته‌ای."
        )
    elif rate < FOLLOWUP_WATCH_BELOW:
        tone = Tone.WATCH.value
        statement = (
            f"پشتکارت این ماه پایین بوده — از {_fa(answered)} فرمانی که سرِ راهت گذاشته "
            f"شد فقط {_fa(kept)} تا را نگه داشته‌ای و {_fa(missed)} تا را جا گذاشته‌ای."
        )
    else:
        tone = Tone.NEUTRAL.value
        statement = (
            f"این ماه نه رها کرده‌ای نه محکم گرفته‌ای — از {_fa(answered)} فرمان "
            f"{_fa(kept)} تا را نگه داشتی و {_fa(missed)} تا را جا گذاشتی."
        )

    evidence.append(f"نرخِ پایبندی: {_pct(rate)}.")

    return Facet(
        key="habits_followthrough",
        title="پایبندی به فرمان‌های روزانه",
        statement=statement,
        group=FacetGroup.HABITS.value,
        kind=Kind.MEASURED.value,
        tone=tone,
        confidence=round(min(0.9, 0.4 + 0.02 * answered), 2),
        evidence=evidence,
        source_label=SRC_DIRECTIVES,
        owns_page=PAGE_DIRECTIVES,
    )


# ── (ب) چه‌قدر واقعاً در تو جا افتاده ───────────────────────────────────────

async def _internalized_facet(db: AsyncSession, uid: int) -> Optional[Facet]:
    """رشته‌ها و فرمان‌هایی که «در تو حل شده‌اند» — در برابر آن‌هایی که تکان نخورده‌اند."""
    from app.models.directive import (
        DIRECTIVE_ACTIVE,
        DIRECTIVE_GRADUATED,
        Directive,
    )

    rows = (
        await db.execute(
            select(Directive.title, Directive.status, Directive.strength, Directive.streak)
            .where(
                _scope(Directive.user_id, uid),
                Directive.status.in_([DIRECTIVE_ACTIVE, DIRECTIVE_GRADUATED]),
            )
            .limit(500)
        )
    ).all()
    if len(rows) < MIN_DIRECTIVES:
        return None

    graduated = [t for t, s, _st, _sk in rows if s == DIRECTIVE_GRADUATED]
    active = [(t, int(_st or 0), int(_sk or 0)) for t, s, _st, _sk in rows if s == DIRECTIVE_ACTIVE]
    untouched = [t for t, strength, _sk in active if strength == 0]
    best = max(active, key=lambda r: r[2], default=None)
    best_streak = best[2] if best else 0

    evidence = [
        f"{_fa(len(active))} فرمانِ فعال و {_fa(len(graduated))} فرمانِ نهادینه‌شده شمرده شد.",
    ]

    if graduated or best_streak >= STREAK_GOOD_AT:
        tone = Tone.GOOD.value
        if graduated:
            statement = (
                f"{_fa(len(graduated))} عادت دیگر بخشی از خودت شده و برنامه سراغش را "
                f"نمی‌گیرد، از جمله {_quote_list([_norm_fa(t)[:60] for t in graduated[:MAX_QUOTES]])}."
            )
            if best_streak >= STREAK_GOOD_AT and best is not None:
                statement = statement[:-1] + (
                    f"؛ از فرمان‌های فعال هم «{_norm_fa(best[0])[:60]}» را "
                    f"{_fa(best_streak)} روز پشتِ‌هم نگه داشته‌ای."
                )
        else:
            statement = (
                f"یک رشتهٔ واقعی ساخته‌ای — «{_norm_fa(best[0])[:60]}» را {_fa(best_streak)} "
                "روز پشتِ‌هم نگه داشته‌ای."
            )
        if best_streak:
            evidence.append(f"بلندترین رشتهٔ جاری: {_fa(best_streak)} روز.")
    elif len(active) >= IDLE_DIRECTIVES_AT and len(untouched) == len(active):
        tone = Tone.WATCH.value
        statement = (
            f"{_fa(len(active))} فرمانِ فعال روی دستت است و هیچ‌کدام هنوز حتی یک قدم جلو "
            "نرفته — همه‌شان از روزِ اول سرِ جای خودشان مانده‌اند."
        )
        evidence.append("هیچ‌کدام از این فرمان‌ها هنوز حتی یک بار انجام نشده‌اند.")
    else:
        tone = Tone.NEUTRAL.value
        forming = len(active) - len(untouched)
        statement = (
            f"از {_fa(len(active))} فرمانِ فعالت {_fa(forming)} تا دارد شکل می‌گیرد و "
            f"{_fa(len(untouched))} تا هنوز شروع نشده."
        )
        if best_streak:
            evidence.append(f"بلندترین رشتهٔ جاری: {_fa(best_streak)} روز.")

    return Facet(
        key="habits_internalized",
        title="چه‌قدر در تو جا افتاده",
        statement=statement,
        group=FacetGroup.HABITS.value,
        kind=Kind.MEASURED.value,
        tone=tone,
        confidence=round(min(0.85, 0.4 + 0.03 * len(rows)), 2),
        evidence=evidence,
        source_label=SRC_DIRECTIVES,
        owns_page=PAGE_DIRECTIVES,
    )


# ── (ب) چه‌قدر از آنچه شروع می‌کند تمام می‌شود ──────────────────────────────

async def _finish_rate_facet(db: AsyncSession, uid: int) -> Optional[Facet]:
    """شروع در برابر تمام‌کردن، و آنچه رها شده."""
    from app.models.todo_item import TodoItem

    rows = (
        await db.execute(
            select(TodoItem.is_completed, TodoItem.created_at, TodoItem.updated_at)
            .where(_scope(TodoItem.owner_id, uid), TodoItem.deleted_at.is_(None))
            .limit(5000)
        )
    ).all()
    total = len(rows)
    if total < MIN_ITEMS_FOR_RATE:
        return None

    done = sum(1 for is_completed, _c, _u in rows if is_completed)
    open_n = total - done
    rate = done / total

    cutoff = _dt.datetime.now(UTC) - _dt.timedelta(days=STALE_DAYS)
    stale = 0
    for is_completed, created, updated in rows:
        if is_completed:
            continue
        touched = _aware(updated) or _aware(created)
        if touched is not None and touched < cutoff:
            stale += 1
    stale_share = (stale / open_n) if open_n else 0.0

    evidence = [
        f"{_fa(total)} موردِ ثبت‌شده (بدونِ سطلِ زباله) شمرده شد.",
        f"نرخِ تمام‌کردن: {_pct(rate)}.",
    ]
    if stale:
        evidence.append(
            f"{_fa(stale)} موردِ باز بیش از {_fa(STALE_DAYS)} روز است که دست نخورده."
        )

    if rate >= FINISH_GOOD_AT and stale_share < STALE_SHARE_WATCH:
        tone = Tone.GOOD.value
        statement = (
            f"آنچه شروع می‌کنی معمولاً تمام می‌شود — از {_fa(total)} کاری که برای خودت "
            f"نوشته‌ای {_fa(done)} تا را بسته‌ای و فقط {_fa(open_n)} تا باز مانده."
        )
    elif rate < FINISH_WATCH_BELOW or stale_share >= STALE_SHARE_WATCH:
        tone = Tone.WATCH.value
        statement = (
            f"بیشتر از آنچه تمام کنی شروع می‌کنی — از {_fa(total)} کاری که برای خودت "
            f"نوشته‌ای {_fa(done)} تا بسته شده و {_fa(open_n)} تا باز مانده"
        )
        statement += (
            f"، که {_fa(stale)} تای آن بیش از {_fa(STALE_DAYS)} روز است دست نخورده."
            if stale
            else "."
        )
    else:
        tone = Tone.NEUTRAL.value
        statement = (
            f"تقریباً نیمی از آنچه می‌نویسی تمام می‌شود — {_fa(done)} تا از {_fa(total)} "
            f"مورد بسته شده و {_fa(open_n)} تا باز است."
        )

    return Facet(
        key="habits_finish_rate",
        title="شروع در برابر تمام‌کردن",
        statement=statement,
        group=FacetGroup.HABITS.value,
        kind=Kind.MEASURED.value,
        tone=tone,
        confidence=round(min(0.85, 0.35 + 0.005 * total), 2),
        evidence=evidence,
        source_label=SRC_ITEMS,
        owns_page=PAGE_LISTS,
    )


# ── (ب) بارِ عقب‌افتاده ─────────────────────────────────────────────────────

async def _overdue_facet(db: AsyncSession, uid: int) -> Optional[Facet]:
    """چه‌قدر از تاریخ‌هایی که خودت گذاشته‌ای رد شده‌ای."""
    from app.models.task import Task, TaskStatus
    from app.models.todo_item import TodoItem

    today = _local_today()

    task_rows = (
        await db.execute(
            select(Task.due_date)
            .where(
                _scope(Task.user_id, uid),
                Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS]),
                Task.merged_into_id.is_(None),
                Task.due_date.is_not(None),
            )
            .limit(2000)
        )
    ).scalars().all()

    item_rows = (
        await db.execute(
            select(TodoItem.due_date)
            .where(
                _scope(TodoItem.owner_id, uid),
                TodoItem.deleted_at.is_(None),
                TodoItem.is_completed.is_(False),
                TodoItem.due_date.is_not(None),
            )
            .limit(2000)
        )
    ).scalars().all()

    dated = [d for d in list(task_rows) + list(item_rows) if d is not None]
    if len(dated) < MIN_DATED_ITEMS:
        return None

    overdue = [d for d in dated if d < today]
    share = len(overdue) / len(dated)

    evidence = [
        f"{_fa(len(dated))} کارِ بازِ تاریخ‌دار شمرده شد ({_fa(len(task_rows))} از کارها و "
        f"{_fa(len(item_rows))} از لیست‌ها).",
    ]
    if overdue:
        worst = min(overdue)
        evidence.append(
            f"قدیمی‌ترینشان {_fa((today - worst).days)} روز از موعدش گذشته."
        )

    if not overdue:
        tone = Tone.GOOD.value
        statement = (
            f"هیچ‌کدام از {_fa(len(dated))} کارِ تاریخ‌دارت عقب نیفتاده — تاریخ‌هایی که "
            "برای خودت گذاشته‌ای را نگه داشته‌ای."
        )
    elif len(overdue) >= OVERDUE_WATCH_AT or share >= OVERDUE_SHARE_WATCH:
        tone = Tone.WATCH.value
        statement = (
            f"از {_fa(len(dated))} کارِ بازِ تاریخ‌دارت {_fa(len(overdue))} تا از موعدش "
            f"گذشته — تاریخ‌هایی که خودت گذاشته‌ای دارند از دستت در می‌روند."
        )
    else:
        tone = Tone.NEUTRAL.value
        statement = (
            f"از {_fa(len(dated))} کارِ بازِ تاریخ‌دارت {_fa(len(overdue))} تا کمی عقب "
            "افتاده؛ بقیه سرِ وقت‌اند."
        )

    evidence.append(f"سهمِ عقب‌افتاده: {_pct(share)}.")

    return Facet(
        key="habits_overdue_load",
        title="بارِ عقب‌افتاده",
        statement=statement,
        group=FacetGroup.HABITS.value,
        kind=Kind.MEASURED.value,
        tone=tone,
        confidence=round(min(0.85, 0.4 + 0.02 * len(dated)), 2),
        evidence=evidence,
        source_label=SRC_ITEMS,
        owns_page=PAGE_TASKS,
    )


# ── گردآوری ─────────────────────────────────────────────────────────────────

_PARTS: Tuple[Tuple[str, Any], ...] = (
    ("named_weaknesses", _named_weaknesses_facet),
    ("followthrough", _followthrough_facet),
    ("internalized", _internalized_facet),
    ("finish_rate", _finish_rate_facet),
    ("overdue", _overdue_facet),
)


async def _collect(db: AsyncSession, uid: int) -> Optional[List[Facet]]:
    facets: List[Facet] = []
    for name, builder in _PARTS:
        try:
            facet = await builder(db, uid)
        except Exception as exc:
            # مهار می‌شود تا یک بخش بقیه را زمین نزند — ولی **ساکت نیست**.
            # همان غلطِ نامِ ستون (`TodoItem.title` به‌جای `content`) اینجا
            # در لاگ داد می‌زند، نه اینکه برای همیشه خالی برگردد.
            logger.warning("owner-insight habits: %s failed: %r", name, exc)
            continue
        if facet is not None:
            facets.append(facet)
    # «نمی‌دانم» جوابِ درستی است؛ کارتِ توخالی نمی‌سازیم.
    return facets or None


register(
    Provider(
        key="habits",
        label="عادت‌ها، پایبندی و ضعف‌هایی که خودت نوشته‌ای",
        owns_page=PAGE_DIRECTIVES,
        collect=_collect,
        group_order=50,
    )
)
