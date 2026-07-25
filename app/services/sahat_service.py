"""خداشهر — the God-city: the human-dimensions layer over the WHOLE system.

Owner's foundational reframing (2026-07-22, corrected twice): the app manages
the life of a HUMAN whose worldview is Shia fiqh, so everything — tasks,
writings, emails, finance, people, files, wishes, hobbies, even idle
downloads — must find its place under the human ساحت‌ها. **This is a CITY,
not a mosque**: the God-relation is the قبله the whole city faces, not a
worship corner; the bulk of the city is مباحات — ordinary work, trade,
hobbies, errands — each standing in its own district with dignity.

The primary axis is the fiqhi four-relations (the axis of تکلیف and
severity): رابطه با خدا / با خود / با دیگران / با محیط — with the modern
five-sahat model slotted in as facets of «خود» (جسم/عقل/روان), exactly the
synthesis the owner's consultation reached.

Design commitments (v2 — «خداشهر», replacing the v1 island):
  * **Persistent + owner-correctable.** The five primary content tables carry
    a nullable ``sahat`` column. A stored value ALWAYS wins; NULL falls back
    to the deterministic classifier. The owner's correction is final and
    visible on every page (chips), so the lens is woven through the app
    instead of living on one page.
  * **A calm organizer, never a judge (owner's third correction).** The
    machine attaches NO moral label to anything — nothing is حق‌الناس/حق‌الله
    by machine decree. Most of life is مباح; whether an act is ever a duty is
    context only the owner sees. Attention items are labelled by their plain
    NATURE (overdue / someone-waiting / stale / piled-up), never by a verdict.
  * **Deeds only, never intentions, never sermons.** The map organizes and
    tracks follow-through; it does not tell the owner «now do X».
  * **A writing is presence, not achievement.** Content mass (writings,
    projects, assets) is shown but NEVER scored as «done» — v1's
    every-writing-counts-as-done inflated the numbers dishonestly.
  * **Threads (نخِ تسبیح) are data.** The registry lives in ``sahat_threads``
    (seeded from the code list below, which stays as fallback), so the owner
    adds a new stream without a deploy; scattered content self-attaches by
    token match at read time.

Deterministic + SQL-only (works on a keyless deploy); snapshots persist to
``AIAssessment(assessment_type='sahat_map')`` for the over-time trend.
"""
from __future__ import annotations

import json
import logging
import re
from datetime import date, datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

SAHAT_MAP_TYPE = "sahat_map"

# ── the taxonomy ────────────────────────────────────────────────────────────
# Four fiqhi relations; «خود» carries the three modern facets (جسم/عقل/روان).
# ``group`` drives the city layout: qibla (the orientation band), khod (the
# three facets of self), rel (the outward relations). ``fa_short`` feeds the
# small chips on the tool pages.
SAHATS: Dict[str, Dict[str, Any]] = {
    "khoda": {
        "title": "رابطه با خدا",
        "fa_short": "خدا",
        "icon": "🕋",
        "group": "qibla",
        "desc": "قبلهٔ شهر — خداشناسی، نیت، عبادت و برنامه‌ریزیِ الهی؛ همهٔ ساحت‌ها رو به این‌جا دارند",
        "links": ["/writings", "/lists", "/directives"],
    },
    "khod_ravan": {
        "title": "خود — روان و اراده",
        "fa_short": "روان",
        "icon": "💠",
        "group": "khod",
        "desc": "خودسازی، اخلاق، اراده و اهتمام، ترس و شجاعت، تفریحِ سالم",
        "links": ["/self-portrait", "/directives", "/lists"],
    },
    "khod_aql": {
        "title": "خود — عقل و ذهن",
        "fa_short": "عقل",
        "icon": "📚",
        "group": "khod",
        "desc": "یادگیری، مطالعه، نوشتن، مهارت‌ها، رشدِ ذهن",
        "links": ["/writings", "/brain", "/lists"],
    },
    "khod_jesm": {
        "title": "خود — جسم و سلامت",
        "fa_short": "جسم",
        "icon": "💪",
        "group": "khod",
        "desc": "ورزش، تغذیه، خواب، سلامت و درمان",
        "links": ["/lists", "/tasks"],
    },
    "digaran": {
        "title": "رابطه با دیگران",
        "fa_short": "دیگران",
        "icon": "🤝",
        "group": "rel",
        "desc": "خانواده و افراد، کار و کسب، معامله و مالی، پروژه‌ها",
        "links": ["/people-profiles", "/budget", "/projects", "/tasks"],
    },
    "mohit": {
        "title": "رابطه با محیط و اموال",
        "fa_short": "محیط",
        "icon": "🌍",
        "group": "rel",
        "desc": "اسناد و دارایی‌ها، اشتراک‌ها، ابزار، نظمِ دیجیتال",
        "links": ["/life-file", "/assets", "/merge"],
    },
}

# Combined districts for navigation: «خود» aggregates its three facets.
DISTRICTS: Dict[str, Dict[str, Any]] = {
    "khoda": {"title": "رابطه با خدا", "keys": ["khoda"]},
    "khod": {"title": "خود — جان و تن و ذهن", "keys": ["khod_ravan", "khod_aql", "khod_jesm"]},
    "digaran": {"title": "رابطه با دیگران", "keys": ["digaran"]},
    "mohit": {"title": "رابطه با محیط و اموال", "keys": ["mohit"]},
}

# ── Urgency ladder (calm — «چقدر منتظرِ توئه», NOT a moral verdict) ──────────
# The owner's THIRD correction (2026-07-22): DROP the fiqhi weighting entirely.
# The map is a calm ORGANIZER, not a judge. Nothing is ever branded
# حق‌الناس/حق‌الله by the machine — most of life is مباح, and context (which
# only the owner sees) is the only thing that could ever make a plain act a
# duty. Attention items are labelled by their NATURE (overdue / someone-waiting
# / stale / piled-up); the numeric level only ORDERS «what needs you first» and
# is never shown as a verdict.
U_OVERDUE = 4    # عقب‌افتاده یا منقضی
U_WAITING = 3    # یک نفر منتظرِ توست
U_SOON = 2       # نزدیکِ موعد
U_STALE = 2      # مدتی راکد مانده
U_PILE = 1       # تلنبار شده

# Back-compat aliases so any external import keeps resolving. Values are now
# plain urgency — they carry NO fiqhi meaning anymore.
W_HAQ_NAS = U_WAITING
W_AHD = U_WAITING
W_ZARAR_KHOD = U_OVERDUE
W_GROWTH = U_STALE
W_CLUTTER = U_PILE
W_SELF_HARM = U_OVERDUE

# Attention-item kinds → the plain, non-judging label the UI shows.
ATTENTION_KINDS_FA = {
    "overdue": "عقب‌افتاده",
    "waiting": "یک نفر منتظرته",
    "soon": "نزدیکِ موعد",
    "stale": "مدتی راکد",
    "pile": "تلنبار شده",
}

# Automated financial notifications about the owner's OWN account — used ONLY
# to route them to «محیط/اموال» and dedup duplicates. No moral label attached;
# checked before the human test so a broker's automated mail isn't mistaken for
# a person awaiting a reply.
_RE_FIN_ALERT = re.compile(
    r"(margin|liquidat|balance|payment due|overdue|insufficient|statement|"
    r"invoice|alert|بدهی|سررسید|موجودی|اخطار|هشدار)",
    re.I,
)

# ── backbone (ستون‌فقرات) — the owner's named lists/writings pinned to sahats ─
_BACKBONE_LISTS = [
    ("عاشق خدا", "khoda"),
    ("مراقبه", "khoda"),
    ("مرد الهی", "khoda"),
    ("مردِ خدا", "khoda"),
    ("محاسبه", "khod_ravan"),
    ("اراده", "khod_ravan"),
    ("ترس", "khod_ravan"),
    ("شجاع", "khod_ravan"),
    ("تذکر", "khod_ravan"),
]
_BACKBONE_WRITING_TOKENS = ("خداشناسی", "برنامه‌ریزی الهی", "برنامه ریزی الهی", "شرح حال")

# Keyword → sahat for free-text titles (first hit wins; checked in order).
# v2: extended with the owner's REAL list names (تجارت، برنامه نویسی، مداحی،
# خریدهای لازم…) so the actual data lands sensibly — the city is mostly
# مباحات and they deserve correct districts, not a pious default.
_KEYWORDS = [
    ("khoda", (
        "نماز", "قرآن", "دعا", "روزه", "خدا", "الهی", "زیارت", "مسجد", "معنو",
        "معارف", "مداحی", "انبیا", "توسل", "اذان", "صدقه", "خمس", "زکات",
    )),
    ("khod_jesm", (
        "ورزش", "دویدن", "باشگاه", "تمرین", "رژیم", "خواب", "سلامت", "پزشک",
        "دندان", "چکاپ", "دارو", "درمان",
    )),
    ("khod_aql", (
        "کتاب", "مطالعه", "خواندن", "یادگیری", "درس", "زبان", "دوره", "study",
        "read", "learn", "برنامه نویسی", "برنامه‌نویسی", "ریاضی", "فیزیک",
        "حقوق", "خوشنویسی", "نویسندگی", "شعر", "تاریخ", "تحلیل", "تفکر",
        "ایده", "هوش", "مهارت",
    )),
    ("digaran", (
        "تماس", "جلسه", "خانواده", "مادر", "پدر", "همسر", "دوست", "مهمان",
        "هدیه", "صله", "تجارت", "درآمد", "کسب", "نفوذ", "فامیل", "مشتری",
        "قرض", "بدهی", "همکار",
    )),
    ("mohit", (
        "نظافت", "تعمیر", "ماشین", "خانه", "اتاق", "مرتب", "بایگانی", "خرید",
        "مدارک", "اشتراک", "پرونده",
    )),
    ("khod_ravan", (
        "تفریح", "سرگرمی", "عادت", "خودهیپنوتیزم", "صبر", "بیکار",
    )),
]

_DOMAIN_TO_SAHAT = {
    "معنوی": "khoda",
    "خودسازی": "khod_ravan",
    "دانش": "khod_aql",
    "سلامت": "khod_jesm",
    "مالی": "digaran",
    "روابط": "digaran",
    "کار": "digaran",
    "آرزو": "khod_ravan",
}


def _scope(col, uid: int):
    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


def classify_text(text: Optional[str], default: str = "khod_ravan") -> str:
    """Deterministic keyword classification for a free-text title. The default
    (اراده و پیگیری) reflects that an unmarked personal task is a commitment to
    oneself. Never returns an unknown key."""
    t = (text or "").lower()
    if not t.strip():
        return default
    for token, sahat in _BACKBONE_LISTS:
        if token in t:
            return sahat
    for sahat, words in _KEYWORDS:
        if any(w in t for w in words):
            return sahat
    return default


def _stored(value: Optional[str]) -> Optional[str]:
    """A stored sahat value, if valid — the owner's correction always wins."""
    return value if value in SAHATS else None


def backbone_sahat_for_list(name: Optional[str]) -> Optional[str]:
    n = (name or "")
    for token, sahat in _BACKBONE_LISTS:
        if token in n:
            return sahat
    return None


def _is_backbone_writing(title: Optional[str], category: Optional[str]) -> bool:
    blob = f"{title or ''} {category or ''}"
    return any(tok in blob for tok in _BACKBONE_WRITING_TOKENS)


# ── effective-sahat helpers (stored value wins; pure + cheap) ───────────────
# Used by the tool-page serializers (lists/tasks/writings/directives/projects)
# so every page can SHOW the lens and offer the correction chip.

def effective_task_sahat(t) -> str:
    return (
        _stored(getattr(t, "sahat", None))
        or ("digaran" if getattr(t, "project_id", None) else None)
        or classify_text(getattr(t, "title", None))
    )


def effective_list_sahat(lst) -> str:
    return (
        _stored(getattr(lst, "sahat", None))
        or backbone_sahat_for_list(getattr(lst, "name", None))
        or classify_text(getattr(lst, "name", None), default="khod_ravan")
    )


def effective_writing_sahat(w) -> str:
    stored = _stored(getattr(w, "sahat", None))
    if stored:
        return stored
    blob = f"{getattr(w, 'title', '') or ''} {getattr(w, 'category', '') or ''}"
    if _is_backbone_writing(getattr(w, "title", None), getattr(w, "category", None)):
        return "khoda"
    th = thread_for(blob)
    if th is not None:
        return th["sahat"]
    return classify_text(blob, default="khod_aql")


def effective_directive_sahat(d) -> str:
    return (
        _stored(getattr(d, "sahat", None))
        or _DOMAIN_TO_SAHAT.get(getattr(d, "domain", "") or "", None)
        or classify_text(getattr(d, "title", None))
    )


def effective_project_sahat(p) -> str:
    return _stored(getattr(p, "sahat", None)) or classify_text(
        getattr(p, "name", None), default="digaran"
    )


# ── نخ‌های تسبیح (threads) — the accretion infrastructure ───────────────────
# v2: the registry is DATA (``sahat_threads`` table, editable from the UI);
# this code list is the SEED and the fallback for keyless/empty deploys.
# Matching semantics are unchanged: any new content naming a thread
# self-attaches to it at read time.
THREADS: List[Dict[str, Any]] = [
    {"key": "khodashenasi", "sahat": "khoda", "title": "خداشناسی و شرح حال",
     "tokens": ("خداشناسی", "شرح حال"), "link": "/writings"},
    {"key": "barnameh_elahi", "sahat": "khoda", "title": "برنامه‌ریزیِ الهی (دنیا و آخرت)",
     "tokens": ("برنامه‌ریزی الهی", "برنامه ریزی الهی", "دنیا و آخرت"), "link": "/writings"},
    {"key": "eshgh_khoda", "sahat": "khoda", "title": "کارهایی که عاشقِ خدا می‌کند",
     "tokens": ("عاشق خدا",), "link": "/lists"},
    {"key": "moraqebe", "sahat": "khoda", "title": "مراقبه قبل از هر کار",
     "tokens": ("مراقبه",), "link": "/lists"},
    {"key": "mard_elahi", "sahat": "khoda", "title": "شخصیتِ مردِ الهی",
     "tokens": ("مرد الهی", "مردِ خدا", "مرد خدا"), "link": "/lists"},
    {"key": "mohasebe", "sahat": "khod_ravan", "title": "محاسبهٔ میان و پایانِ هفته",
     "tokens": ("محاسبه",), "link": "/lists"},
    {"key": "erade", "sahat": "khod_ravan", "title": "تقویت/تضعیفِ اراده",
     "tokens": ("اراده",), "link": "/lists"},
    {"key": "shojaat", "sahat": "khod_ravan", "title": "ترس‌ها و شجاعت",
     "tokens": ("ترس", "شجاع"), "link": "/lists"},
    {"key": "tazakor", "sahat": "khod_ravan", "title": "تذکر و یادآوری",
     "tokens": ("تذکر", "یادآوری"), "link": "/lists"},
]


def thread_for(text: Optional[str]) -> Optional[Dict[str, Any]]:
    """First CODE-registry thread whose token appears in the text, else None.
    (Kept for back-compat and for the pure helpers above; the map itself uses
    the DB registry via :func:`get_threads`.)"""
    return _thread_for_in(THREADS, text)


def _thread_for_in(registry: List[Dict[str, Any]], text: Optional[str]) -> Optional[Dict[str, Any]]:
    t = text or ""
    if not t.strip():
        return None
    for th in registry:
        if any(tok in t for tok in th["tokens"]):
            return th
    return None


async def ensure_threads_seeded(db: AsyncSession, uid: int = 0) -> None:
    """Fill-empty seeding: every code-registry thread missing from the DB is
    inserted (merge, don't replace — owner rows are never touched)."""
    try:
        from app.models.sahat_thread import SahatThread

        rows = (
            await db.execute(select(SahatThread).where(_scope(SahatThread.user_id, uid)))
        ).scalars().all()
        have = {r.key for r in rows}
        added = False
        for i, th in enumerate(THREADS):
            if th["key"] in have:
                continue
            db.add(SahatThread(
                user_id=None if uid == 0 else uid,
                key=th["key"],
                title=th["title"],
                sahat=th["sahat"],
                tokens=list(th["tokens"]),
                link=th.get("link"),
                sort_order=i,
            ))
            added = True
        if added:
            await db.commit()
    except Exception as exc:
        logger.debug("sahat thread seeding skipped: %r", exc)
        try:
            await db.rollback()
        except Exception:
            pass


async def get_threads(db: AsyncSession, uid: int = 0) -> List[Dict[str, Any]]:
    """Active threads from the DB (seeded on first read); falls back to the
    code registry so a keyless/broken deploy keeps its map."""
    try:
        from app.models.sahat_thread import SahatThread

        await ensure_threads_seeded(db, uid)
        rows = (
            await db.execute(
                select(SahatThread)
                .where(_scope(SahatThread.user_id, uid), SahatThread.is_active.is_(True))
                .order_by(SahatThread.sort_order, SahatThread.id)
            )
        ).scalars().all()
        out = []
        seen_keys: set = set()
        for r in rows:
            tokens = tuple(r.tokens or ())
            # Dedup by key: NULL user_id rows escape UNIQUE(user_id, key) on
            # Postgres (NULLs are distinct), so a concurrent first-seed could
            # double-insert — render each thread once regardless.
            if not tokens or r.key in seen_keys:
                continue
            seen_keys.add(r.key)
            out.append({
                "id": r.id, "key": r.key, "sahat": r.sahat if r.sahat in SAHATS else "khod_ravan",
                "title": r.title, "tokens": tokens, "link": r.link or "/lists",
            })
        return out or list(THREADS)
    except Exception as exc:
        logger.debug("sahat threads fallback to code registry: %r", exc)
        return list(THREADS)


# ── owner correction (the assign endpoint's engine) ─────────────────────────
_ASSIGNABLE = {
    "task": ("app.models.task", "Task", "user_id"),
    "list": ("app.models.todo_list", "TodoList", "user_id"),
    "writing": ("app.models.personal_writing", "PersonalWriting", "user_id"),
    "directive": ("app.models.directive", "Directive", "user_id"),
    "project": ("app.models.project", "Project", "user_id"),
}


async def assign_sahat(
    db: AsyncSession, uid: int, entity_type: str, entity_id: int, sahat: str
) -> bool:
    """Persist the owner's sahat correction. Returns False when the entity is
    missing or out of scope (route answers 404 — cross-tenant rows stay
    hidden). ``sahat`` must be a known key."""
    if sahat not in SAHATS or entity_type not in _ASSIGNABLE:
        raise ValueError("unknown sahat or entity type")
    import importlib

    mod_name, cls_name, owner_col = _ASSIGNABLE[entity_type]
    model = getattr(importlib.import_module(mod_name), cls_name)
    row = (
        await db.execute(
            select(model).where(model.id == entity_id, _scope(getattr(model, owner_col), uid))
        )
    ).scalars().first()
    if row is None:
        return False
    row.sahat = sahat
    await db.commit()
    return True


def _empty_cell() -> Dict[str, Any]:
    return {
        "total": 0, "done": 0, "attention": [], "backbone": [],
        # content mass — shown, never scored:
        "writings": 0, "projects": 0, "assets": 0,
        # item-level detail (filled only when detail=True):
        "detail": {"tasks": [], "lists": [], "writings": [], "directives": [], "projects": []},
    }


async def build_sahat_map(
    db: AsyncSession, uid: int = 0, detail: bool = False
) -> Dict[str, Any]:
    """Aggregate EVERYTHING into the six sahat buckets, live. Read-only.

    ``detail=True`` additionally fills per-cell item lists (the district pages
    drill down through them) — same single pass, no second query storm.
    """
    cells: Dict[str, Dict[str, Any]] = {k: _empty_cell() for k in SAHATS}
    today = date.today()
    threads_reg = await get_threads(db, uid)
    thr: Dict[str, Dict[str, Any]] = {
        th["key"]: {"done": 0, "total": 0, "writings": 0, "directives": 0, "lists": 0,
                    "samples": []}
        for th in threads_reg
    }

    def att(sahat: str, label: str, weight: int, link: str, kind: str = "overdue") -> None:
        cells[sahat]["attention"].append({
            "label": label[:120], "weight": weight, "link": link, "kind": kind,
            "kind_fa": ATTENTION_KINDS_FA.get(kind, "پیگیری"),
        })

    def thr_sample(key: str, title: str) -> None:
        row = thr.get(key)
        if row is not None and len(row["samples"]) < 5 and title:
            row["samples"].append(title[:80])

    # ── Tasks ───────────────────────────────────────────────────────────────
    # An overdue task is surfaced plainly. If a person is linked, the label
    # simply notes «یک نفر منتظرشه» (higher in the list) — no moral class, no
    # verdict. That's the whole rule now.
    try:
        from app.models.person_task import person_tasks
        from app.models.task import Task, TaskStatus

        linked_ids = {
            row[0]
            for row in (await db.execute(select(person_tasks.c.task_id))).all()
        }
        tasks = (
            await db.execute(
                select(Task).where(_scope(Task.user_id, uid), Task.merged_into_id.is_(None))
            )
        ).scalars().all()
        for t in tasks:
            if t.status == TaskStatus.CANCELLED:
                continue
            person_linked = t.id in linked_ids
            sahat = (
                _stored(getattr(t, "sahat", None))
                or ("digaran" if (person_linked or t.project_id) else classify_text(t.title))
            )
            cell = cells[sahat]
            cell["total"] += 1
            overdue = bool(t.due_date and t.due_date < today and t.status != TaskStatus.DONE)
            if t.status == TaskStatus.DONE:
                cell["done"] += 1
            elif overdue:
                if person_linked:
                    att(sahat, f"کارِ عقب‌افتاده — یک نفر منتظرشه: {t.title}", U_WAITING, "/tasks",
                        kind="waiting")
                else:
                    att(sahat, f"کارِ عقب‌افتاده: {t.title}", U_OVERDUE, "/tasks", kind="overdue")
            if detail and t.status != TaskStatus.DONE and len(cell["detail"]["tasks"]) < 60:
                steps = t.steps if isinstance(t.steps, list) else []
                s_total = sum(1 for s in steps if isinstance(s, dict) and s.get("text"))
                s_done = sum(1 for s in steps if isinstance(s, dict) and s.get("done"))
                cell["detail"]["tasks"].append({
                    "id": t.id, "title": t.title, "status": str(t.status.value if hasattr(t.status, "value") else t.status),
                    "due_date": t.due_date.isoformat() if t.due_date else None,
                    "overdue": overdue,
                    "steps_total": s_total, "steps_done": s_done,
                })
    except Exception as exc:
        logger.debug("sahat tasks skipped: %r", exc)

    # ── Todo lists + items ──────────────────────────────────────────────────
    try:
        from app.models.todo_item import TodoItem
        from app.models.todo_list import TodoList, todo_list_items

        lists = (
            await db.execute(
                select(TodoList).where(_scope(TodoList.user_id, uid), TodoList.is_archived.is_(False))
            )
        ).scalars().all()
        items = (
            await db.execute(
                select(TodoItem).where(_scope(TodoItem.owner_id, uid), TodoItem.deleted_at.is_(None))
            )
        ).scalars().all()
        item_by_id = {i.id: i for i in items}
        by_list: Dict[int, List] = {}
        for list_id, item_id in (
            await db.execute(select(todo_list_items.c.todo_list_id, todo_list_items.c.todo_item_id))
        ).all():
            it = item_by_id.get(item_id)
            if it is not None:
                by_list.setdefault(list_id, []).append(it)
        for lst in lists:
            sahat = effective_list_sahat(lst)
            rows = by_list.get(lst.id, [])
            done = sum(1 for i in rows if i.is_completed)
            cell = cells[sahat]
            cell["total"] += len(rows)
            cell["done"] += done
            if backbone_sahat_for_list(lst.name):
                cell["backbone"].append({
                    "label": lst.name, "done": done, "total": len(rows), "link": "/lists",
                })
            th = _thread_for_in(threads_reg, lst.name)
            if th is not None:
                thr[th["key"]]["lists"] += 1
                thr[th["key"]]["done"] += done
                thr[th["key"]]["total"] += len(rows)
                thr_sample(th["key"], lst.name)
            for i in rows:
                if not i.is_completed and i.due_date and i.due_date < today:
                    att(sahat, f"آیتمِ موعدگذشته: {(i.content or '')[:60]}", U_OVERDUE, "/lists",
                        kind="overdue")
            if detail and len(cell["detail"]["lists"]) < 60:
                cell["detail"]["lists"].append({
                    "id": lst.id, "name": lst.name, "done": done, "total": len(rows),
                })
    except Exception as exc:
        logger.debug("sahat lists skipped: %r", exc)

    # ── Writings — presence, not achievement ────────────────────────────────
    # v1 counted every writing as done/total (a fake 100%). v2 counts content
    # MASS per sahat and lets the backbone show as documents, unscored.
    try:
        from app.models.personal_writing import PersonalWriting

        writings = (
            await db.execute(
                select(PersonalWriting).where(
                    _scope(PersonalWriting.user_id, uid), PersonalWriting.deleted_at.is_(None)
                )
            )
        ).scalars().all()
        for w in writings:
            blob = f"{w.title or ''} {w.category or ''}"
            th = _thread_for_in(threads_reg, blob)
            if th is not None:
                thr[th["key"]]["writings"] += 1
                thr_sample(th["key"], w.title or "نوشته")
            sahat = _stored(getattr(w, "sahat", None)) or (
                "khoda" if _is_backbone_writing(w.title, w.category)
                else (th["sahat"] if th is not None else classify_text(blob, default="khod_aql"))
            )
            cell = cells[sahat]
            cell["writings"] += 1
            if _is_backbone_writing(w.title, w.category):
                cell["backbone"].append({
                    "label": w.title or "نوشته", "doc": True, "link": "/writings",
                })
            if detail and len(cell["detail"]["writings"]) < 60:
                cell["detail"]["writings"].append({
                    "id": w.id, "title": w.title, "category": w.category,
                })
    except Exception as exc:
        logger.debug("sahat writings skipped: %r", exc)

    # ── Directives (فرمان‌ها) ───────────────────────────────────────────────
    try:
        from app.models.directive import Directive

        dirs = (
            await db.execute(select(Directive).where(_scope(Directive.user_id, uid)))
        ).scalars().all()
        for d in dirs:
            status = str(getattr(d, "status", "")).lower()
            if status == "archived":
                continue
            th = _thread_for_in(threads_reg, d.title)
            if th is not None:
                thr[th["key"]]["directives"] += 1
                thr_sample(th["key"], d.title or "فرمان")
            sahat = effective_directive_sahat(d)
            cell = cells[sahat]
            cell["total"] += 1
            if status == "graduated":
                cell["done"] += 1
            missed = int(getattr(d, "times_missed", 0) or 0)
            done_n = int(getattr(d, "times_done", 0) or 0)
            if status == "active" and missed > max(done_n, 2):
                att(sahat, f"مسیرِ راکد: {(d.title or '')[:60]}", U_STALE, "/directives", kind="stale")
            if detail and status in ("active", "proposed") and len(cell["detail"]["directives"]) < 60:
                cell["detail"]["directives"].append({
                    "id": d.id, "title": d.title, "status": status,
                    "strength": int(getattr(d, "strength", 0) or 0),
                    "streak": int(getattr(d, "streak", 0) or 0),
                })
    except Exception as exc:
        logger.debug("sahat directives skipped: %r", exc)

    # ── Projects — presence (mass), classified + correctable ────────────────
    try:
        from app.models.project import Project

        projects = (
            await db.execute(select(Project).where(_scope(Project.user_id, uid)))
        ).scalars().all()
        for p in projects:
            sahat = effective_project_sahat(p)
            cells[sahat]["projects"] += 1
            if detail and len(cells[sahat]["detail"]["projects"]) < 30:
                cells[sahat]["detail"]["projects"].append({"id": p.id, "name": p.name})
    except Exception as exc:
        logger.debug("sahat projects skipped: %r", exc)

    # ── People (دیگران): a follow-up you meant to make — plainly, no verdict ─
    # افراد lives HERE in the city (2026-07-25): the محلهٔ «رابطه با دیگران»
    # carries the people themselves and their permanent ledger, not only the
    # follow-ups that slipped. The map reads the record back; it never judges.
    people_overdue: List[Dict[str, Any]] = []
    people_detail: List[Dict[str, Any]] = []
    people_flagged = 0
    try:
        from app.models.person import Person
        from app.models.person_profile import PersonProfile
        from app.services import person_profile_service as pps

        people = (
            await db.execute(select(Person).where(_scope(Person.user_id, uid)))
        ).scalars().all()
        profiles = {
            pr.person_id: pr
            for pr in (await db.execute(select(PersonProfile))).scalars().all()
        }
        cells["digaran"]["total"] += len(people)
        cells["digaran"]["done"] += sum(
            1 for p in people
            if not (getattr(p, "next_follow_up", None) and p.next_follow_up < today)
        )
        for p in people:
            nf = getattr(p, "next_follow_up", None)
            if nf and nf < today:
                att("digaran", f"می‌خواستی پیگیری کنی: {p.name}", U_WAITING, "/people-profiles",
                    kind="waiting")
                people_overdue.append({"id": p.id, "name": p.name, "next_follow_up": nf.isoformat()})
            prof = profiles.get(p.id)
            ledger = pps.build_ledger(prof) if prof is not None else None
            rel = pps.effective_relationship(prof) if prof is not None else None
            if ledger:
                people_flagged += len(ledger["flagged"])
            if detail and len(people_detail) < 30:
                people_detail.append({
                    "id": p.id, "name": p.name,
                    "relationship": rel,
                    "relationship_fa": pps.REL_FA.get(rel, rel) if rel else None,
                    "good": ledger["good"] if ledger else 0,
                    "bad": ledger["bad"] if ledger else 0,
                    "flagged": len(ledger["flagged"]) if ledger else 0,
                    "next_follow_up": nf.isoformat() if nf else None,
                })
        # «فراموش نکنم» — the flagged entries are a standing reminder, low and
        # calm: a count, not a nag per person.
        if people_flagged:
            att("digaran", f"{people_flagged} موردِ «یادم بماند» دربارهٔ افراد",
                U_PILE, "/people-profiles", kind="pile")
        people_detail.sort(key=lambda r: (-r["flagged"], -(r["good"] + r["bad"])))
    except Exception as exc:
        logger.debug("sahat people skipped: %r", exc)

    # ── Emails needing action — plainly routed, no moral labels ─────────────
    # Order matters (the broker-email fix): an automated financial notification
    # is checked FIRST — a margin call from a named broker address is a machine
    # alert about the owner's OWN account, not a person awaiting a reply. Then
    # a real human awaiting a reply is surfaced as «یک نفر منتظرته»; the rest is
    # a machine pile. Deduped by subject so five copies collapse to one.
    try:
        from app.models.personal_sync import PersonalEmail
        from app.services.google_sync.person_ingest import _is_human

        pend = (
            await db.execute(
                select(PersonalEmail).where(
                    PersonalEmail.needs_action.is_(True), PersonalEmail.task_id.is_(None)
                )
            )
        ).scalars().all()
        seen_subjects: set = set()
        auto_other = 0
        for e in pend:
            subj = (e.subject or "بدون موضوع")[:60]
            dup = subj in seen_subjects
            seen_subjects.add(subj)
            if _RE_FIN_ALERT.search(f"{e.subject or ''} {e.snippet or ''}"):
                cells["mohit"]["total"] += 1
                if not dup:
                    att("mohit", f"هشدارِ مالیِ حسابت: {subj}", U_OVERDUE, "/", kind="overdue")
            elif _is_human(e):
                cells["digaran"]["total"] += 1
                if not dup:
                    att("digaran", f"پاسخِ معطلِ یک نفر: {subj}", U_WAITING, "/", kind="waiting")
            else:
                auto_other += 1
        if auto_other:
            cells["mohit"]["total"] += auto_other
            att("mohit", f"{auto_other} اعلانِ ماشینیِ دیگر", U_PILE, "/", kind="pile")
    except Exception as exc:
        logger.debug("sahat emails skipped: %r", exc)

    # ── Finance (دیگران — رزقِ حلال) ────────────────────────────────────────
    finance_lines: List[str] = []
    try:
        from app.services.finance_report_service import build_report, summarize_current_month

        report = await build_report(db, user_id=uid, months=1)
        summary = summarize_current_month(report)
        if summary.get("lines"):
            finance_lines = summary["lines"][:3]
            cells["digaran"]["finance_lines"] = finance_lines
    except Exception as exc:
        logger.debug("sahat finance skipped: %r", exc)

    # ── Documents / subscriptions / RTA (محیط و اموال) ──────────────────────
    docs_detail: List[Dict[str, Any]] = []
    try:
        from app.models.identity_document import IdentityDocument

        docs = (
            await db.execute(select(IdentityDocument).where(_scope(IdentityDocument.user_id, uid)))
        ).scalars().all()
        cells["mohit"]["total"] += len(docs)
        for doc in docs:
            exp = (doc.expiry_date or "")[:10]
            expired = False
            try:
                expired = bool(exp) and date.fromisoformat(exp) < today
            except ValueError:
                pass
            if expired:
                att("mohit", f"سندِ منقضی: {doc.full_name or 'سند'}", U_OVERDUE, "/life-file",
                    kind="overdue")
            else:
                cells["mohit"]["done"] += 1
            if detail and len(docs_detail) < 10:
                docs_detail.append({
                    "name": doc.full_name or "سند", "expiry": doc.expiry_date, "expired": expired,
                })
    except Exception as exc:
        logger.debug("sahat documents skipped: %r", exc)

    subs_count = 0
    try:
        from app.models.subscription_account import SubscriptionAccount

        subs = (
            await db.execute(select(SubscriptionAccount).where(_scope(SubscriptionAccount.user_id, uid)))
        ).scalars().all()
        subs_count = len(subs)
        cells["mohit"]["total"] += subs_count
        cells["mohit"]["done"] += subs_count
    except Exception as exc:
        logger.debug("sahat subscriptions skipped: %r", exc)

    try:
        from app.models.rta_account import RTAAccount

        rta = (
            await db.execute(
                select(RTAAccount).where(_scope(RTAAccount.user_id, uid))
                .order_by(RTAAccount.id.desc()).limit(1)
            )
        ).scalars().first()
        payable = float(getattr(rta, "fines_payable", 0) or 0) if rta is not None else 0
        if payable > 0:
            att("mohit", f"جریمهٔ پرداختنیِ RTA ({payable:g})", U_OVERDUE, "/life-file",
                kind="overdue")
    except Exception as exc:
        logger.debug("sahat rta skipped: %r", exc)

    # ── Digital assets (فیلم/کتاب/فایل) — the انباشتگی the owner named ──────
    try:
        from sqlalchemy import func as _f

        from app.models.user_asset import UserAsset

        n_assets = (
            await db.execute(
                select(_f.count()).select_from(UserAsset).where(_scope(UserAsset.user_id, uid))
            )
        ).scalar() or 0
        cells["mohit"]["assets"] += int(n_assets)
    except Exception as exc:
        logger.debug("sahat assets skipped: %r", exc)

    # ── Digital clutter (لغو/اتلاف — انباشتگیِ صندوق) ───────────────────────
    inbox_pending = 0
    try:
        from sqlalchemy import func as _f

        from app.models.inbox_item import InboxItem

        inbox_pending = (
            await db.execute(
                select(_f.count()).select_from(InboxItem).where(
                    _scope(InboxItem.user_id, uid), InboxItem.status == "pending"
                )
            )
        ).scalar() or 0
        if inbox_pending:
            cells["mohit"]["total"] += int(inbox_pending)
            if inbox_pending > 10:
                att("mohit", f"{inbox_pending} موردِ تلنبارشده در صندوقِ ورودی", U_PILE, "/",
                    kind="pile")
    except Exception as exc:
        logger.debug("sahat inbox skipped: %r", exc)

    # ── رشدِ ذهن: recency of the brain practice (عقل) ───────────────────────
    try:
        from app.models.brain import BrainUpload

        last_up = (
            await db.execute(
                select(BrainUpload).order_by(BrainUpload.id.desc()).limit(1)
            )
        ).scalars().first()
        if last_up is not None and last_up.created_at is not None:
            created = last_up.created_at
            if created.tzinfo is None:  # SQLite returns naive datetimes
                created = created.replace(tzinfo=timezone.utc)
            age_days = (datetime.now(timezone.utc) - created).days
            if age_days > 14:
                att("khod_aql", f"تمرینِ هوش {age_days} روز است به‌روز نشده", U_STALE, "/brain",
                    kind="stale")
    except Exception as exc:
        logger.debug("sahat brain skipped: %r", exc)

    # ── روان: fold in the willpower index (خودنگاره) ─────────────────────────
    diligence_score = None
    try:
        from app.services.self_model_service import compute_diligence

        d = await compute_diligence(db, uid)
        if d.get("has_signal"):
            diligence_score = d["score"]
    except Exception as exc:
        logger.debug("sahat diligence skipped: %r", exc)

    # ── score each sahat — follow-through only; mass is displayed, not scored ─
    out: List[Dict[str, Any]] = []
    for key, meta in SAHATS.items():
        cell = cells[key]
        total, done = cell["total"], cell["done"]
        completion = (done / total) if total else None
        penalty = min(sum(a["weight"] for a in cell["attention"]), 40)
        if completion is None:
            score = None if key != "khod_ravan" or diligence_score is None else diligence_score
        else:
            base = completion * 100
            if key == "khod_ravan" and diligence_score is not None:
                base = (base + diligence_score) / 2
            score = int(max(0, min(100, round(base - penalty))))
        cell["attention"].sort(key=lambda a: -a["weight"])
        threads = [
            {
                "key": th["key"], "title": th["title"], "link": th["link"],
                "id": th.get("id"),
                "done": thr[th["key"]]["done"], "total": thr[th["key"]]["total"],
                "writings": thr[th["key"]]["writings"],
                "directives": thr[th["key"]]["directives"],
                "lists": thr[th["key"]]["lists"],
                "samples": thr[th["key"]]["samples"],
            }
            for th in threads_reg if th["sahat"] == key
        ]
        entry = {
            "key": key,
            "title": meta["title"],
            "fa_short": meta["fa_short"],
            "icon": meta["icon"],
            "group": meta["group"],
            "desc": meta["desc"],
            "links": meta["links"],
            "score": score,
            "total": total,
            "done": done,
            "writings": cell["writings"],
            "projects": cell["projects"],
            "assets": cell["assets"],
            "backbone": cell["backbone"][:6],
            "threads": threads,
            "attention": cell["attention"][:5],
            "finance_lines": cell.get("finance_lines"),
        }
        if detail:
            entry["detail"] = cell["detail"]
            if key == "digaran":
                entry["detail"]["people_overdue"] = people_overdue[:20]
                entry["detail"]["people"] = people_detail
                entry["detail"]["people_flagged"] = people_flagged
                entry["detail"]["finance_lines"] = finance_lines
            if key == "mohit":
                entry["detail"]["documents"] = docs_detail
                entry["detail"]["subscriptions_count"] = subs_count
                entry["detail"]["inbox_pending"] = int(inbox_pending)
        out.append(entry)

    scored = [s for s in out if s["score"] is not None]
    weakest = min(scored, key=lambda s: s["score"])["key"] if scored else None
    strongest = max(scored, key=lambda s: s["score"])["key"] if scored else None
    return {
        "sahats": out,
        "weakest": weakest,
        "strongest": strongest,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


async def build_sahat_district(db: AsyncSession, uid: int, district: str) -> Optional[Dict[str, Any]]:
    """One district («محله»), item-level: a SAHATS key or a DISTRICTS key
    ('khod' aggregates the three facets of self). Returns None for unknown
    keys (route answers 404)."""
    if district in DISTRICTS:
        keys = DISTRICTS[district]["keys"]
        title = DISTRICTS[district]["title"]
    elif district in SAHATS:
        keys = [district]
        title = SAHATS[district]["title"]
    else:
        return None
    data = await build_sahat_map(db, uid, detail=True)
    cells = [s for s in data["sahats"] if s["key"] in keys]
    return {
        "district": district,
        "title": title,
        "keys": keys,
        "sahats": cells,
        "generated_at": data["generated_at"],
    }


async def snapshot_sahat_map(db: AsyncSession, uid: int = 0) -> Dict[str, Any]:
    """Build + persist one snapshot (per-sahat scores) for the over-time trend."""
    data = await build_sahat_map(db, uid)
    try:
        from app.models.ai_assessment import AIAssessment

        scores = {s["key"]: s["score"] for s in data["sahats"]}
        valid = [v for v in scores.values() if v is not None]
        db.add(
            AIAssessment(
                user_id=uid,
                assessment_type=SAHAT_MAP_TYPE,
                score=float(sum(valid) / len(valid)) if valid else None,
                analysis_text=json.dumps(
                    {"scores": scores, "generated_at": data["generated_at"]}, ensure_ascii=False
                ),
            )
        )
        await db.commit()
    except Exception as exc:
        logger.debug("sahat snapshot persist skipped: %r", exc)
        await db.rollback()
    return data


async def get_sahat_history(db: AsyncSession, uid: int = 0, limit: int = 30) -> List[Dict[str, Any]]:
    """Last N snapshots' per-sahat scores, oldest-first (for the trend strip)."""
    from app.models.ai_assessment import AIAssessment

    rows = (
        await db.execute(
            select(AIAssessment)
            .where(_scope(AIAssessment.user_id, uid), AIAssessment.assessment_type == SAHAT_MAP_TYPE)
            .order_by(AIAssessment.id.desc())
            .limit(limit)
        )
    ).scalars().all()
    hist: List[Dict[str, Any]] = []
    for r in reversed(rows):
        try:
            payload = json.loads(r.analysis_text or "{}")
            hist.append({
                "scores": payload.get("scores") or {},
                "at": r.created_at.isoformat() if r.created_at else None,
            })
        except Exception:
            continue
    return hist
