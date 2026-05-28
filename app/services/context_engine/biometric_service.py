"""Biometric signal — interpret a heart-rate reading into a coarse state."""
from __future__ import annotations

from typing import Optional


class BiometricService:
    """Bucket a heart rate into resting / active / elevated.

    Thresholds are conservative adult defaults; the orchestrator uses the
    bucket (not the raw number) so a future per-user baseline can refine it
    without changing callers.
    """

    RESTING_MAX = 80
    ACTIVE_MAX = 120

    def assess(self, heart_rate: Optional[int]) -> dict:
        if heart_rate is None:
            return {"signal": "biometric", "state": "unknown"}
        if heart_rate <= self.RESTING_MAX:
            state = "resting"
        elif heart_rate <= self.ACTIVE_MAX:
            state = "active"
        else:
            state = "elevated"
        return {"signal": "biometric", "state": state, "heart_rate": heart_rate}
