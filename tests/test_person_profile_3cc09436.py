"""PersonProfile + behavioural analysis (audit task 3cc09436).

Covers the canonical ACs: the PersonProfile model fields (AC1), the GET profile
contract (AC2), the analyze endpoint persisting score + relationship (AC3), and
the note-save path backing the form (AC6).
"""
from __future__ import annotations

from app.database import Base


# ── AC1: model fields ───────────────────────────────────────────────


def test_person_profile_model_fields():
    cols = {c.name for c in Base.metadata.tables["person_profiles"].columns}
    assert {
        "person_id", "ai_score", "user_notes", "behavior_log",
        "relationship_type", "last_analyzed_at",
    } <= cols


def _make_person(api_client, name="Ali"):
    r = api_client.post("/api/persons", json={"name": name})
    assert r.status_code == 201, r.text
    return r.json()["id"]


# ── AC2: GET profile ────────────────────────────────────────────────


def test_get_person_profile_returns_fields(api_client):
    pid = _make_person(api_client)
    r = api_client.get(f"/api/people/{pid}/profile")
    assert r.status_code == 200, r.text
    body = r.json()
    assert {"ai_score", "user_notes", "behavior_log", "relationship_type"} <= set(body.keys())


def test_get_profile_missing_person_404(api_client):
    assert api_client.get("/api/people/987654/profile").status_code == 404


# ── AC3: analyze persists score + relationship ──────────────────────


def test_analyze_person_profile_persists(api_client):
    pid = _make_person(api_client, "Sara")
    r = api_client.post(f"/api/people/{pid}/profile/analyze")
    assert r.status_code == 200, r.text
    body = r.json()
    assert "ai_score" in body and body["relationship_type"] in ("close", "regular", "distant", "neutral")
    assert body["last_analyzed_at"] is not None
    # the analysis snapshot is appended to behavior_log
    assert isinstance(body["behavior_log"], list) and len(body["behavior_log"]) >= 1

    # persisted: a fresh GET reflects the analysis
    got = api_client.get(f"/api/people/{pid}/profile").json()
    assert got["last_analyzed_at"] is not None


# ── AC6: note save ──────────────────────────────────────────────────


def test_save_user_note(api_client):
    pid = _make_person(api_client, "Reza")
    r = api_client.post(
        f"/api/people/{pid}/profile/note", json={"user_notes": "همکار قابل‌اعتماد"}
    )
    assert r.status_code == 200, r.text
    assert r.json()["user_notes"] == "همکار قابل‌اعتماد"
    # persisted
    got = api_client.get(f"/api/people/{pid}/profile").json()
    assert got["user_notes"] == "همکار قابل‌اعتماد"
