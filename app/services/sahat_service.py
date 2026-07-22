"""نقشهٔ ساحت‌ها — the human-dimensions layer over the WHOLE system.

Owner's foundational reframing (2026-07-22): the app manages the life of a
HUMAN whose worldview is Shia fiqh, so everything — tasks, writings, emails,
finance, people, files, wishes, even idle downloads — must find its place under
the human ساحت‌ها. The primary axis is the fiqhi four-relations (the axis of
تکلیف and severity): رابطه با خدا / با خود / با دیگران / با محیط — with the
modern five-sahat model slotted in as facets of «خود» (جسم/عقل/روان), exactly
the synthesis the owner's consultation reached.

Design commitments:
  * **A LENS, not a rebuild.** Nothing already built is discarded; this module
    only READS the existing tables and buckets every row under a sahat via
    deterministic rules (keyword/domain/relation), so anything new added
    anywhere classifies itself automatically. No source table is mutated.
  * **Principled weights (اصالت), from فقه:** severity is anchored in the
    مفسده/مصلحت ladder the owner specified — حق‌الناس/عهد (5) > اضرار به نفس
    (4) > رشد/تهذیب (3) > لغو و اتلاف (1-2) — never arbitrary points.
  * **Deeds only, never intentions.** نیت is between the owner and God; the
    machine scores observable follow-through (عمل و پیگیری), nothing more.
  * **The map serves محاسبه.** The owner's own «خودسازی - محاسبه میان و پایان
    هفته» practice is the consumption point: the map pre-computes the weekly
    self-accounting sheet instead of replacing it.

Deterministic + SQL-only (works on a keyless deploy); snapshots persist to
``AIAssessment(assessment_type='sahat_map')`` for the over-time trend (same
pattern as self_model_service).
"""
from __future__ import annotations

import json
import logging
from datetime import date, datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

SAHAT_MAP_TYPE = "sahat_map"

# ── the taxonomy ────────────────────────────────────────────────────────────
# Four fiqhi relations; «خود» carries the three modern facets (جسم/عقل/روان).
SAHATS: Dict[str, Dict[str, Any]] = {
    "khoda": {
        "title": "رابطه با خدا",
        "icon": "🕌",
        "desc": "عبادت، نیت، خداشناسی، برنامه‌ریزیِ الهی",
        "links": ["/writings", "/directives", "/lists"],
    },
    "khod_ravan": {
        "title": "خود — روان و اراده",
        "icon": "💠",
        "desc": "خودسازی، اخلاق، اراده و اهتمام، ترس و شجاعت",
        "links": ["/self-portrait", "/directives", "/lists"],
    },
    "khod_aql": {
        "title": "خود — عقل و ذهن",
        "icon": "📚",
        "desc": "یادگیری، مطالعه، نوشته‌ها، رشدِ ذهن",
        "links": ["/writings", "/brain", "/lists"],
    },
    "khod_jesm": {
        "title": "خود — جسم و سلامت",
        "icon": "💪",
        "desc": "ورزش، تغذیه، خواب، سلامت",
        "links": ["/lists", "/tasks"],
    },
    "digaran": {
        "title": "رابطه با دیگران",
        "icon": "🤝",
        "desc": "خانواده و افراد، کار و پروژه، مالی و حق‌الناس، ایمیل‌ها",
        "links": ["/people-profiles", "/budget", "/projects", "/tasks"],
    },
    "mohit": {
        "title": "رابطه با محیط و ابزار",
        "icon": "🌍",
        "desc": "اسناد و دارایی‌ها، اشتراک‌ها، نظمِ دیجیتال، انباشتگی",
        "links": ["/life-file", "/assets", "/merge"],
    },
}

# Severity ladder (اصالتِ امتیاز — از فقه، نه قراردادی):
W_HAQ_NAS = 5      # حق‌الناس / عهد — تعهد به دیگران، ددلاین، بدهی، ایمیلِ بی‌پاسخ
W_SELF_HARM = 4    # اضرار به نفس — سلامتِ رهاشده، سندِ منقضی
W_GROWTH = 3       # رشد و تهذیب — ستون‌فقرات‌های خودسازی/علم که راکد مانده
W_CLUTTER = 1      # لغو و اتلاف — انباشتگیِ دیجیتال، صندوقِ تلنبارشده

# ── backbone (نخِ تسبیح) — the owner's named lists/writings pinned to sahats ─
# Matched by substring on the list/writing name (case/spacing tolerant).
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
_KEYWORDS = [
    ("khoda", ("نماز", "قرآن", "دعا", "روزه", "خدا", "الهی", "زیارت", "مسجد", "معنو")),
    ("khod_jesm", ("ورزش", "دویدن", "باشگاه", "تمرین", "رژیم", "خواب", "سلامت", "پزشک", "دندان", "چکاپ")),
    ("khod_aql", ("کتاب", "مطالعه", "خواندن", "یادگیری", "درس", "زبان", "دوره", "study", "read", "learn")),
    ("digaran", ("تماس", "جلسه", "خانواده", "مادر", "پدر", "همسر", "دوست", "مهمان", "هدیه", "صله")),
    ("mohit", ("نظافت", "تعمیر", "ماشین", "خانه", "اتاق", "مرتب", "بایگانی")),
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


def backbone_sahat_for_list(name: Optional[str]) -> Optional[str]:
    n = (name or "")
    for token, sahat in _BACKBONE_LISTS:
        if token in n:
            return sahat
    return None


def _is_backbone_writing(title: Optional[str], category: Optional[str]) -> bool:
    blob = f"{title or ''} {category or ''}"
    return any(tok in blob for tok in _BACKBONE_WRITING_TOKENS)


def _empty_cell() -> Dict[str, Any]:
    return {"total": 0, "done": 0, "attention": [], "backbone": []}


async def build_sahat_map(db: AsyncSession, uid: int = 0) -> Dict[str, Any]:
    """Aggregate EVERYTHING into the six sahat buckets, live. Read-only."""
    cells: Dict[str, Dict[str, Any]] = {k: _empty_cell() for k in SAHATS}
    today = date.today()

    def att(sahat: str, label: str, weight: int, link: str) -> None:
        cells[sahat]["attention"].append({"label": label[:120], "weight": weight, "link": link})

    # ── Tasks (with people/project ⇒ دیگران/حق‌الناس) ────────────────────────
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
            sahat = "digaran" if (t.id in linked_ids or t.project_id) else classify_text(t.title)
            cell = cells[sahat]
            cell["total"] += 1
            if t.status == TaskStatus.DONE:
                cell["done"] += 1
            elif t.due_date and t.due_date < today:
                w = W_HAQ_NAS if sahat == "digaran" else (
                    W_SELF_HARM if sahat == "khod_jesm" else W_GROWTH
                )
                att(sahat, f"کارِ عقب‌افتاده: {t.title}", w, "/tasks")
    except Exception as exc:
        logger.debug("sahat tasks skipped: %r", exc)

    # ── Todo lists + items (the نخِ تسبیح lives here) ────────────────────────
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
        # items ↔ lists is M2M through todo_list_items
        by_list: Dict[int, List] = {}
        for list_id, item_id in (
            await db.execute(select(todo_list_items.c.todo_list_id, todo_list_items.c.todo_item_id))
        ).all():
            it = item_by_id.get(item_id)
            if it is not None:
                by_list.setdefault(list_id, []).append(it)
        for lst in lists:
            sahat = backbone_sahat_for_list(lst.name) or classify_text(lst.name, default="khod_ravan")
            rows = by_list.get(lst.id, [])
            done = sum(1 for i in rows if i.is_completed)
            cell = cells[sahat]
            cell["total"] += len(rows)
            cell["done"] += done
            if backbone_sahat_for_list(lst.name):
                cell["backbone"].append({
                    "label": lst.name, "done": done, "total": len(rows), "link": "/lists",
                })
            for i in rows:
                if not i.is_completed and i.due_date and i.due_date < today:
                    att(sahat, f"آیتمِ موعدگذشته: {(i.content or '')[:60]}", W_GROWTH, "/lists")
    except Exception as exc:
        logger.debug("sahat lists skipped: %r", exc)

    # ── Writings (backbone: خداشناسی / برنامه‌ریزی الهی) ─────────────────────
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
            if _is_backbone_writing(w.title, w.category):
                cells["khoda"]["total"] += 1
                cells["khoda"]["done"] += 1  # a written piece IS the artifact
                cells["khoda"]["backbone"].append({
                    "label": w.title or "نوشته", "done": 1, "total": 1, "link": "/writings",
                })
            else:
                sahat = classify_text(f"{w.title or ''} {w.category or ''}", default="khod_aql")
                cells[sahat]["total"] += 1
                cells[sahat]["done"] += 1
    except Exception as exc:
        logger.debug("sahat writings skipped: %r", exc)

    # ── Directives (فرمان‌ها) by domain ──────────────────────────────────────
    try:
        from app.models.directive import Directive

        dirs = (
            await db.execute(select(Directive).where(_scope(Directive.user_id, uid)))
        ).scalars().all()
        for d in dirs:
            status = str(getattr(d, "status", "")).lower()
            if status == "archived":
                continue
            sahat = _DOMAIN_TO_SAHAT.get(getattr(d, "domain", "") or "", None) or classify_text(d.title)
            cell = cells[sahat]
            cell["total"] += 1
            if status == "graduated":
                cell["done"] += 1
            missed = int(getattr(d, "times_missed", 0) or 0)
            done_n = int(getattr(d, "times_done", 0) or 0)
            if status == "active" and missed > max(done_n, 2):
                att(sahat, f"فرمانِ رهاشده: {(d.title or '')[:60]}", W_GROWTH, "/directives")
    except Exception as exc:
        logger.debug("sahat directives skipped: %r", exc)

    # ── People (دیگران): overdue follow-ups / birthdays ─────────────────────
    try:
        from app.models.person import Person

        people = (
            await db.execute(select(Person).where(_scope(Person.user_id, uid)))
        ).scalars().all()
        cells["digaran"]["total"] += len(people)
        cells["digaran"]["done"] += sum(
            1 for p in people
            if not (getattr(p, "next_follow_up", None) and p.next_follow_up < today)
        )
        for p in people:
            nf = getattr(p, "next_follow_up", None)
            if nf and nf < today:
                att("digaran", f"پیگیریِ عقب‌افتاده: {p.name}", W_HAQ_NAS, "/people-profiles")
    except Exception as exc:
        logger.debug("sahat people skipped: %r", exc)

    # ── Emails needing action (حق‌الناس — پاسخِ معطل) ────────────────────────
    try:
        from app.models.personal_sync import PersonalEmail

        pend = (
            await db.execute(
                select(PersonalEmail).where(
                    PersonalEmail.needs_action.is_(True), PersonalEmail.task_id.is_(None)
                )
            )
        ).scalars().all()
        cells["digaran"]["total"] += len(pend)
        for e in pend[:5]:
            att("digaran", f"ایمیلِ منتظرِ اقدام: {(e.subject or '')[:60]}", W_HAQ_NAS, "/")
    except Exception as exc:
        logger.debug("sahat emails skipped: %r", exc)

    # ── Finance (دیگران — رزقِ حلال و حق‌الناسِ مالی) ────────────────────────
    try:
        from app.services.finance_report_service import build_report, summarize_current_month

        report = await build_report(db, user_id=uid, months=1)
        summary = summarize_current_month(report)
        if summary.get("lines"):
            cells["digaran"]["total"] += 1
            cells["digaran"]["done"] += 1
            cells["digaran"]["finance_lines"] = summary["lines"][:3]
    except Exception as exc:
        logger.debug("sahat finance skipped: %r", exc)

    # ── Documents / subscriptions (محیط و ابزار) ─────────────────────────────
    try:
        from app.models.identity_document import IdentityDocument

        docs = (
            await db.execute(select(IdentityDocument).where(_scope(IdentityDocument.user_id, uid)))
        ).scalars().all()
        cells["mohit"]["total"] += len(docs)
        for doc in docs:
            exp = (doc.expiry_date or "")[:10]
            try:
                if exp and date.fromisoformat(exp) < today:
                    att("mohit", f"سندِ منقضی: {doc.full_name or 'سند'}", W_SELF_HARM, "/life-file")
                    continue
            except ValueError:
                pass
            cells["mohit"]["done"] += 1
    except Exception as exc:
        logger.debug("sahat documents skipped: %r", exc)

    try:
        from app.models.subscription_account import SubscriptionAccount

        subs = (
            await db.execute(select(SubscriptionAccount).where(_scope(SubscriptionAccount.user_id, uid)))
        ).scalars().all()
        cells["mohit"]["total"] += len(subs)
        cells["mohit"]["done"] += len(subs)
    except Exception as exc:
        logger.debug("sahat subscriptions skipped: %r", exc)

    # ── Digital clutter (لغو/اتلاف — انباشتگیِ صندوق) ───────────────────────
    try:
        from app.models.inbox_item import InboxItem
        from sqlalchemy import func as _f

        n_pending = (
            await db.execute(
                select(_f.count()).select_from(InboxItem).where(
                    _scope(InboxItem.user_id, uid), InboxItem.status == "pending"
                )
            )
        ).scalar() or 0
        if n_pending:
            cells["mohit"]["total"] += int(n_pending)
            if n_pending > 10:
                att("mohit", f"{n_pending} موردِ تلنبارشده در صندوقِ ورودی", W_CLUTTER, "/")
    except Exception as exc:
        logger.debug("sahat inbox skipped: %r", exc)

    # ── روان: fold in the willpower index (خودنگاره) ─────────────────────────
    diligence_score = None
    try:
        from app.services.self_model_service import compute_diligence

        d = await compute_diligence(db, uid)
        if d.get("has_signal"):
            diligence_score = d["score"]
    except Exception as exc:
        logger.debug("sahat diligence skipped: %r", exc)

    # ── score each sahat ─────────────────────────────────────────────────────
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
        out.append({
            "key": key,
            "title": meta["title"],
            "icon": meta["icon"],
            "desc": meta["desc"],
            "links": meta["links"],
            "score": score,
            "total": total,
            "done": done,
            "backbone": cell["backbone"][:6],
            "attention": cell["attention"][:5],
            "finance_lines": cell.get("finance_lines"),
        })

    scored = [s for s in out if s["score"] is not None]
    weakest = min(scored, key=lambda s: s["score"])["key"] if scored else None
    strongest = max(scored, key=lambda s: s["score"])["key"] if scored else None
    return {
        "sahats": out,
        "weakest": weakest,
        "strongest": strongest,
        "generated_at": datetime.now(timezone.utc).isoformat(),
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
