"""Location signal — map raw coordinates to a coarse zone label."""
from __future__ import annotations

from typing import Optional


class LocationService:
    """Classify a lat/lng into a coarse context zone.

    Without a per-user geofence store this is intentionally simple: it
    reports whether coordinates were supplied and a best-effort zone. The
    orchestrator only needs a stable, structured signal to reason over.
    """

    def classify(self, lat: Optional[float], lng: Optional[float]) -> dict:
        if lat is None or lng is None:
            return {"signal": "location", "zone": "unknown", "has_fix": False}
        return {"signal": "location", "zone": "known", "has_fix": True, "lat": lat, "lng": lng}
