"""Context engine (audit task 2165524b).

A small, rule-based context engine that turns ambient signals (location,
biometrics, activity, audio) into actionable task suggestions. Each signal has
its own service; ``ContextOrchestrator`` fuses them. The services are
deliberately dependency-free and deterministic so the analyze endpoint and its
tests run without real sensors.
"""
from app.services.context_engine.activity_service import ActivityService
from app.services.context_engine.audio_context_service import AudioContextService
from app.services.context_engine.biometric_service import BiometricService
from app.services.context_engine.location_service import LocationService
from app.services.context_engine.orchestrator_service import ContextOrchestrator

__all__ = [
    "ActivityService",
    "AudioContextService",
    "BiometricService",
    "LocationService",
    "ContextOrchestrator",
]
