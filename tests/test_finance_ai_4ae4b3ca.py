"""AI-driven financial analysis endpoint (task 4ae4b3ca, AC 13).

The memo asks that finances be analysed by the app's internal AI models and that
budget-aware purchase suggestions be surfaced. GET /api/finance/insights wires
the user's accounts/budget/planned purchases into ai_service.generate_text and
returns advice plus a per-purchase affordability verdict. generate_text serves a
deterministic placeholder without a provider key, so this responds 200 offline.
"""
from __future__ import annotations


def _make_account(api_client, *, balance=1000, kind="bank"):
    resp = api_client.post(
        "/api/finance/accounts",
        json={"name": "Acct", "kind": kind, "currency": "USD", "balance": balance},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


def test_insights_endpoint_returns_summary_and_analysis(api_client):
    _make_account(api_client, balance=5000)
    r = api_client.get("/api/finance/insights")
    assert r.status_code == 200, r.text
    body = r.json()
    assert {"summary", "suggestions", "analysis", "model_used"} <= set(body)
    assert body["summary"]["total_balance"] == 5000.0
    assert isinstance(body["analysis"], str) and body["analysis"]
    assert isinstance(body["suggestions"], list)


def test_insights_flags_planned_purchase_affordability(api_client):
    _make_account(api_client, balance=300)
    # A planned purchase the user parked as a task with an estimated cost.
    created = api_client.post(
        "/api/tasks",
        json={"title": "خرید لپ‌تاپ", "estimated_cost": 100},
    )
    assert created.status_code in (200, 201), created.text

    r = api_client.get("/api/finance/insights")
    assert r.status_code == 200, r.text
    suggestions = r.json()["suggestions"]
    laptop = [s for s in suggestions if s["title"] == "خرید لپ‌تاپ"]
    assert laptop, suggestions
    assert laptop[0]["affordable"] is True
    assert laptop[0]["recommendation"]


def test_insights_marks_over_budget_purchase_not_affordable(api_client):
    _make_account(api_client, balance=50)
    created = api_client.post(
        "/api/tasks",
        json={"title": "خرید گران", "estimated_cost": 9999},
    )
    assert created.status_code in (200, 201), created.text

    r = api_client.get("/api/finance/insights")
    assert r.status_code == 200, r.text
    pricey = [s for s in r.json()["suggestions"] if s["title"] == "خرید گران"]
    assert pricey, r.json()["suggestions"]
    assert pricey[0]["affordable"] is False
