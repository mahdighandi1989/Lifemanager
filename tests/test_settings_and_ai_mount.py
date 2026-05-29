"""task 1a08ded2 — /api/ai dual-mount + admin-gated global settings (AC 56-59)."""
from __future__ import annotations


def _register(api_client, email: str, username: str) -> str:
    resp = api_client.post(
        "/auth/register",
        json={"email": email, "password": "hunter2-long", "username": username},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["access_token"]


# ── /api/ai dual-mount (frontend contract) ───────────────────────────

def test_api_ai_dual_mount_serves_configs(api_client):
    # Frontend (AISettings/Settings) calls /api/ai/...; the legacy /ai/... must
    # also keep working for existing callers/tests.
    assert api_client.get("/api/ai/configs").status_code == 200
    assert api_client.get("/ai/configs").status_code == 200


# ── GlobalSetting model (AC 56) ──────────────────────────────────────

def test_configs_provider_filter(api_client):
    # AC 14/15: POST returns id/name/provider; GET supports ?provider= filter.
    r1 = api_client.post(
        "/api/ai/configs",
        json={"name": "m-openai", "provider": "openai", "model_name": "gpt-4o"},
    )
    assert r1.status_code == 201, r1.text
    body = r1.json()
    assert {"id", "name", "provider"} <= set(body) and body["provider"] == "openai"

    api_client.post(
        "/api/ai/configs",
        json={"name": "m-gemini", "provider": "gemini", "model_name": "gemini-2.5"},
    )

    all_names = {c["name"] for c in api_client.get("/api/ai/configs").json()}
    assert {"m-openai", "m-gemini"} <= all_names

    openai_only = api_client.get("/api/ai/configs?provider=openai").json()
    assert all(c["provider"] == "openai" for c in openai_only)
    assert {c["name"] for c in openai_only} == {"m-openai"}


def test_global_setting_model_fields():
    from app.models.global_setting import GlobalSetting

    cols = set(GlobalSetting.__table__.columns.keys())
    assert {"id", "key", "value"} <= cols
    # key is UNIQUE per AC 56
    assert GlobalSetting.__table__.c.key.unique is True


# ── /api/settings/global-analysis-prompt admin gate (AC 57-59) ───────

def test_settings_global_prompt_no_token_403(api_client):
    assert api_client.get("/api/settings/global-analysis-prompt").status_code == 403


def test_settings_global_prompt_non_admin_403(api_client):
    tok = _register(api_client, "notadmin@example.com", "nota")
    r = api_client.get(
        "/api/settings/global-analysis-prompt",
        headers={"Authorization": f"Bearer {tok}"},
    )
    assert r.status_code == 403


def test_settings_global_prompt_admin_roundtrip(api_client):
    tok = _register(api_client, "mohamad.mahdi1988@gmail.com", "admin")
    h = {"Authorization": f"Bearer {tok}"}

    r = api_client.get("/api/settings/global-analysis-prompt", headers=h)
    assert r.status_code == 200, r.text
    assert r.json()["value"] == ""

    r2 = api_client.put(
        "/api/settings/global-analysis-prompt",
        headers=h,
        json={"value": "ALWAYS BE CONCISE"},
    )
    assert r2.status_code == 200, r2.text

    r3 = api_client.get("/api/settings/global-analysis-prompt", headers=h)
    assert r3.json()["value"] == "ALWAYS BE CONCISE"
