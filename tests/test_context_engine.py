"""Context engine + /api/v1/context/analyze (audit task 2165524b, AC1/AC3)."""
from app.services.context_engine import (
    ActivityService,
    AudioContextService,
    BiometricService,
    ContextOrchestrator,
    LocationService,
)


def test_biometric_buckets():
    bio = BiometricService()
    assert bio.assess(60)["state"] == "resting"
    assert bio.assess(100)["state"] == "active"
    assert bio.assess(150)["state"] == "elevated"
    assert bio.assess(None)["state"] == "unknown"


def test_audio_and_activity_and_location_signals():
    assert AudioContextService().classify(40)["ambiance"] == "quiet"
    assert AudioContextService().classify(90)["ambiance"] == "loud"
    assert ActivityService().infer("running")["state"] == "running"
    assert LocationService().classify(None, None)["has_fix"] is False
    assert LocationService().classify(35.7, 51.4)["has_fix"] is True


def test_orchestrator_resting_quiet_suggests_focus():
    out = ContextOrchestrator().analyze({"heart_rate": 60, "noise_db": 30})
    kinds = {s["kind"] for s in out["suggestions"]}
    assert "focus" in kinds
    assert out["signals"]["biometric"]["state"] == "resting"


def test_orchestrator_always_returns_at_least_one_suggestion():
    out = ContextOrchestrator().analyze({})
    assert len(out["suggestions"]) >= 1


def test_analyze_endpoint_returns_200_with_suggestions(api_client):
    """AC3: POST /api/v1/context/analyze with location + heart_rate -> 200
    and a suggestion list."""
    resp = api_client.post(
        "/api/v1/context/analyze",
        json={"location": {"lat": 35.7, "lng": 51.4}, "heart_rate": 65},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert "suggestions" in body and isinstance(body["suggestions"], list)
    assert len(body["suggestions"]) >= 1
    assert "signals" in body
