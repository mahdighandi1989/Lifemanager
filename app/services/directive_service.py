"""موتور نهادینه‌سازی — the internalization engine (owner vision 2026-07-21).

Turns the owner's static lists / writings / aspirations into *living
directives* and runs the daily loop that internalizes them:

  extract → (approve) → daily command → follow-up → strength/streak →
  graduate ("در من حل شد") → make room for the next.

Design (mirrors the sibling engines — no FastAPI imports, own idempotent
helpers, fail-open, config in a single GlobalSetting blob):

  * ``extract_directives``     — propose directives from the owner's content.
    AI (the routed model) rewrites each candidate into an imperative command
    and tags domain/cadence/kind; with no model configured a keyword
    HEURISTIC does the same deterministically, so the engine works with or
    without AI (and the tests exercise the heuristic path).
  * ``select_today_commands``  — pick today's few commands (weak-first +
    due + neglected + weight; strict mode surfaces more and pushes harder).
    Persisted once/day as ``DirectiveCheckin`` rows so the web brief, the
    page and the Telegram loop all agree on "today's commands".
  * ``mark``                   — the follow-up: done raises strength/streak,
    a miss resets the streak and drops strength (strict = bigger swings).
  * ``run_evening_followup``   — end-of-day: anything commanded but
    unanswered is counted a miss (strict «جاماندن‌ها واضح»).
  * ``graduation``             — strength≥grad_strength AND streak≥grad_streak
    ⇒ status=graduated (no longer nagged) → «بخشی از تو شد».
  * ``auto_intake_from_text``  — anything added later (a new writing, a typed
    aspiration, an inbox item) proposes its own directive automatically.
  * ``growth_report``          — نهادینه‌شده / در حال شکل‌گیری / شروع‌نشده.
"""
from __future__ import annotations

import logging
import re
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.directive import (
    CADENCE_DAILY,
    CADENCE_FEW_PER_WEEK,
    CADENCE_ONCE,
    CADENCE_WEEKLY,
    DIRECTIVE_ACTIVE,
    DIRECTIVE_ARCHIVED,
    DIRECTIVE_GRADUATED,
    DIRECTIVE_PROPOSED,
    KIND_GOAL,
    KIND_PRACTICE,
    Directive,
    DirectiveCheckin,
)

logger = logging.getLogger(__name__)

CONFIG_KEY = "directive_engine"

# Engine presets by "coach tone". The owner chose strict + both channels
# (2026-07-21). Everything is stored in the config blob so it stays tunable
# from the UI without a code change.
_MODE_PRESETS: Dict[str, Dict[str, Any]] = {
    "strict": {
        "daily_count": 5, "gain": 7, "penalty": 12,
        "grad_strength": 90, "grad_streak": 21,
    },
    "balanced": {
        "daily_count": 4, "gain": 6, "penalty": 8,
        "grad_strength": 85, "grad_streak": 18,
    },
    "gentle": {
        "daily_count": 3, "gain": 5, "penalty": 3,
        "grad_strength": 80, "grad_streak": 14,
    },
}

_CONFIG_DEFAULTS: Dict[str, Any] = {
    "mode": "strict",           # owner's choice
    "channel": "both",          # web + telegram
    "tz_offset_minutes": 240,   # UAE (+4), same default as the attention engine
    "brief_hour": 7,            # local hour the morning commands go out
    "followup_hour": 21,        # local hour the evening follow-up goes out
    "enabled": True,
    "extraction_scope": "all",  # "all" = every list item + writing bodies; "starred" = only ⭐
    "extraction_limit": 80,     # max candidates considered per extraction pass
}

# ── domain keyword heuristic (used to tag a candidate when AI is off) ─────────
_DOMAIN_KEYWORDS = [
    ("معنوی", ("قرآن", "نماز", "دعا", "خدا", "ذکر", "عبادت", "معنوی", "ایمان", "توکل", "زیارت", "مسجد", "روزه")),
    ("سلامت", ("ورزش", "تردمیل", "شنا", "بوکس", "پیاده", "دویدن", "بدنسازی", "سلامت", "خواب", "تغذیه", "رژیم", "آب خوردن")),
    ("دانش", ("کتاب", "یادگیری", "مطالعه", "زبان", "انگلیسی", "عربی", "برنامه‌نویسی", "درس", "آموزش", "دوره", "یاد بگیر", "خواندن")),
    ("مالی", ("پول", "مالی", "درآمد", "خرید", "پس‌انداز", "بودجه", "سرمایه", "فارکس", "بورس", "تجارت", "کسب")),
    ("روابط", ("خانواده", "همسر", "دوست", "پدر", "مادر", "فرزند", "رابطه", "ارتباط", "صله", "دیدار")),
    ("آرزو", ("آرزو", "هدف", "رویا", "می‌خواهم", "میخوام", "دوست دارم بشم", "روزی")),
    ("خودسازی", ("محاسبه", "اراده", "تمرکز", "عادت", "خودسازی", "مراقبه", "تذکر", "اخلاق", "صبر", "نظم", "تفکر")),
]


# ── scope helpers (same anon/legacy convention as the rest of the app) ────────
def _scope(col, uid: int):
    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


def _uid_for_write(uid: int) -> Optional[int]:
    """Anon scope (uid==0) writes NULL so it matches legacy rows and needs no
    users row (FK SET NULL). A real owner writes their id."""
    return None if not uid else uid


def _norm(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip()).lower()[:200]


def _guess_domain(text: str) -> str:
    low = (text or "").lower()
    for domain, words in _DOMAIN_KEYWORDS:
        if any(w in low for w in words):
            return domain
    return "خودسازی"


# ── config blob ──────────────────────────────────────────────────────────────
async def _load_blob(db: AsyncSession, key: str) -> Dict[str, Any]:
    from app.models.global_setting import GlobalSetting
    import json

    try:
        row = (
            await db.execute(select(GlobalSetting).where(GlobalSetting.key == key))
        ).scalar_one_or_none()
        if row and row.value:
            data = json.loads(row.value)
            if isinstance(data, dict):
                return data
    except Exception as exc:
        logger.debug("directive config load failed: %r", exc)
    return {}


async def _save_blob(db: AsyncSession, key: str, blob: Dict[str, Any]) -> None:
    from app.models.global_setting import GlobalSetting
    import json

    row = (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == key))
    ).scalar_one_or_none()
    payload = json.dumps(blob, ensure_ascii=False)
    if row is None:
        db.add(GlobalSetting(key=key, value=payload))
    else:
        row.value = payload
    await db.commit()


async def get_config(db: AsyncSession) -> Dict[str, Any]:
    """Defaults ← stored blob ← mode preset (so `strength gain`, `daily_count`
    etc. always reflect the chosen coach tone even if only `mode` was saved)."""
    cfg = dict(_CONFIG_DEFAULTS)
    stored = await _load_blob(db, CONFIG_KEY)
    cfg.update({k: v for k, v in stored.items() if v is not None})
    preset = _MODE_PRESETS.get(cfg.get("mode"), _MODE_PRESETS["strict"])
    # Stored explicit overrides win over the preset; otherwise take the preset.
    for k, v in preset.items():
        cfg.setdefault(k, v)
        if k not in stored:
            cfg[k] = v
    return cfg


async def update_config(db: AsyncSession, partial: Dict[str, Any]) -> Dict[str, Any]:
    stored = await _load_blob(db, CONFIG_KEY)
    allowed = set(_CONFIG_DEFAULTS) | {"daily_count", "gain", "penalty", "grad_strength", "grad_streak"}
    # normalize the enum-ish scope
    if partial.get("extraction_scope") not in (None, "all", "starred"):
        partial = {**partial, "extraction_scope": "all"}
    for k, v in (partial or {}).items():
        if k in allowed:
            stored[k] = v
    await _save_blob(db, CONFIG_KEY, stored)
    return await get_config(db)


def _local_now(cfg: Dict[str, Any], now: Optional[datetime] = None) -> datetime:
    now = now or datetime.now(timezone.utc)
    if now.tzinfo is not None:
        now = now.astimezone(timezone.utc).replace(tzinfo=None)
    return now + timedelta(minutes=int(cfg.get("tz_offset_minutes", 240)))


# ── serialization ─────────────────────────────────────────────────────────────
def _clean_steps(steps: Any) -> List[Dict[str, Any]]:
    """Coerce stored steps into ``[{"text": str, "done": bool}, …]``."""
    if not isinstance(steps, list):
        return []
    out = []
    for s in steps:
        if isinstance(s, dict) and s.get("text"):
            out.append({"text": str(s["text"])[:300], "done": bool(s.get("done"))})
    return out


def _current_step(steps: Any) -> Optional[str]:
    """The first not-yet-done step — the concrete «الان دقیقاً این قدم»."""
    for s in _clean_steps(steps):
        if not s["done"]:
            return s["text"]
    return None


def directive_dict(d: Directive) -> Dict[str, Any]:
    steps = _clean_steps(getattr(d, "steps", None))
    return {
        "id": d.id,
        "title": d.title,
        "detail": d.detail,
        "domain": d.domain,
        "cadence": d.cadence,
        "kind": d.kind,
        "status": d.status,
        "strength": int(d.strength or 0),
        "streak": int(d.streak or 0),
        "best_streak": int(d.best_streak or 0),
        "times_done": int(d.times_done or 0),
        "times_missed": int(d.times_missed or 0),
        "weight": int(d.weight or 3),
        "next_step": d.next_step,
        "steps": steps,
        "current_step": _current_step(steps),
        "steps_total": len(steps),
        "steps_done": sum(1 for s in steps if s["done"]),
        "source_type": d.source_type,
        "source_ref": d.source_ref,
        "last_done_at": d.last_done_at.isoformat() if d.last_done_at else None,
        "graduated_at": d.graduated_at.isoformat() if d.graduated_at else None,
    }


# ── extraction ────────────────────────────────────────────────────────────────
async def _existing_norm_titles(db: AsyncSession, user_id: int) -> set:
    rows = (
        await db.execute(select(Directive.title).where(_scope(Directive.user_id, user_id)))
    ).scalars().all()
    return {_norm(t) for t in rows}


def _chunk_writing_body(body: str, *, max_chunks: int = 12) -> List[str]:
    """Split a long writing into aspiration-sized chunks (a paragraph or a
    sentence) so the AI can mine goals FROM WITHIN the text — not just its
    title. Trivial fragments are dropped; the whole thing is capped so a
    50k-char writing can't flood the candidate list."""
    if not body:
        return []
    # paragraphs first; fall back to sentence-ish splits for wall-of-text
    parts = re.split(r"\n{2,}", body)
    chunks: List[str] = []
    for p in parts:
        p = re.sub(r"\s+", " ", p).strip()
        if not p:
            continue
        if len(p) <= 220:
            chunks.append(p)
        else:
            for s in re.split(r"(?<=[.!؟\n])\s+", p):
                s = s.strip()
                if 12 <= len(s) <= 220:
                    chunks.append(s)
        if len(chunks) >= max_chunks:
            break
    return chunks[:max_chunks]


async def _gather_candidates(
    db: AsyncSession, user_id: int, limit: int, *, scope: str = "all"
) -> List[Dict[str, Any]]:
    """Candidate texts from the owner's content, each carrying its source (for
    traceability) and a ``starred`` high-signal flag.

    ``scope="starred"`` — only ⭐ items + writing titles (the conservative set,
    used as the safe heuristic fallback when no AI model is configured).
    ``scope="all"`` (default) — ALSO every other active list item AND chunks
    of the writing BODIES, so the extractor can see EVERYTHING, not just the
    12 starred ones (owner 2026-07-21: «فقط همین ۱۲ تا؟»). The broad set is
    meant to be filtered/merged by the AI; the heuristic path keeps only the
    starred subset to avoid proposing every shopping-list item."""
    from app.models.personal_writing import PersonalWriting
    from app.models.todo_item import TodoItem

    out: List[Dict[str, Any]] = []
    seen: set = set()

    def _add(text: str, *, source_type: str, source_ref: str, starred: bool, kind: Optional[str] = None):
        t = (text or "").strip()
        key = _norm(t)
        if not t or key in seen or len(out) >= limit:
            return
        seen.add(key)
        row = {"text": t[:400], "source_type": source_type, "source_ref": source_ref, "starred": starred}
        if kind:
            row["kind"] = kind
        out.append(row)

    # 1) Starred active items — the owner's own emphasis (highest signal).
    starred = (
        await db.execute(
            select(TodoItem).where(
                _scope(TodoItem.owner_id, user_id),
                TodoItem.deleted_at.is_(None),
                TodoItem.is_completed.is_(False),
                TodoItem.is_starred.is_(True),
            ).order_by(TodoItem.updated_at.desc().nullslast()).limit(limit)
        )
    ).scalars().all()
    for it in starred:
        _add(it.content, source_type="todo_item", source_ref=str(it.id), starred=True)

    # 2) Writing TITLES — always high-signal (an aspiration each).
    writings = (
        await db.execute(
            select(PersonalWriting)
            .where(_scope(PersonalWriting.user_id, user_id), PersonalWriting.deleted_at.is_(None))
            .order_by(PersonalWriting.sort_order.asc())
        )
    ).scalars().all()
    for w in writings:
        _add(w.title, source_type="personal_writing", source_ref=str(w.id), starred=True, kind=KIND_GOAL)

    if scope == "all":
        # 3) Every OTHER active list item (non-starred) — broad coverage.
        others = (
            await db.execute(
                select(TodoItem).where(
                    _scope(TodoItem.owner_id, user_id),
                    TodoItem.deleted_at.is_(None),
                    TodoItem.is_completed.is_(False),
                    TodoItem.is_starred.is_(False),
                ).order_by(TodoItem.updated_at.desc().nullslast()).limit(limit)
            )
        ).scalars().all()
        for it in others:
            _add(it.content, source_type="todo_item", source_ref=str(it.id), starred=False)
        # 4) Chunks of the writing BODIES — mine goals from within the text.
        for w in writings:
            for chunk in _chunk_writing_body(w.body or ""):
                _add(chunk, source_type="personal_writing", source_ref=str(w.id), starred=False, kind=KIND_GOAL)

    return out


async def _ai_refine(db: AsyncSession, candidates: List[Dict[str, Any]]) -> Optional[List[Dict[str, Any]]]:
    """Ask the routed model to rewrite candidates into imperative daily
    commands + tag them. Returns None on any failure (caller falls back to the
    heuristic)."""
    import json

    try:
        from app.services.ai.inference_gateway import complete

        listing = "\n".join(f"{i+1}. {c['text'][:160]}" for i, c in enumerate(candidates))
        prompt = (
            "این‌ها بریده‌هایی از لیست‌ها و نوشته‌های یک کاربر است. آن‌هایی را که یک "
            "«عادت/تمرین/هدفِ» قابلِ‌نهادینه‌شدن‌اند به «فرمانِ» کوتاهِ امری فارسی (حداکثر "
            "۱۲ کلمه) تبدیل کن و برچسب بزن. کارهای یک‌بارهٔ پیشِ‌پاافتاده (خریدِ روزمره، "
            "تماسِ تکی، قرارِ گذرا) را **رد کن** و در خروجی نیاور؛ موارد تکراری/هم‌معنا را "
            "**ادغام** کن. فقط JSON آرایه برگردان؛ هر عضو: "
            '{"i": شمارهٔ ورودی, "title": "فرمان", "domain": یکی از '
            "[معنوی,خودسازی,دانش,سلامت,مالی,روابط,آرزو,کار], "
            '"cadence": یکی از [daily,few_per_week,weekly,once], "kind": یکی از [practice,goal]}.\n\n'
            + listing
        )
        res = await complete(db, prompt, task="planning", max_tokens=2000)
        if not (res.get("ok") and res.get("text")):
            return None
        text = res["text"]
        start, end = text.find("["), text.rfind("]")
        if start < 0 or end <= start:
            return None
        parsed = json.loads(text[start:end + 1])
        refined: List[Dict[str, Any]] = []
        for obj in parsed:
            if not isinstance(obj, dict):
                continue
            idx = int(obj.get("i", 0)) - 1
            if not (0 <= idx < len(candidates)):
                continue
            title = str(obj.get("title") or "").strip()
            if not title:
                continue
            src = candidates[idx]
            refined.append({
                "title": title[:200],
                "domain": str(obj.get("domain") or _guess_domain(title))[:32],
                "cadence": str(obj.get("cadence") or CADENCE_DAILY),
                "kind": str(obj.get("kind") or src.get("kind") or KIND_PRACTICE),
                "source_type": src.get("source_type"),
                "source_ref": src.get("source_ref"),
            })
        return refined or None
    except Exception as exc:
        logger.debug("directive AI refine skipped: %r", exc)
        return None


def _heuristic_refine(candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    out = []
    for c in candidates:
        title = (c["text"] or "").strip()[:200]
        kind = c.get("kind") or KIND_PRACTICE
        out.append({
            "title": title,
            "domain": _guess_domain(title),
            "cadence": CADENCE_ONCE if kind == KIND_GOAL else CADENCE_DAILY,
            "kind": kind,
            "source_type": c.get("source_type"),
            "source_ref": c.get("source_ref"),
        })
    return out


_VALID_CADENCE = {CADENCE_DAILY, CADENCE_FEW_PER_WEEK, CADENCE_WEEKLY, CADENCE_ONCE}
_VALID_KIND = {KIND_PRACTICE, KIND_GOAL}


async def extract_directives(
    db: AsyncSession, user_id: int = 0, *, limit: Optional[int] = None,
    use_ai: bool = True, scope: Optional[str] = None,
) -> Dict[str, Any]:
    """Propose directives from the owner's content. Idempotent: a candidate
    whose (normalized) command already exists is skipped, so re-running only
    adds what's new. NEVER raises — returns a summary dict.

    ``scope`` / ``limit`` default from the engine config (extraction_scope /
    extraction_limit). With ``scope="all"`` the WHOLE of the owner's content is
    considered (every list item + writing bodies); the AI filters/merges it.
    When no AI is available the heuristic keeps only the STARRED subset so a
    broad scope can't dump every trivial list item as a proposal."""
    try:
        cfg = await get_config(db)
        scope = scope or cfg.get("extraction_scope", "all")
        limit = int(limit or cfg.get("extraction_limit", 80))
        candidates = await _gather_candidates(db, user_id, limit, scope=scope)
        if not candidates:
            return {"ok": True, "proposed_added": 0, "skipped": 0, "reason": "no_candidates"}

        refined = (await _ai_refine(db, candidates)) if use_ai else None
        used_ai = refined is not None
        if not refined:
            # Safe fallback: without AI, only the high-signal (starred) subset
            # becomes proposals — never the whole backlog.
            refined = _heuristic_refine([c for c in candidates if c.get("starred")])

        seen = await _existing_norm_titles(db, user_id)
        added = 0
        skipped = 0
        for r in refined:
            key = _norm(r["title"])
            if not key or key in seen:
                skipped += 1
                continue
            seen.add(key)
            cadence = r["cadence"] if r["cadence"] in _VALID_CADENCE else CADENCE_DAILY
            kind = r["kind"] if r["kind"] in _VALID_KIND else KIND_PRACTICE
            db.add(Directive(
                user_id=_uid_for_write(user_id),
                title=r["title"],
                domain=r["domain"] or "خودسازی",
                cadence=cadence,
                kind=kind,
                status=DIRECTIVE_PROPOSED,
                source_type=r.get("source_type"),
                source_ref=r.get("source_ref"),
            ))
            added += 1
        await db.commit()
        return {"ok": True, "proposed_added": added, "skipped": skipped, "used_ai": used_ai}
    except Exception as exc:
        logger.warning("extract_directives failed: %r", exc)
        try:
            await db.rollback()
        except Exception:
            pass
        return {"ok": False, "proposed_added": 0, "skipped": 0, "error": repr(exc)[:200]}


async def auto_intake_from_text(
    db: AsyncSession, user_id: int, text: str, *,
    source_type: str = "manual", source_ref: Optional[str] = None,
    kind: str = KIND_PRACTICE, status: str = DIRECTIVE_PROPOSED,
) -> Optional[Directive]:
    """Anything added later finds its place: propose (or add) a directive from
    one piece of text. Deduped against existing titles. Returns the row or
    None (duplicate/empty)."""
    title = (text or "").strip()[:200]
    if not title:
        return None
    seen = await _existing_norm_titles(db, user_id)
    if _norm(title) in seen:
        return None
    d = Directive(
        user_id=_uid_for_write(user_id),
        title=title,
        domain=_guess_domain(title),
        cadence=CADENCE_ONCE if kind == KIND_GOAL else CADENCE_DAILY,
        kind=kind if kind in _VALID_KIND else KIND_PRACTICE,
        status=status if status in {DIRECTIVE_PROPOSED, DIRECTIVE_ACTIVE} else DIRECTIVE_PROPOSED,
        source_type=source_type,
        source_ref=source_ref,
    )
    db.add(d)
    await db.commit()
    await db.refresh(d)
    return d


async def add_manual(
    db: AsyncSession, user_id: int, *, title: str, domain: Optional[str] = None,
    cadence: str = CADENCE_DAILY, kind: str = KIND_PRACTICE, weight: int = 3,
    detail: Optional[str] = None, next_step: Optional[str] = None,
) -> Directive:
    """Owner adds a directive by hand → active immediately (they meant it)."""
    d = Directive(
        user_id=_uid_for_write(user_id),
        title=(title or "").strip()[:200] or "بدون عنوان",
        detail=detail,
        domain=(domain or _guess_domain(title))[:32],
        cadence=cadence if cadence in _VALID_CADENCE else CADENCE_DAILY,
        kind=kind if kind in _VALID_KIND else KIND_PRACTICE,
        status=DIRECTIVE_ACTIVE,
        weight=max(1, min(5, int(weight or 3))),
        next_step=next_step,
        source_type="manual",
    )
    db.add(d)
    await db.commit()
    await db.refresh(d)
    return d


# ── approve / reject / archive ────────────────────────────────────────────────
async def set_status(db: AsyncSession, directive_id: int, status: str, user_id: int = 0) -> Optional[Directive]:
    d = (
        await db.execute(
            select(Directive).where(Directive.id == directive_id, _scope(Directive.user_id, user_id))
        )
    ).scalar_one_or_none()
    if d is None:
        return None
    if status in {DIRECTIVE_PROPOSED, DIRECTIVE_ACTIVE, DIRECTIVE_GRADUATED, DIRECTIVE_ARCHIVED}:
        d.status = status
        if status == DIRECTIVE_GRADUATED and d.graduated_at is None:
            d.graduated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(d)
    return d


async def _ai_steps(db: AsyncSession, directive: Directive) -> Optional[List[str]]:
    """Ask the routed model to break a directive into 3–7 concrete, ordered
    sub-steps / prerequisites. Returns None on any failure."""
    import json

    try:
        from app.services.ai.inference_gateway import complete

        prompt = (
            f"هدف/عادت کاربر: «{directive.title}»"
            + (f" (حوزه: {directive.domain})" if directive.domain else "")
            + ".\nاین را به ۳ تا ۷ قدمِ عملیِ کوتاه و به‌ترتیب بشکن (اول پیش‌نیازها، بعد "
            "اجرا). هر قدم یک جملهٔ امریِ کوتاهِ فارسی. فقط JSON آرایه‌ای از رشته‌ها برگردان، "
            'مثل ["قدم اول","قدم دوم"].'
        )
        res = await complete(db, prompt, task="planning", max_tokens=600)
        if not (res.get("ok") and res.get("text")):
            return None
        text = res["text"]
        start, end = text.find("["), text.rfind("]")
        if start < 0 or end <= start:
            return None
        parsed = json.loads(text[start:end + 1])
        steps = [str(s).strip()[:300] for s in parsed if str(s).strip()]
        return steps[:7] or None
    except Exception as exc:
        logger.debug("directive AI steps skipped: %r", exc)
        return None


async def generate_steps(
    db: AsyncSession, directive_id: int, user_id: int = 0, *, use_ai: bool = True
) -> Optional[Dict[str, Any]]:
    """Break a directive into ordered sub-steps (layer 2). AI-driven; with no
    model the ``next_step`` (if any) becomes a single step so the feature still
    does something. Returns the updated directive dict or None."""
    d = (
        await db.execute(
            select(Directive).where(Directive.id == directive_id, _scope(Directive.user_id, user_id))
        )
    ).scalar_one_or_none()
    if d is None:
        return None
    step_texts = (await _ai_steps(db, d)) if use_ai else None
    if not step_texts:
        step_texts = [d.next_step.strip()] if (d.next_step or "").strip() else []
    d.steps = [{"text": t, "done": False} for t in step_texts]
    await db.commit()
    await db.refresh(d)
    return directive_dict(d)


async def set_step_done(
    db: AsyncSession, directive_id: int, index: int, done: bool, user_id: int = 0
) -> Optional[Dict[str, Any]]:
    """Toggle one sub-step's done state and advance the «current step»."""
    d = (
        await db.execute(
            select(Directive).where(Directive.id == directive_id, _scope(Directive.user_id, user_id))
        )
    ).scalar_one_or_none()
    if d is None:
        return None
    steps = _clean_steps(getattr(d, "steps", None))
    if 0 <= index < len(steps):
        steps[index]["done"] = bool(done)
        d.steps = steps
        await db.commit()
        await db.refresh(d)
    return directive_dict(d)


async def _count_status(db: AsyncSession, user_id: int, status: str) -> int:
    from sqlalchemy import func

    return int(
        (
            await db.execute(
                select(func.count()).select_from(Directive).where(
                    _scope(Directive.user_id, user_id), Directive.status == status
                )
            )
        ).scalar()
        or 0
    )


# ── auto add/remove: keep the routine in sync with the owner's content ────────
async def reconcile_sources(db: AsyncSession, user_id: int = 0) -> int:
    """Remove-from-routine, automatically: archive any proposed/active
    directive whose source todo item is now gone or trashed (soft-deleted).
    Recoverable (archived, never hard-deleted — quarantine-not-delete).
    Graduated directives are left untouched (already internalized)."""
    from app.models.todo_item import TodoItem

    rows = (
        await db.execute(
            select(Directive).where(
                _scope(Directive.user_id, user_id),
                Directive.status.in_([DIRECTIVE_PROPOSED, DIRECTIVE_ACTIVE]),
                Directive.source_type == "todo_item",
            )
        )
    ).scalars().all()
    archived = 0
    for d in rows:
        try:
            ref = int(d.source_ref)
        except (TypeError, ValueError):
            continue
        item = (
            await db.execute(select(TodoItem).where(TodoItem.id == ref))
        ).scalar_one_or_none()
        if item is None or item.deleted_at is not None:
            d.status = DIRECTIVE_ARCHIVED
            archived += 1
    if archived:
        await db.commit()
    return archived


async def run_daily_intake(db: AsyncSession, user_id: int = 0) -> Dict[str, Any]:
    """The «هرچیزی بعداً اضافه بشه خودش جا بده» loop step: propose directives
    from newly-starred items / new writings (extract is dedup-idempotent), and
    archive directives whose source content was removed. Fail-open."""
    try:
        ex = await extract_directives(db, user_id)
    except Exception as exc:
        logger.debug("daily intake extract skipped: %r", exc)
        ex = {"proposed_added": 0}
    try:
        archived = await reconcile_sources(db, user_id)
    except Exception as exc:
        logger.debug("daily intake reconcile skipped: %r", exc)
        archived = 0
    return {"proposed_added": int(ex.get("proposed_added", 0)), "archived": archived}


# ── daily command selection ───────────────────────────────────────────────────
def _is_due(d: Directive, today: date) -> bool:
    if d.cadence == CADENCE_DAILY:
        return True
    last = d.last_done_at.date() if d.last_done_at else None
    if last is None:
        return True
    gap = (today - last).days
    if d.cadence == CADENCE_FEW_PER_WEEK:
        return gap >= 2
    if d.cadence == CADENCE_WEEKLY:
        return gap >= 6
    if d.cadence == CADENCE_ONCE:  # a goal — nudge every few days
        return gap >= 3
    return True


def _score(d: Directive, today: date) -> tuple:
    """Weak-first, due-first, neglected-first, heavier-first — strict coaching
    surfaces what most needs work. Deterministic (id tie-break) so the web
    preview and the persisted set agree."""
    due = 1 if _is_due(d, today) else 0
    last_surf = d.last_surfaced_at.date() if d.last_surfaced_at else None
    neglect = (today - last_surf).days if last_surf else 30
    neglect = max(0, min(neglect, 30))
    weakness = 100 - int(d.strength or 0)
    return (due, neglect, int(d.weight or 3), weakness, -(d.id or 0))


async def _todays_checkins(db: AsyncSession, user_id: int, day: date) -> List[DirectiveCheckin]:
    return (
        await db.execute(
            select(DirectiveCheckin).where(
                _scope(DirectiveCheckin.user_id, user_id),
                DirectiveCheckin.checkin_date == day,
                DirectiveCheckin.surfaced.is_(True),
            )
        )
    ).scalars().all()


async def select_today_commands(
    db: AsyncSession, user_id: int = 0, now: Optional[datetime] = None, *, persist: bool = False
) -> Dict[str, Any]:
    """Return today's command set (list of {directive, done}). If already
    surfaced today, returns exactly that persisted set; otherwise selects the
    top-N active directives and (when ``persist``) writes the check-in rows +
    stamps ``last_surfaced_at`` (idempotent via the per-day unique key)."""
    cfg = await get_config(db)
    day = _local_now(cfg, now).date()

    existing = await _todays_checkins(db, user_id, day)
    if existing:
        by_id = {c.directive_id: c for c in existing}
        ds = (
            await db.execute(select(Directive).where(Directive.id.in_(list(by_id.keys()))))
        ).scalars().all()
        ds.sort(key=lambda d: _score(d, day), reverse=True)
        return {
            "date": day.isoformat(),
            "commands": [
                {**directive_dict(d), "done": by_id[d.id].done} for d in ds
            ],
            "persisted": True,
        }

    active = (
        await db.execute(
            select(Directive).where(
                _scope(Directive.user_id, user_id), Directive.status == DIRECTIVE_ACTIVE
            )
        )
    ).scalars().all()
    active.sort(key=lambda d: _score(d, day), reverse=True)
    picked = active[: int(cfg.get("daily_count", 5))]

    if persist and picked:
        now_utc = datetime.now(timezone.utc)
        for d in picked:
            db.add(DirectiveCheckin(
                directive_id=d.id, user_id=_uid_for_write(user_id),
                checkin_date=day, surfaced=True, done=None,
            ))
            d.last_surfaced_at = now_utc
        await db.commit()

    return {
        "date": day.isoformat(),
        "commands": [{**directive_dict(d), "done": None} for d in picked],
        "persisted": persist and bool(picked),
    }


# ── follow-up: mark done / missed + strength/streak/graduation ────────────────
async def _upsert_checkin(db: AsyncSession, directive_id: int, user_id: int, day: date) -> DirectiveCheckin:
    c = (
        await db.execute(
            select(DirectiveCheckin).where(
                DirectiveCheckin.directive_id == directive_id,
                DirectiveCheckin.checkin_date == day,
            )
        )
    ).scalar_one_or_none()
    if c is None:
        c = DirectiveCheckin(
            directive_id=directive_id, user_id=_uid_for_write(user_id),
            checkin_date=day, surfaced=True, done=None,
        )
        db.add(c)
    return c


async def mark(
    db: AsyncSession, directive_id: int, done: bool, user_id: int = 0,
    now: Optional[datetime] = None, note: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Record today's follow-up answer for a directive and move its
    internalization signal. Returns {directive, graduated} or None."""
    cfg = await get_config(db)
    now_utc = now or datetime.now(timezone.utc)
    day = _local_now(cfg, now).date()

    d = (
        await db.execute(
            select(Directive).where(Directive.id == directive_id, _scope(Directive.user_id, user_id))
        )
    ).scalar_one_or_none()
    if d is None:
        return None

    c = await _upsert_checkin(db, directive_id, user_id, day)
    was_done = c.done
    c.done = bool(done)
    if note is not None:
        c.note = note

    gain = int(cfg.get("gain", 7))
    penalty = int(cfg.get("penalty", 12))

    # Undo the previous same-day answer's effect before applying the new one,
    # so toggling done↔missed twice in a day can't double-count.
    if was_done is True and done is False:
        d.times_done = max(0, int(d.times_done or 0) - 1)
    elif was_done is False and done is True:
        d.times_missed = max(0, int(d.times_missed or 0) - 1)

    if done:
        if was_done is not True:
            d.times_done = int(d.times_done or 0) + 1
            d.streak = int(d.streak or 0) + 1
            d.best_streak = max(int(d.best_streak or 0), d.streak)
            d.strength = min(100, int(d.strength or 0) + gain)
            d.last_done_at = now_utc
    else:
        if was_done is not False:
            d.times_missed = int(d.times_missed or 0) + 1
            d.streak = 0
            d.strength = max(0, int(d.strength or 0) - penalty)

    graduated = False
    if (
        d.status == DIRECTIVE_ACTIVE
        and int(d.strength or 0) >= int(cfg.get("grad_strength", 90))
        and int(d.streak or 0) >= int(cfg.get("grad_streak", 21))
    ):
        d.status = DIRECTIVE_GRADUATED
        d.graduated_at = now_utc
        graduated = True

    await db.commit()
    await db.refresh(d)
    return {"directive": directive_dict(d), "graduated": graduated}


async def run_evening_followup(
    db: AsyncSession, user_id: int = 0, now: Optional[datetime] = None
) -> Dict[str, Any]:
    """End-of-day: every command surfaced today but left unanswered counts as a
    miss (strict «جاماندن‌ها واضح»). Returns a summary."""
    cfg = await get_config(db)
    day = _local_now(cfg, now).date()
    pending = (
        await db.execute(
            select(DirectiveCheckin).where(
                _scope(DirectiveCheckin.user_id, user_id),
                DirectiveCheckin.checkin_date == day,
                DirectiveCheckin.surfaced.is_(True),
                DirectiveCheckin.done.is_(None),
            )
        )
    ).scalars().all()
    missed = 0
    for c in pending:
        res = await mark(db, c.directive_id, False, user_id=user_id, now=now)
        if res is not None:
            missed += 1
    return {"ok": True, "date": day.isoformat(), "missed": missed}


# ── growth report ─────────────────────────────────────────────────────────────
async def growth_report(db: AsyncSession, user_id: int = 0, now: Optional[datetime] = None) -> Dict[str, Any]:
    cfg = await get_config(db)
    day = _local_now(cfg, now).date()
    rows = (
        await db.execute(select(Directive).where(_scope(Directive.user_id, user_id)))
    ).scalars().all()

    graduated = [d for d in rows if d.status == DIRECTIVE_GRADUATED]
    active = [d for d in rows if d.status == DIRECTIVE_ACTIVE]
    proposed = [d for d in rows if d.status == DIRECTIVE_PROPOSED]
    forming = [d for d in active if int(d.strength or 0) > 0]
    not_started = [d for d in active if int(d.strength or 0) == 0]

    today_checkins = await _todays_checkins(db, user_id, day)
    today_done = sum(1 for c in today_checkins if c.done is True)

    graduated.sort(key=lambda d: (d.graduated_at or datetime.min.replace(tzinfo=timezone.utc)), reverse=True)
    forming.sort(key=lambda d: int(d.strength or 0), reverse=True)

    # per-domain active counts (so the owner sees the balance of their life)
    by_domain: Dict[str, int] = {}
    for d in active:
        by_domain[d.domain] = by_domain.get(d.domain, 0) + 1

    return {
        "date": day.isoformat(),
        "counts": {
            "graduated": len(graduated),   # نهادینه‌شده / در تو حل شده
            "active": len(active),
            "forming": len(forming),       # در حال شکل‌گیری
            "not_started": len(not_started),
            "proposed": len(proposed),     # منتظر تأیید
        },
        "today": {"done": today_done, "total": len(today_checkins)},
        "graduated_recent": [directive_dict(d) for d in graduated[:10]],
        "forming_top": [directive_dict(d) for d in forming[:10]],
        "by_domain": by_domain,
    }


async def list_directives(
    db: AsyncSession, user_id: int = 0, *, status: Optional[str] = None, limit: int = 200
) -> List[Dict[str, Any]]:
    q = select(Directive).where(_scope(Directive.user_id, user_id))
    if status:
        q = q.where(Directive.status == status)
    q = q.order_by(Directive.strength.desc(), Directive.id.desc()).limit(limit)
    rows = (await db.execute(q)).scalars().all()
    return [directive_dict(d) for d in rows]


# ── daily tick (morning commands + evening follow-up) ─────────────────────────
async def directive_tick(db: AsyncSession, now: Optional[datetime] = None, *, user_id: int = 0) -> Dict[str, Any]:
    """One engine cycle: at/after the brief hour surface today's commands and
    push them (once/day); at/after the follow-up hour run the evening miss
    sweep + reminder (once/day). Stamps its own once-a-day guards in the
    config blob. Returns what it did. Fail-open in the caller."""
    cfg = await get_config(db)
    if not cfg.get("enabled", True):
        return {"did": "disabled"}
    local = _local_now(cfg, now)
    day_iso = local.date().isoformat()
    stored = await _load_blob(db, CONFIG_KEY)
    did: List[str] = []

    # Morning: pull in new content / drop removed content, then surface + push.
    if local.hour >= int(cfg.get("brief_hour", 7)) and stored.get("last_command_date") != day_iso:
        intake = await run_daily_intake(db, user_id)
        res = await select_today_commands(db, user_id, now=now, persist=True)
        cmds = res.get("commands") or []
        pending = await _count_status(db, user_id, DIRECTIVE_PROPOSED)
        if cmds and cfg.get("channel") in ("both", "telegram"):
            await _push_commands(cmds, local, pending_proposals=pending)
        stored = await _load_blob(db, CONFIG_KEY)  # intake committed sibling rows
        stored["last_command_date"] = day_iso
        await _save_blob(db, CONFIG_KEY, stored)
        did.append(f"commands:{len(cmds)} intake+{intake['proposed_added']}/-{intake['archived']}")

    # Evening: sweep misses + remind.
    if local.hour >= int(cfg.get("followup_hour", 21)) and stored.get("last_followup_date") != day_iso:
        summary = await run_evening_followup(db, user_id, now=now)
        # re-load (mark() mutated the blob's sibling rows, not the blob itself)
        stored = await _load_blob(db, CONFIG_KEY)
        if cfg.get("channel") in ("both", "telegram"):
            await _push_followup(db, user_id, now)
        stored["last_followup_date"] = day_iso
        await _save_blob(db, CONFIG_KEY, stored)
        did.append(f"followup_missed:{summary.get('missed', 0)}")

    return {"did": did or "not_due", "date": day_iso}


async def _push_commands(
    commands: List[Dict[str, Any]], local: datetime, *, pending_proposals: int = 0
) -> None:
    try:
        from app.services.telegram_service import get_telegram_bot

        bot = get_telegram_bot()
        if not bot.is_configured():
            return
        lines = [f"🎯 *فرمان‌های امروز* ({local.date().isoformat()}) — مربیِ جدی:", ""]
        for c in commands:
            streak = f" 🔥{c['streak']}" if c.get("streak") else ""
            lines.append(f"• {c['title']}{streak}")
        lines.append("")
        if pending_proposals:
            lines.append(f"📥 {pending_proposals} پیشنهادِ تازه از محتوایت منتظر تأیید است.")
        lines.append("شب می‌پرسم کدام‌ها را انجام دادی. جا نمان.")
        await bot.send("\n".join(lines), silent=True)
    except Exception as exc:
        logger.debug("directive command push skipped: %r", exc)


async def _push_followup(db: AsyncSession, user_id: int, now: Optional[datetime]) -> None:
    try:
        from app.services.telegram_service import get_telegram_bot

        bot = get_telegram_bot()
        if not bot.is_configured():
            return
        rep = await growth_report(db, user_id, now=now)
        t = rep.get("today", {})
        lines = [
            "🌙 *پیگیریِ شب*",
            f"امروز: {t.get('done', 0)} از {t.get('total', 0)} فرمان انجام شد.",
            f"نهادینه‌شده تا حالا: {rep['counts']['graduated']} | در حال شکل‌گیری: {rep['counts']['forming']}",
            "",
            "فردا صبح دوباره کنارت‌ام.",
        ]
        await bot.send("\n".join(lines), silent=True)
    except Exception as exc:
        logger.debug("directive followup push skipped: %r", exc)


async def directive_loop(stop_event) -> None:
    """Background loop (30-min cadence, 150s boot grace). Own SessionLocal
    session per cycle, fail-open — same lifecycle as backup_loop."""
    import asyncio

    try:
        await asyncio.wait_for(stop_event.wait(), timeout=150)
        return
    except asyncio.TimeoutError:
        pass
    while not stop_event.is_set():
        try:
            from app.database import SessionLocal

            async with SessionLocal() as session:
                await directive_tick(session)
        except Exception as exc:
            logger.debug("directive cycle skipped: %r", exc)
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=1800)
        except asyncio.TimeoutError:
            continue
