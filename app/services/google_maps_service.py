"""Google Maps integration for location-based recommendations.

Audit task 2165524b (AC 8). ``geocode_address`` + ``find_nearby_places`` back
the location-aware suggestions. ``GOOGLE_MAPS_API_KEY`` gates real calls;
without it (the default) these return a deterministic empty result so a
key-less deploy still boots and the recommendation engine simply skips
location-based suggestions instead of erroring.
"""
from __future__ import annotations

import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
_NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"


def _maps_key() -> str:
    try:
        from app.config import settings

        return getattr(settings, "GOOGLE_MAPS_API_KEY", "") or ""
    except Exception:
        return ""


def _timeout() -> float:
    try:
        from app.config import settings

        return float(getattr(settings, "EXTERNAL_API_TIMEOUT", 30.0))
    except Exception:
        return 30.0


async def geocode_address(address: str) -> Optional[dict]:
    """Resolve an address to ``{lat, lng, formatted_address}`` or None.

    Returns None when no API key is configured or the address is blank — the
    caller treats that as "location features unavailable".
    """
    if not _maps_key() or not (address or "").strip():
        return None
    try:
        import httpx

        async with httpx.AsyncClient(timeout=_timeout()) as client:
            resp = await client.get(
                _GEOCODE_URL, params={"address": address, "key": _maps_key()}
            )
        data = resp.json()
        results = data.get("results") or []
        if not results:
            return None
        loc = results[0]["geometry"]["location"]
        return {
            "lat": loc["lat"],
            "lng": loc["lng"],
            "formatted_address": results[0].get("formatted_address"),
        }
    except Exception as exc:  # network / quota / shape — degrade, don't crash
        logger.warning("geocode_address failed for %r: %r", address, exc)
        return None


async def find_nearby_places(
    lat: float, lng: float, *, keyword: str = "", radius_m: int = 1500
) -> List[dict]:
    """Return nearby places ``[{name, place_id, lat, lng}]`` for a point.

    Returns ``[]`` when no API key is configured — no location-based
    suggestions, but never an error.
    """
    if not _maps_key():
        return []
    try:
        import httpx

        params = {
            "location": f"{lat},{lng}",
            "radius": radius_m,
            "key": _maps_key(),
        }
        if keyword:
            params["keyword"] = keyword
        async with httpx.AsyncClient(timeout=_timeout()) as client:
            resp = await client.get(_NEARBY_URL, params=params)
        out: List[dict] = []
        for item in (resp.json().get("results") or [])[:10]:
            loc = item.get("geometry", {}).get("location", {})
            out.append(
                {
                    "name": item.get("name"),
                    "place_id": item.get("place_id"),
                    "lat": loc.get("lat"),
                    "lng": loc.get("lng"),
                }
            )
        return out
    except Exception as exc:
        logger.warning("find_nearby_places failed at (%s,%s): %r", lat, lng, exc)
        return []
