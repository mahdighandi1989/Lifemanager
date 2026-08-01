"""/api/places — مکان‌ها، سفرها، و **خطِ حرکت**.

چرا این روتر ساخته شد (۲۰۲۶-۰۸-۰۱، نقدِ صریحِ مالک)
====================================================
نقاطِ موقعیت جمع می‌شدند، خوشه می‌شدند، الگو می‌شدند — و بعد **هیچ راهی برای
دیدنشان نبود**. هیچ روتی نقاط یا سفرها را برنمی‌گرداند و هیچ صفحه‌ای نقشه
نمی‌کشید، پس تنها چیزی که مالک می‌دید یک سطرِ لاگ بود: «۱۱ نقطهٔ موقعیت».
داده وارد می‌شد و ناپدید می‌شد.

توجه (درسِ system_map): این ماژول نباید ``from __future__ import annotations``
داشته باشد — @handle_errors annotationها را در فضای نامِ app/middleware.py حل
می‌کند و آنجا Request/AsyncSession تعریف نیستند، پس همه‌چیز ۴۲۲ می‌شود.
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_required_user_id
from app.middleware import handle_errors

logger = logging.getLogger(__name__)

router = APIRouter()


def _scope(col, uid: int):
    from sqlalchemy import or_

    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


def _local(moment, offset_minutes: int):
    if moment is None:
        return None
    aware = moment if moment.tzinfo else moment.replace(tzinfo=timezone.utc)
    return aware + timedelta(minutes=offset_minutes)


@router.get("/api/places", tags=["places"])
@handle_errors
async def list_places(
    days: int = Query(default=30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """مکان‌های کشف‌شده + سفرهای اخیر، با **نام و نشانی** — نه فقط مختصات."""
    from app.models.place import Place, Trip
    from app.services.place_service import TZ_OFFSET_MINUTES

    since = datetime.now(timezone.utc) - timedelta(days=days)

    places = (
        await db.execute(
            select(Place)
            .where(_scope(Place.user_id, user_id))
            .order_by(Place.total_minutes.desc().nullslast())
            .limit(200)
        )
    ).scalars().all()
    by_id = {p.id: p for p in places}

    def _name(pid) -> str:
        row = by_id.get(pid)
        if row is None:
            return "جایی ناشناس"
        return row.label or (row.address or "")[:80] or (
            f"نقطهٔ {row.latitude:.4f}, {row.longitude:.4f}"
        )

    trips = (
        await db.execute(
            select(Trip)
            .where(_scope(Trip.user_id, user_id), Trip.started_at >= since)
            .order_by(Trip.started_at.desc())
            .limit(200)
        )
    ).scalars().all()

    # آیا نشانیِ متنی اصلاً ممکن است؟ بدونِ کلیدِ Maps هرگز نمی‌آید و مالک
    # باید **بداند** چرا — نه اینکه منتظرِ چیزی بماند که هیچ‌وقت نمی‌رسد.
    try:
        from app.services.google_maps_service import _maps_key

        addresses_available = bool(_maps_key())
    except Exception:
        addresses_available = False
    missing_address = sum(1 for p in places if not p.address)

    return {
        "ok": True,
        "success": True,
        "tz_offset_minutes": TZ_OFFSET_MINUTES,
        "addresses_available": addresses_available,
        "places_without_address": missing_address,
        "places": [
            {
                "id": p.id,
                "label": p.label,
                "address": p.address,
                "kind": p.kind,
                "lat": p.latitude,
                "lon": p.longitude,
                "radius_m": p.radius_m,
                "visit_count": p.visit_count,
                "total_minutes": round(p.total_minutes or 0, 1),
                "owner_locked": bool(p.owner_locked),
                "last_seen_at": p.last_seen_at.isoformat() if p.last_seen_at else None,
                # وقتی نشانی هست، «نقطهٔ ۲۵٫۲…» دیگر لازم نیست — ولی مختصات
                # همیشه برمی‌گردد چون نقشه به آن نیاز دارد.
                "display": p.label or (p.address or "")[:80]
                or f"نقطهٔ {p.latitude:.4f}, {p.longitude:.4f}",
            }
            for p in places
        ],
        "trips": [
            {
                "id": t.id,
                "from": _name(t.from_place_id),
                "to": _name(t.to_place_id),
                "from_id": t.from_place_id,
                "to_id": t.to_place_id,
                "started_at": t.started_at.isoformat() if t.started_at else None,
                "ended_at": t.ended_at.isoformat() if t.ended_at else None,
                "started_local": (
                    _local(t.started_at, TZ_OFFSET_MINUTES).strftime("%H:%M")
                    if t.started_at else None
                ),
                "minutes": round(t.minutes or 0),
                "distance_km": round(t.distance_km or 0, 1),
                "is_anomaly": bool(t.is_anomaly),
                "note": t.note,
                "device": t.device,
            }
            for t in trips
        ],
    }


@router.get("/api/places/track", tags=["places"])
@handle_errors
async def location_track(
    days: int = Query(default=2, ge=1, le=30),
    device: str = Query(default=""),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """نقاطِ خامِ مسیر، به‌ترتیبِ زمان — ورودیِ «خطِ حرکت».

    این چیزی است که تا امروز هیچ‌جا برنمی‌گشت، و بدونِ آن رسمِ مسیر ممکن نبود.
    به تفکیکِ دستگاه، چون مالک ممکن است با چند گوشی جابه‌جا شود.
    """
    from app.models.user_location import UserLocation

    since = datetime.now(timezone.utc) - timedelta(days=days)
    q = (
        select(UserLocation)
        .where(_scope(UserLocation.user_id, user_id), UserLocation.timestamp >= since)
        .order_by(UserLocation.timestamp.asc())
        .limit(5000)
    )
    if device:
        q = q.where(UserLocation.device == device)
    rows = (await db.execute(q)).scalars().all()

    tracks: Dict[str, List[Dict[str, Any]]] = {}
    for r in rows:
        if r.latitude is None or r.longitude is None:
            continue
        tracks.setdefault(r.device or "نامشخص", []).append(
            {
                "lat": r.latitude,
                "lon": r.longitude,
                "at": r.timestamp.isoformat() if r.timestamp else None,
                "speed_kmh": round(r.speed_kmh, 1) if r.speed_kmh is not None else None,
                "accuracy_m": round(r.accuracy_m) if r.accuracy_m is not None else None,
            }
        )
    return {
        "ok": True,
        "success": True,
        "days": days,
        "total_points": sum(len(v) for v in tracks.values()),
        "tracks": [{"device": k, "points": v} for k, v in tracks.items()],
    }
