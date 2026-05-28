"""Coverage for /api/location + /api/location/history (task 2165524b)."""
from __future__ import annotations


def test_record_location_returns_201(api_client):
    resp = api_client.post(
        "/api/location",
        json={"latitude": 37.42, "longitude": -122.08, "accuracy_m": 12.5},
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["latitude"] == 37.42
    assert body["accuracy_m"] == 12.5


def test_location_history_returns_user_pings(api_client):
    api_client.post("/api/location", json={"latitude": 1.0, "longitude": 2.0})
    api_client.post("/api/location", json={"latitude": 3.0, "longitude": 4.0})
    history = api_client.get("/api/location/history").json()
    assert len(history) >= 2
    # Sorted desc — most recent first.
    timestamps = [h["timestamp"] for h in history]
    assert timestamps == sorted(timestamps, reverse=True)


def test_location_rejects_invalid_lat_lng(api_client):
    resp = api_client.post(
        "/api/location", json={"latitude": 999, "longitude": -122}
    )
    assert resp.status_code in (400, 422)


def test_google_maps_api_key_setting_exists():
    """Static AC: GOOGLE_MAPS_API_KEY must appear on the Settings class
    so a deploy can wire it in via the env."""
    from app.config import settings

    assert hasattr(settings, "GOOGLE_MAPS_API_KEY")


def test_env_example_documents_google_maps_key():
    from pathlib import Path

    env = (Path(__file__).resolve().parent.parent / ".env.example").read_text()
    assert "GOOGLE_MAPS_API_KEY" in env
    assert "VITE_GOOGLE_MAPS_API_KEY" in env
