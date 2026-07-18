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
INBOX_TARGETS = ("task", "todo", "note", "person")

# Fallback list for explicit todo filings that match no existing list —
# auto-created so a "به لیست بفرست" choice can never dead-end.
INBOX_DEFAULT_LIST_NAME = "صندوق ورودی"

_TRIAGE_PROMPT = """تو دستیار دسته‌بندی «صندوق ورودی» یک برنامه مدیریت زندگی هستی.
متن خام زیر را بخوان و تشخیص بده به کدام بخش تعلق دارد. فقط یک شیء JSON برگردان، بدون هیچ توضیح اضافه:

{{
  "type": "task | todo | note | person",
  "title": "عنوان کوتاه (حداکثر ۱۲۰ نویسه)",
  "description": "خلاصه/جزئیات (اختیاری)",
  "priority": "low | normal | high",
  "due_date": "YYYY-MM-DD یا null",
  "list_name": "نام یکی از لیست‌های موجود یا null",
  "category": "دستهٔ یادداشت وقتی type=note است، وگرنه null",
  "person_name": "نام شخص وقتی type=person است، وگرنه null",
  "reason": "یک جمله فارسی: چرا این مقصد"
}}

راهنما:
- «task» = کاری که باید انجام شود (اقدام، پیگیری، خرید، پرداخت، تماس کاری).
- «todo» = آیتم چک‌لیستی که به یکی از لیست‌های موجود می‌خورد (list_name را فقط از فهرست زیر انتخاب کن).
- «note» = فکر، ایده، خاطره، مطلب آموختنی — چیزی که باید «نگه داشته» شود نه انجام.
- «person» = معرفی/اطلاعات یک آدم (نام + شماره/ایمیل/توضیح).
- اگر تاریخ یا موعدی در متن هست در due_date بگذار.

لیست‌های موجود کاربر:
{lists}

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

        lists = await _list_names(db, user_id)
        lists_txt = "\n".join(f"- {n}" for n in lists) or "(هیچ لیستی نیست)"
        prompt = _TRIAGE_PROMPT.format(lists=lists_txt, content=content[:6000])
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
    """Same stored-XSS defence the route layer applies to direct creates."""
    return None if value is None else html.escape(value, quote=True)


def _to_task_priority(value: str):
    from app.models.task import TaskPriority

    return {
        "low": TaskPriority.LOW,
        "normal": TaskPriority.MEDIUM,
        "high": TaskPriority.HIGH,
    }.get(value, TaskPriority.MEDIUM)


async def _file_as_task(db: AsyncSession, s: Dict[str, Any], user_id: int) -> Dict[str, Any]:
    from app.models.task import Task, TaskStatus

    task = Task(
        title=_esc(s["title"]),
        description=_esc(s.get("description")),
        status=TaskStatus.TODO,
        priority=_to_task_priority(s.get("priority", "normal")),
        user_id=user_id,
        due_date=_norm_date(s.get("due_date")),
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
        lst = (
            await db.execute(
                select(TodoList)
                .where(scope_filter(TodoList.user_id, user_id), TodoList.name.ilike(f"%{name}%"))
                .limit(1)
            )
        ).scalars().first()
    if lst is None:
        lst = (
            await db.execute(
                select(TodoList)
                .where(
                    scope_filter(TodoList.user_id, user_id),
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


async def _file_as_person(db: AsyncSession, s: Dict[str, Any], user_id: int) -> Dict[str, Any]:
    from app.models.person import Person

    name = s.get("person_name") or s["title"]
    person = Person(
        user_id=user_id,
        name=_esc(name)[:255],
        notes=_esc(s.get("description")),
    )
    db.add(person)
    await db.flush()
    return {
        "kind": "person",
        "id": person.id,
        "title": person.name,
        "link": "/people-profiles",
    }


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

    filer = {
        "task": _file_as_task,
        "todo": _file_as_todo,
        "note": _file_as_note,
        "person": _file_as_person,
    }[kind]
    created = await filer(db, base, user_id)

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
