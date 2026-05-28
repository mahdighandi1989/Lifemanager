"""Audio signal — turn an ambient noise level into a focus hint."""
from __future__ import annotations

from typing import Optional


class AudioContextService:
    """Map an ambient decibel reading to a focus-friendliness hint."""

    QUIET_MAX_DB = 50
    MODERATE_MAX_DB = 70

    def classify(self, noise_db: Optional[float]) -> dict:
        if noise_db is None:
            return {"signal": "audio", "ambiance": "unknown"}
        if noise_db <= self.QUIET_MAX_DB:
            ambiance = "quiet"
        elif noise_db <= self.MODERATE_MAX_DB:
            ambiance = "moderate"
        else:
            ambiance = "loud"
        return {"signal": "audio", "ambiance": ambiance, "noise_db": noise_db}
