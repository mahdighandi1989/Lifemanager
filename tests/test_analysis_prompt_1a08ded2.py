"""task 1a08ded2 — admin-managed /api/ai/analysis_prompt (AC 24-28)."""
from __future__ import annotations


def _register(api_client, email: str, username: str) -> str:
    resp = api_client.post(
        "/auth/register",
        json={"email": email, "password": "hunter2-long", "username": username},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["access_token"]


# ── AC 24: model + service files exist and are importable ────────────

def test_analysis_prompt_model_and_service_exist():
    from app.models.analysis_prompt import AnalysisPrompt
    from app.services.ai.analysis_prompt_service import (
        get_analysis_prompt,
        set_analysis_prompt,
    )

    cols = set(AnalysisPrompt.__table__.columns.keys())
    assert {"id", "prompt_text", "edited_by_user_id", "last_edited_at"} <= cols
    assert callable(get_analysis_prompt) and callable(set_analysis_prompt)


# ── AC 25: GET returns 200 with empty default when none saved ────────

def test_get_analysis_prompt_default_empty(api_client):
    r = api_client.get("/api/ai/analysis_prompt")
    assert r.status_code == 200, r.text
    assert r.json()["prompt_text"] == ""


# ── AC 26: anonymous PUT -> 401, authenticated non-admin PUT -> 403 ──
# دو کدِ متفاوت برای دو وضعیتِ متفاوت: «هویت ندادی» در برابر «هویت دادی
# ولی اجازه نداری». یکی‌کردنشان همان اشتباهی بود که این تست را کهنه کرد.

def test_put_analysis_prompt_anonymous_401(api_client):
    r = api_client.put("/api/ai/analysis_prompt", json={"prompt_text": "x"})
    assert r.status_code == 401
    assert r.headers.get("www-authenticate") == "Bearer"


def test_put_analysis_prompt_non_admin_403(api_client):
    tok = _register(api_client, "notadmin2@example.com", "nota2")
    r = api_client.put(
        "/api/ai/analysis_prompt",
        headers={"Authorization": f"Bearer {tok}"},
        json={"prompt_text": "x"},
    )
    assert r.status_code == 403


# ── AC 27 + 28: admin PUT updates, GET reflects the new value ────────

def test_put_analysis_prompt_admin_roundtrip(api_client):
    tok = _register(api_client, "mohamad.mahdi1988@gmail.com", "admin2")
    h = {"Authorization": f"Bearer {tok}"}

    r = api_client.put(
        "/api/ai/analysis_prompt", headers=h, json={"prompt_text": "ANALYZE DEEPLY"}
    )
    assert r.status_code == 200, r.text
    assert r.json()["prompt_text"] == "ANALYZE DEEPLY"

    # AC 28: a fresh GET returns the persisted value.
    r2 = api_client.get("/api/ai/analysis_prompt")
    assert r2.status_code == 200
    assert r2.json()["prompt_text"] == "ANALYZE DEEPLY"
