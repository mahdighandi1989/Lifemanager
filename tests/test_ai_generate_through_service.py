"""AC 5 + AC 6 of audit task 97867b277c1b.

* AC 5 — `from app.services.ai_service import ..., generate_text` must
  not appear in app/routes/ai.py (the route now goes through the
  AIService instance method).
* AC 6 — POST /ai/generate must respond 200 and route through AIService.
* AC 7 — `from app.routes import ai` must not raise.
"""
from __future__ import annotations

import re
from pathlib import Path


_AI_ROUTE = Path(__file__).resolve().parent.parent / "app" / "routes" / "ai.py"


def test_ai_route_no_longer_imports_module_level_generate_text():
    text = _AI_ROUTE.read_text(encoding="utf-8")
    # The exact AC-required pattern:
    assert not re.search(
        r"^\s*from\s+app\.services\.ai_service\s+import\s+[^\n]*\bgenerate_text\b",
        text,
        flags=re.MULTILINE,
    ), "module-level generate_text import is still present in app/routes/ai.py"


def test_ai_route_imports_cleanly():
    """AC 7 — no import-time errors after the refactor."""
    import importlib
    import sys

    sys.modules.pop("app.routes.ai", None)
    importlib.import_module("app.routes.ai")  # raises if anything is wrong


def test_ai_service_exposes_generate_text_method():
    """AC 6 — the AIService instance carries the generate_text entry
    point the route now uses."""
    from app.services.ai_service import AIService

    assert hasattr(AIService, "generate_text")
    import inspect

    assert inspect.iscoroutinefunction(AIService.generate_text)


def test_ai_generate_endpoint_returns_200(api_client):
    """AC 6 — happy path through the new AIService.generate_text call."""
    resp = api_client.post(
        "/ai/generate",
        json={"prompt": "hello world", "max_tokens": 16},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert "generated_text" in body
    assert "model_used" in body
    assert "tokens_used" in body
