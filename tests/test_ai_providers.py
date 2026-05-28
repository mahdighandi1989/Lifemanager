"""Coverage for /ai/providers + /ai/global-prompt (audit task 1a08ded2)."""
from __future__ import annotations


def test_create_and_list_providers(api_client):
    created = api_client.post(
        "/ai/providers",
        json={"name": "DeepSeek", "description": "DeepSeek chat"},
    )
    assert created.status_code == 201, created.text
    body = created.json()
    assert body["name"] == "DeepSeek"
    assert body["is_enabled"] is True

    listing = api_client.get("/ai/providers").json()
    assert any(p["name"] == "DeepSeek" for p in listing)


def test_get_provider_404_when_missing(api_client):
    resp = api_client.get("/ai/providers/99999")
    assert resp.status_code == 404


def test_update_provider_toggles_enabled(api_client):
    created = api_client.post("/ai/providers", json={"name": "Gemini"}).json()
    resp = api_client.patch(
        f"/ai/providers/{created['id']}",
        json={"is_enabled": False, "description": "muted"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["is_enabled"] is False
    assert body["description"] == "muted"


def test_delete_provider(api_client):
    created = api_client.post("/ai/providers", json={"name": "Claude"}).json()
    resp = api_client.delete(f"/ai/providers/{created['id']}")
    assert resp.status_code == 204
    assert api_client.get(f"/ai/providers/{created['id']}").status_code == 404


def test_global_prompt_defaults_to_empty(api_client):
    resp = api_client.get("/ai/global-prompt")
    assert resp.status_code == 200
    assert resp.json()["prompt_text"] == ""


def test_global_prompt_put_then_get_roundtrip(api_client):
    api_client.put("/ai/global-prompt", json={"prompt_text": "تحلیل ساده"})
    body = api_client.get("/ai/global-prompt").json()
    assert body["prompt_text"] == "تحلیل ساده"


def test_global_prompt_put_overwrites(api_client):
    api_client.put("/ai/global-prompt", json={"prompt_text": "v1"})
    api_client.put("/ai/global-prompt", json={"prompt_text": "v2"})
    body = api_client.get("/ai/global-prompt").json()
    assert body["prompt_text"] == "v2"
