"""Wearable / physiological signal ingestion (audit task 2165524b, Steps 6-7).

The voice memo wanted a watch (Apple-Watch-like) to stream heart-rate into the
app so recommendations react to physical state ("این فیلم آدرنالین خونتو بیاره
بالا چون ضربان قلبت..."). The device pairing itself is an OS/hardware boundary
(see TO-DO/), but the ingestion seam + the state classification are in-repo: a
companion app / shortcut POSTs samples to /api/context/physiological and they
land on UserContext for the recommendation engine.
"""
from __future__ import annotations

from typing import Optional


def classify_physical_state(heart_rate: Optional[int]) -> str:
    """Coarse physical-state bucket from a heart-rate sample."""
    if heart_rate is None:
        return "unknown"
    if heart_rate >= 100:
        return "elevated"
    if heart_rate <= 55:
        return "resting"
    return "stable"


def normalize_physiological(signals: dict) -> dict:
    """Normalise an inbound wearable payload into the UserContext fields.
    Returns ``{heart_rate, activity_status, physical_state}``."""
    hr = signals.get("heart_rate")
    try:
        hr = int(hr) if hr is not None else None
    except (TypeError, ValueError):
        hr = None
    return {
        "heart_rate": hr,
        "activity_status": signals.get("activity_status") or signals.get("activity"),
        "physical_state": classify_physical_state(hr),
    }
