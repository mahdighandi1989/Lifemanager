"""Supervisor's read-only finance audit (owner's approval, 2026-10-11).

Pins: the supervisor token can read it, a stranger cannot, and reading it
changes nothing — the SMS replay is a dry run.
"""
from __future__ import annotations

import json

import pytest

from app.models.activity_log import ActivityLog
from app.models.finance import FinancialAccount

TOKEN = "t" * 64
SUP = {"X-Supervisor-Token": TOKEN}


@pytest.fixture(autouse=True)
def _supervisor_token(monkeypatch):
    import app.dependencies.auth as auth_dep
    from app.routes import inspection as route

    monkeypatch.setenv("SUPERVISOR_TOKEN", TOKEN)
    monkeypatch.delenv("AUTH_JWT_SECRET", raising=False)
    monkeypatch.setattr(route._config.settings, "ADMIN_EMAILS", "owner@example.com")
    monkeypatch.setattr(auth_dep.settings, "ADMIN_EMAILS", "owner@example.com")


async def _session():
    """A session on the SAME in-memory DB the test client uses (its override)."""
    from app.database import get_db
    from app.main import app

    return app.dependency_overrides[get_db]()


@pytest.mark.asyncio
async def test_supervisor_reads_cards_and_why_each_sms_did_or_did_not_apply(api_client):
    gen = await _session()
    db = await gen.__anext__()
    acc = FinancialAccount(user_id=None, name="ملت", kind="bank", institution="ملت", currency="USD",
                           balance=4224209.74, extra=json.dumps({"source": "email", "inferred": True}))
    db.add(acc)
    db.add(ActivityLog(action="mobile_sms", entity_type="sms", entity_label="ملت",
                       detail="[finance→finance] بانک ملت\nمانده:45,300,000 ريال", user_id=None))
    await db.commit()

    r = api_client.get("/api/inspection/audit/finance", headers=SUP)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["read_only"] is True
    assert [a["name"] for a in body["accounts"]] == ["ملت"]
    msg = body["finance_messages"][0]["explain"]
    assert msg["parsed_balance"] == 45300000.0 and msg["parsed_currency"] == "IRR"
    assert msg["would_apply"] is True and msg["would_relabel"] == "USD → IRR"

    await db.refresh(acc)
    assert float(acc.balance) == 4224209.74 and acc.currency == "USD", "a dry run must not write"


def test_a_stranger_cannot_read_it(api_client):
    r = api_client.get("/api/inspection/audit/finance")
    assert r.status_code in (401, 403)


def test_ai_probe_is_gated_and_uses_the_page_task(api_client, monkeypatch):
    import app.services.ai.inference_gateway as gw

    seen = {}

    async def fake_complete(db, user, task=None, system=None, max_tokens=None, **kw):
        seen.update(user=user, task=task, system=system)
        return {"ok": True, "text": "{}", "model": "m"}

    monkeypatch.setattr(gw, "complete", fake_complete)
    assert api_client.post("/api/inspection/audit/ai", json={"user": "x"}).status_code in (401, 403)
    r = api_client.post("/api/inspection/audit/ai", json={"system": "s", "user": "u"}, headers=SUP)
    assert r.status_code == 200 and r.json()["text"] == "{}"
    assert seen == {"user": "u", "task": "learning_architecture", "system": "s"}
    assert api_client.post("/api/inspection/audit/ai", json={"user": "x" * 40001}, headers=SUP).status_code == 413
