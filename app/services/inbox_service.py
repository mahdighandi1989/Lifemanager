"""Universal capture inbox (صندوق ورودی همه‌چیز) — triage + filing.

The web quick-box (Dashboard) and the Telegram ``/inbox`` command both
drop raw text here; this module decides *where it belongs* and turns it
into a real entity on confirmation:

* ``classify_content``  — ask the routed text model (task ``inbox_triage``
  via ``inference_gateway.complete``, same seam the Telegram compose flow
  uses) for a destination suggestion; degrade to a deterministic keyword
  heuristic when no model is configured (fail-open — the inbox must work
  on a keyless deploy).
* ``file_item``         — create the suggested (or user-overridden) entity
  through the CALLER'S session: task / todo item (into a matching list,
  else the auto-created «صندوق ورودی» list) / note (PersonalWriting) /
  person, then mark the row filed.

No FastAPI imports — routes stay thin shells over this module.
"""
from __future__ import annotations

import html
import json
import logging
import re
from datetime import date
from typing import Any, Dict, List, Optional

from sqlalchemy import func, insert, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inbox_item import InboxItem

logger = logging.getLogger(__name__)

# Destinations the triage layer may suggest / the filing layer accepts.
# «subscription» is filed by the auto-ingest pipeline (a recognised
# subscription-provider email) rather than the text classifier, but it flows
# through the same review-then-file queue.
# Declared here for readability; RE-DERIVED at the bottom of this module from
# the FILERS registry, so a new destination is ONE registration (a `_file_as_x`
# + its FILERS line) and the triage prompt, the validation and the mobile
# dispatcher all pick it up automatically — never three edits in three places.
INBOX_TARGETS = ("task", "todo", "note", "person", "subscription", "finance_account", "document", "transaction")

# Persian labels for the destinations, used in the triage prompt and the UI.
# A target with no label falls back to its key (so it still works).
TARGET_FA = {
    "task": "کار (اقدامی که باید انجام شود)",
    "todo": "آیتم لیست (چک‌لیستِ یکی از لیست‌های موجود)",
    "note": "یادداشت/نوشته (چیزی که باید نگه داشته شود)",
    "person": "فرد (معرفی یا اطلاعات یک آدم)",
    "subscription": "اشتراک (سرویس دوره‌ای مثل نتفلیکس)",
    "finance_account": "حساب مالی (بانک/بروکر/صرافی — با شماره یا موجودی)",
    "document": "مدرک (شناسنامه/گواهینامه/بیمه‌نامه با تاریخ انقضا)",
    "transaction": "تراکنش مالی (خرید/هزینه/رسید)",
}

# Fallback list for explicit todo filings that match no existing list —
# auto-created so a "به لیست بفرست" choice can never dead-end.
INBOX_DEFAULT_LIST_NAME = "صندوق ورودی"

_TRIAGE_PROMPT = """تو دستیار دسته‌بندی «صندوق ورودی» یک برنامه مدیریت زندگی هستی.
متن خام زیر را بخوان و تشخیص بده به کدام بخش تعلق دارد. فقط یک شیء JSON برگردان، بدون هیچ توضیح اضافه:

{{
  "type": "یکی از کلیدهای «مقصدهای مجاز» پایین",
  "title": "عنوان کوتاه (حداکثر ۱۲۰ نویسه)",
  "description": "خلاصه/جزئیات (اختیاری)",
  "priority": "low | normal | high",
  "due_date": "YYYY-MM-DD یا null",
  "list_name": "نام یکی از لیست‌های موجود یا null",
  "category": "دستهٔ یادداشت وقتی type=note است، وگرنه null",
  "person_name": "نام شخص وقتی type=person است، وگرنه null",
  "section": "نام بخشی از برنامه که این مورد به آن مربوط است (از فهرست بخش‌ها) یا null",
  "reason": "یک جمله فارسی: چرا این مقصد"
}}

مقصدهای مجاز (type را فقط از این کلیدها انتخاب کن):
{targets}

راهنما:
- «todo» را وقتی بده که آیتم به یکی از لیست‌های موجود بخورد (list_name را فقط از فهرست لیست‌ها بردار).
- اگر تاریخ یا موعدی در متن هست در due_date بگذار.
- «section» فقط یک راهنماست برای این‌که این مورد به کدام بخش برنامه مربوط می‌شود؛ مقصد اصلی همان type است.

لیست‌های موجود کاربر:
{lists}

بخش‌های برنامه:
{pages}

متن خام:
{content}
"""


def _parse_json_object(text: str) -> Optional[Dict[str, Any]]:
    """Extract the first JSON object from a model reply (code fences and
    leading prose tolerated). Returns None when nothing parses."""
    if not text:
        return None
    cleaned = re.sub(r"```(?:json)?", "", text).strip()
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


def _norm_date(value: Any) -> Optional[date]:
    if not value:
        return None
    try:
        return date.fromisoformat(str(value).strip()[:10])
    except ValueError:
        return None


def _norm_priority(value: Any) -> str:
    v = str(value or "").strip().lower()
    if v in ("high", "urgent", "critical", "بالا", "فوری"):
        return "high"
    if v in ("low", "پایین", "کم"):
        return "low"
    return "normal"


_PHONE_RE = re.compile(r"(?:\+?\d[\d\s\-]{8,}\d)")
# Action-ish cues for the keyless heuristic — deliberately coarse; the
# real quality comes from the AI path, this only keeps a keyless deploy
# useful instead of dead.
_TASK_CUES = (
    "باید", "بخر", "خرید", "پرداخت", "تماس", "زنگ", "پیگیری", "بفرست", "ارسال",
    "رزرو", "تمدید", "ثبت‌نام", "انجام", "درست کن", "تعمیر", "قرار", "جلسه",
    "call", "buy", "pay", "todo", "fix", "book", "renew",
)
_PERSON_CUES = ("شماره", "آقای", "خانم", "دکتر", "مهندس", "@", "phone", "شماره‌ی")


def _heuristic_classify(content: str) -> Dict[str, Any]:
    """Deterministic no-model fallback: coarse cues, never raises."""
    text = content.strip()
    first_line = next((ln.strip() for ln in text.splitlines() if ln.strip()), "بدون عنوان")
    lower = text.lower()
    if _PHONE_RE.search(text) and any(c in text or c in lower for c in _PERSON_CUES):
        kind = "person"
    elif len(text) > 400:
        kind = "note"
    elif any(c in text or c in lower for c in _TASK_CUES):
        kind = "task"
    else:
        kind = "note"
    return {
        "type": kind,
        "title": first_line[:120],
        "description": text[:4000],
        "priority": "normal",
        "due_date": None,
        "list_name": None,
        "category": None,
        "person_name": first_line[:120] if kind == "person" else None,
        "reason": "دسته‌بندی با قانون ساده (مدل AI پیکربندی نشده)",
    }


LOCKED_TYPES = ("password_request", "password_components")


def locked_first_order():
    """ORDER BY expression putting «رمز لازم» rows first.

    A locked-file row is one-step actionable (type the password); an unread note
    is not. With seventy notes pending, six password requests were invisible —
    the owner reported «جایی برای رمز زدن نیست» while the digest kept naming the
    files. Sorting them to the top is the fix."""
    from sqlalchemy import case

    from app.models.inbox_item import InboxItem

    return case((InboxItem.suggested_type.in_(list(LOCKED_TYPES)), 0), else_=1)


def scope_filter(col, uid: int):
    """Anon scope (0) also covers legacy NULL-owner rows — same rule as
    the tasks/writings/activity-log routers."""
    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


async def _list_names(db: AsyncSession, user_id: int) -> List[str]:
    from app.models.todo_list import TodoList

    rows = (
        await db.execute(
            select(TodoList.name)
            .where(scope_filter(TodoList.user_id, user_id), TodoList.is_archived.is_(False))
            .limit(100)
        )
    ).scalars().all()
    return [n for n in rows if n]


async def classify_content(db: AsyncSession, content: str, *, user_id: int = 0) -> Dict[str, Any]:
    """Return ``{"suggested_type", "suggestion", "ai_model"}`` for ``content``.

    Never raises: any AI/parse failure falls back to the heuristic.
    """
    fallback = _heuristic_classify(content)
    try:
        from app.services.ai.inference_gateway import complete

        # مقصدها/لیست‌ها/بخش‌ها همگی زنده‌اند: افزودنِ یک فایل‌کننده یا یک لیست
        # یا یک صفحهٔ تازه، بلافاصله در همین پرامپت دیده می‌شود (بدون ویرایش کد).
        catalog = await destination_catalog(db, user_id)
        targets_txt = "\n".join(
            f"- {t['key']}: {t['label']}" for t in catalog["targets"]
        )
        lists_txt = "\n".join(f"- {n}" for n in catalog["lists"]) or "(هیچ لیستی نیست)"
        pages_txt = "\n".join(f"- {p['label']}" for p in catalog["pages"]) or "(نامشخص)"
        prompt = _TRIAGE_PROMPT.format(
            targets=targets_txt, lists=lists_txt, pages=pages_txt, content=content[:6000]
        )
        res = await complete(db, prompt, task="inbox_triage", max_tokens=700)
    except Exception as exc:  # gateway import/resolve crash — keep capturing
        logger.warning("inbox triage AI call failed (falling back): %r", exc)
        res = {"ok": False}
    obj = _parse_json_object(res.get("text", "")) if res.get("ok") else None
    if not obj:
        return {
            "suggested_type": fallback["type"],
            "suggestion": fallback,
            "ai_model": None,
        }
    kind = str(obj.get("type") or "").strip().lower()
    if kind not in INBOX_TARGETS:
        kind = fallback["type"]
    suggestion = {
        "type": kind,
        "title": (str(obj.get("title") or fallback["title"]))[:120].strip()
        or fallback["title"],
        "description": str(obj.get("description") or content)[:4000],
        "priority": _norm_priority(obj.get("priority")),
        "due_date": (
            _norm_date(obj.get("due_date")).isoformat()
            if _norm_date(obj.get("due_date"))
            else None
        ),
        "list_name": (str(obj.get("list_name")).strip() or None)
        if obj.get("list_name") and str(obj.get("list_name")).lower() not in ("null", "none")
        else None,
        "category": (str(obj.get("category")).strip() or None)
        if obj.get("category") and str(obj.get("category")).lower() not in ("null", "none")
        else None,
        "person_name": (str(obj.get("person_name")).strip() or None)
        if obj.get("person_name") and str(obj.get("person_name")).lower() not in ("null", "none")
        else None,
        # «کدام بخشِ برنامه» — راهنمای مسیریابی برای بخش‌هایی که هنوز
        # فایل‌کنندهٔ اختصاصی ندارند؛ باعث می‌شود دادهٔ تازه بی‌صاحب نماند.
        "section": (str(obj.get("section")).strip() or None)
        if obj.get("section") and str(obj.get("section")).lower() not in ("null", "none")
        else None,
        "reason": str(obj.get("reason") or "")[:500] or None,
    }
    return {"suggested_type": kind, "suggestion": suggestion, "ai_model": res.get("model")}


async def apply_classification(db: AsyncSession, item: InboxItem, *, user_id: int = 0) -> InboxItem:
    """Run triage for ``item`` and persist the suggestion on the row."""
    result = await classify_content(db, item.content, user_id=user_id)
    item.suggested_type = result["suggested_type"]
    item.suggestion = result["suggestion"]
    item.ai_model = result["ai_model"]
    await db.commit()
    await db.refresh(item)
    return item


def _esc(value: Optional[str]) -> Optional[str]:
    """Normalise to EXACTLY ONE escape level (the app convention set by the
    tasks router's _sanitize). Filing inputs arrive mixed: content-derived
    defaults are already escaped at capture, route-body overrides are raw,
    and AI-suggested text may be either — a plain second html.escape would
    double-escape the first kind (``Q&A`` → ``Q&amp;amp;A``, breaking titles
    and URLs). unescape-then-escape is idempotent across all three sources.
    """
    return None if value is None else html.escape(html.unescape(value), quote=True)


def _to_task_priority(value: str):
    from app.models.task import TaskPriority

    return {
        "low": TaskPriority.LOW,
        "normal": TaskPriority.MEDIUM,
        "high": TaskPriority.HIGH,
    }.get(value, TaskPriority.MEDIUM)


def _auto_sahat(text: str) -> Optional[str]:
    """خداشهر: place a captured input under a sahat automatically at filing
    time, so it lands in its district «مثل آب خوردن». Owner-correctable later
    via the chip. Best-effort — never blocks a capture."""
    try:
        from app.services.sahat_service import classify_text

        return classify_text(text)
    except Exception:
        return None


async def _file_as_task(db: AsyncSession, s: Dict[str, Any], user_id: int) -> Dict[str, Any]:
    from app.models.task import Task, TaskStatus

    task = Task(
        title=_esc(s["title"]),
        description=_esc(s.get("description")),
        status=TaskStatus.TODO,
        priority=_to_task_priority(s.get("priority", "normal")),
        user_id=user_id,
        due_date=_norm_date(s.get("due_date")),
        sahat=_auto_sahat(f"{s.get('title', '')} {s.get('description', '')}"),
    )
    db.add(task)
    await db.flush()
    return {"kind": "task", "id": task.id, "title": task.title, "link": "/tasks"}


async def _file_as_todo(db: AsyncSession, s: Dict[str, Any], user_id: int) -> Dict[str, Any]:
    from app.models.todo_item import TodoItem
    from app.models.todo_list import TodoList, todo_list_items

    lst = None
    name = s.get("list_name")
    if name:
        # Exact (case-insensitive) match wins — «کار» must not land in
        # «کارهای شخصی». Fall back to substring with LIKE wildcards escaped
        # (a list named «تخفیف 50%» must not widen the pattern). Archived
        # lists are never a filing destination.
        lst = (
            await db.execute(
                select(TodoList)
                .where(
                    scope_filter(TodoList.user_id, user_id),
                    TodoList.is_archived.is_(False),
                    func.lower(TodoList.name) == name.lower(),
                )
                .limit(1)
            )
        ).scalars().first()
        if lst is None:
            pattern = (
                name.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            )
            lst = (
                await db.execute(
                    select(TodoList)
                    .where(
                        scope_filter(TodoList.user_id, user_id),
                        TodoList.is_archived.is_(False),
                        TodoList.name.ilike(f"%{pattern}%", escape="\\"),
                    )
                    .order_by(func.length(TodoList.name))
                    .limit(1)
                )
            ).scalars().first()
    if lst is None:
        lst = (
            await db.execute(
                select(TodoList)
                .where(
                    scope_filter(TodoList.user_id, user_id),
                    TodoList.is_archived.is_(False),
                    TodoList.name == INBOX_DEFAULT_LIST_NAME,
                )
                .limit(1)
            )
        ).scalars().first()
    if lst is None:
        lst = TodoList(
            name=INBOX_DEFAULT_LIST_NAME,
            description="آیتم‌های فرستاده‌شده از صندوق ورودی که لیست مشخصی نداشتند",
            user_id=user_id,
        )
        db.add(lst)
        await db.flush()
    item = TodoItem(
        content=_esc(s["title"]),
        description=_esc(s.get("description")),
        owner_id=user_id,
        type="task",
        due_date=_norm_date(s.get("due_date")),
    )
    db.add(item)
    await db.flush()
    position = int(
        (
            await db.execute(
                select(func.count())
                .select_from(todo_list_items)
                .where(todo_list_items.c.todo_list_id == lst.id)
            )
        ).scalar()
        or 0
    )
    await db.execute(
        insert(todo_list_items).values(
            todo_list_id=lst.id, todo_item_id=item.id, position=position
        )
    )
    return {
        "kind": "todo_item",
        "id": item.id,
        "title": item.content,
        "list_id": lst.id,
        "list_name": lst.name,
        "link": f"/lists/{lst.id}",
    }


async def _file_as_note(db: AsyncSession, s: Dict[str, Any], user_id: int) -> Dict[str, Any]:
    from app.models.personal_writing import PersonalWriting

    writing = PersonalWriting(
        user_id=user_id,
        title=_esc(s["title"]) or "یادداشت صندوق ورودی",
        category=_esc(s.get("category")) or "صندوق ورودی",
        body=_esc(s.get("description")) or _esc(s["title"]) or "",
        source_note="ثبت‌شده از صندوق ورودی",
    )
    db.add(writing)
    await db.flush()
    return {"kind": "writing", "id": writing.id, "title": writing.title, "link": "/writings"}


async def _file_as_subscription(db: AsyncSession, s: Dict[str, Any], user_id: int) -> Dict[str, Any]:
    """Turn an auto-ingest subscription candidate into a real
    ``SubscriptionAccount`` — which the «اشتراک‌ها» card shows and
    ``attention_service.subscription_renewal`` turns into a renewal reminder.
    Only the shown next-payment date + provider/email ride along; there is no
    price column on the model, so the amount stays informational in the inbox
    row (the owner can edit the account afterwards)."""
    from app.models.subscription_account import SubscriptionAccount

    provider = (s.get("provider") or s.get("title") or "subscription")
    sub = SubscriptionAccount(
        user_id=user_id,
        provider=str(provider)[:64],
        account_email=(str(s["account_email"])[:255] if s.get("account_email") else None),
        next_payment_date=(str(s["next_payment_date"])[:64] if s.get("next_payment_date") else None),
    )
    db.add(sub)
    await db.flush()
    return {"kind": "subscription", "id": sub.id, "title": sub.provider, "link": "/life-file"}


def _to_decimal(value: Any):
    """Best-effort money parse: «AED 44.99» / «۱٬۲۳۴٫۵» / 1234 → Decimal or None."""
    from decimal import Decimal, InvalidOperation

    if value is None:
        return None
    s = str(value)
    s = s.translate(str.maketrans("۰۱۲۳۴۵۶۷۸۹٬٫", "0123456789,."))
    m = re.search(r"-?[0-9][0-9,]*\.?[0-9]*", s)
    if not m:
        return None
    try:
        return Decimal(m.group(0).replace(",", ""))
    except (InvalidOperation, ValueError):
        return None


# Titles arriving from other ingests are not account names: strip the
# person-suggestion prefix, any <email> part, and pre-escaped HTML entities.
_RE_TITLE_PREFIX = re.compile(r"^\s*فرد جدید از ایمیل\s*[:：]?\s*", re.I)
_RE_ANGLE_ADDR = re.compile(r"<[^>]*>|&lt;.*?&gt;")


def _clean_provider(raw: Any) -> str:
    import html as _html

    s = _html.unescape(str(raw or ""))
    s = _RE_TITLE_PREFIX.sub("", s)
    s = _RE_ANGLE_ADDR.sub("", s)
    return re.sub(r"\s{2,}", " ", s).strip(" -—،:") or "حساب"


async def _occurred_from_source(db: AsyncSession, source_ref: Optional[str]) -> Optional[str]:
    """The signal's own date, recovered from the mirrored email the file came
    from (`gmail:<mid>:<file>` / `email:<id>`). Without a date, an OLD statement
    confirmed today would count as «newer» and stomp the current balance —
    exactly what the owner saw (2026-07-25)."""
    if not source_ref:
        return None
    try:
        from app.models.personal_sync import PersonalEmail

        parts = str(source_ref).split(":")
        if len(parts) >= 2 and parts[0] in ("gmail", "email"):
            row = await db.get(PersonalEmail, parts[1])
            if row is not None and row.received_at is not None:
                return row.received_at.isoformat()
    except Exception:
        pass
    return None


async def _file_as_finance_account(db: AsyncSession, s: Dict[str, Any], user_id: int) -> Dict[str, Any]:
    """Create OR update a bank/broker/exchange account from an approved file,
    via the SHARED identity engine (finance_email_scan_service.apply_account_signal).

    2026-07-25 (owner: «خریدهای طلبات و کارفور را به مالی فرستادم، مثل گاو حساب
    بانکی ساخت»): a PURCHASE routed to «مالی» is an EXPENSE, not an account.
    An account card needs an account signal — an IBAN/account number, or a real
    positive balance. A payload with only an amount (a receipt) is delegated to
    the transaction filer; a payload with nothing financial at all is refused
    with a clear message instead of minting a blind 0.00 card (that fallback is
    where the Carrefour/Talabat/«فرد جدید از ایمیل» junk cards came from).
    """
    from app.services import finance_email_scan_service as fs

    provider = _clean_provider(s.get("provider") or s.get("title"))[:255]
    kind = str(s.get("account_kind") or s.get("kind") or "bank")[:32]
    ref = s.get("account_no") or s.get("account_ref")
    iban = s.get("iban")
    balance = _to_decimal(s.get("balance"))
    amount = _to_decimal(s.get("amount") or s.get("total"))

    blob = " ".join(str(v) for v in (provider, s.get("title"), s.get("description")) if v)
    has_account_signal = bool(iban or ref or (balance is not None and balance > 0))
    if fs.is_not_an_account(blob) or (not has_account_signal and amount is not None):
        # a receipt/invoice — file it as the expense it is («نقدی/رسیدها»).
        return await _file_as_transaction(db, s, user_id)
    if not has_account_signal:
        raise ValueError(
            "این مورد هیچ نشانه‌ای از یک حساب ندارد (نه شماره/IBAN، نه موجودی) — "
            "به‌عنوان «خرید/هزینه» یا «یادداشت» ثبتش کن."
        )

    occurred = s.get("date") or await _occurred_from_source(db, s.get("source_ref"))
    institution = fs._institution(None, provider) or provider or None
    res = await fs.apply_account_signal(
        db, user_id, institution=institution, account_ref=ref, iban=iban,
        balance=balance, currency=s.get("currency"), kind=kind,
        source="attachment", source_ref=s.get("source_ref"),
        occurred_iso=occurred, provider_name=provider,
        # the owner clicked «تأیید» — his explicit approval outranks the
        # tombstone/allow-list gates that police the MACHINE's auto-feed.
        trusted=True,
    )
    acct_id = res.get("account_id")
    if acct_id is None:
        # the shared engine refused (e.g. non-account text) — same rule here.
        raise ValueError(
            "این مورد به‌عنوان حسابِ بانکی پذیرفته نشد — اگر خرید است، «خرید/هزینه» را انتخاب کن."
        )
    return {"kind": "finance_account", "id": acct_id, "title": provider, "link": "/budget"}


def _parse_date(value: Any):
    """Best-effort date parse for a receipt's own date → date or None."""
    if not value:
        return None
    from datetime import datetime as _dt

    s = str(value).strip()[:10]
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d", "%d-%m-%Y"):
        try:
            return _dt.strptime(s, fmt).date()
        except Exception:
            continue
    return None


async def _file_as_transaction(db: AsyncSession, s: Dict[str, Any], user_id: int) -> Dict[str, Any]:
    """File an extracted receipt/invoice as an EXPENSE Transaction so purchases
    actually feed the income/expense/profit-loss analysis — «خریدهایم را تحلیل
    کن». Books it against a per-currency «نقدی/رسیدها» cash account (created if
    missing). Idempotent on source_ref (a re-approval never double-posts)."""
    from sqlalchemy import func as _f

    from app.models.finance import FinancialAccount, Transaction

    amount = _to_decimal(s.get("amount") or s.get("total") or s.get("balance"))
    currency = str(s.get("currency") or "AED")[:8]
    source_ref = s.get("source_ref")
    if source_ref:
        existing = (
            await db.execute(select(Transaction).where(Transaction.source_ref == source_ref))
        ).scalars().first()
        if existing is not None:
            return {"kind": "transaction", "id": existing.id, "title": existing.description or "تراکنش", "link": "/finance"}

    acct_name = f"نقدی/رسیدها ({currency})"
    acct = (
        await db.execute(
            select(FinancialAccount).where(
                scope_filter(FinancialAccount.user_id, user_id),
                _f.lower(FinancialAccount.name) == acct_name.lower(),
            )
        )
    ).scalars().first()
    if acct is None:
        acct = FinancialAccount(
            user_id=user_id, name=_esc(acct_name), kind="bank",
            institution="رسیدها", currency=currency, balance=0,
        )
        db.add(acct)
        await db.flush()

    merchant = (s.get("provider") or s.get("merchant") or s.get("title") or "خرید")[:255]
    category = _esc(s.get("category") or merchant)[:64] or None
    txn = Transaction(
        account_id=acct.id,
        amount=amount if amount is not None else 0,
        transaction_type=str(s.get("transaction_type") or "expense")[:16],
        description=_esc(merchant),
        category=category,
        occurred_on=_parse_date(s.get("date")),
        currency=currency,
        source="receipt",
        source_ref=(str(source_ref)[:255] if source_ref else None),
    )
    db.add(txn)
    await db.flush()
    return {"kind": "transaction", "id": txn.id, "title": merchant, "link": "/finance"}


async def _file_as_document(db: AsyncSession, s: Dict[str, Any], user_id: int) -> Dict[str, Any]:
    """File an extracted identity/official document into IdentityDocument (its
    expiry then drives the attention reminder)."""
    from app.models.identity_document import IdentityDocument

    doc = IdentityDocument(
        user_id=user_id,
        full_name=(_esc(s.get("name") or s.get("full_name") or s.get("title")) or None),
        emirates_id_number=(str(s["account_no"])[:32] if s.get("account_no") else None),
        expiry_date=(str(s["expiry"])[:32] if s.get("expiry") else None),
    )
    db.add(doc)
    await db.flush()
    return {"kind": "document", "id": doc.id, "title": doc.full_name or "سند", "link": "/life-file"}


async def _file_as_person(db: AsyncSession, s: Dict[str, Any], user_id: int) -> Dict[str, Any]:
    from app.models.person import Person

    name = s.get("person_name") or s["title"]
    email = (s.get("email") or "").strip().lower() or None
    person = Person(
        user_id=user_id,
        name=_esc(name)[:255],
        email=(email[:255] if email else None),
        notes=_esc(s.get("description")),
    )
    db.add(person)
    await db.flush()
    # If we know their email (a Gmail-sourced candidate), backfill the
    # relationship from the emails already synced from them so the profile
    # shows a real score the moment it's approved — not a lifeless zero.
    if email:
        try:
            from app.services.google_sync import person_ingest

            await person_ingest.backfill_person_interactions(
                db, person_id=person.id, email=email, user_id=user_id
            )
        except Exception:
            pass  # score enrichment is best-effort; the person is what matters
    return {
        "kind": "person",
        "id": person.id,
        "title": person.name,
        "link": "/people-profiles",
    }


# ── The destination registry (single registration point) ────────────────────
# Adding a destination = write `_file_as_<x>` above + ONE line here. From this
# dict we derive INBOX_TARGETS (validation + the triage prompt) and the mobile
# dispatcher's routable set, so a new section of the app becomes reachable by
# the router automatically — the same «derive, never hand-maintain» rule the
# live system map follows.
FILERS = {
    "task": _file_as_task,
    "todo": _file_as_todo,
    "note": _file_as_note,
    "person": _file_as_person,
    "subscription": _file_as_subscription,
    "finance_account": _file_as_finance_account,
    "document": _file_as_document,
    "transaction": _file_as_transaction,
}

# Re-derived from the registry (the tuple near the top is the readable
# declaration; THIS is the truth the code runs on).
INBOX_TARGETS = tuple(FILERS.keys())


async def destination_catalog(db: AsyncSession, user_id: int = 0) -> Dict[str, Any]:
    """The LIVE picture of where an incoming signal may be filed.

    Three layers, all derived at call time so the router never goes stale:
      * ``targets``  — from FILERS (a new filer appears here instantly)
      * ``lists``    — the owner's actual todo lists (a new list is targetable)
      * ``pages``    — the SPA's live route registry, as context for the model
        («این به کدام بخش برنامه مربوط است؟») even before a filer exists.
    """
    catalog: Dict[str, Any] = {
        "targets": [{"key": k, "label": TARGET_FA.get(k, k)} for k in INBOX_TARGETS],
        "lists": [],
        "pages": [],
    }
    try:
        catalog["lists"] = await _list_names(db, user_id)
    except Exception:
        pass
    try:
        from app.services.system_graph_service import parse_routes_meta

        seen = set()
        for entry in parse_routes_meta():
            label = entry.get("label") or entry.get("page")
            if label and label not in seen and entry.get("group") != "public":
                seen.add(label)
                catalog["pages"].append({"label": label, "path": entry.get("path")})
    except Exception:
        pass
    return catalog


async def file_item(
    db: AsyncSession,
    item: InboxItem,
    *,
    target_type: Optional[str] = None,
    overrides: Optional[Dict[str, Any]] = None,
    user_id: int = 0,
) -> Dict[str, Any]:
    """Turn a pending inbox row into a real entity and mark it filed.

    ``target_type`` overrides the suggestion; ``overrides`` patch the
    suggestion payload (title, list_name, …). Raises ``ValueError`` on an
    unknown target so the route can 422 it.
    """
    kind = (target_type or item.suggested_type or "task").strip().lower()
    if kind == "todo_item":
        kind = "todo"
    if kind == "writing":
        kind = "note"
    if kind not in INBOX_TARGETS:
        raise ValueError(f"unknown inbox target: {kind}")

    base = dict(item.suggestion or {})
    if not base.get("title"):
        first_line = next(
            (ln.strip() for ln in item.content.splitlines() if ln.strip()), "بدون عنوان"
        )
        base["title"] = first_line[:120]
    if not base.get("description"):
        base["description"] = item.content[:4000]
    for key, value in (overrides or {}).items():
        if value is not None:
            base[key] = value

    created = await FILERS[kind](db, base, user_id)

    item.status = "filed"
    item.filed_entity_type = created["kind"]
    item.filed_entity_id = created["id"]
    await db.commit()
    await db.refresh(item)
    return created


async def pending_count(db: AsyncSession, user_id: int = 0) -> int:
    return int(
        (
            await db.execute(
                select(func.count())
                .select_from(InboxItem)
                .where(scope_filter(InboxItem.user_id, user_id), InboxItem.status == "pending")
            )
        ).scalar()
        or 0
    )
