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
from datetime import datetime, timedelta, timezone
from typing import Any, Callable, Dict, List, Optional

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

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

قواعد:
- حداکثر {max_fields} فیلد. فقط چیزی را بپرس که واقعاً از متن معلوم نیست.
- چیزی را که خودت از متن می‌فهمی **نپرس**.
- «choice» فقط وقتی گزینه‌ها واقعاً محدود و مشخص‌اند؛ choices را پر کن.
- label باید طوری باشد که با یک خطِ کوتاه هم قابل جواب باشد.
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
                db, topic=topic, context=context, targets=targets, hint=hint
            )
        if not fields and existing is None:
            return None  # مدل گفت ابهامِ واقعی‌ای نیست — سؤالِ الکی نمی‌سازیم

        if existing is not None:
            merged = _merge_fields(existing.questions or [], fields)
            if len(merged) == len(existing.questions or []):
                return existing          # چیزی تازه نبود
            existing.questions = merged
            # سؤالِ تازه = فرم دوباره «باز» است و باید دوباره فرستاده شود.
            existing.status = "partial" if _answered(existing) else "open"
            if existing.status == "parked":
                existing.status = "open"
            existing.attempts = max(0, (existing.attempts or 0) - 1)
            await db.flush()
            return existing

        row = Clarification(
            user_id=user_id, topic=topic[:300], context=(context or "")[:4000],
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
        parts = [", ".join(cat.get("targets") or [])]
        if cat.get("lists"):
            parts.append("لیست‌ها: " + ", ".join(cat["lists"][:20]))
        if cat.get("pages"):
            parts.append("صفحه‌ها: " + ", ".join(cat["pages"][:25]))
        return " | ".join(p for p in parts if p)
    except Exception:
        return "task, todo, note, person, finance_account, document, transaction"


# ── رندرِ فرم ───────────────────────────────────────────────────────────────

def render_form(c, *, reminder: bool = False) -> str:
    """فرمِ پرشدنی: هر خط یک فیلد با «:» — مالک جلوی هر کدام می‌نویسد و
    می‌فرستد. خالی‌گذاشتن مجاز است و همان فیلد بعداً دوباره پرسیده می‌شود."""
    pending = _unanswered(c)
    done = _answered(c)
    head = "🔄 *یادآوری — هنوز جواب نگرفتم*" if reminder else "❓ *یک ابهام هست، لطفاً کمک کن*"
    lines = [head, "", f"*موضوع:* {c.topic}"]
    if c.context:
        snippet = (c.context or "").strip().replace("\n", " ")[:220]
        lines.append(f"_{snippet}_")
    if done:
        lines += ["", f"✅ قبلاً جواب دادی: {len(done)} مورد"]
    lines += ["", "برای جواب، همین پیام را *ریپلای* کن و خط‌ها را پر کن:", ""]
    for idx, q in enumerate(pending, start=1):
        hint = ""
        if q.get("type") == "choice" and q.get("choices"):
            hint = "  (" + " / ".join(q["choices"][:6]) + ")"
        elif q.get("type") == "date":
            hint = "  (تاریخ)"
        elif q.get("type") == "yesno":
            hint = "  (بله / خیر)"
        elif q.get("type") == "number":
            hint = "  (عدد)"
        lines.append(f"{idx}) {q['label']}{hint}:")
    lines += [
        "",
        "• هر خطی را که جوابش را نمی‌دانی *خالی* بگذار — بعداً دوباره می‌پرسم.",
        "• جوابِ کوتاه یا بلند، هر دو خوب است.",
    ]
    return "\n".join(lines)


def _form_markup(c) -> Dict[str, Any]:
    return {"inline_keyboard": [[
        {"text": "⏰ بعداً", "callback_data": f"clar:snooze:{c.id}"},
        {"text": "🚫 مربوط نیست", "callback_data": f"clar:skip:{c.id}"},
    ]]}


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
        res = await bot.send(
            render_form(c, reminder=reminder), silent=not reminder,
            reply_markup={
                "force_reply": True,
                "input_field_placeholder": "خط‌ها را پر کن و بفرست",
            },
        )
        mid = res.get("message_id") if isinstance(res, dict) else None
        if mid:
            c.message_id = str(mid)
            c.chat_id = str(bot.chat_id or "") or c.chat_id
        c.attempts = int(c.attempts or 0) + 1
        c.last_sent_at = datetime.now(timezone.utc)
        # تلگرام در یک پیام یا force_reply می‌پذیرد یا دکمهٔ شیشه‌ای، نه هر دو.
        # ارسالِ اول تمیز می‌ماند (فقط کادرِ جواب باز می‌شود)؛ دکمه‌های
        # «بعداً/مربوط نیست» فقط از یادآوریِ دوم به بعد می‌آیند — یعنی دقیقاً
        # وقتی که مالک یک بار جواب نداده و شاید اصلاً نخواهد جواب بدهد.
        if reminder:
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
                .where(Clarification.status.in_(("open", "partial")))
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
    """جوابِ آزادِ کاربر → {key: value}. خالی‌ها برنمی‌گردند."""
    pending = _unanswered(c)
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
        bare = _strip_prefix(text)
        if _meaningful(bare):
            out[pending[0]["key"]] = bare[:2000]
    return out


def _strip_prefix(value: str) -> str:
    """«۲) جواب» / «عنوان: جواب» → «جواب»."""
    line = re.sub(r"\s+", " ", str(value or "")).strip()
    line = re.sub(r"^[\(\[]?\s*[0-9۰-۹]{1,2}\s*[\)\].\-:]\s*", "", line)
    if ":" in line:
        head, _, tail = line.partition(":")
        if tail.strip():
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
    questions = list(c.questions or [])
    filled = 0
    for q in questions:
        value = mapped.get(q.get("key"))
        if _meaningful(value):
            q["answer"] = str(value)[:2000]
            q["answered_at"] = now.isoformat()
            filled += 1
    c.questions = questions
    history = list(c.answers or [])
    history.append({"at": now.isoformat(), "text": (raw or "")[:2000], "via": via,
                    **({"note": note} if note else {})})
    c.answers = history[-20:]
    remaining = _unanswered(c)
    c.status = "answered" if not remaining else ("partial" if _answered(c) else "open")
    if filled:
        # جوابِ تازه = چرخهٔ پرسش از نو، تا بقیهٔ فیلدها بی‌فاصله دوباره نپرند
        c.attempts = 0
        c.last_sent_at = now
    await db.flush()
    return {"filled": filled, "remaining": len(remaining), "note": note}


# ── ثبتِ جواب‌ها در بخش‌های واقعی ────────────────────────────────────────────

async def file_answers(db: AsyncSession, c) -> List[Dict[str, Any]]:
    """جوابِ فرم را به مقصدِ واقعی‌اش می‌برد.

    رجیستریِ ``_APPLIERS`` مثل مسیریابِ سیگنال کار می‌کند: نوعِ تازه = یک خطِ
    تازه، نه شاخهٔ if در همه‌جا. مقصدِ ناشناخته → صندوقِ ورودی (که خودش تریاژ
    دارد) تا هیچ جوابی هدر نرود."""
    target = c.target or {}
    kind = str(target.get("kind") or "none")
    applier = _APPLIERS.get(kind, _apply_to_inbox)
    try:
        result = await applier(db, c, target)
    except Exception as exc:
        logger.debug("clarification filing failed (%s): %r", kind, exc)
        result = []
    c.result = (c.result or []) + list(result or [])
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


async def _apply_to_inbox(db: AsyncSession, c, target: Dict[str, Any]) -> List[Dict[str, Any]]:
    """پیش‌فرض: موضوع + جواب‌ها یک آیتمِ صندوق می‌شود و تریاژِ خودِ صندوق
    آن را به مقصدِ درست می‌برد — همان تضمینِ «هیچ‌چیز هدر نمی‌رود»."""
    from app.models.inbox_item import InboxItem
    from app.services import inbox_service

    content = f"{c.topic}\n{c.context or ''}\n\n{answers_text(c)}".strip()
    item = InboxItem(user_id=c.user_id or 0, content=content[:4000],
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
    if item is None:
        return await _apply_to_inbox(db, c, target)
    item.content = f"{item.content}\n\n— پاسخِ مالک —\n{answers_text(c)}"[:4000]
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

    pid = int(target.get("id") or 0)
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

    picked = next((q.get("answer") for q in _answered(c) if q.get("answer")), None)
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

    raw_balance = target.get("balance")
    if raw_balance not in (None, ""):
        try:
            acc.balance = Decimal(str(raw_balance))
        except (InvalidOperation, ValueError):
            raw_balance = None
    if raw_balance not in (None, ""):
        try:
            extra = _json.loads(acc.extra or "{}")
        except Exception:
            extra = {}
        extra["owner_balance_at"] = datetime.now(timezone.utc).isoformat()
        extra["balance_evidence"] = "پاسخِ مالک به پرسشِ رفعِ ابهام"
        acc.extra = _json.dumps(extra, ensure_ascii=False)
    await db.flush()
    return [{"where": "finance_account", "id": acc.id,
             "label": f"کارتِ «{acc.name}»" + (" — موجودی ثبت شد" if raw_balance else " — انتخاب ثبت شد")}]


_APPLIERS: Dict[str, Callable] = {
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
            select(Clarification).where(Clarification.message_id == str(message_id)).limit(1)
        )
    ).scalar_one_or_none()


async def newest_open(db: AsyncSession):
    """آخرین فرمِ باز — برای وقتی که کاربر بدونِ ریپلای جواب می‌دهد."""
    from app.models.clarification import Clarification

    return (
        await db.execute(
            select(Clarification)
            .where(Clarification.status.in_(("open", "partial")))
            .order_by(Clarification.last_sent_at.desc().nullslast(), Clarification.id.desc())
            .limit(1)
        )
    ).scalar_one_or_none()


async def handle_reply(db: AsyncSession, *, text: str, reply_to_message_id: Any = None) -> Optional[Dict[str, Any]]:
    """جوابِ تلگرام → تحلیل → ثبت → فیدبک. None یعنی «این پیام جوابِ فرم نبود»."""
    c = await find_by_message(db, reply_to_message_id)
    if c is None:
        return None
    mapped = await parse_reply(db, c, text)
    outcome = await record_answers(db, c, mapped, raw=text, via="telegram")
    filed = await file_answers(db, c) if outcome["filled"] else []
    await db.commit()
    return {"clarification_id": c.id, **outcome, "filed": filed,
            "feedback": feedback_text(c, outcome, filed)}


def feedback_text(c, outcome: Dict[str, Any], filed: List[Dict[str, Any]]) -> str:
    """فیدبکِ صادق: چه چیزی کجا ثبت شد و چه چیزی هنوز باز است."""
    lines = []
    if outcome.get("filled"):
        lines.append(f"✅ {outcome['filled']} جواب ثبت شد — «{c.topic[:60]}»")
    else:
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


async def snooze(db: AsyncSession, clarification_id: int, hours: int = 24) -> bool:
    from app.models.clarification import Clarification

    c = await db.get(Clarification, int(clarification_id))
    if c is None:
        return False
    c.snoozed_until = datetime.now(timezone.utc) + timedelta(hours=max(1, int(hours)))
    await db.commit()
    return True


async def skip(db: AsyncSession, clarification_id: int) -> bool:
    """«مربوط نیست» — از چرخه بیرون می‌رود ولی حذف نمی‌شود."""
    from app.models.clarification import Clarification

    c = await db.get(Clarification, int(clarification_id))
    if c is None:
        return False
    c.status = "skipped"
    await db.commit()
    return True


async def open_forms(db: AsyncSession, limit: int = 20) -> List[Any]:
    from app.models.clarification import Clarification

    return (
        await db.execute(
            select(Clarification)
            .where(Clarification.status.in_(("open", "partial", "parked")))
            .order_by(Clarification.priority.desc(), Clarification.id.desc())
            .limit(limit)
        )
    ).scalars().all()


async def resend_all(db: AsyncSession) -> Dict[str, Any]:
    """دستورِ «سؤال‌های باز» در تلگرام: همه را دوباره بفرست، چون پیامِ قبلی
    بالا رفته. شمارندهٔ تلاش را جلو نمی‌برد — این خواستهٔ خودِ کاربر است."""
    sent = 0
    for c in await open_forms(db, limit=MAX_OPEN_FORMS):
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
        "target": c.target or {},
        "last_sent_at": c.last_sent_at.isoformat() if c.last_sent_at else None,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "open_count": len(_unanswered(c)),
        "answered_count": len(_answered(c)),
    }
