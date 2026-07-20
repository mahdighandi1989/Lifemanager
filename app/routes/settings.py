"""/api/settings/* — admin-managed global settings.

Audit task 1a08ded2 (AC 56-59). The global analysis prompt is stored as a
single GlobalSetting row (key='global_analysis_prompt'). Both endpoints are
admin-gated via get_current_admin_user, so a non-admin caller gets 403.
"""
from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import AuthContext, get_current_admin_user
from app.middleware import handle_errors
from app.models.global_setting import GlobalSetting

router = APIRouter()

_GLOBAL_ANALYSIS_PROMPT_KEY = "global_analysis_prompt"


class GlobalPromptBody(BaseModel):
    value: str = ""


@router.get("/api/settings/global-analysis-prompt", tags=["settings"])
@handle_errors
async def get_global_analysis_prompt(
    db: AsyncSession = Depends(get_db),
    _admin: AuthContext = Depends(get_current_admin_user),  # AC 59: non-admin -> 403
) -> dict:
    result = await db.execute(
        select(GlobalSetting).where(GlobalSetting.key == _GLOBAL_ANALYSIS_PROMPT_KEY)
    )
    row = result.scalars().first()
    return {"key": _GLOBAL_ANALYSIS_PROMPT_KEY, "value": row.value if row else ""}


@router.put("/api/settings/global-analysis-prompt", tags=["settings"])
@handle_errors
async def put_global_analysis_prompt(
    payload: GlobalPromptBody = Body(...),
    db: AsyncSession = Depends(get_db),
    _admin: AuthContext = Depends(get_current_admin_user),
) -> dict:
    result = await db.execute(
        select(GlobalSetting).where(GlobalSetting.key == _GLOBAL_ANALYSIS_PROMPT_KEY)
    )
    row = result.scalars().first()
    if row is None:
        row = GlobalSetting(key=_GLOBAL_ANALYSIS_PROMPT_KEY, value=payload.value)
        db.add(row)
    else:
        row.value = payload.value
    await db.commit()
    return {"key": _GLOBAL_ANALYSIS_PROMPT_KEY, "value": payload.value}


# --- اقدامات مالک (owner-actions queue, data-safety phase 0) ---------------
#
# The 2026-07-20 audit found merged capabilities silently OFF because their
# one-time owner action (env var / Google-console click) lived only in
# docs/overhaul/AUDIT_LOG.md. This endpoint surfaces that queue inside the
# product with live checks where the app can actually verify the state.

@router.get("/api/settings/owner-actions", tags=["settings"])
@handle_errors
async def owner_actions(db: AsyncSession = Depends(get_db)) -> dict:
    import os

    from app.config import settings as _settings

    actions: list[dict] = []

    def add(key: str, title: str, done, how: str, detail: str = "") -> None:
        actions.append({
            "key": key, "title": title, "done": done,
            "how": how, "detail": detail,
        })

    # 1) Telegram bot token (env).
    add(
        "telegram_token",
        "توکن بات تلگرام",
        bool((os.environ.get("TELEGRAM_BOT_TOKEN") or "").strip()),
        "در Render → Environment مقدار TELEGRAM_BOT_TOKEN را ست کن (از BotFather).",
        "بدون آن: کپچر تلگرام، بریف صبح و هشدارهای تلگرامی خاموش‌اند.",
    )
    # 2) Google connection (refresh token stored + encrypted).
    google_connected = False
    try:
        from app.services.drive_settings_service import resolve_refresh_token

        google_connected = bool(await resolve_refresh_token(db))
    except Exception:
        google_connected = False
    add(
        "google_connection",
        "اتصال گوگل (درایو/جیمیل/تقویم)",
        google_connected,
        "تنظیمات → گوگل → «اتصال به گوگل» و تیک همهٔ دسترسی‌ها.",
        "بدون آن: همگام‌سازی ایمیل/تقویم، گزارش روز و بکاپ روی Drive خاموش‌اند.",
    )
    # 3) OAuth consent published (cannot be checked from here — instruction).
    add(
        "oauth_consent_published",
        "انتشار OAuth consent (پایان انقضای هفتگی توکن گوگل)",
        None,
        "console.cloud.google.com → APIs & Services → OAuth consent screen → "
        "Publish app (از حالت Testing خارج شود).",
        "در حالت Testing، refresh token هر ~۷ روز می‌میرد و اتصال گوگل هفتگی می‌شکند.",
    )
    # 4) REQUIRE_AUTH flipped on.
    add(
        "require_auth",
        "فعال‌سازی REQUIRE_AUTH (بستن دسترسی ناشناس)",
        bool(_settings.REQUIRE_AUTH),
        "بعد از ساخت حساب و ورود موفق در مرورگر/گوشی، در Render → Environment مقدار "
        "REQUIRE_AUTH=true را ست کن.",
        "تا خاموش است، درخواست بدون توکن به دادهٔ user-0 می‌رسد.",
    )
    # 5) Register invite gate.
    add(
        "register_invite",
        "کد دعوت ثبت‌نام (بستن register باز)",
        bool(_settings.REGISTER_INVITE_CODE),
        "در Render → Environment مقدار REGISTER_INVITE_CODE را ست کن.",
        "بدون آن هر غریبه‌ای می‌تواند حساب بسازد.",
    )
    # 6) Nightly backup healthy (live check via backup service if present).
    backup_done = None
    backup_detail = "وضعیت بکاپ در دسترس نیست."
    try:
        from app.services.backup_service import get_status as _backup_status

        st = await _backup_status(db)
        backup_done = bool(st.get("last_ok_at")) and not st.get("is_stale", True)
        backup_detail = (
            f"آخرین بکاپ موفق: {st.get('last_ok_at') or '—'}"
            + (" (قدیمی!)" if st.get("is_stale") else "")
        )
    except Exception:
        pass
    add(
        "backup_fresh",
        "بکاپ شبانهٔ دادهٔ زندگی",
        backup_done,
        "اتصال گوگل را برقرار کن؛ بکاپ شبانه خودکار اجرا می‌شود "
        "(دکمهٔ «بکاپ فوری» هم در همین تنظیمات هست).",
        backup_detail,
    )
    # 7) Keep-alive ping (cannot verify from inside — instruction).
    add(
        "keepalive",
        "پینگ بیدارباش free-tier (GitHub Actions)",
        None,
        "GitHub → repo Settings → Secrets and variables → Actions → Variables → "
        "KEEPALIVE_URL = https://<app>.onrender.com/api/health",
        "بدون آن سرویس در بی‌کاری می‌خوابد و بریف ۷ صبح تا اولین بازدید تو عقب می‌افتد.",
    )

    pending = [a for a in actions if a["done"] is False]
    return {
        "ok": True,
        "actions": actions,
        "pending_count": len(pending),
    }


@router.get("/api/settings/jobs-status", tags=["settings"])
@handle_errors
async def jobs_status(db: AsyncSession = Depends(get_db)) -> dict:
    """وضعیت موتور واحد زمان‌بندی (jobs engine) — کدام کار کی اجرا شده."""
    from app.services.jobs_engine import get_jobs_status

    return await get_jobs_status(db)


@router.get("/api/settings/ai-usage", tags=["settings"])
@handle_errors
async def ai_usage_summary(db: AsyncSession = Depends(get_db)) -> dict:
    """خلاصهٔ مصرف AI هفت روز اخیر به تفکیک task — حسابداری مصرف روی
    اشتراک شخصی مالک (phase 1)."""
    from datetime import datetime, timedelta, timezone

    from sqlalchemy import case as _case
    from sqlalchemy import func as _func

    from app.models.ai_usage import AIUsageLog

    since = datetime.now(timezone.utc) - timedelta(days=7)
    rows = (
        await db.execute(
            select(
                AIUsageLog.task,
                _func.count(AIUsageLog.id),
                _func.sum(AIUsageLog.prompt_chars),
                _func.sum(AIUsageLog.output_chars),
                _func.sum(_case((AIUsageLog.ok.is_(False), 1), else_=0)),
            )
            .where(AIUsageLog.created_at >= since)
            .group_by(AIUsageLog.task)
            .order_by(_func.count(AIUsageLog.id).desc())
        )
    ).all()
    total_calls = sum(int(r[1] or 0) for r in rows)
    return {
        "ok": True,
        "since": since.isoformat(),
        "total_calls_7d": total_calls,
        "by_task": [
            {
                "task": r[0],
                "calls": int(r[1] or 0),
                "prompt_chars": int(r[2] or 0),
                "output_chars": int(r[3] or 0),
                "est_tokens": (int(r[2] or 0) + int(r[3] or 0)) // 4,
                "failures": int(r[4] or 0),
            }
            for r in rows
        ],
    }
