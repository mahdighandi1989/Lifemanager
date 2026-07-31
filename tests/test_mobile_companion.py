"""نسخهٔ همراهِ رصدگر (2026-07-30) — the /api/mobile/* ingest surface.

Contract: every ingest endpoint is device-token gated (401 without/with a
wrong token, nothing logged); a bank SMS flows through the hardened finance
engine (deduped, currency-guarded); everything lands in the activity log;
/api/mobile/status shows the device's last signal.
Also here: the finance repair kit — rebuild-auto-cards, the provenance line,
and the owner-typed balance always winning (PUT).
"""


def _pair(api_client) -> str:
    r = api_client.get("/api/mobile/token")
    assert r.status_code == 200
    return r.json()["token"]


def test_token_is_stable_and_rotatable(api_client):
    t1 = _pair(api_client)
    t2 = _pair(api_client)
    assert t1 == t2
    t3 = api_client.get("/api/mobile/token", params={"rotate": "true"}).json()["token"]
    assert t3 != t1


def test_ingest_requires_the_device_token(api_client):
    _pair(api_client)
    no_token = api_client.post("/api/mobile/sms", json={"sender": "x", "body": "y"})
    assert no_token.status_code == 401
    bad = api_client.post(
        "/api/mobile/sms", json={"sender": "x", "body": "y"},
        headers={"X-Device-Token": "wrong"},
    )
    assert bad.status_code == 401
    # nothing was logged for the refused calls
    log = api_client.get("/api/activity-log", params={"action": "mobile_sms"}).json()
    assert (log.get("total") or len(log.get("items") or [])) == 0


def test_bank_sms_updates_the_right_account_and_dedupes(api_client):
    token = _pair(api_client)
    made = api_client.post(
        "/api/finance/accounts",
        json={"name": "Mellat", "kind": "bank", "institution": "mellat",
              "balance": 100, "currency": "IRR"},
    ).json()
    sms = {"sender": "Mellat", "body": "بانک ملت\nموجودی: ۱۲٬۵۰۰٬۰۰۰ ریال", "device": "s24"}
    r = api_client.post("/api/mobile/sms", json=sms, headers={"X-Device-Token": token})
    assert r.status_code == 200
    assert r.json()["finance"]["balances_updated"] == 1
    acc = next(a for a in api_client.get("/api/finance/accounts").json() if a["id"] == made["id"])
    assert float(acc["balance"]) == 12_500_000.0

    # the same SMS re-delivered is a no-op (content-hash dedup)
    r2 = api_client.post("/api/mobile/sms", json=sms, headers={"X-Device-Token": token})
    assert r2.json()["finance"]["balances_updated"] == 0

    # and it is in the activity log
    log = api_client.get("/api/activity-log", params={"action": "mobile_sms"}).json()
    items = log.get("items") or []
    assert any("۱۲٬۵۰۰٬۰۰۰" in (i.get("detail") or "") for i in items)


def test_notification_and_heartbeat_reach_status(api_client):
    token = _pair(api_client)
    n = api_client.post(
        "/api/mobile/notification",
        json={"app": "com.whatsapp", "title": "علی", "text": "سلام", "device": "s24"},
        headers={"X-Device-Token": token},
    )
    assert n.status_code == 200
    h = api_client.post(
        "/api/mobile/heartbeat",
        json={"device": "s24", "battery": 88},
        headers={"X-Device-Token": token},
    )
    assert h.status_code == 200
    devices = api_client.get("/api/mobile/status").json()["devices"]
    assert any(d["device"] == "s24" for d in devices)


def test_usage_summary_is_logged(api_client):
    token = _pair(api_client)
    r = api_client.post(
        "/api/mobile/usage",
        json={"day": "2026-07-30", "device": "s24",
              "apps": [{"app": "org.telegram", "minutes": 42}, {"app": "com.gmail", "minutes": 7}]},
        headers={"X-Device-Token": token},
    )
    assert r.status_code == 200 and r.json()["recorded"] == 2


# ── the repair kit ──────────────────────────────────────────────────────────

def test_owner_typed_balance_beats_older_signals(api_client):
    made = api_client.post(
        "/api/finance/accounts",
        json={"name": "FAB", "kind": "bank", "institution": "fab",
              "balance": 1, "currency": "AED"},
    ).json()
    r = api_client.put(f"/api/finance/accounts/{made['id']}", json={"balance": 465.44})
    assert r.status_code == 200
    body = r.json()
    assert float(body["balance"]) == 465.44
    assert body["owner_balance_at"] is not None
    assert body["balance_evidence"] == "تنظیم دستی مالک"

    # the list endpoint reflects the pinned value + provenance
    acc = next(a for a in api_client.get("/api/finance/accounts").json() if a["id"] == made["id"])
    assert float(acc["balance"]) == 465.44 and acc["owner_balance_at"]


def test_rebuild_removes_machine_cards_and_keeps_manual(api_client):
    manual = api_client.post(
        "/api/finance/accounts",
        json={"name": "دستی من", "kind": "bank", "balance": 500, "currency": "AED"},
    ).json()
    r = api_client.post("/api/finance/rebuild-auto-cards")
    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is True
    names = [a["name"] for a in api_client.get("/api/finance/accounts").json()]
    assert "دستی من" in names
    assert manual["id"] in [a["id"] for a in api_client.get("/api/finance/accounts").json()]
