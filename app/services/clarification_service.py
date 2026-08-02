"""حلقهٔ رفعِ ابهام — وقتی موتور شک دارد، به‌جای حدس‌زدن **می‌پرسد**.

خواستهٔ مالک: ارتباط دوطرفه شود؛ ابهامِ هوش مصنوعی نه مغفول بماند و نه با
حدس اشتباه ثبت شود. مسیرِ کامل:

    جایی در خطِ لوله شک می‌کند
        → ask()   (فرم می‌سازد یا با فرمِ بازِ همان موضوع ادغام می‌کند)
        → فرمِ پرشدنی در تلگرام (force_reply)
        → مالک هرچه‌قدر خواست پر می‌کند (کوتاه/بلند/خالی)
        → hand_reply()  (هوش مصنوعی جوابِ آزاد را به فیلدها نگاشت می‌کند)
        → file_answers() (در بخش‌های واقعی ثبت می‌شود)
        → فیدبکِ تلگرام: چه چیزی کجا ثبت شد و چه چیزی هنوز باز است
        → هرچه بی‌جواب ماند، با فاصلهٔ فزاینده دوباره پرسیده می‌شود

اصولِ طراحی (هرکدام مستقیماً از خواستهٔ مالک):

* **هیچ فیلدی هاردکد نیست.** ``_generate_questions`` هر بار برحسب موضوع
  فیلد می‌سازد. اگر مدل نبود، یک فیلدِ آزاد جایگزین می‌شود — نه یک فرمِ ثابت.
* **جوابِ نصفه طبیعی است.** فیلدِ خالی «رد نشده»، «هنوز باز» است.
* **دوباره‌پرسی.** پیامی که بالا رفته یا دیده نشده، با backoff تکرار می‌شود.
* **ادغام، نه تکثیر.** سؤالِ تازه دربارهٔ موضوعِ باز به همان فرم اضافه می‌شود.
* **هیچ‌چیز حذف نمی‌شود.** فرمِ رهاشده ``parked`` می‌شود و در برنامه می‌ماند.

این سرویس هیچ FastAPI ای import نمی‌کند و هرگز استثنا به بیرون نمی‌دهد —
یک سؤالِ ناموفق نباید ثبتِ خودِ داده را خراب کند.
"""
from __future__ import annotations

import json
import logging
import re
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from typing import Any, Callable, Dict, List, Optional

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified


def _scope(model, user_id: Optional[int]):
    """محدودهٔ دادهٔ یک کاربر — همان قاعدهٔ همه‌جای پروژه.

    ردیف‌های قدیمی ``user_id`` ندارند (NULL) و متعلق به دامنهٔ ناشناس (۰)
    هستند، پس برابریِ خشک ``user_id == uid`` آن‌ها را نامرئی می‌کند. این تابع
    همان جفت را برمی‌گرداند تا هیچ کوئری‌ای نه چیزی گم کند و نه چیزی از
    کاربرِ دیگر ببیند.
    """
    uid = int(user_id or 0)
    if uid == 0:
        return or_(model.user_id == 0, model.user_id.is_(None))
    return model.user_id == uid


# مجرای تلگرام تک‌مالکی است (یک بات، یک chat_id پیکربندی‌شده). هر چیزی که از
# آن طرف می‌رود یا می‌آید متعلق به همین دامنه است — همان دامنهٔ ناشناس/تک‌مستأجرِ
# بقیهٔ برنامه.
TELEGRAM_SCOPE_USER_ID = 0


def _row_in_scope(row, user_id: Optional[int]) -> bool:
    """همان قاعده، ولی روی یک ردیفِ از پیش خوانده‌شده (بعد از ``db.get``)."""
    if row is None:
        return False
    owner = getattr(row, "user_id", None)
    uid = int(user_id or 0)
    return (owner or 0) == uid

logger = logging.getLogger(__name__)

MAX_FIELDS = 6            # یک فرمِ طولانی پر نمی‌شود؛ سؤالِ بیشتر → دفعهٔ بعد
MAX_OPEN_FORMS = 8        # سقفِ فرم‌های بازِ هم‌زمان تا تلگرام سیل نشود
MAX_ATTEMPTS = 5          # بعد از این، فرم parked می‌شود (نه حذف)
# فاصلهٔ ارسالِ مجدد (ساعت) به‌ازای شمارهٔ تلاش — فزاینده، تا نه فراموش شود
# نه آزاردهنده. تلاشِ اول فوری است.
BACKOFF_HOURS = (0, 6, 24, 72, 168)

FIELD_TYPES = ("short", "long", "choice", "date", "number", "yesno")


# ── ساختنِ سؤال‌ها (پویا، برحسب موضوع) ───────────────────────────────────────

_QUESTION_PROMPT = """تو دستیارِ یک برنامهٔ مدیریت زندگی هستی. موتورِ برنامه دارد
یک دادهٔ ورودی را مسیریابی می‌کند و در جایی شک دارد. باید **کمترین تعداد سؤالِ
لازم** را طراحی کنی تا صاحبِ برنامه با پرکردنشان ابهام را رفع کند.

فقط یک شیء JSON برگردان، بدون توضیحِ اضافه:

{{"fields": [{{"key": "snake_case_en", "label": "پرسش به فارسی و کوتاه",
"type": "short|long|choice|date|number|yesno", "choices": ["..."],
"why": "چرا این را می‌پرسیم، یک جملهٔ کوتاه فارسی", "required": true}}]}}

قواعد (سخت‌گیرانه — پرسشِ بد بدتر از نپرسیدن است):
- حداکثر {max_fields} فیلد، و در عمل ۱ تا ۳ تا کافی است.
- **هرگز** از او نپرس این داده به کدام بخش برنامه برود (سند/کار/یادداشت/
  تراکنش). دسته‌بندی کارِ توست، نه او. اگر مطمئن نیستی، خودت محتمل‌ترین را
  انتخاب کن و فقط دربارهٔ «واقعیتی» که نمی‌دانی بپرس.
- **هرگز** «عنوان کوتاه چیست؟» یا «توضیح بده» نپرس؛ اینها را از متن بساز.
- فقط چیزی را بپرس که یک انسان با یک نگاه می‌داند و از متن **قابل استخراج
  نیست** — مثلاً «این هزینه بابتِ کدام پروژه بود؟» یا «مهلتش کِی است؟».
- هر پرسش باید مستقل و بدونِ خواندنِ متنِ اصلی هم قابل‌فهم باشد؛ به «این
  مورد» یا «این ورودی» ارجاع نده، خودِ چیز را نام ببر.
- «why» را حتماً پر کن: یک جمله که بگوید این جواب چه چیزی را در برنامه درست
  می‌کند. مالک باید بفهمد چرا وقت می‌گذارد.
- «choice» فقط وقتی گزینه‌ها واقعاً محدود و مشخص‌اند؛ choices را پر کن —
  گزینه‌ای بودن یعنی او فقط یک دکمه می‌زند و این بهترین حالت است.
- اگر متنِ ورودی آن‌قدر بی‌محتواست که پرسشِ معناداری نمی‌شود ساخت (مثلاً فقط
  یک نامِ فایل)، fields را **خالی** برگردان — سؤالِ بی‌معنا نپرس.
- اگر هیچ ابهامِ واقعی‌ای نیست، fields را خالی برگردان.

موضوع: {topic}
مقصدهای ممکنِ ثبت: {targets}
متنِ ورودی:
{context}
"""


async def _generate_questions(
    db: AsyncSession, *, topic: str, context: str, targets: str, hint: Optional[str] = None
) -> tuple[List[Dict[str, Any]], Optional[str]]:
    """فیلدهای فرم را برحسب موضوع می‌سازد. (fields, model_name)

    اگر مدل نباشد یا خطا بدهد، یک فیلدِ آزاد برمی‌گردد — چون «سؤال نپرسیدن»
    یعنی همان مغفول‌ماندنی که قرار بود حل شود."""
    try:
        from app.services.ai.inference_gateway import complete

        prompt = _QUESTION_PROMPT.format(
            max_fields=MAX_FIELDS, topic=topic[:200],
            targets=targets[:400], context=(context or "")[:2000],
        )
        if hint:
            prompt += f"\nراهنمایی از خودِ موتور: {hint[:300]}\n"
        res = await complete(db, prompt, task="inbox_triage", max_tokens=700)
        if res.get("ok"):
            obj = _parse_json_object(res.get("text") or "")
            fields = _normalize_fields((obj or {}).get("fields"))
            if fields is not None:      # [] هم جوابِ معتبری است: «ابهامی نیست»
                return fields, res.get("model")
    except Exception as exc:
        logger.debug("clarification question generation fell back: %r", exc)
    return _fallback_fields(topic), None


def _fallback_fields(topic: str) -> List[Dict[str, Any]]:
    return [{
        "key": "free_answer",
        "label": f"دربارهٔ «{topic[:80]}» چه باید بدانم تا درست ثبتش کنم؟",
        "type": "long",
        "choices": [],
        "why": "مدل در دسترس نبود، پس یک پرسشِ باز پرسیده می‌شود تا چیزی از قلم نیفتد.",
        "required": False,
    }]


def _normalize_fields(raw: Any) -> Optional[List[Dict[str, Any]]]:
    """خروجیِ مدل را به شکلِ امن و یکدست درمی‌آورد؛ None یعنی «قابل استفاده نبود»."""
    if not isinstance(raw, list):
        return None
    out: List[Dict[str, Any]] = []
    seen = set()
    for item in raw[:MAX_FIELDS]:
        if not isinstance(item, dict):
            continue
        label = str(item.get("label") or "").strip()
        if not label:
            continue
        key = _safe_key(item.get("key") or label, seen)
        ftype = str(item.get("type") or "short").strip().lower()
        if ftype not in FIELD_TYPES:
            ftype = "short"
        choices = item.get("choices")
        choices = [str(c)[:80] for c in choices[:8]] if isinstance(choices, list) else []
        out.append({
            "key": key,
            "label": label[:200],
            "type": ftype,
            "choices": choices,
            "why": str(item.get("why") or "")[:200],
            "required": bool(item.get("required", False)),
            "answer": None,
            "answered_at": None,
        })
        seen.add(key)
    return out


def _safe_key(raw: Any, seen: set) -> str:
    key = re.sub(r"[^a-z0-9_]+", "_", str(raw).strip().lower())[:40].strip("_")
    if not key:
        key = "field"
    base, n = key, 2
    while key in seen:
        key = f"{base}_{n}"
        n += 1
    return key


def _parse_json_object(text: str) -> Optional[Dict[str, Any]]:
    cleaned = re.sub(r"```(?:json)?", "", text or "").strip()
    decoder = json.JSONDecoder()
    for start in range(len(cleaned)):
        if cleaned[start] != "{":
            continue
        try:
            obj, _ = decoder.raw_decode(cleaned[start:])
        except ValueError:
            continue
        if isinstance(obj, dict):
            return obj
    return None


# ── ساخت / ادغام ────────────────────────────────────────────────────────────

# ── نوشتن روی ستون‌های JSON ─────────────────────────────────────────────────
# دامِ کلاسیکِ SQLAlchemy: ستونِ JSONِ ساده «تغییرِ درجا» را نمی‌بیند. اگر
# `list(c.questions)` بگیری و دیکشنری‌های درونش را عوض کنی، لیستِ قدیم و جدید
# *همان* دیکشنری‌ها را دارند، پس در flush برابر دیده می‌شوند و UPDATE صادر
# نمی‌شود — جواب در حافظه هست و در دیتابیس نیست. (این دقیقاً یک بار اتفاق
# افتاد: تست‌های هم‌نشست سبز بودند و رکوردِ واقعی خالی.) پس: کپیِ عمیق برای
# ویرایش، و flag_modified موقعِ نوشتن.

def _questions_of(c) -> List[Dict[str, Any]]:
    return deepcopy(list(c.questions or []))


def _write_json(obj, field: str, value) -> None:
    setattr(obj, field, value)
    flag_modified(obj, field)


def _unanswered(c) -> List[Dict[str, Any]]:
    return [q for q in (c.questions or []) if not str(q.get("answer") or "").strip()]


def _answered(c) -> List[Dict[str, Any]]:
    return [q for q in (c.questions or []) if str(q.get("answer") or "").strip()]


async def ask(
    db: AsyncSession,
    *,
    topic: str,
    context: str = "",
    source: str = "engine",
    source_ref: Optional[str] = None,
    target: Optional[Dict[str, Any]] = None,
    questions: Optional[List[Dict[str, Any]]] = None,
    hint: Optional[str] = None,
    priority: int = 0,
    user_id: int = 0,
):
    """یک ابهام را به فرم تبدیل می‌کند — یا با فرمِ بازِ همان موضوع ادغام.

    ``questions`` را فقط جایی بده که خودِ دامنه گزینه‌های قطعی دارد (مثلاً
    «کدام حساب؟» با فهرستِ واقعیِ حساب‌ها)؛ در بقیهٔ موارد خالی بگذار تا
    برحسب موضوع ساخته شوند. برمی‌گرداند: رکورد، یا None اگر ابهامی نبود."""
    from app.models.clarification import Clarification

    try:
        existing = None
        if source_ref:
            existing = (
                await db.execute(
                    select(Clarification)
                    .where(
                        Clarification.source_ref == source_ref,
                        # ادغام فقط **درونِ دامنهٔ همان کاربر**. بدونِ این شرط،
                        # دو کاربر که source_ref یکسانی تولید می‌کنند (مثلاً
                        # «sms:<همان شناسه>») به یک فرم می‌رسیدند: دومی موضوع و
                        # متنِ خامِ اولی را پس می‌گرفت و جوابش روی مقصدِ او
                        # می‌نشست. ردیف‌های قدیمی user_id NULL دارند و همان
                        # دامنهٔ ناشناس (۰) حساب می‌شوند — مثل بقیهٔ جدول‌ها.
                        _scope(Clarification, user_id),
                        # «filed»/«skipped» بسته‌اند: جوابشان قبلاً جایی نشسته،
                        # پس سؤالِ تازه فرمِ تازه است. بقیه — حتی «answered»ی که
                        # هنوز ثبت نشده — پذیرای سؤالِ تازه‌اند.
                        Clarification.status.in_(("open", "partial", "parked", "answered")),
                    )
                    .limit(1)
                )
            ).scalar_one_or_none()

        fields = _normalize_fields(questions) if questions else None
        model_name = None
        if fields is None:
            targets = await _targets_text(db, user_id)
            fields, model_name = await _generate_questions(
                db, topic=humanize_topic(topic), context=context,
                targets=targets, hint=hint,
            )
        if not fields and existing is None:
            return None  # مدل گفت ابهامِ واقعی‌ای نیست — سؤالِ الکی نمی‌سازیم

        if existing is not None:
            merged = _merge_fields(_questions_of(existing), fields)
            if len(merged) == len(existing.questions or []):
                return existing          # چیزی تازه نبود
            _write_json(existing, "questions", merged)
            # سؤالِ تازه = فرم دوباره «باز» است و باید دوباره فرستاده شود.
            existing.status = "partial" if _answered(existing) else "open"
            if existing.status == "parked":
                existing.status = "open"
            existing.attempts = max(0, (existing.attempts or 0) - 1)
            await db.flush()
            return existing

        row = Clarification(
            user_id=user_id, topic=humanize_topic(topic)[:300],
            context=(context or "")[:4000],
            source=source[:48], source_ref=(source_ref or "")[:191] or None,
            target=target or {"kind": "none"}, questions=fields, answers=[],
            result=[], status="open", priority=int(priority), attempts=0,
            ai_model=model_name,
        )
        db.add(row)
        await db.flush()
        return row
    except Exception as exc:
        logger.debug("clarification ask skipped: %r", exc)
        return None


def _merge_fields(old: List[Dict[str, Any]], new: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """سؤالِ تازه اضافه می‌شود؛ جوابِ داده‌شده هرگز پاک نمی‌شود.

    تشخیصِ تکرار با کلید **و** با متنِ نرمال‌شدهٔ پرسش، چون مدل ممکن است همان
    سؤال را با کلیدِ دیگری بسازد و مالک نباید دو بار یک چیز را بخواند."""
    merged = list(old)
    keys = {q.get("key") for q in old}
    labels = {_norm_label(q.get("label")) for q in old}
    for q in new or []:
        if q.get("key") in keys or _norm_label(q.get("label")) in labels:
            continue
        merged.append(q)
        keys.add(q.get("key"))
        labels.add(_norm_label(q.get("label")))
    return merged[: MAX_FIELDS * 2]


def _norm_label(value: Any) -> str:
    return re.sub(r"[\s‌؟?:.،,]+", "", str(value or "")).lower()


async def _targets_text(db: AsyncSession, user_id: int) -> str:
    """مقصدهای زندهٔ ثبت — همان رجیستریِ خودشناسِ صندوق، نه فهرستِ ثابت."""
    try:
        from app.services.inbox_service import destination_catalog

        cat = await destination_catalog(db, user_id)
        # targets فهرستی از dict است ({key, label})، نه رشته. نسخهٔ اول
        # مستقیم join می‌کرد و **هر بار** TypeError می‌داد؛ except خالیِ زیر
        # صدایش را می‌خورد و تابع همیشه همان رشتهٔ هاردکدِ ۷تایی را برمی‌گرداند.
        # یعنی رجیستریِ زنده — که کلِ هدفش همین بود — در تنها جایی که شکلِ
        # سؤالِ مالک را تعیین می‌کند مرده بود. (۲۰۲۶-۰۸-۰۲)
        parts = [", ".join(t["key"] for t in (cat.get("targets") or []) if t.get("key"))]
        if cat.get("lists"):
            parts.append("لیست‌ها: " + ", ".join(str(x) for x in cat["lists"][:20]))
        if cat.get("pages"):
            parts.append("صفحه‌ها: " + ", ".join(
                (p.get("label") if isinstance(p, dict) else str(p)) for p in cat["pages"][:25]
            ))
        return " | ".join(p for p in parts if p)
    except Exception as exc:
        # صدادار، نه خاموش: همین سکوت بود که خرابیِ بالا را ماه‌ها پنهان کرد.
        logger.warning("clarification targets fell back to the hardcoded list: %r", exc)
        return "task, todo, note, person, finance_account, document, transaction"



# ── خوانا کردنِ موضوع ────────────────────────────────────────────────────────
# چرا لازم است (بازخوردِ مالک، ۲۰۲۶-۰۷-۳۱): فرمِ واقعی با این موضوع رفت —
# «Project_manager: Project_manager 📎 scan_bundle_c9e90b2b-4141-4012-...pdf»
# یعنی نامِ فرستنده دوبار، یک UUID، و پسوندِ فایل. برای آدم بی‌معناست، و
# بدتر: مدل هم با همین متنِ بی‌معنا سؤال می‌سازد، پس سؤال‌ها هم بی‌معنا
# می‌شوند. تمیزکاری باید سرِ **ساخت** انجام شود، نه سرِ نمایش.

# بدونِ \b — نامِ فایل شناسه را با «_» می‌چسباند، پس مرزِ واژه‌ای در کار نیست.
_UUID_RE = re.compile(r"[0-9a-f]{8}(?:-[0-9a-f]{4}){1,4}(?:-[0-9a-f]{6,12})?", re.I)
_HASH_RE = re.compile(r"(?<![0-9a-z])[0-9a-f]{16,}(?![0-9a-z])", re.I)
_EXT_FA = {
    "pdf": "PDF", "jpg": "تصویر", "jpeg": "تصویر", "png": "تصویر", "webp": "تصویر",
    "doc": "سند word", "docx": "سند word", "xls": "صفحهٔ اکسل", "xlsx": "صفحهٔ اکسل",
    "csv": "جدول", "zip": "بستهٔ فشرده", "mp3": "صوت", "ogg": "صوت", "m4a": "صوت",
}


def _looks_machine_made(text: str) -> bool:
    """آیا این رشته «نامِ فایل/شناسه» است یا جملهٔ آدمیزاد؟

    تمیزکاریِ تهاجمی فقط برای حالتِ اول مجاز است. نسخهٔ اول این تفکیک را
    نداشت و روی متنِ عادی هم اجرا می‌شد: «موجودیِ 1,000,000 IRR» به
    «موجودیِ 1 000 IRR» تبدیل می‌شد (هزار برابر کمتر!) و «فاکتور شماره
    1002345» شمارهٔ فاکتورش را از دست می‌داد (ممیزی ۲۰۲۶-۰۷-۳۱).
    """
    if _UUID_RE.search(text) or _HASH_RE.search(text):
        return True
    if re.search(r"\.(pdf|jpe?g|png|webp|docx?|xlsx?|csv|zip|mp3|ogg|m4a)\b", text, re.I):
        return True
    # یک توکنِ بلندِ چسبیده با _ یا - و بدونِ فاصله = نامِ فایل
    return bool(re.fullmatch(r"[\w.\-]{12,}", text.strip()))


def humanize_topic(raw: str) -> str:
    """موضوعِ خوانا. متنِ آدمیزاد دست‌نخورده می‌ماند؛ فقط نامِ فایل/شناسه
    تمیز می‌شود."""
    text = re.sub(r"\s+", " ", str(raw or "")).strip().replace("📎", " ")
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return "یک موردِ نامشخص"
    if not _looks_machine_made(text):
        # جملهٔ عادی: فقط تکرارِ بلافصلِ همان عبارت را بردار و کوتاهش کن.
        text = re.sub(r"^(.{4,40}?)[:\s]+\1\b", r"\1", text).strip(" :،-")
        return text[:120]

    kind = ""
    m = re.search(r"\.([A-Za-z0-9]{2,5})(?:\s|$)", text)
    if m and m.group(1).lower() in _EXT_FA:
        kind = _EXT_FA[m.group(1).lower()]
        text = text[: m.start()] + " " + text[m.end():]
    text = _UUID_RE.sub(" ", text)
    text = _HASH_RE.sub(" ", text)

    tokens = [t for t in re.split(r"[\s_\-:،,/\\]+", text) if t]
    noise = {"scan", "bundle", "img", "image", "doc", "docs", "file", "files",
             "attachment", "attachments", "untitled", "copy", "final", "new"}
    kept, seen = [], set()
    for tok in tokens:
        low = tok.lower().strip(".")
        if low in noise or not low:
            continue
        # شناسهٔ ماشینی: هگزِ بلندی که هم رقم دارد هم حرف (پس «1002345» و
        # «1403» و «000» سالم می‌مانند)
        if (len(low) >= 8 and re.fullmatch(r"[0-9a-f]+", low)
                and any(ch.isdigit() for ch in low) and any(ch.isalpha() for ch in low)):
            continue
        if low in seen:                       # «Project_manager: Project_manager»
            continue
        seen.add(low)
        kept.append(tok.strip("."))

    clean = re.sub(r"\s+", " ", " ".join(kept)).strip(" _-.:")
    if len(clean) < 3:
        return f"یک {kind or 'مورد'}ِ بدونِ عنوان"
    return f"{kind}: {clean[:80]}" if kind else clean[:100]


# ── رندرِ HTML (به‌جای Markdown) ─────────────────────────────────────────────
# Markdown تلگرام روی «_» و «*» داخلِ نامِ فایل و متنِ فارسی می‌شکند — در
# فرمِ واقعی نامِ فایل ایتالیک شد و جمله به‌هم ریخت. HTML با escape امن است.

def _esc(value: Any) -> str:
    import html as _html

    return _html.escape(str(value or ""))


def _progress(c) -> str:
    total = len(c.questions or [])
    done = len(_answered(c))
    return f"{done} از {total} پاسخ داده شده"


# ── رندرِ فرم ───────────────────────────────────────────────────────────────

def _type_hint(q: Dict[str, Any]) -> str:
    if q.get("type") == "choice" and q.get("choices"):
        return "  (" + " / ".join(q["choices"][:6]) + ")"
    return {"date": "  (تاریخ)", "yesno": "  (بله / خیر)", "number": "  (عدد)"}.get(
        q.get("type"), ""
    )


def render_form(c, *, reminder: bool = False) -> str:
    """فرمِ پرشدنی و قابلِ ویرایش — با HTML، نه Markdown.

    چرا HTML: Markdownِ تلگرام روی «_» و «*» می‌شکند و نامِ فایل‌های واقعی پر
    از «_» است؛ در فرمِ واقعی جمله ایتالیک و به‌هم‌ریخته رسید. با escape هیچ
    ورودی‌ای نمی‌تواند قالب را خراب کند.

    شماره‌گذاری روی *همهٔ* فیلدهاست تا بینِ ارسال‌های پیاپی جابه‌جا نشود، و
    جوابِ قبلی جلوی خطش می‌آید تا ویرایش و پرکردن یک حرکت باشند.
    """
    head = "🔄 <b>یادآوری — هنوز جواب نگرفتم</b>" if reminder else "❓ <b>یک ابهام دارم</b>"
    lines = [head, "", f"📌 <b>موضوع:</b> {_esc(c.topic)}"]
    snippet = re.sub(r"\s+", " ", (c.context or "")).strip()
    if snippet:
        lines.append(f"<blockquote>{_esc(snippet[:250])}</blockquote>")
    lines.append(f"📊 <i>{_progress(c)}</i>")
    lines += ["", "<b>برای جواب، همین پیام را ریپلای کن و خط‌ها را پر کن:</b>", ""]
    for idx, q in enumerate(c.questions or [], start=1):
        answer = str(q.get("answer") or "").strip()
        if answer:
            shown = answer if len(answer) <= 60 else answer[:57] + "…"
            lines.append(f"{idx}) {_esc(q['label'])}: <b>{_esc(shown)}</b>  ✅")
        else:
            hint = _type_hint(q)
            lines.append(f"{idx}) {_esc(q['label'])}{_esc(hint)}: ______")
            why = str(q.get("why") or "").strip()
            if why:
                lines.append(f"   <i>{_esc(why)}</i>")
    footer = [
        "",
        "• خطی که نمی‌دانی را خالی بگذار — بعداً دوباره می‌پرسم.",
        "• خطی که پر است جوابِ قبلیِ توست؛ عوضش کنی به‌روز می‌شود.",
        "• سؤالم را نفهمیدی؟ دکمهٔ «❓ سؤال دارم» را بزن.",
    ]
    # بودجهٔ طول: سقفِ تلگرام ۴۰۹۶ است و برشِ خامِ لایهٔ ارسال، وسطِ یک تگِ
    # HTML می‌بُرد → تلگرام کلِ پیام را رد می‌کرد و نسخهٔ بدونِ قالب می‌رفت
    # (تگ‌های خام و بی‌راهنما). حالا خودمان جا باز می‌کنیم: اول توضیحِ «چرا»،
    # بعد نقلِ‌قول، و راهنما هرگز قربانی نمی‌شود (ممیزی ۲۰۲۶-۰۷-۳۱).
    budget = 3600
    def _size(body):
        return len("\n".join(body + footer))
    if _size(lines) > budget:
        lines = [ln for ln in lines if not ln.startswith("   <i>")]
    if _size(lines) > budget:
        lines = [ln for ln in lines if not ln.startswith("<blockquote>")]
    while _size(lines) > budget and len(lines) > 6:
        lines.pop(-1)                      # آخرین پرسش‌ها کوتاه می‌شوند
        lines.append("… (بقیهٔ پرسش‌ها را بعد از این جواب‌ها می‌فرستم)")
        if _size(lines) <= budget:
            break
        lines.pop(-1)
    return "\n".join(lines + footer)


def _pick_rows(c) -> List[List[Dict[str, Any]]]:
    """دکمه‌های آماده برای فیلدهای گزینه‌ای/بله‌خیر — تایپ‌نکردن بهترین UX است."""
    rows: List[List[Dict[str, Any]]] = []
    for qi, q in enumerate(c.questions or []):
        if str(q.get("answer") or "").strip():
            continue
        options: List[str] = []
        if q.get("type") == "choice":
            options = list(q.get("choices") or [])[:6]
        elif q.get("type") == "yesno":
            options = ["بله", "خیر"]
        if not options:
            continue
        rows.append([{"text": f"↓ {str(q.get('label') or '')[:48]}", "callback_data": "clar:noop"}])
        row: List[Dict[str, Any]] = []
        for oi, opt in enumerate(options):
            row.append({"text": str(opt)[:28], "callback_data": f"clar:pick:{c.id}:{qi}:{oi}"})
            if len(row) == 2:
                rows.append(row)
                row = []
        if row:
            rows.append(row)
    return rows


def _form_markup(c) -> Dict[str, Any]:
    """کیبوردِ شیشه‌ای: گزینه‌های آماده + پرسیدنِ متقابل + تعویق/رد."""
    rows = _pick_rows(c)
    rows.append([
        {"text": "❓ سؤال دارم", "callback_data": f"clar:ask:{c.id}"},
        {"text": "📄 نمایش دوباره", "callback_data": f"clar:show:{c.id}"},
    ])
    rows.append([
        {"text": "⏰ بعداً", "callback_data": f"clar:snooze:{c.id}"},
        {"text": "🚫 مربوط نیست", "callback_data": f"clar:skip:{c.id}"},
    ])
    return {"inline_keyboard": rows}


# ── ارسال و ارسالِ مجدد ─────────────────────────────────────────────────────

def _due(c, now: datetime) -> bool:
    """آیا الان باید (دوباره) فرستاده شود؟"""
    if c.status not in ("open", "partial"):
        return False
    if c.snoozed_until and _aware(c.snoozed_until) > now:
        return False
    if not _unanswered(c):
        return False
    attempts = int(c.attempts or 0)
    if attempts == 0:
        return True
    if attempts >= MAX_ATTEMPTS:
        return False
    hours = BACKOFF_HOURS[min(attempts, len(BACKOFF_HOURS) - 1)]
    last = _aware(c.last_sent_at)
    return last is None or (now - last) >= timedelta(hours=hours)


def _aware(value):
    if value is None:
        return None
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


async def send_form(db: AsyncSession, c, *, reminder: bool = False) -> bool:
    """فرم را به تلگرام می‌فرستد و message_id را نگه می‌دارد (کلیدِ گره‌خوردنِ
    جواب). force_reply یعنی کادرِ جواب همان‌جا باز می‌شود."""
    try:
        from app.services.telegram_service import get_telegram_bot

        bot = get_telegram_bot()
        if not bot.is_configured():
            return False
        # کیبوردِ شیشه‌ای (گزینه‌های آماده + «سؤال دارم») بر force_reply مقدم
        # است، چون تلگرام فقط یکی را در هر پیام می‌پذیرد و یک‌ضربه‌ای‌بودنِ
        # گزینه‌ها ارزشش بیشتر است. اگر هیچ فیلدِ دکمه‌ای نبود، force_reply
        # می‌آید تا کادرِ جواب خودش باز شود.
        markup = _form_markup(c)
        if not _pick_rows(c):
            markup = {
                "force_reply": True,
                "input_field_placeholder": "خط‌ها را پر کن و بفرست",
            }
        res = await bot.send(
            render_form(c, reminder=reminder), silent=not reminder,
            reply_markup=markup, parse_mode="HTML",
        )
        ok = bool(isinstance(res, dict) and res.get("ok"))
        mid = res.get("message_id") if isinstance(res, dict) else None
        if not ok:
            # ارسال نشد → تلاش را نسوزان. نسخهٔ اول بی‌قید شمارنده را بالا
            # می‌برد، پس فرمی که اصلاً تحویل نشده بود بعد از ۵ بار «رهاشده»
            # می‌شد و دیگر هرگز پرسیده نمی‌شد (ممیزی ۲۰۲۶-۰۷-۳۱).
            logger.debug("clarification form not delivered: %r", res)
            return False
        if mid:
            c.message_id = str(mid)
            c.chat_id = str(bot.chat_id or "") or c.chat_id
        c.attempts = int(c.attempts or 0) + 1
        c.last_sent_at = datetime.now(timezone.utc)
        # تلگرام در یک پیام یا force_reply می‌پذیرد یا دکمهٔ شیشه‌ای، نه هر دو.
        # ارسالِ اول تمیز می‌ماند (فقط کادرِ جواب باز می‌شود)؛ دکمه‌های
        # «بعداً/مربوط نیست» فقط از یادآوریِ دوم به بعد می‌آیند — یعنی دقیقاً
        # وقتی که مالک یک بار جواب نداده و شاید اصلاً نخواهد جواب بدهد.
        # وقتی force_reply رفته (فرمِ تمام‌متنی)، دکمه‌ها در یک پیامِ کوتاهِ
        # جدا می‌آیند — فقط از یادآوریِ دوم به بعد، تا ارسالِ اول شلوغ نشود.
        if reminder and not _pick_rows(c):
            try:
                await bot.send("این پرسش را می‌خواهی چه کنم؟", silent=True,
                               reply_markup=_form_markup(c))
            except Exception:
                pass
        return bool(mid)
    except Exception as exc:
        logger.debug("clarification send failed: %r", exc)
        return False


async def dispatch_pending(db: AsyncSession, now: Optional[datetime] = None) -> Dict[str, Any]:
    """تیکِ زمان‌بند: فرم‌های سررسیده را بفرست، رهاشده‌ها را park کن.

    «park» یعنی از چرخهٔ پرسش بیرون می‌رود ولی در برنامه دیده می‌شود — هیچ
    سؤالی حذف نمی‌شود."""
    from app.models.clarification import Clarification

    now = now or datetime.now(timezone.utc)
    sent = parked = 0
    try:
        rows = (
            await db.execute(
                select(Clarification)
                .where(
                    Clarification.status.in_(("open", "partial")),
                    # تلگرام **یک** مقصد دارد: مالک. پس فقط فرم‌های دامنهٔ
                    # مالک آنجا فرستاده می‌شوند. بدونِ این شرط، فرمِ هر حسابِ
                    # دیگری با متنِ خامش (پیامکِ بانکی، اعلانِ شخصی) در چتِ
                    # مالک بالا می‌آمد و جوابِ مالک هم روی دادهٔ آن حساب
                    # می‌نشست. فرم‌های بقیه در «سؤال‌های باز»ِ خودشان می‌مانند
                    # — چیزی حذف نمی‌شود، فقط از این مجرا بیرون است.
                    _scope(Clarification, TELEGRAM_SCOPE_USER_ID),
                )
                .order_by(Clarification.priority.desc(), Clarification.id.asc())
                .limit(50)
            )
        ).scalars().all()
        for c in rows:
            if int(c.attempts or 0) >= MAX_ATTEMPTS and _unanswered(c):
                c.status = "parked"
                parked += 1
                continue
            if sent >= MAX_OPEN_FORMS:
                break
            if _due(c, now) and await send_form(db, c, reminder=int(c.attempts or 0) > 0):
                sent += 1
        await db.commit()
    except Exception as exc:
        logger.debug("clarification dispatch skipped: %r", exc)
        try:
            await db.rollback()
        except Exception:
            pass
    return {"sent": sent, "parked": parked}


# ── تحلیلِ جواب ─────────────────────────────────────────────────────────────

_ANSWER_PROMPT = """صاحبِ برنامه به یک فرمِ پرسش جواب داده. جواب را به فیلدها نگاشت کن.

فقط یک شیء JSON برگردان:
{{"answers": {{"<key>": "<جوابِ همان فیلد یا رشتهٔ خالی>"}}, "note": "هر نکتهٔ
اضافه‌ای که گفته ولی به هیچ فیلدی نمی‌خورد"}}

قواعد مهم:
- کاربر ممکن است شماره‌گذاری را رعایت نکند، فقط چند خط بنویسد، یا یک
  پاراگرافِ پیوسته بنویسد. معنا را بفهم، نه قالب را.
- فیلدی که جوابش را نداده یا خالی گذاشته → رشتهٔ خالی. **حدس نزن.**
- «نمی‌دانم» / «بعداً» / «-» یعنی بی‌جواب → رشتهٔ خالی.
- جوابِ کوتاه را کش نده و جوابِ بلند را خلاصه نکن؛ عیناً همان را بگذار.
- برای فیلدِ choice، نزدیک‌ترین گزینه را انتخاب کن؛ اگر هیچ‌کدام نبود، عینِ
  حرفِ کاربر را بگذار.

فیلدها:
{fields}

جوابِ کاربر:
{reply}
"""


async def parse_reply(db: AsyncSession, c, text: str) -> Dict[str, str]:
    """جوابِ آزادِ کاربر → {key: value}. خالی‌ها برنمی‌گردند.

    روی **همهٔ** فیلدها کار می‌کند، نه فقط بی‌جواب‌ها — چون فرم قابلِ ویرایش
    است و مالک ممکن است جوابِ قبلی‌اش را عوض کند."""
    pending = list(c.questions or [])
    if not pending:
        return {}
    heuristic = _heuristic_map(pending, text)
    try:
        from app.services.ai.inference_gateway import complete

        fields_txt = "\n".join(
            f"- {q['key']} ({q['type']}): {q['label']}"
            + (f" [گزینه‌ها: {', '.join(q['choices'])}]" if q.get("choices") else "")
            for q in pending
        )
        res = await complete(
            db, _ANSWER_PROMPT.format(fields=fields_txt, reply=(text or "")[:3000]),
            task="inbox_triage", max_tokens=800,
        )
        if res.get("ok"):
            obj = _parse_json_object(res.get("text") or "") or {}
            answers = obj.get("answers")
            if isinstance(answers, dict):
                out = {}
                valid = {q["key"] for q in pending}
                for key, value in answers.items():
                    if key in valid and _meaningful(value):
                        out[key] = str(value).strip()[:2000]
                note = obj.get("note")
                if _meaningful(note):
                    out.setdefault("_note", str(note).strip()[:1000])
                # مدل چیزی نفهمید ولی قالبِ شماره‌دار روشن بود → قاعده را نگه دار
                return out or heuristic
    except Exception as exc:
        logger.debug("clarification answer parse fell back: %r", exc)
    return heuristic


_NON_ANSWERS = {"", "-", "—", "؟", "?", "نمیدانم", "نمی‌دانم", "نمیدونم", "بعدا",
                "بعداً", "خالی", "none", "n/a", "na", "skip", "بلدنیستم"}


def _meaningful(value: Any) -> bool:
    text = re.sub(r"\s+", " ", str(value or "")).strip()
    return bool(text) and text.lower() not in _NON_ANSWERS


def _heuristic_map(pending: List[Dict[str, Any]], text: str) -> Dict[str, str]:
    """قاعدهٔ قطعیِ بدونِ مدل: خطوطِ «۱) ...» یا «label: value» را نگاشت می‌کند.

    وجودِ این مسیر مهم است — بدونِ کلیدِ مدل هم حلقه باید کار کند."""
    out: Dict[str, str] = {}
    lines = [ln.strip() for ln in re.split(r"[\n\r]+", text or "") if ln.strip()]
    by_index = {}
    for line in lines:
        m = re.match(r"^[\(\[]?\s*([0-9۰-۹]{1,2})\s*[\)\].\-:]\s*(.*)$", line)
        if m:
            idx = int(_fa_digits(m.group(1)))
            rest = m.group(2).strip()
            # «۱) عنوانِ سؤال: جواب» → فقط بعد از «:» جواب است
            if ":" in rest:
                rest = rest.split(":", 1)[1].strip()
            if _meaningful(rest):
                by_index[idx] = rest
            continue
        if ":" in line:
            label, _, value = line.partition(":")
            if _meaningful(value):
                target = _match_label(pending, label)
                if target:
                    out[target] = value.strip()[:2000]
    for idx, value in by_index.items():
        if 1 <= idx <= len(pending):
            out.setdefault(pending[idx - 1]["key"], value[:2000])
    # یک فیلدِ باز + یک جوابِ ساده و بی‌قالب → همان جواب است. اول شماره/برچسبِ
    # ابتدای خط را می‌کَنیم، وگرنه «۱) نمی‌دانم» به‌عنوان جوابِ واقعی جا می‌افتد
    # چون خودِ رشتهٔ کامل در فهرستِ «بی‌جواب»ها نیست.
    if not out and len(pending) == 1:
        bare = _strip_prefix(text, pending[0].get("label") or "")
        if _meaningful(bare):
            out[pending[0]["key"]] = bare[:2000]
    return out


def _strip_prefix(value: str, label: str = "") -> str:
    """«۲) جواب» → «جواب»، و «عنوانِ همان پرسش: جواب» → «جواب».

    برشِ کورِ اولین «:» غلط بود: جوابِ «ساعت ۹: قرار با دکتر» به «قرار با
    دکتر» تبدیل می‌شد و نیمهٔ اولِ حرفِ مالک بی‌صدا حذف می‌شد (ممیزی
    ۲۰۲۶-۰۷-۳۱). حالا فقط وقتی بریده می‌شود که چیزی که قبل از «:» آمده
    واقعاً **خودِ متنِ پرسش** باشد."""
    line = re.sub(r"\s+", " ", str(value or "")).strip()
    line = re.sub(r"^[\(\[]?\s*[0-9۰-۹]{1,2}\s*[\)\].\-]\s*", "", line)
    if ":" in line:
        head, _, tail = line.partition(":")
        if tail.strip() and label and _norm_label(head) and _norm_label(head) in _norm_label(label):
            line = tail.strip()
    return line.strip()


def _fa_digits(value: str) -> str:
    return str(value).translate(str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789"))


def _match_label(pending: List[Dict[str, Any]], label: str) -> Optional[str]:
    needle = _norm_label(label)
    if not needle:
        return None
    best = None
    for q in pending:
        norm = _norm_label(q.get("label"))
        if not norm:
            continue
        if needle in norm or norm in needle:
            if best is None or len(norm) > len(_norm_label(best[1])):
                best = (q["key"], q.get("label"))
    return best[0] if best else None


async def record_answers(db: AsyncSession, c, mapped: Dict[str, str], *, raw: str = "", via: str = "telegram") -> Dict[str, Any]:
    """جواب‌ها را روی فیلدها می‌نشاند و وضعیت را به‌روز می‌کند."""
    now = datetime.now(timezone.utc)
    note = mapped.pop("_note", None)
    questions = _questions_of(c)
    filled = 0
    edited: Dict[str, Any] = {}
    for q in questions:
        value = mapped.get(q.get("key"))
        if not _meaningful(value):
            continue
        new_value = str(value)[:2000]
        old_value = str(q.get("answer") or "")
        if old_value and old_value == new_value:
            continue                      # همان جوابِ قبلی، تکرارِ فرمِ پرشده
        if old_value:
            # ویرایشِ جوابِ قبلی از راهِ همان فرم — «اشتباه نوشتم / عوض شد».
            edited[q["key"]] = {"before": old_value, "after": new_value}
        else:
            filled += 1
        q["answer"] = new_value
        q["answered_at"] = now.isoformat()
    _write_json(c, "questions", questions)
    history = list(c.answers or [])
    history.append({"at": now.isoformat(), "text": (raw or "")[:2000], "via": via,
                    **({"note": note} if note else {}),
                    **({"edited": edited} if edited else {})})
    _write_json(c, "answers", history[-20:])
    remaining = _unanswered(c)
    c.status = "answered" if not remaining else ("partial" if _answered(c) else "open")
    if filled or edited:
        # جوابِ تازه = چرخهٔ پرسش از نو، تا بقیهٔ فیلدها بی‌فاصله دوباره نپرند
        c.attempts = 0
        c.last_sent_at = now
    await db.flush()
    return {"filled": filled, "edited": len(edited), "edits": edited,
            "remaining": len(remaining), "note": note}


# ── ثبتِ جواب‌ها در بخش‌های واقعی ────────────────────────────────────────────

async def file_answers(db: AsyncSession, c) -> List[Dict[str, Any]]:
    """جوابِ فرم را به مقصدِ واقعی‌اش می‌برد.

    رجیستریِ ``_APPLIERS`` مثل مسیریابِ سیگنال کار می‌کند: نوعِ تازه = یک خطِ
    تازه، نه شاخهٔ if در همه‌جا. مقصدِ ناشناخته → صندوقِ ورودی (که خودش تریاژ
    دارد) تا هیچ جوابی هدر نرود."""
    # مقصد از بدنهٔ درخواست هم می‌تواند آمده باشد (POST /api/clarifications/ask)،
    # پس هیچ‌وقت نباید هویتِ خودش را تعیین کند. مالکِ فرم — که از توکن آمده و
    # روی رکورد نشسته — همیشه جایگزینِ هر user_id ای می‌شود که در مقصد نوشته
    # شده است. بدونِ این، بدنهٔ درخواست می‌توانست جوابِ فرم را روی پروفایلِ
    # کاربرِ دیگری بنشاند.
    target = {**(c.target or {}), "user_id": int(c.user_id or 0)}
    kind = str(target.get("kind") or "none")
    applier = _APPLIERS.get(kind, _apply_to_inbox)
    try:
        result = await applier(db, c, target)
    except Exception as exc:
        logger.debug("clarification filing failed (%s): %r", kind, exc)
        result = []
    _write_json(c, "result", list(c.result or []) + list(result or []))
    if not _unanswered(c):
        c.status = "filed"
        c.filed_at = datetime.now(timezone.utc)
    await db.flush()
    return list(result or [])


def answers_text(c) -> str:
    """جوابِ داده‌شده به شکلِ «پرسش: جواب» — ورودیِ ثبت در مقصد."""
    return "\n".join(
        f"{q['label']}: {q['answer']}" for q in _answered(c)
    )


def _prior_result(c, where: str) -> Optional[Dict[str, Any]]:
    """ثبتِ قبلیِ همین فرم در همین مقصد (اگر بوده)."""
    for entry in reversed(c.result or []):
        if entry.get("where") == where and entry.get("id"):
            return entry
    return None


async def _apply_to_inbox(db: AsyncSession, c, target: Dict[str, Any]) -> List[Dict[str, Any]]:
    """پیش‌فرض: موضوع + جواب‌ها یک آیتمِ صندوق می‌شود و تریاژِ خودِ صندوق
    آن را به مقصدِ درست می‌برد — همان تضمینِ «هیچ‌چیز هدر نمی‌رود».

    **یک آیتم به‌ازای هر فرم، نه هر جواب** (ممیزی ۲۰۲۶-۰۷-۳۱): جوابِ نصفه
    طبیعی است، پس این تابع چند بار صدا زده می‌شود؛ نسخهٔ اول هر بار یک آیتمِ
    تازه می‌ساخت و مالک چند کپیِ ناقص برای تریاژ می‌دید. حالا اگر قبلاً ساخته
    شده باشد، همان **به‌روز** می‌شود."""
    from app.models.inbox_item import InboxItem
    from app.services import inbox_service

    content = f"{c.topic}\n{c.context or ''}\n\n{answers_text(c)}".strip()[:4000]
    prior = _prior_result(c, "inbox")
    item = await db.get(InboxItem, int(prior["id"])) if prior else None
    if item is not None and item.status == "pending":
        item.content = content
    else:
        item = InboxItem(user_id=c.user_id or 0, content=content,
                         source="clarification", status="pending")
        db.add(item)
    await db.flush()
    try:
        item = await inbox_service.apply_classification(db, item, user_id=c.user_id or 0)
        sug = dict(item.suggestion or {})
        sug["source_ref"] = f"clarification:{c.id}"
        item.suggestion = sug
    except Exception:
        pass
    return [{"where": "inbox", "id": item.id, "label": "صندوق ورودی (با تریاژ)"}]


async def _apply_to_inbox_item(db: AsyncSession, c, target: Dict[str, Any]) -> List[Dict[str, Any]]:
    """آیتمِ صندوقی که ابهام داشت: جواب‌ها به محتوایش اضافه و دوباره تریاژ
    می‌شود، بعد فایل می‌شود — یعنی ابهام واقعاً رفع شد، نه اینکه یک کپی بسازد."""
    from app.models.inbox_item import InboxItem
    from app.services import inbox_service

    item = await db.get(InboxItem, int(target.get("id") or 0))
    # شناسه از مقصد می‌آید و مقصد می‌تواند از بدنهٔ درخواست آمده باشد؛ پس
    # مالکیت اینجا هم بررسی می‌شود، نه فقط موقعِ ساختِ فرم. آیتمی که مالِ این
    # کاربر نیست انگار وجود ندارد → جواب در صندوقِ خودش می‌نشیند و هدر نمی‌رود.
    if item is not None and not _row_in_scope(item, c.user_id):
        item = None
    if item is None:
        return await _apply_to_inbox(db, c, target)
    # جوابِ نصفه یعنی این تابع چند بار اجرا می‌شود. نسخهٔ اول هر بار بلوکِ
    # «پاسخِ مالک» را دوباره می‌چسباند و دوباره file_item می‌زد، پس یک آیتم دو
    # موجودیت می‌ساخت و اولی یتیم می‌ماند. حالا بلوک **جایگزین** می‌شود و
    # آیتمِ فایل‌شده دوباره فایل نمی‌شود (ممیزی ۲۰۲۶-۰۷-۳۱).
    marker = "\n\n— پاسخِ مالک —\n"
    base = (item.content or "").split(marker)[0]
    item.content = f"{base}{marker}{answers_text(c)}"[:4000]
    if item.status == "filed":
        await db.flush()
        return [{"where": (item.filed_entity_type or "inbox"), "id": item.filed_entity_id or item.id,
                 "label": "موردِ قبلی به‌روز شد (دوباره ساخته نشد)"}]
    await db.flush()
    try:
        item = await inbox_service.apply_classification(db, item, user_id=c.user_id or 0)
        filed = await inbox_service.file_item(db, item, user_id=c.user_id or 0)
        where = (filed or {}).get("target") or (item.suggestion or {}).get("target") or "inbox"
        return [{"where": where, "id": (filed or {}).get("entity_id") or item.id,
                 "label": f"صندوق → {where}"}]
    except Exception:
        return [{"where": "inbox", "id": item.id, "label": "صندوق ورودی (به‌روز شد)"}]


async def _apply_to_person(db: AsyncSession, c, target: Dict[str, Any]) -> List[Dict[str, Any]]:
    from app.services import person_profile_service as pps

    from app.models.person import Person

    pid = int(target.get("id") or 0)
    # مثل صندوق: شناسه از مقصد می‌آید، پس مالکیتش باید همین‌جا تأیید شود.
    if pid and not _row_in_scope(await db.get(Person, pid), c.user_id):
        pid = 0
    if not pid:
        return await _apply_to_inbox(db, c, target)
    await pps.record_interaction(
        db, person_id=pid, type="note", summary=answers_text(c)[:400],
        dedup_note=f"clarification:{c.id}", reanalyze=False,
    )
    return [{"where": "person", "id": pid, "label": "پروفایل فرد"}]


async def _apply_to_finance_account(db: AsyncSession, c, target: Dict[str, Any]) -> List[Dict[str, Any]]:
    """جوابِ «این موجودی مالِ کدام کارت است؟» → موجودی روی همان کارت می‌نشیند.

    جوابِ مالک بالاترین اعتبار را دارد، پس دقیقاً مثل «تنظیم دستی» ثبت می‌شود
    (`owner_balance_at`) — یعنی هیچ سیگنالِ خودکارِ قدیمی‌تری بعداً نمی‌تواند
    خرابش کند. همان قاعده‌ای که برای اصلاحِ موجودی‌های اشتباه گذاشته شد."""
    import json as _json
    from decimal import Decimal, InvalidOperation

    from sqlalchemy import or_ as _or

    from app.models.finance import FinancialAccount

    # فیلدِ «کدام حساب» را صریح پیدا کن. نسخهٔ اول اولین فیلدِ جواب‌داده را
    # می‌گرفت، پس هر فیلدِ دیگری که زودتر جواب می‌گرفت، انتخابِ حساب را
    # می‌ربود و موجودی بی‌صدا نوشته نمی‌شد (ممیزی ۲۰۲۶-۰۷-۳۱).
    wanted_key = str(target.get("field") or "account_name")
    q = (
        next((q for q in _answered(c) if q.get("key") == wanted_key), None)
        or next((q for q in _answered(c) if q.get("type") == "choice" and q.get("choices")), None)
        or next(iter(_answered(c)), None)
    )
    picked = (q or {}).get("answer")
    if not picked:
        return []
    picked = str(picked).strip()
    uid = c.user_id or 0
    institution = target.get("institution")
    rows = (
        await db.execute(
            select(FinancialAccount).where(
                _or(FinancialAccount.user_id == uid, FinancialAccount.user_id.is_(None))
                if uid == 0 else (FinancialAccount.user_id == uid)
            )
        )
    ).scalars().all()
    candidates = [r for r in rows if not institution or r.institution == institution]
    acc = next((r for r in candidates if (r.name or "").strip() == picked), None)
    if acc is None:  # جوابِ آزاد به‌جای انتخابِ گزینه — با تطبیقِ نرم
        acc = next((r for r in candidates if picked and picked in (r.name or "")), None)
    if acc is None:
        return [{"where": "finance", "id": None,
                 "label": f"کارتی به نامِ «{picked[:40]}» پیدا نشد — دست‌نخورده ماند"}]

    # ── اصلاحِ جوابِ قبلی باید کارتِ قبلی را هم برگرداند ────────────────────
    # (۲۰۲۶-۰۷-۳۱) اگر مالک اول «کارت اول» را انتخاب کند و بعد اصلاحش کند،
    # نوشتنِ مبلغ روی کارتِ دوم کافی نیست: کارتِ اول یک موجودیِ **ساختگی** با
    # مهرِ owner_balance_at نگه می‌داشت که هیچ سیگنالِ خودکاری هم نمی‌توانست
    # تصحیحش کند. پس هر ثبتِ قبلیِ همین فرم روی کارتِ دیگر، عقب زده می‌شود.
    # اولین (قدیمی‌ترین) عکسِ هر کارت، و فقط یک بار. نسخهٔ اول همهٔ ثبت‌های
    # قبلی را به‌ترتیب بازپخش می‌کرد، پس اگر یک کارت دو بار ثبت شده بود،
    # آخرین «prev_balance» (که خودش عددِ ساختگی بود) برنده می‌شد و همان
    # خرابی‌ای می‌ماند که این بلوک برای جلوگیری‌اش هست (ممیزی ۲۰۲۶-۰۷-۳۱).
    first_snapshot: Dict[int, Dict[str, Any]] = {}
    for r in (c.result or []):
        if r.get("where") == "finance_account" and r.get("id") and r.get("id") != acc.id:
            first_snapshot.setdefault(int(r["id"]), r)
    reverted = []
    for entry in first_snapshot.values():
        old_acc = await db.get(FinancialAccount, int(entry["id"]))
        if old_acc is None:
            continue
        if entry.get("prev_balance") is not None:
            try:
                old_acc.balance = Decimal(str(entry["prev_balance"]))
            except (InvalidOperation, ValueError):
                pass
        try:
            old_extra = _json.loads(old_acc.extra or "{}")
        except Exception:
            old_extra = {}
        if not entry.get("had_owner_pin"):
            old_extra.pop("owner_balance_at", None)
        old_extra.pop("balance_evidence", None)
        old_acc.extra = _json.dumps(old_extra, ensure_ascii=False)
        reverted.append({"where": "finance_account_reverted", "id": old_acc.id,
                         "label": f"کارتِ «{old_acc.name}» به حالتِ قبل برگشت"})

    raw_balance = target.get("balance")
    try:
        extra = _json.loads(acc.extra or "{}")
    except Exception:
        extra = {}
    prev_balance = str(acc.balance if acc.balance is not None else "")
    had_pin = bool(extra.get("owner_balance_at"))

    wrote = False
    if raw_balance not in (None, ""):
        try:
            value = Decimal(str(raw_balance))
        except (InvalidOperation, ValueError):
            value = None
        # همان دو گاردِ مسیرِ قطعیِ مالی: ارزِ ناهمخوان و عددِ نامثبت هرگز روی
        # کارت نمی‌نشیند — جوابِ مالک «کدام کارت» است، نه «هر عددی بنویس».
        target_currency = (target.get("currency") or "").upper()
        if value is not None and value > 0 and not (
            target_currency and acc.currency and target_currency != str(acc.currency).upper()
        ):
            acc.balance = value
            extra["owner_balance_at"] = datetime.now(timezone.utc).isoformat()
            extra["balance_evidence"] = "پاسخِ مالک به پرسشِ رفعِ ابهام"
            acc.extra = _json.dumps(extra, ensure_ascii=False)
            wrote = True

    await db.flush()
    label = f"کارتِ «{acc.name}»" + (" — موجودی ثبت شد" if wrote else " — انتخاب ثبت شد")
    # اگر همین کارت قبلاً ثبت شده، عکسِ **اولیه**اش را نگه دار و ردیفِ تازه
    # نساز — وگرنه prev_balance با عددِ نوشته‌شده جایگزین می‌شود.
    existing = next(
        (r for r in (c.result or [])
         if r.get("where") == "finance_account" and r.get("id") == acc.id),
        None,
    )
    if existing is not None:
        existing["label"] = label
        _write_json(c, "result", list(c.result or []))
        return reverted
    return reverted + [{
        "where": "finance_account", "id": acc.id,
        "prev_balance": prev_balance, "had_owner_pin": had_pin, "label": label,
    }]


async def _apply_to_owner_identity(db: AsyncSession, c, target: Dict[str, Any]) -> List[Dict[str, Any]]:
    """جوابِ «تاریخ تولدت؟» / «کجا زندگی می‌کنی؟» → همان فیلدِ پروفایل."""
    from app.services import owner_identity_service as ident

    field = str(target.get("field") or "")
    q = next((q for q in _answered(c) if q.get("key") == field), None) or next(iter(_answered(c)), None)
    value = (q or {}).get("answer")
    return await ident.apply_clarification_answer(db, target, value or "")


async def _apply_to_place(db: AsyncSession, c, target: Dict[str, Any]) -> List[Dict[str, Any]]:
    """جوابِ «اینجا کجاست؟» / «آنجا چه کردی؟» → مکان یا سفر."""
    from app.services import place_service

    answers = {q.get("key"): q.get("answer") for q in _answered(c) if q.get("answer")}
    return await place_service.apply_place_answer(db, target, answers)


_APPLIERS: Dict[str, Callable] = {
    "owner_identity": _apply_to_owner_identity,
    "place": _apply_to_place,
    "trip": _apply_to_place,
    "inbox_item": _apply_to_inbox_item,
    "person": _apply_to_person,
    "finance_account": _apply_to_finance_account,
    "none": _apply_to_inbox,
}


# ── ورودیِ تلگرام (جواب/دکمه) ───────────────────────────────────────────────

async def find_by_message(db: AsyncSession, message_id: Any):
    from app.models.clarification import Clarification

    if not message_id:
        return None
    return (
        await db.execute(
            select(Clarification)
            .where(Clarification.message_id == str(message_id),
                   # مجرای تلگرام فقط دامنهٔ مالک را می‌بیند — همان قیدِ
                   # dispatch_pending، اینجا در جهتِ برگشت.
                   _scope(Clarification, TELEGRAM_SCOPE_USER_ID))
            .limit(1)
        )
    ).scalar_one_or_none()


async def newest_open(db: AsyncSession):
    """آخرین فرمِ باز — برای وقتی که کاربر بدونِ ریپلای جواب می‌دهد."""
    from app.models.clarification import Clarification

    return (
        await db.execute(
            select(Clarification)
            .where(Clarification.status.in_(("open", "partial")),
                   _scope(Clarification, TELEGRAM_SCOPE_USER_ID))
            .order_by(Clarification.last_sent_at.desc().nullslast(), Clarification.id.desc())
            .limit(1)
        )
    ).scalar_one_or_none()


FORM_MARKER = "همین پیام را *ریپلای* کن"


async def find_by_quoted_text(db: AsyncSession, quoted: str):
    """فرمِ متناظر با متنِ پیامی که کاربر به آن ریپلای زده.

    چرا لازم است: هر یادآوری یک پیامِ تازه است و ``message_id`` فقط آخری را
    نگه می‌دارد، پس ریپلای به نسخهٔ **قبلیِ** همان فرم شناخته نمی‌شد و جوابِ
    مالک به فلوِ «کار جدید» می‌افتاد (ممیزی ۲۰۲۶-۰۷-۳۱). با تطبیقِ عنوانِ
    موضوع در متنِ نقل‌شده، هر نسخه‌ای از فرم قابلِ جواب می‌ماند — و چون
    نشانهٔ فرم هم باید باشد، ریپلای به یک پیامِ بی‌ربط اشتباه گرفته نمی‌شود."""
    from app.models.clarification import Clarification

    body = quoted or ""
    if FORM_MARKER not in body and "❓" not in body and "🔄" not in body:
        return None
    rows = (
        await db.execute(
            select(Clarification)
            .where(Clarification.status.in_(("open", "partial", "parked", "answered")),
                   _scope(Clarification, TELEGRAM_SCOPE_USER_ID))
            .order_by(Clarification.id.desc())
            .limit(50)
        )
    ).scalars().all()
    best = None
    for c in rows:
        topic = (c.topic or "").strip()
        if len(topic) >= 6 and topic[:120] in body:
            if best is None or len(topic) > len(best.topic or ""):
                best = c
    return best


async def handle_reply(
    db: AsyncSession, *, text: str, reply_to_message_id: Any = None,
    quoted_text: str = "",
) -> Optional[Dict[str, Any]]:
    """جوابِ تلگرام → تحلیل → ثبت → فیدبک. None یعنی «این پیام جوابِ فرم نبود»."""
    c = await find_by_message(db, reply_to_message_id)
    if c is None:
        c = await find_by_quoted_text(db, quoted_text)
    if c is None:
        return None
    mapped = await parse_reply(db, c, text)
    outcome = await record_answers(db, c, mapped, raw=text, via="telegram")
    # ویرایش هم مثل جوابِ تازه باید دوباره ثبت شود، وگرنه جوابِ اصلاح‌شده در
    # فرم می‌ماند و سیستم با مقدارِ غلطِ قبلی جلو می‌رود.
    changed = outcome["filled"] or outcome.get("edited")
    filed = await file_answers(db, c) if changed else []
    await db.commit()
    return {"clarification_id": c.id, **outcome, "filed": filed,
            "feedback": feedback_text(c, outcome, filed)}


def feedback_text(c, outcome: Dict[str, Any], filed: List[Dict[str, Any]]) -> str:
    """فیدبکِ صادق: چه چیزی کجا ثبت شد و چه چیزی هنوز باز است."""
    lines = []
    if outcome.get("filled"):
        lines.append(f"✅ {outcome['filled']} جواب ثبت شد — «{c.topic[:60]}»")
    if outcome.get("edited"):
        lines.append(f"✏️ {outcome['edited']} جوابِ قبلی به‌روز شد و دوباره ثبت شد.")
    if not outcome.get("filled") and not outcome.get("edited"):
        lines.append(f"🤔 از پیامت چیزی برای «{c.topic[:60]}» برداشت نکردم.")
    for r in filed or []:
        lines.append(f"• ثبت شد در: {r.get('label') or r.get('where')}")
    if outcome.get("note"):
        lines.append(f"📝 یادداشتِ اضافه‌ات هم نگه داشته شد.")
    remaining = outcome.get("remaining") or 0
    if remaining:
        lines.append(f"⏳ {remaining} پرسشِ بی‌جواب مانده — بعداً دوباره می‌پرسم.")
    else:
        lines.append("🎉 این موضوع کامل شد.")
    return "\n".join(lines)


async def edit_answers(
    db: AsyncSession, clarification_id: int, edits: Dict[str, str], *,
    refile: bool = True, user_id: Optional[int] = None,
) -> Optional[Dict[str, Any]]:
    """ویرایشِ جوابِ قبلی — «اشتباه نوشتم» یا «نظرم عوض شد».

    بدونِ این، یک جوابِ غلط برای همیشه در سیستم می‌ماند و دقیقاً همان
    «ثبتِ اشتباه»ی می‌شود که این حلقه برای جلوگیری از آن ساخته شد.

    قواعد:
      * مقدارِ تازه جایگزین می‌شود؛ مقدارِ **خالی** یعنی «این جواب را پس گرفتم»
        → فیلد دوباره باز و دوباره پرسیدنی می‌شود.
      * تاریخچهٔ ویرایش در ``answers`` می‌ماند (چیزی پاک نمی‌شود).
      * پس از ویرایش، دوباره ثبت می‌شود تا سیستم با جوابِ درست هم‌گام شود.
    """
    from app.models.clarification import Clarification

    c = await db.get(Clarification, int(clarification_id))
    if c is None or not owns(c, user_id):
        return None
    now = datetime.now(timezone.utc)
    questions = _questions_of(c)
    valid = {q.get("key") for q in questions}
    changed: Dict[str, Any] = {}
    for key, value in (edits or {}).items():
        if key not in valid:
            continue
        target = next(q for q in questions if q.get("key") == key)
        before = target.get("answer")
        if _meaningful(value):
            target["answer"] = str(value).strip()[:2000]
            target["answered_at"] = now.isoformat()
        else:
            target["answer"] = None       # پس‌گرفتن → دوباره باز
            target["answered_at"] = None
        if before != target.get("answer"):
            changed[key] = {"before": before, "after": target.get("answer")}
    if not changed:
        return {"edited": 0, "remaining": len(_unanswered(c)), "refiled": []}

    _write_json(c, "questions", questions)
    history = list(c.answers or [])
    history.append({"at": now.isoformat(), "via": "edit", "edited": changed})
    _write_json(c, "answers", history[-20:])
    remaining = _unanswered(c)
    if remaining:
        # فیلدی دوباره باز شد → چرخهٔ پرسش از نو شروع می‌شود.
        c.status = "partial" if _answered(c) else "open"
        c.attempts = 0
        c.filed_at = None
    else:
        c.status = "answered"
    refiled = await file_answers(db, c) if (refile and _answered(c)) else []
    await db.commit()
    return {"edited": len(changed), "changed": changed,
            "remaining": len(remaining), "refiled": refiled}


# ── گفتگوی دوطرفه دربارهٔ همان ابهام ────────────────────────────────────────
# خواستهٔ مالک (۲۰۲۶-۰۷-۳۱): «اگر در پاسخ به سؤالش، خودم سؤالی داشتم بتوانم
# بپرسم و جواب بگیرم — حتی چند بار — ولی بعدش موضوع و سؤال‌های اصلی نباید
# فراموش و گم شود.» پس: هر دور پرسش‌وپاسخ در `discussion` ذخیره می‌شود (تا
# دورِ بعد حافظه داشته باشد) و **بلافاصله بعدش خودِ فرم دوباره نشان داده
# می‌شود** — یعنی نخِ اصلی هرگز رها نمی‌شود.

_DISCUSS_PROMPT = """صاحبِ برنامه دربارهٔ پرسشی که از او پرسیده‌ای، خودش سؤال دارد.
کوتاه، دقیق و فارسی جواب بده تا ابهامش رفع شود و بتواند فرم را پر کند.

قواعد:
- فقط بر اساس اطلاعاتِ زیر جواب بده. چیزی که نمی‌دانی را صادقانه بگو نمی‌دانم.
- اگر پرسیده «منظورت چیست؟»، پرسشِ خودت را ساده‌تر و با یک مثال توضیح بده.
- جوابت حداکثر ۴ جمله باشد. فهرستِ سؤال‌ها را دوباره تکرار نکن.

موضوعِ ابهام: {topic}
متنِ اصلی که این ابهام از آن آمده:
{context}

پرسش‌هایی که از او پرسیده‌ام:
{questions}

گفتگوی تا اینجا:
{history}

سؤالِ او: {question}
"""


def _discussion(c) -> List[Dict[str, Any]]:
    return list(c.discussion or [])


async def discuss(db: AsyncSession, c, question: str) -> str:
    """یک دورِ پرسشِ متقابل: جوابِ کوتاه + ذخیره در نخِ گفتگو.

    هرگز استثنا نمی‌دهد — اگر مدل نبود، یک جوابِ صادقانه برمی‌گردد تا مالک
    بلاتکلیف نماند."""
    now = datetime.now(timezone.utc)
    thread = _discussion(c)
    thread.append({"at": now.isoformat(), "role": "owner", "text": (question or "")[:1500]})

    history = "\n".join(
        f"{'من' if t.get('role') == 'assistant' else 'او'}: {t.get('text', '')[:300]}"
        for t in thread[-8:]
    )
    questions_txt = "\n".join(
        f"- {q.get('label')}" + (f" (جواب داده: {q.get('answer')})" if q.get("answer") else "")
        for q in (c.questions or [])
    )
    answer = ""
    try:
        from app.services.ai.inference_gateway import complete

        res = await complete(
            db,
            _DISCUSS_PROMPT.format(
                topic=(c.topic or "")[:200], context=(c.context or "")[:1500],
                questions=questions_txt[:1200], history=history[:2000],
                question=(question or "")[:500],
            ),
            task="inbox_triage", max_tokens=400,
        )
        if res.get("ok"):
            answer = re.sub(r"\s+\n", "\n", (res.get("text") or "").strip())[:1200]
    except Exception as exc:
        logger.debug("clarification discuss fell back: %r", exc)
    if not answer:
        answer = (
            "الان نمی‌توانم توضیحِ بیشتری بدهم. اگر پرسشم مبهم است، همان خط را "
            "خالی بگذار یا با جملهٔ خودت بنویس — بعداً از رویش می‌فهمم."
        )
    thread.append({"at": now.isoformat(), "role": "assistant", "text": answer})
    _write_json(c, "discussion", thread[-30:])
    # پرسیدنِ متقابل یعنی مالک درگیر است؛ چرخهٔ یادآوری از نو شروع شود تا
    # وسطِ گفتگو پیامِ «هنوز جواب نگرفتم» نیاید.
    c.attempts = 0
    c.last_sent_at = now
    await db.flush()
    return answer


async def answer_field(db: AsyncSession, c, field_index: int, value: str) -> Dict[str, Any]:
    """جوابِ یک فیلد با **یک ضربه** (دکمهٔ گزینه‌ای) — بدونِ تایپ."""
    questions = _questions_of(c)
    if not (0 <= field_index < len(questions)):
        return {"filled": 0, "remaining": len(_unanswered(c))}
    key = questions[field_index].get("key")
    mapped = {key: value}
    outcome = await record_answers(db, c, mapped, raw=f"[دکمه] {value}", via="telegram-button")
    filed = await file_answers(db, c) if (outcome["filled"] or outcome.get("edited")) else []
    return {**outcome, "filed": filed}


async def snooze(db: AsyncSession, clarification_id: int, hours: int = 24,
                 user_id: Optional[int] = None) -> bool:
    from app.models.clarification import Clarification

    c = await db.get(Clarification, int(clarification_id))
    if c is None or not owns(c, user_id):
        return False
    c.snoozed_until = datetime.now(timezone.utc) + timedelta(hours=max(1, int(hours)))
    await db.commit()
    return True


async def skip(db: AsyncSession, clarification_id: int, user_id: Optional[int] = None) -> bool:
    """«مربوط نیست» — از چرخه بیرون می‌رود ولی حذف نمی‌شود."""
    from app.models.clarification import Clarification

    c = await db.get(Clarification, int(clarification_id))
    if c is None or not owns(c, user_id):
        return False
    c.status = "skipped"
    await db.commit()
    return True


async def open_forms(db: AsyncSession, limit: int = 20, user_id: Optional[int] = None) -> List[Any]:
    """پرسش‌های باز. ``user_id`` را همیشه از مسیرِ HTTP بده — بدونِ آن، فهرست
    فرم‌های همهٔ کاربران را برمی‌گرداند و متنِ خامِ پیامکِ بانکیِ یکی به دیگری
    نشت می‌کند (۲۰۲۶-۰۷-۳۱)."""
    from app.models.clarification import Clarification

    stmt = select(Clarification).where(
        Clarification.status.in_(("open", "partial", "parked"))
    )
    if user_id is not None:
        from app.services.inbox_service import scope_filter

        stmt = stmt.where(scope_filter(Clarification.user_id, user_id))
    return (
        await db.execute(
            stmt.order_by(Clarification.priority.desc(), Clarification.id.desc()).limit(limit)
        )
    ).scalars().all()


async def sanitize_target(
    db: AsyncSession, target: Any, *, user_id: int
) -> Dict[str, Any]:
    """مقصدی که از سمتِ کلاینت آمده را به دامنهٔ خودِ همان کاربر می‌بندد.

    ``POST /api/clarifications/ask`` بدنهٔ دلخواه می‌گیرد و ``target`` همان
    چیزی است که بعداً تعیین می‌کند جوابِ فرم **کجا** بنشیند. بدونِ این تابع،
    بدنهٔ درخواست می‌توانست شناسهٔ ردیفِ کاربرِ دیگری را نام ببرد.

    قاعده: نوعِ ناشناخته → «none»؛ شناسه‌ای که مالِ این کاربر نیست → «none»؛
    و ``user_id`` هرگز از کلاینت پذیرفته نمی‌شود (``file_answers`` هم دوباره
    مهرش می‌زند — دو لایه، چون این مسیر امنیتی است).

    چیزی حذف نمی‌شود: مقصدِ ردشده به «none» تنزل می‌کند، یعنی جواب در صندوقِ
    ورودیِ خودِ کاربر می‌نشیند و تریاژ می‌شود.
    """
    from app.models.inbox_item import InboxItem
    from app.models.person import Person
    from app.models.place import Place, Trip

    if not isinstance(target, dict):
        return {"kind": "none"}
    kind = str(target.get("kind") or "none")
    if kind not in _APPLIERS:
        return {"kind": "none"}

    clean = {k: v for k, v in target.items() if k != "user_id"}
    clean["kind"] = kind

    # (مدل, کلیدِ شناسه) برای هر نوعی که به یک ردیفِ مشخص اشاره می‌کند.
    owned = {
        "inbox_item": (InboxItem, "id"),
        "person": (Person, "id"),
        "place": (Place, "place_id"),
        "trip": (Trip, "trip_id"),
    }.get(kind)
    if owned is not None:
        model, key = owned
        try:
            row_id = int(clean.get(key) or 0)
        except (TypeError, ValueError):
            return {"kind": "none"}
        if not row_id or not _row_in_scope(await db.get(model, row_id), user_id):
            return {"kind": "none"}
    return clean


def owns(c, user_id: Optional[int]) -> bool:
    """آیا این فرم متعلق به همین کاربر است؟ (۰/NULL = دامنهٔ ناشناس، مثل بقیهٔ
    جدول‌ها). ``None`` یعنی «بررسی نکن» — فقط برای مسیرهای داخلی مثل تلگرام
    که خودشان تک‌مالکی‌اند."""
    if user_id is None:
        return True
    owner = c.user_id or 0
    return owner == user_id or (user_id == 0 and c.user_id is None)


async def resend_all(db: AsyncSession, *, user_id: Optional[int] = None) -> Dict[str, Any]:
    """دستورِ «سؤال‌های باز» در تلگرام: همه را دوباره بفرست، چون پیامِ قبلی
    بالا رفته. شمارندهٔ تلاش را جلو نمی‌برد — این خواستهٔ خودِ کاربر است."""
    sent = 0
    for c in await open_forms(db, limit=MAX_OPEN_FORMS, user_id=user_id):
        if not _unanswered(c):
            continue
        before = int(c.attempts or 0)
        if await send_form(db, c, reminder=True):
            c.attempts = before          # درخواستِ کاربر تلاشِ سیستم نیست
            if c.status == "parked":
                c.status = "partial" if _answered(c) else "open"
            sent += 1
    await db.commit()
    return {"sent": sent}


def to_dict(c) -> Dict[str, Any]:
    return {
        "id": c.id,
        "topic": c.topic,
        "context": c.context,
        "source": c.source,
        "status": c.status,
        "priority": c.priority,
        "attempts": c.attempts,
        "questions": c.questions or [],
        "answers": c.answers or [],
        "result": c.result or [],
        "discussion": c.discussion or [],
        "target": c.target or {},
        "last_sent_at": c.last_sent_at.isoformat() if c.last_sent_at else None,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "open_count": len(_unanswered(c)),
        "answered_count": len(_answered(c)),
    }
