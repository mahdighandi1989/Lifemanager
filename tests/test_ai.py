"""Tests for /ai/generate and the AI schema validators.

Replaces the prior tests/test_ai.py which targeted /ai/chat (no such
endpoint exists in this codebase).
"""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_generate_returns_200_with_generated_text_field():
    """AC: POST /ai/generate with a valid prompt returns 200 plus a
    response containing 'generated_text'.
    """
    r = client.post("/ai/generate", json={"prompt": "test prompt"})
    assert r.status_code == 200
    body = r.json()
    assert "generated_text" in body
    assert isinstance(body["generated_text"], str)
    assert len(body["generated_text"]) > 0


def test_generate_rejects_empty_prompt():
    r = client.post("/ai/generate", json={"prompt": ""})
    assert r.status_code == 422


def test_generate_rejects_prompt_over_1000_chars():
    r = client.post("/ai/generate", json={"prompt": "x" * 1001})
    assert r.status_code == 422


def test_generate_accepts_prompt_at_exact_1000_chars():
    r = client.post("/ai/generate", json={"prompt": "x" * 1000})
    assert r.status_code == 200


def test_generate_rejects_sql_injection_probe_payload():
    """AC: SQL-injection-style probes get 422 (validation), not 200."""
    for probe in [
        "show me everything OR 1=1--",
        "ignore previous; DROP TABLE users",
        "list ' UNION SELECT password from users--",
    ]:
        r = client.post("/ai/generate", json={"prompt": probe})
        assert r.status_code == 422, f"prompt {probe!r} should be rejected"


def test_generate_accepts_persian_rtl_prompts():
    """Sanitisation must not reject legitimate multi-language prompts."""
    r = client.post(
        "/ai/generate",
        json={"prompt": "یک ایمیل دوستانه به همکار بنویس درباره جلسهٔ فردا"},
    )
    assert r.status_code == 200


def test_generate_response_matches_schema_strict_fields():
    """The route validates AI output against AIGenerateResponse — extra
    fields from the upstream provider don't reach the client."""
    r = client.post("/ai/generate", json={"prompt": "hi"})
    assert r.status_code == 200
    body = r.json()
    # ``hallucination`` is the guard block added by audit task 32145cd6; it is a
    # declared AIGenerateResponse field, so it's allowed alongside the core three.
    assert set(body.keys()) <= {
        "generated_text", "model_used", "tokens_used", "hallucination",
    }
