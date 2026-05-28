"""Context orchestrator — fuse the per-signal services into suggestions."""
from __future__ import annotations

from typing import Any, Optional

from app.services.context_engine.activity_service import ActivityService
from app.services.context_engine.audio_context_service import AudioContextService
from app.services.context_engine.biometric_service import BiometricService
from app.services.context_engine.location_service import LocationService


class ContextOrchestrator:
    """Combine the location / biometric / activity / audio signals into a
    deterministic list of task suggestions. Pure rules for now — no upstream
    AI call — so it is fast and testable, and a model-backed ranker can slot
    in later behind the same interface."""

    def __init__(self) -> None:
        self.location = LocationService()
        self.biometric = BiometricService()
        self.activity = ActivityService()
        self.audio = AudioContextService()

    def analyze(self, payload: dict[str, Any]) -> dict:
        loc = payload.get("location") or {}
        signals = {
            "location": self.location.classify(loc.get("lat"), loc.get("lng")),
            "biometric": self.biometric.assess(payload.get("heart_rate")),
            "activity": self.activity.infer(payload.get("activity")),
            "audio": self.audio.classify(payload.get("noise_db")),
        }
        return {"signals": signals, "suggestions": self._suggest(signals)}

    @staticmethod
    def _suggest(signals: dict) -> list[dict]:
        suggestions: list[dict] = []
        bio = signals["biometric"]["state"]
        ambiance = signals["audio"]["ambiance"]
        activity = signals["activity"]["state"]

        if bio == "resting" and ambiance in ("quiet", "unknown"):
            suggestions.append(
                {"kind": "focus", "reason": "resting + quiet", "text": "زمان مناسبی برای کار عمیق و تمرکز است."}
            )
        if bio == "elevated" or activity in ("running", "walking"):
            suggestions.append(
                {"kind": "movement", "reason": "elevated/active", "text": "در حال تحرک هستید — کارهای سبک یا یادآوری‌های صوتی را انجام دهید."}
            )
        if ambiance == "loud":
            suggestions.append(
                {"kind": "defer", "reason": "loud", "text": "محیط شلوغ است — کارهای نیازمند تمرکز را به بعد موکول کنید."}
            )
        if not suggestions:
            suggestions.append(
                {"kind": "general", "reason": "default", "text": "سیگنال کافی برای پیشنهاد خاص نیست؛ به برنامهٔ امروز ادامه دهید."}
            )
        return suggestions


def analyze_context(payload: Optional[dict] = None) -> dict:
    """Module-level helper used by the route + the Celery job."""
    return ContextOrchestrator().analyze(payload or {})
