"""Owner self-model — INTERESTS + WILLPOWER/diligence (اراده و اهتمام) inferred
from the owner's OWN data over time: writings, wishes/directives, tasks and
their follow-through (done vs not-done, abandonment).

Composes existing deterministic heuristics (profile_analysis keyword/category
extraction; directive + task + todo counts) — SQL-only so it runs on a keyless
deploy — and persists ONE snapshot per refresh to
``AIAssessment(assessment_type='self_model')`` so the over-time series
accumulates for free. Behaviour-preserving: it reads, never mutates the source
tables, and adds a new assessment_type without touching the existing ones.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

SELF_MODEL_TYPE = "self_model"


def _scope(col, uid: int):
    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


async def _gather_texts(db: AsyncSession, uid: int) -> List[str]:
    """The owner's own corpus for interest inference — writings (the richest),
    tasks, list items, and directive titles/domains."""
    from app.models.directive import Directive
    from app.models.personal_writing import PersonalWriting
    from app.models.task import Task
    from app.models.todo_item import TodoItem

    out: List[str] = []
    try:
        writings = (
            await db.execute(
                select(PersonalWriting).where(
                    _scope(PersonalWriting.user_id, uid), PersonalWriting.deleted_at.is_(None)
                )
            )
        ).scalars().all()
        for w in writings:
            out += [w.title or "", w.category or "", (w.body or "")[:2000]]
    except Exception as exc:
        logger.debug("self-model writings gather skipped: %r", exc)
    try:
        tasks = (await db.execute(select(Task).where(_scope(Task.user_id, uid)))).scalars().all()
        out += [t.title or "" for t in tasks]
    except Exception:
        pass
    try:
        items = (
            await db.execute(
                select(TodoItem).where(_scope(TodoItem.owner_id, uid), TodoItem.deleted_at.is_(None))
            )
        ).scalars().all()
        out += [i.content or "" for i in items]
    except Exception:
        pass
    try:
        dirs = (await db.execute(select(Directive).where(_scope(Directive.user_id, uid)))).scalars().all()
        for d in dirs:
            out += [d.title or "", getattr(d, "domain", "") or ""]
    except Exception:
        pass
    return [x for x in out if x and x.strip()]


async def compute_interests(db: AsyncSession, uid: int = 0, *, top: int = 8) -> Dict[str, Any]:
    """Ranked interest CATEGORIES (excluding the catch-all 'general') + the most
    frequent meaningful terms, from the owner's whole corpus."""
    from app.services.ai import profile_analysis as pa

    texts = await _gather_texts(db, uid)
    freq = pa.keyword_frequencies(texts)
    cat_scores: Dict[str, int] = {}
    cat_terms: Dict[str, List] = {}
    for term, c in freq.items():
        if c < 2:
            continue
        cat = pa.categorize(term)
        if cat != "general":
            cat_scores[cat] = cat_scores.get(cat, 0) + c
            cat_terms.setdefault(cat, []).append((term, c))
    categories = []
    for cat, score in sorted(cat_scores.items(), key=lambda kv: -kv[1])[:top]:
        terms = [t for t, _ in sorted(cat_terms[cat], key=lambda kv: -kv[1])[:4]]
        categories.append({"category": cat, "score": score, "terms": terms})
    top_terms = [
        {"term": t, "count": c}
        for t, c in sorted(freq.items(), key=lambda kv: -kv[1])[:12]
        if c >= 2
    ]
    return {"categories": categories, "top_terms": top_terms}


async def compute_diligence(db: AsyncSession, uid: int = 0) -> Dict[str, Any]:
    """A 0-100 WILLPOWER/diligence index + trend, from follow-through evidence:
    directive done-vs-missed + streaks + graduation, task & list completion, and
    an abandonment (overdue) penalty. Fully deterministic."""
    from app.models.directive import Directive
    from app.models.task import Task, TaskStatus
    from app.models.todo_item import TodoItem

    now = datetime.now(timezone.utc)
    today = now.date()

    dirs = (await db.execute(select(Directive).where(_scope(Directive.user_id, uid)))).scalars().all()
    d_done = sum(int(getattr(d, "times_done", 0) or 0) for d in dirs)
    d_missed = sum(int(getattr(d, "times_missed", 0) or 0) for d in dirs)
    dir_rate = (d_done / (d_done + d_missed)) if (d_done + d_missed) else None
    graduated = sum(1 for d in dirs if str(getattr(d, "status", "")).lower() == "graduated")
    best_streak = max([int(getattr(d, "best_streak", 0) or 0) for d in dirs], default=0)

    tasks = (await db.execute(select(Task).where(_scope(Task.user_id, uid)))).scalars().all()
    t_done = sum(1 for t in tasks if t.status == TaskStatus.DONE)
    t_open = sum(1 for t in tasks if t.status in (TaskStatus.TODO, TaskStatus.IN_PROGRESS))
    task_rate = (t_done / (t_done + t_open)) if (t_done + t_open) else None
    overdue = sum(
        1 for t in tasks
        if t.status in (TaskStatus.TODO, TaskStatus.IN_PROGRESS) and t.due_date and t.due_date < today
    )

    items = (
        await db.execute(
            select(TodoItem).where(_scope(TodoItem.owner_id, uid), TodoItem.deleted_at.is_(None))
        )
    ).scalars().all()
    i_done = sum(1 for i in items if getattr(i, "is_completed", False))
    todo_rate = (i_done / len(items)) if items else None

    def _days_ago(dt_) -> int:
        try:
            return (today - dt_.date()).days
        except Exception:
            return 10**6

    recent = sum(1 for i in items if getattr(i, "completed_at", None) and _days_ago(i.completed_at) <= 30)
    prior = sum(1 for i in items if getattr(i, "completed_at", None) and 30 < _days_ago(i.completed_at) <= 60)
    if recent > prior * 1.2 + 0.5:
        trend = "صعودی"
    elif recent < prior * 0.8:
        trend = "نزولی"
    else:
        trend = "پایدار"

    rates = [r for r in (dir_rate, task_rate, todo_rate) if r is not None]
    base = (sum(rates) / len(rates)) if rates else 0.0
    streak_bonus = min(best_streak, 20) / 20 * 0.10          # up to +10
    overdue_penalty = min(overdue, 20) / 20 * 0.15           # up to -15
    score = int(max(0, min(100, round((base + streak_bonus - overdue_penalty) * 100))))

    return {
        "score": score,
        "trend": trend,
        "directive_rate": round(dir_rate, 3) if dir_rate is not None else None,
        "task_rate": round(task_rate, 3) if task_rate is not None else None,
        "todo_rate": round(todo_rate, 3) if todo_rate is not None else None,
        "graduated": graduated,
        "best_streak": best_streak,
        "overdue": overdue,
        "recent_completions": recent,
        "prior_completions": prior,
        "has_signal": bool(rates or best_streak or items or tasks or dirs),
    }


async def build_self_model(db: AsyncSession, uid: int = 0) -> Dict[str, Any]:
    """Compute interests + diligence, persist a snapshot, return the composite."""
    interests = await compute_interests(db, uid)
    diligence = await compute_diligence(db, uid)
    payload = {
        "interests": interests,
        "diligence": diligence,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        from app.models.ai_assessment import AIAssessment

        db.add(
            AIAssessment(
                user_id=uid,
                assessment_type=SELF_MODEL_TYPE,
                score=float(diligence["score"]),
                analysis_text=json.dumps(payload, ensure_ascii=False),
            )
        )
        await db.commit()
    except Exception as exc:
        logger.debug("self-model persist skipped: %r", exc)
        await db.rollback()
    return payload


async def get_latest_self_model(db: AsyncSession, uid: int = 0) -> Dict[str, Any]:
    """Return the latest persisted snapshot (parsed), or a freshly computed one
    if none exists yet. Also returns a short history of diligence scores."""
    from app.models.ai_assessment import AIAssessment

    rows = (
        await db.execute(
            select(AIAssessment)
            .where(_scope(AIAssessment.user_id, uid), AIAssessment.assessment_type == SELF_MODEL_TYPE)
            .order_by(AIAssessment.id.desc())
            .limit(30)
        )
    ).scalars().all()
    if not rows:
        payload = await build_self_model(db, uid)
        payload["history"] = [{"score": payload["diligence"]["score"]}]
        return payload
    try:
        payload = json.loads(rows[0].analysis_text or "{}")
    except Exception:
        payload = {}
    payload["history"] = [
        {"score": int(r.score or 0), "at": r.created_at.isoformat() if r.created_at else None}
        for r in reversed(rows)
    ]
    return payload
