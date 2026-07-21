"""/api/system-map — نقشهٔ سیستم درون‌اپ (phase 4, completeness-critic #8).

The owner's complaint «یادم نمی‌مونه چی کجاست» can't be fixed by docs
that live in git. This endpoint is the product's self-description: every
capability, where it lives, whether it's automated, plus live row counts
so the map doubles as a data census. The نقشهٔ سیستم page renders it.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import enforce_auth_when_required, get_optional_user_id
from app.middleware import handle_errors

logger = logging.getLogger(__name__)

router = APIRouter()


async def _count(db: AsyncSession, model, *filters) -> int:
    try:
        stmt = select(func.count()).select_from(model)
        for f in filters:
            stmt = stmt.where(f)
        return int((await db.execute(stmt)).scalar() or 0)
    except Exception:
        return -1  # جدول در دسترس نیست


@router.get("/api/system-map", tags=["system-map"])
@handle_errors
async def system_map(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    counts: dict = {}
    try:
        from app.models.finance import FinancialAccount, Transaction
        from app.models.inbox_item import InboxItem
        from app.models.person import Person
        from app.models.personal_sync import PersonalEmail, PersonalEvent
        from app.models.personal_writing import PersonalWriting
        from app.models.project import Project
        from app.models.task import Task
        from app.models.todo_item import TodoItem
        from app.models.todo_list import TodoList

        counts = {
            "tasks": await _count(db, Task),
            "projects": await _count(db, Project),
            "lists": await _count(db, TodoList),
            "todo_items": await _count(db, TodoItem, TodoItem.deleted_at.is_(None)),
            "writings": await _count(db, PersonalWriting, PersonalWriting.deleted_at.is_(None)),
            "people": await _count(db, Person),
            "accounts": await _count(db, FinancialAccount),
            "transactions": await _count(db, Transaction),
            "emails_synced": await _count(db, PersonalEmail),
            "events_synced": await _count(db, PersonalEvent),
            "inbox_pending": await _count(db, InboxItem, InboxItem.status == "pending"),
        }
    except Exception as exc:
        logger.debug("system map counts skipped: %r", exc)

    sections = [
        {
            "key": "capture", "title": "ثبت و ورود",
            "items": [
                {"name": "کپچر تلگرام", "url": None, "auto": True,
                 "desc": "هر پیام تلگرام → تسک/صندوق ورودی با AI"},
                {"name": "صندوق ورودی", "url": "/", "auto": True,
                 "desc": "هرچه ثبت شود این‌جا تریاژ و بایگانی می‌شود"},
                {"name": "ایمپورت داده", "url": "/import", "auto": False,
                 "desc": "ورود فایل/اکسل/آرشیوها"},
            ],
        },
        {
            "key": "day", "title": "روزِ من",
            "items": [
                {"name": "میز فرمان «امروز من»", "url": "/", "auto": True,
                 "desc": "تسک‌ها + لیست‌ها + مالی + تقویم + افراد + رشد، یک‌جا"},
                {"name": "بریف صبح (تلگرام)", "url": "/attention", "auto": True,
                 "desc": "هر روز ساعت تنظیم‌شده + برنامهٔ پیشنهادی روز"},
                {"name": "گزارش شبانهٔ روز (ایمیل/تلگرام)", "url": "/settings?tab=drive", "auto": True,
                 "desc": "تقویم/ایمیل/مالی/افراد/توسعه + توصیهٔ AI"},
                {"name": "موتور توجه", "url": "/attention", "auto": True,
                 "desc": "۱۲ قاعدهٔ سررسید/انقضا/تولد/جریمه → زنگ + تلگرام"},
                {"name": "مرور هفتگی", "url": "/attention", "auto": True,
                 "desc": "روایت AI از هفته"},
            ],
        },
        {
            "key": "content", "title": "محتوا و دانش",
            "items": [
                {"name": "لیست‌ها (۳۳+ لیست سال‌ها)", "url": "/lists", "auto": False,
                 "desc": "گنجینهٔ اصلی — با موعد، ستاره، زیرآیتم"},
                {"name": "نوشته‌های من", "url": "/writings", "auto": False,
                 "desc": "نوشته‌های بلند شخصی (با سطل زباله و بکاپ)"},
                {"name": "رشد ذهن و خودسازی", "url": "/brain", "auto": True,
                 "desc": "چک‌این عادت‌ها + auto-tick شبانه"},
                {"name": "سطل زباله", "url": "/settings?tab=safety", "auto": True,
                 "desc": "هر حذف قابل بازیابی است"},
            ],
        },
        {
            "key": "life", "title": "زندگی و دارایی",
            "items": [
                {"name": "مالی (حساب‌ها/بودجه/گزارش ماهانه)", "url": "/budget", "auto": True,
                 "desc": "به تفکیک ارز + پول‌خوانی خودکار ایمیل بانکی"},
                {"name": "پروندهٔ زندگی (مدارک/اشتراک‌ها/خودرو)", "url": "/life-file", "auto": True,
                 "desc": "همهٔ مدارک + شمارش معکوس انقضا + تسک تمدید"},
                {"name": "افراد", "url": "/people-profiles", "auto": True,
                 "desc": "پروفایل + تولد/پیگیری → یادآور خودکار"},
                {"name": "پروژه‌ها و مرکز توسعه", "url": "/projects", "auto": True,
                 "desc": "پروژه‌های شخصی + آینهٔ GitHub/Render"},
            ],
        },
        {
            "key": "brain_ai", "title": "هوش مصنوعی",
            "items": [
                {"name": "دستیار سراسری (چت + /ask تلگرام)", "url": "/assistant", "auto": False,
                 "desc": "«وضعیت مالی‌ام چطوره؟» — پاسخ از دادهٔ زنده"},
                {"name": "تنظیمات مدل‌ها + مصرف AI", "url": "/ai-settings", "auto": False,
                 "desc": "هر قابلیت را به مدل دلخواه پین کن"},
                {"name": "جستجوی سراسری", "url": None, "auto": False,
                 "desc": "جعبهٔ بالای صفحه — همهٔ داده‌ها با یک عبارت"},
            ],
        },
        {
            "key": "safety", "title": "ایمنی و خودکاری",
            "items": [
                {"name": "بکاپ شبانه به Drive", "url": "/settings?tab=safety", "auto": True,
                 "desc": "کل دیتابیس، هر شب + دانلود دستی"},
                {"name": "اقدامات مالک", "url": "/settings?tab=safety", "auto": False,
                 "desc": "چک‌لیست کارهایی که فقط تو می‌توانی انجام دهی"},
                {"name": "موتور زمان‌بندی واحد", "url": "/settings?tab=safety", "auto": True,
                 "desc": "۷ کار خودکار (خودسازی/مالی/فایل/پیشنهاد/کوچ داده)"},
            ],
        },
    ]
    return {"ok": True, "counts": counts, "sections": sections}
