"""رشد ذهن و هوش — cognitive-growth analytics: ingest + dashboard + reminders.

Three concerns, one topic (the owner asked for ONE consolidated surface):

1. **Ingest** — ``parse_brilliant_zip`` reduces a Brilliant.org personal-data
   export (JSON-Lines files under data/production/) to a stats summary:
   problem interactions, practice accuracy, lessons/courses progress, streaks,
   monthly activity/accuracy trend. ``ingest_upload`` verifies PROVENANCE
   (the export's account email vs. the owner's known emails — "is this data
   really MINE?"), stores a BrainUpload row, clears the reminder cycle, and
   best-effort asks the AI catalog for a short referenced narrative.

2. **Dashboard** — ``build_dashboard`` merges the uploads trend with the
   owner's OWN behavioural signals already in the app (tasks completed,
   self-improvement check-ins, todo completions, finance entries — each
   section carries an explicit ``provenance`` block naming the exact tables/
   rows/rules behind every number, and a ``authored_by_you`` rule stating why
   this signal counts as the owner's behaviour).

3. **Reminders** — weekly Telegram reminder to upload the export; config in
   the global_settings JSON (enabled / weekday / hour / silent /
   refollow_hours), editable from the dashboard; ``reminder_tick`` is the pure
   decision function (unit-testable) driven by a background loop; an upload
   from EITHER channel ends the cycle.
"""
from __future__ import annotations

import io
import json
import logging
import os
import zipfile
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.brain import BrainUpload

logger = logging.getLogger(__name__)

REMINDER_KEY = "brain_reminder"

DEFAULT_REMINDER = {
    "enabled": True,
    "weekday": 4,          # 0=Monday … 4=Friday (جمعه‌کاری امارات: آخر هفته)
    "hour": 18,            # local-server hour
    "silent": False,
    "refollow_hours": 6,   # re-remind interval while no upload arrived
    "last_reminder_at": None,   # ISO
    "awaiting_since": None,     # ISO — set on reminder, cleared on upload
    "last_upload_at": None,     # ISO
}


def _task_user_id() -> int:
    try:
        return int(os.environ.get("TELEGRAM_TASK_USER_ID", "0") or "0")
    except (TypeError, ValueError):
        return 0


# ── Brilliant zip parsing ────────────────────────────────────────────────────
def _jsonl(z: zipfile.ZipFile, name: str) -> List[dict]:
    path = f"data/production/{name}.json"
    try:
        raw = z.read(path).decode("utf-8", "replace")
    except KeyError:
        return []
    rows = []
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return rows


def is_brilliant_zip(data: bytes) -> bool:
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as z:
            return any(n.endswith("data/production/auth_user.json") or
                       n == "data/production/auth_user.json" for n in z.namelist())
    except Exception:
        return False


def parse_brilliant_zip(data: bytes) -> Dict[str, Any]:
    """Reduce the export to the dashboard's stats summary. Raises ValueError
    on a non-Brilliant zip."""
    try:
        z = zipfile.ZipFile(io.BytesIO(data))
    except Exception as exc:
        raise ValueError(f"فایل zip قابل خواندن نیست: {exc}") from exc

    users = _jsonl(z, "auth_user")
    if not users:
        raise ValueError("این zip خروجی Brilliant نیست (auth_user یافت نشد)")
    user = users[0]

    interactions = _jsonl(z, "stats_userprobleminteraction")
    practices = _jsonl(z, "practice_practiceuserstate")
    lessons = _jsonl(z, "courses_lessonuserstate")
    courses = _jsonl(z, "courses_courseuserstate")
    streaks = _jsonl(z, "profile_streakrecord")

    # practice accuracy from per-problem states
    correct = total = viewed_solution = 0
    monthly: Dict[str, Dict[str, int]] = defaultdict(lambda: {"correct": 0, "total": 0, "interactions": 0})
    for p in practices:
        month = (p.get("completed_ts") or p.get("last_active_ts") or "")[:7]
        for prob in (p.get("progress_data") or {}).get("problems", []):
            total += 1
            state_correct = prob.get("state") == "correct"
            if state_correct:
                correct += 1
            if prob.get("viewed_solution"):
                viewed_solution += 1
            if month:
                monthly[month]["total"] += 1
                monthly[month]["correct"] += int(state_correct)
    for it in interactions:
        month = (it.get("ts") or "")[:7]
        if month:
            monthly[month]["interactions"] += 1

    def _days(s):
        try:
            a = datetime.fromisoformat(s["start_date"])
            b = datetime.fromisoformat(s["end_date"])
            return (b - a).days + 1
        except Exception:
            return 1

    streak_days = [_days(s) for s in streaks]
    scores = [p.get("best_score") for p in practices if isinstance(p.get("best_score"), (int, float))]

    return {
        "source": "brilliant",
        "account_email": (user.get("email") or "").strip().lower(),
        "account_name": f"{user.get('first_name', '')} {user.get('last_name', '')}".strip(),
        "date_joined": user.get("date_joined"),
        "last_login": user.get("last_login"),
        "problem_interactions": len(interactions),
        "practice_sets": len(practices),
        "practice_problems_total": total,
        "practice_problems_correct": correct,
        "accuracy_pct": round(100.0 * correct / total, 1) if total else None,
        "viewed_solution_pct": round(100.0 * viewed_solution / total, 1) if total else None,
        "avg_best_score": round(sum(scores) / len(scores), 1) if scores else None,
        "lessons_started": len(lessons),
        "lessons_completed": sum(1 for les in lessons if les.get("completed_ts")),
        "courses": [
            {"course_info_id": c.get("course_info_id"),
             "percent_complete": c.get("percent_complete"),
             "last_active_ts": c.get("last_active_ts")}
            for c in courses
        ],
        "streaks_count": len(streaks),
        "longest_streak_days": max(streak_days) if streak_days else 0,
        "total_streak_days": sum(streak_days),
        "monthly": {k: dict(v) for k, v in sorted(monthly.items())},
    }


# ── ownership / provenance check ─────────────────────────────────────────────
async def _known_owner_emails(db: AsyncSession) -> set:
    emails = set()
    env = (os.environ.get("OWNER_EMAIL") or "").strip().lower()
    if env:
        emails.add(env)
    try:
        from app.models.user import User

        rows = (await db.execute(select(User.email))).scalars().all()
        emails.update((e or "").strip().lower() for e in rows if e)
    except Exception:
        pass
    try:
        prior = (await db.execute(
            select(BrainUpload.owner_email).where(BrainUpload.verified_owner.is_(True))
        )).scalars().all()
        emails.update((e or "").strip().lower() for e in prior if e)
    except Exception:
        pass
    return {e for e in emails if e}


async def ingest_upload(
    db: AsyncSession, data: bytes, *, filename: str = "", via: str = "dashboard",
) -> Dict[str, Any]:
    """Parse + verify + store one export; clears the reminder cycle."""
    stats = parse_brilliant_zip(data)

    known = await _known_owner_emails(db)
    email = stats.get("account_email") or ""
    if email and known:
        verified: Optional[bool] = email in known
    elif email:
        verified = None  # first upload, no baseline — recorded as the baseline
    else:
        verified = False

    row = BrainUpload(
        user_id=_task_user_id(), source="brilliant",
        filename=(filename or "data.zip")[:255], via=via,
        verified_owner=verified if verified is not None else True,  # first upload sets baseline
        owner_email=email or None,
        stats_json=json.dumps(stats, ensure_ascii=False),
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)

    # end the reminder cycle (either channel)
    try:
        await update_reminder_config(db, {
            "awaiting_since": None,
            "last_upload_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception as exc:
        logger.debug("brain reminder clear skipped: %r", exc)

    # optional AI narrative with references (best-effort; never blocks)
    note = None
    try:
        note = await _ai_narrative(db, stats)
        if note:
            row.analysis_note = note
            await db.commit()
    except Exception as exc:
        logger.debug("brain AI narrative skipped: %r", exc)

    return {"id": row.id, "verified_owner": row.verified_owner,
            "owner_email": row.owner_email, "stats": stats, "analysis_note": note}


async def _ai_narrative(db: AsyncSession, stats: Dict[str, Any]) -> Optional[str]:
    from app.services.ai.inference_gateway import complete

    prompt = (
        "به‌عنوان تحلیل‌گر رشد شناختی، از روی این آمار خروجی Brilliant یک تحلیل کوتاه فارسی بنویس "
        "(حداکثر ۱۲ خط): روند دقت، پشتکار (استریک‌ها)، حجم تمرین، و یک پیشنهاد مشخص. "
        "در پایان بخش «مراجع:» بنویس و دقیقاً بگو هر عدد از کدام فیلد آمده.\n\n"
        f"آمار: {json.dumps(stats, ensure_ascii=False)[:4000]}"
    )
    res = await complete(db, prompt, task="task_analysis", max_tokens=900)
    if res.get("ok") and (res.get("text") or "").strip():
        model = res.get("model") or ""
        return res["text"].strip() + (f"\n\n🤖 مدل تحلیل: {model}" if model else "")
    return None


# ── dashboard (multi-source, referenced) ─────────────────────────────────────
def _scope(col, uid: int):
    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


async def build_dashboard(db: AsyncSession) -> Dict[str, Any]:
    """Every section carries ``provenance``: exactly which tables/rows/rules
    produced the numbers, and why the signal counts as the owner's own
    behaviour (authored_by_you)."""
    uid = _task_user_id()
    sections: List[Dict[str, Any]] = []

    # 1) Brilliant uploads trend
    uploads = (await db.execute(
        select(BrainUpload).order_by(BrainUpload.uploaded_at)
    )).scalars().all()
    up_series = []
    for u in uploads:
        try:
            s = json.loads(u.stats_json)
        except Exception:
            continue
        up_series.append({
            "id": u.id, "filename": u.filename, "via": u.via,
            "uploaded_at": u.uploaded_at.isoformat() if u.uploaded_at else None,
            "verified_owner": u.verified_owner,
            "accuracy_pct": s.get("accuracy_pct"),
            "problem_interactions": s.get("problem_interactions"),
            "lessons_completed": s.get("lessons_completed"),
            "longest_streak_days": s.get("longest_streak_days"),
            "monthly": s.get("monthly", {}),
        })
    latest = None
    if uploads:
        try:
            latest = json.loads(uploads[-1].stats_json)
        except Exception:
            latest = None
    sections.append({
        "key": "brilliant",
        "title": "تمرین هوش و منطق (Brilliant)",
        "latest": latest,
        "latest_note": uploads[-1].analysis_note if uploads else None,
        "series": up_series,
        "provenance": {
            "tables": ["brain_uploads"],
            "rows": [f"#{u.id} ({u.filename}، {u.via})" for u in uploads],
            "rule": "آمار مستقیماً از فایل‌های خروجی رسمی Brilliant شما (stats_userprobleminteraction، "
                    "practice_practiceuserstate، courses_*، profile_streakrecord) استخراج شده است.",
            "authored_by_you": "ایمیل حساب داخل هر فایل با ایمیل(های) شناخته‌شدهٔ شما مقایسه می‌شود "
                               "(verified_owner)؛ فایل با ایمیل ناشناس علامت‌گذاری و جدا نمایش داده می‌شود.",
        },
    })

    # 2) Tasks — completion behaviour
    from app.models.task import Task, TaskStatus

    t_total = (await db.execute(select(func.count(Task.id)).where(_scope(Task.user_id, uid)))).scalar() or 0
    t_done = (await db.execute(select(func.count(Task.id)).where(
        _scope(Task.user_id, uid), Task.status == TaskStatus.DONE))).scalar() or 0
    t_open = (await db.execute(select(func.count(Task.id)).where(
        _scope(Task.user_id, uid), Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS])))).scalar() or 0
    sections.append({
        "key": "tasks",
        "title": "کارها (اجرای برنامه‌ها)",
        "metrics": {"total": t_total, "done": t_done, "open": t_open,
                    "done_ratio_pct": round(100.0 * t_done / t_total, 1) if t_total else None},
        "provenance": {
            "tables": ["tasks"],
            "rule": f"شمارش ردیف‌های جدول tasks در محدودهٔ کاربر شما (user_id={uid} یا قدیمی/NULL)؛ "
                    "done = وضعیت DONE.",
            "authored_by_you": "تغییر وضعیت کارها فقط با عمل خود شما (وب یا ربات تلگرام) رخ می‌دهد؛ "
                               "داده‌های seed شده وضعیت DONE ندارند مگر خودتان تغییر داده باشید.",
        },
    })

    # 3) Self-improvement check-ins — pure behavioural signal
    try:
        from app.models.self_improvement import SelfImprovementCheckIn

        c_total = (await db.execute(select(func.count(SelfImprovementCheckIn.id)))).scalar() or 0
    except Exception:
        c_total = 0
    from app.models.todo_item import TodoItem

    i_done = (await db.execute(select(func.count(TodoItem.id)).where(
        _scope(TodoItem.owner_id, uid), TodoItem.is_completed.is_(True)))).scalar() or 0
    sections.append({
        "key": "self_improvement",
        "title": "خودسازی و لیست‌ها (پیگیری عادت‌ها)",
        "metrics": {"checkins": c_total, "items_completed": i_done},
        "provenance": {
            "tables": ["self_improvement_checkins", "todo_items"],
            "rule": "شمارش check-in های ثبت‌شده + آیتم‌های is_completed=true در محدودهٔ شما.",
            "authored_by_you": "check-in و تیک‌زدن آیتم فقط از تعامل مستقیم شما ایجاد می‌شود؛ "
                               "seed ها هیچ آیتمی را completed نمی‌کنند.",
        },
    })

    # 4) Finance — decision/behaviour signal (archive seed EXCLUDED)
    try:
        from app.models.finance import FinancialAccount, Transaction
        from app.services._personal_development_seed_data import PD_ACCOUNT_NAME

        archive_ids = (await db.execute(
            select(FinancialAccount.id).where(FinancialAccount.name == PD_ACCOUNT_NAME)
        )).scalars().all()
        q = select(func.count(Transaction.id))
        if archive_ids:
            q = q.where(Transaction.account_id.notin_(archive_ids))
        tx_live = (await db.execute(q)).scalar() or 0
    except Exception:
        tx_live = 0
        archive_ids = []
    sections.append({
        "key": "finance",
        "title": "ثبت‌های مالی (نظم و تصمیم‌گیری)",
        "metrics": {"live_transactions": tx_live},
        "provenance": {
            "tables": ["transactions", "financial_accounts"],
            "rule": "تراکنش‌های ثبت‌شده به‌جز حساب آرشیو اکسل "
                    f"(حساب‌های مستثنی: {archive_ids or 'هیچ'}).",
            "authored_by_you": "آرشیو تاریخی اکسل عمداً حذف شده تا فقط ثبت‌های جاری خود شما شمرده شود.",
        },
    })

    cfg = await get_reminder_config(db)
    return {"ok": True, "generated_at": datetime.now(timezone.utc).isoformat(),
            "sections": sections, "reminder": cfg}


# ── reminder config + tick ───────────────────────────────────────────────────
async def get_reminder_config(db: AsyncSession) -> Dict[str, Any]:
    from app.models.global_setting import GlobalSetting

    row = (await db.execute(
        select(GlobalSetting).where(GlobalSetting.key == REMINDER_KEY)
    )).scalars().first()
    cfg = dict(DEFAULT_REMINDER)
    if row and row.value:
        try:
            cfg.update(json.loads(row.value))
        except Exception:
            pass
    return cfg


async def update_reminder_config(db: AsyncSession, partial: Dict[str, Any]) -> Dict[str, Any]:
    from app.models.global_setting import GlobalSetting

    cfg = await get_reminder_config(db)
    for k, v in (partial or {}).items():
        if k in DEFAULT_REMINDER:
            cfg[k] = v
    row = (await db.execute(
        select(GlobalSetting).where(GlobalSetting.key == REMINDER_KEY)
    )).scalars().first()
    if row is None:
        row = GlobalSetting(key=REMINDER_KEY, value=json.dumps(cfg, ensure_ascii=False))
        db.add(row)
    else:
        row.value = json.dumps(cfg, ensure_ascii=False)
    await db.commit()
    return cfg


def reminder_decision(cfg: Dict[str, Any], now: datetime) -> Optional[str]:
    """Pure decision: None | 'remind' | 'refollow'.

    - 'remind'   → the weekly slot (weekday+hour) has arrived and this week's
                   reminder hasn't been sent yet.
    - 'refollow' → a reminder was sent, no upload arrived, and refollow_hours
                   have passed since the last (re)reminder.
    """
    if not cfg.get("enabled", True):
        return None

    def _parse(ts):
        try:
            return datetime.fromisoformat(ts) if ts else None
        except ValueError:
            return None

    last_reminder = _parse(cfg.get("last_reminder_at"))
    awaiting = _parse(cfg.get("awaiting_since"))

    if awaiting is not None:
        hours = float(cfg.get("refollow_hours") or 6)
        if last_reminder and (now - last_reminder).total_seconds() >= hours * 3600:
            return "refollow"
        return None

    if now.weekday() == int(cfg.get("weekday", 4)) and now.hour >= int(cfg.get("hour", 18)):
        # not yet reminded today?
        if last_reminder is None or last_reminder.date() != now.date():
            return "remind"
    return None


async def reminder_tick(db: AsyncSession, now: Optional[datetime] = None) -> Optional[str]:
    """One scheduler cycle: decide + send via the Telegram bot + persist state.
    Returns the action taken (or None)."""
    now = now or datetime.now(timezone.utc)
    cfg = await get_reminder_config(db)
    action = reminder_decision(cfg, now)
    if action is None:
        return None

    from app.services.telegram_service import get_telegram_bot

    bot = get_telegram_bot()
    if action == "remind":
        text = (
            "🧠 *یادآور هفتگی رشد ذهن*\n\n"
            "وقت آپلود فایل دادهٔ تمرین هوش (خروجی Brilliant) است.\n"
            "فایل zip را همین‌جا در تلگرام بفرست، یا از داشبورد «رشد ذهن و هوش» آپلود کن.\n"
            f"⏰ اگر تا {cfg.get('refollow_hours', 6)} ساعت آینده فایلی نرسد دوباره یادآوری می‌کنم."
        )
    else:
        text = (
            "🔁 *یادآوری مجدد — رشد ذهن*\n\n"
            "هنوز فایل دادهٔ این هفته آپلود نشده. فایل zip را بفرست تا تحلیل و داشبورد به‌روز شود.\n"
            "(برای تغییر یا خاموش‌کردن یادآور: داشبورد → رشد ذهن و هوش → تنظیمات یادآور)"
        )
    if bot.is_configured():
        await bot.send(text, silent=bool(cfg.get("silent")))
    else:
        logger.info("brain reminder (bot unconfigured): %s", action)
    await update_reminder_config(db, {
        "last_reminder_at": now.isoformat(),
        "awaiting_since": cfg.get("awaiting_since") or now.isoformat(),
    })
    return action


async def brain_reminder_loop(stop_event) -> None:
    """Background loop (10-min cadence) driving reminder_tick. Started at app
    startup; cancelled via stop_event on shutdown. Fail-open per cycle."""
    import asyncio

    try:
        await asyncio.wait_for(stop_event.wait(), timeout=30)
        return
    except asyncio.TimeoutError:
        pass
    while not stop_event.is_set():
        try:
            from app.database import SessionLocal

            async with SessionLocal() as session:
                await reminder_tick(session)
        except Exception as exc:
            logger.debug("brain reminder cycle skipped: %r", exc)
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=600)
        except asyncio.TimeoutError:
            continue
