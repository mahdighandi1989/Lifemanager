"""/api/facets — «آنچه برنامه دربارهٔ تو می‌داند»، برای هر صفحه‌ای.

توجه (درسِ system_map و owner_identity): این ماژول نباید
``from __future__ import annotations`` داشته باشد — @handle_errors
annotationها را در فضای نامِ app/middleware.py حل می‌کند و آنجا
Request/AsyncSession تعریف نیستند، پس همه‌چیز ۴۲۲ می‌شود.

چرا این روت وجود دارد
─────────────────────
`owner_insight.collect()` — هفت منبع، حدود ۳٬۶۰۰ خطِ تست‌شده که مکان‌ها،
عادت‌ها، نوشته‌ها و مدارکِ مالک را می‌خوانند — تا امروز **یک** صداکننده داشت:
`GET /api/identity-profile`. همهٔ آن ماشین از یک صفحه قابلِ دسترس بود. این
روت دهانِ دوم است.

چرا خروجی **گزینش‌شده** است و نه همه‌چیز
──────────────────────────────────────
با یک پایگاه‌دادهٔ کم‌داده (۸ ردیف: ۳ کار + ۴ قلمِ فهرست) خروجیِ خامِ
`collect()` **دقیقاً یک جمله** است:

    «پشتکارت این دوره پایین بوده؛ … از هر ۱۰ تا حدود ۰ تا را نگه داشته‌ای.»

یعنی تنها چیزی که برنامه دربارهٔ مالک می‌گوید، یک نمرهٔ ارادهٔ پایین است.
این همان «شاخص پشتکار ۱۰/۱۰۰» است که مالک درباره‌اش گفت «احمقانه» — فقط
این بار در قالبِ جمله. کلِ مجموعه‌تست هم سبز می‌ماند. پس گزینش خودِ
قابلیت است، نه یک تنظیمِ سلیقه‌ای.

هیچ‌چیز حذف نشده (قاعدهٔ ۲)
──────────────────────────
`/api/identity-profile` مثلِ قبل **همه‌چیز** را برمی‌گرداند؛ آن صفحه کارش
کامل‌بودن است. اینجا فقط پیش‌فرض تنگ‌تر است و با `?groups=` یا
`?include=` هر چیزی دوباره برمی‌گردد. علتِ کنارگذاشتنِ هرکدام در
docs/overhaul/REMOVAL_CANDIDATES.md ثبت است.
"""
import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_required_user_id
from app.middleware import handle_errors

logger = logging.getLogger(__name__)

router = APIRouter()

# گروه‌هایی که به‌طور پیش‌فرض بیرون می‌مانند — نه چون خراب‌اند، چون جای
# دیگری دارند:
#   * unlinked — گزارشِ ستون‌های بی‌مصرفِ خودِ برنامه، خطاب به «تو» و پر از
#     نامِ جدول. یک بار خواندنی است، هر روز دیدنش نه. صاحبش /system-map است.
#   * facts   — رونوشتِ مدارکِ هویتی. مالک نامش، تاریخِ تولدش و ملیتش را
#     می‌داند؛ و چون این روت روی این استقرار بدونِ توکن هم پاسخ می‌دهد
#     (REQUIRE_AUTH=False)، بیرون‌گذاشتنش یک تصمیمِ حریمِ خصوصی هم هست.
QUIET_GROUPS = ("unlinked", "facts")

# کارت‌هایی که **معیوب**اند، نه صرفاً پرحرف. با شواهدِ اجراشده:
#   * self_model_diligence — جملهٔ «این دوره» دروغ است: compute_diligence
#     هیچ پنجرهٔ زمانی ندارد (self_model_service.py) و نسبت‌ها مادام‌العمرند،
#     پس نمره هرگز نمی‌تواند بهتر شود. با ۸ ردیف هم شلیک می‌کند، درحالی‌که
#     معادلش در habits حداقلِ ۱۵ قلم می‌خواهد.
#   * self_model_interests — دسته‌بند با زیررشته کار می‌کند، پس «برنامه‌ریزی»
#     می‌شود «فناوری» و «خدا»/«خانواده»/«سلامتی» می‌شوند general که دور
#     ریخته می‌شود. این کارت ساختاراً نمی‌تواند دربارهٔ ایمان، خانواده یا
#     سلامتِ مالک چیزی بگوید.
# هر دو روی /api/identity-profile سرِ جای‌شان هستند (قاعدهٔ ۲: قرنطینه، نه حذف).
QUARANTINED_KEYS = ("self_model_diligence", "self_model_interests")


def _split(raw: Optional[str]) -> List[str]:
    return [p.strip() for p in (raw or "").split(",") if p.strip()]


def curate(
    facets: List[Dict[str, Any]],
    *,
    groups: Optional[List[str]] = None,
    include: Optional[List[str]] = None,
    surface: str = "",
) -> List[Dict[str, Any]]:
    """پیش‌فرضِ تنگ، با درِ بازگشت.

    ``groups`` صریح یعنی «دقیقاً همین‌ها» (پس `?groups=unlinked` گزارشِ
    ستون‌های بی‌مصرف را برمی‌گرداند). ``include`` یک کارتِ قرنطینه‌شده را
    اسم‌به‌اسم برمی‌گرداند. ``surface`` فقط کارت‌هایی را می‌گذارد که نویسنده‌شان
    صراحتاً آن سطح را در `surfaces` نوشته باشد.
    """
    include = include or []
    if groups:
        wanted = set(groups)
        out = [f for f in facets if f.get("group") in wanted]
    else:
        out = [f for f in facets if f.get("group") not in QUIET_GROUPS]
    out = [
        f for f in out
        if f.get("key") not in QUARANTINED_KEYS or f.get("key") in include
    ]
    if surface:
        out = [f for f in out if surface in (f.get("surfaces") or [])]
    return out


@router.get("/api/facets", tags=["facets"])
@handle_errors
async def read_facets(
    groups: Optional[str] = Query(default=None, description="فقط این گروه‌ها (با کاما)"),
    include: Optional[str] = Query(default=None, description="برگرداندنِ کارتِ قرنطینه‌شده"),
    surface: str = Query(default="", description="فقط کارت‌هایی که این سطح را اعلام کرده‌اند"),
    limit: int = Query(default=0, ge=0, le=100),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """کارت‌های گزینش‌شده — هر کارت یک جمله، شواهدش، و دری به سرچشمه‌اش.

    ``degraded`` را از ``unavailable`` جدا نگه می‌داریم: `collect()` برای
    «داده‌ای ندارم» و «ترکیدم» هر دو ``None`` برمی‌گرداند و هر دو در
    ``unavailable`` می‌نشینند، پس مصرف‌کننده نمی‌تواند «ساکت» را از «خراب»
    تشخیص دهد. ``degraded`` یعنی گردآورنده اصلاً بالا نیامد.
    """
    payload: Dict[str, Any] = {"facets": [], "sources": [], "unavailable": []}
    degraded = False
    try:
        from app.services import owner_insight

        payload = await owner_insight.collect(db, user_id)
    except Exception as exc:  # گردآورنده هرگز نباید صفحهٔ میزبان را بخواباند
        logger.warning("facets collect failed: %r", exc)
        degraded = True

    facets = curate(
        payload.get("facets") or [],
        groups=_split(groups),
        include=_split(include),
        surface=surface,
    )
    if limit:
        facets = facets[:limit]
    return {
        "ok": True,
        "success": True,
        "degraded": degraded,
        "facets": facets,
        "sources": payload.get("sources") or [],
        # «ساکت» نه «خراب»: منبعی که دادهٔ کافی ندارد عمداً چیزی نمی‌گوید.
        "quiet": payload.get("unavailable") or [],
        "unavailable": payload.get("unavailable") or [],
    }
