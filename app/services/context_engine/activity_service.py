"""Activity signal — normalise a reported activity label."""
from __future__ import annotations

from typing import Optional


class ActivityService:
    """Normalise an activity hint into a known bucket.

    Accepts free-form labels ("walking", "در حال رانندگی", ...) and maps the
    common ones to a canonical token; anything unrecognised stays ``other``.
    """

    _MAP = {
        "still": "still",
        "ساکن": "still",
        "walking": "walking",
        "پیاده‌روی": "walking",
        "running": "running",
        "دویدن": "running",
        "driving": "driving",
        "رانندگی": "driving",
    }

    def infer(self, activity: Optional[str]) -> dict:
        if not activity:
            return {"signal": "activity", "state": "unknown"}
        token = self._MAP.get(activity.strip().lower(), "other")
        return {"signal": "activity", "state": token, "raw": activity}
