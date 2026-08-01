"""«من که هستم» — گردآورنده، نه موتورِ استخراجِ موازی.

چرا این پکیج وجود دارد (۲۰۲۶-۰۸-۰۱، پس از نقدِ صریحِ مالک)
============================================================
نسخهٔ اول یک صفحهٔ تازه بود که استخراج‌کننده‌های **خودش** را داشت و رونوشتِ
کم‌عمقِ سطح‌هایی را نگه می‌داشت که از قبل وجود داشتند. نتیجه دو خرابی بود که
مالک هر دو را دید:

1. **کم‌عمق.** «نقاط قوت» یک عددِ خام بود (`شاخص پشتکار ۱۰/۱۰۰`) بدون هیچ
   آستانه‌ای — نمرهٔ پایین به‌عنوان نقطهٔ قوت. سه فیلد هم ساختاراً مرده بودند
   (ستونی که وجود نداشت، `assessment_type`ی که هیچ‌جا نوشته نمی‌شد، سه کلیدِ
   غلط) و یک `except` صدایشان را می‌خورد.
2. **موازی‌کاری.** «خودنگاره»، «پروندهٔ زندگی»، «نوشته‌های من» و ستون‌های
   قدیمیِ `users` هرکدام تکه‌ای از همین تصویر را داشتند و جزیره مانده بودند؛
   این صفحه به‌جای وصل‌کردنشان، جزیرهٔ تازه‌ای شد.

قرارداد این پکیج
================
* **هیچ داده‌ای اینجا ذخیره نمی‌شود.** تنها استثنا حرفِ خودِ مالک است که در
  `owner_identity_fields` می‌نشیند و همیشه بر هر چیزِ محاسبه‌شده مقدم است.
* **هر منبع یک provider است** که در رجیستری ثبت می‌شود. منبعِ تازه = یک فایلِ
  تازه + یک ثبت؛ نه شاخهٔ `if` در جای دیگر، نه ویرایشِ این فایل. این همان
  الگویی است که مسیریابِ مرکزیِ سیگنال و نقشهٔ زندهٔ سیستم دارند، و همان
  چیزی است که مالک خواست: «هر چیزی که بعداً اضافه می‌شود و مرتبط با من است».
* **هر ادعا منبع دارد و درِ ورودی دارد.** هیچ کارتی بدونِ `source` و بدونِ
  لینک به صفحه‌ای که صاحبِ آن داده است ساخته نمی‌شود — این تضمینِ ضدِ
  جزیره‌ای‌شدن است.
* **«نمی‌دانم» جوابِ درستی است.** provider که شواهدِ کافی ندارد باید
  ``None`` برگرداند تا سؤال شود؛ عددِ بی‌معنا بدتر از خالی است.
"""
from __future__ import annotations

import asyncio
import importlib
import logging
import pkgutil
from typing import Any, Callable, Dict, List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.owner_insight.base import Facet, FacetGroup, Provider

logger = logging.getLogger(__name__)

_REGISTRY: Dict[str, Provider] = {}
_LOADED = False


def register(provider: Provider) -> Provider:
    """ثبتِ یک منبع. تکراری بی‌سروصدا جایگزین می‌شود (بارگذاریِ دوباره در تست)."""
    _REGISTRY[provider.key] = provider
    return provider


def _load_providers() -> None:
    """همهٔ ماژول‌های زیرِ providers/ را import کن.

    کشفِ خودکار عمدی است: افزودنِ منبعِ تازه نباید نیاز به ویرایشِ این فایل
    داشته باشد، وگرنه همان چیزی می‌شود که مالک از آن شکایت کرد — فهرستِ ثابتی
    که با رشدِ برنامه عقب می‌مانَد.
    """
    global _LOADED
    if _LOADED:
        return
    # با نامِ کامل import می‌شود، نه نسبی: در همین ماژول یک تابعِ `providers`
    # هم هست و `from . import providers` به آن تابع می‌رسد، نه به زیرپکیج.
    pkg = importlib.import_module("app.services.owner_insight.providers")

    for mod in pkgutil.iter_modules(pkg.__path__):
        if mod.name.startswith("_"):
            continue
        try:
            importlib.import_module(f"{pkg.__name__}.{mod.name}")
        except Exception as exc:  # یک منبعِ خراب نباید کلِ پروفایل را بخواباند
            logger.warning("owner-insight provider %s failed to load: %r", mod.name, exc)
    _LOADED = True


def providers() -> List[Provider]:
    _load_providers()
    return sorted(_REGISTRY.values(), key=lambda p: (p.group_order, p.key))


async def collect(
    db: AsyncSession, uid: int = 0, *, only: Optional[str] = None
) -> Dict[str, Any]:
    """همهٔ providerها را موازی صدا بزن و تصویرِ یکپارچه را بساز.

    هیچ provider ای نمی‌تواند بقیه را زمین بزند: استثنا و مهلتِ زمانی هر دو
    مهار می‌شوند و منبعِ خراب فقط با یک یادداشتِ صادقانه غایب می‌ماند.
    """
    chosen = [p for p in providers() if only is None or p.key == only]

    async def _run(p: Provider):
        try:
            return await asyncio.wait_for(p.collect(db, uid), timeout=p.timeout_s)
        except asyncio.TimeoutError:
            logger.debug("owner-insight provider %s timed out", p.key)
            return None
        except Exception as exc:
            logger.debug("owner-insight provider %s failed: %r", p.key, exc)
            return None

    results = await asyncio.gather(*[_run(p) for p in chosen])

    facets: List[Facet] = []
    failed: List[str] = []
    for p, res in zip(chosen, results):
        if res is None:
            failed.append(p.key)
            continue
        facets.extend(res)

    return {
        "facets": [f.as_dict() for f in facets],
        "groups": _grouped(facets),
        "sources": [
            {"key": p.key, "label": p.label, "owns_page": p.owns_page,
             "ok": p.key not in failed}
            for p in chosen
        ],
        "unavailable": failed,
    }


def _grouped(facets: List[Facet]) -> List[Dict[str, Any]]:
    order = [g.value for g in FacetGroup]
    buckets: Dict[str, List[Dict[str, Any]]] = {g: [] for g in order}
    for f in facets:
        buckets.setdefault(f.group, []).append(f.as_dict())
    return [
        {"group": g, "label": FacetGroup.label(g), "items": buckets[g]}
        for g in order
        if buckets.get(g)
    ]


__all__ = ["register", "providers", "collect", "Facet", "FacetGroup", "Provider"]
