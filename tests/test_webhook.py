"""Tests for the /webhook endpoint and its HMAC signing helpers."""
import hashlib
import hmac
import json

import pytest

from app.services.integration_service import sign_payload, verify_signature


def test_sign_payload_is_sha256_hmac():
    body = b'{"event":"x"}'
    expected = hmac.new(b"secret", body, hashlib.sha256).hexdigest()
    assert sign_payload(body, "secret") == expected


def test_sign_payload_accepts_str_input():
    assert sign_payload("hi", "secret") == sign_payload(b"hi", "secret")


def test_verify_signature_round_trip():
    body = '{"event":"task_created"}'
    sig = sign_payload(body, "secret")
    assert verify_signature(body, sig, "secret") is True


def test_verify_signature_rejects_wrong_secret():
    body = '{"event":"x"}'
    sig = sign_payload(body, "secret")
    assert verify_signature(body, sig, "OTHER-SECRET") is False


def test_verify_signature_rejects_empty_inputs():
    assert verify_signature(b"body", "", "secret") is False
    assert verify_signature(b"body", "abc", "") is False


def test_webhook_health(api_client):
    r = api_client.get("/webhook/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["service"] == "webhook"


def test_webhook_without_signature_returns_401(api_client, monkeypatch):
    """Webhooks without valid signature return 401 (AC)."""
    monkeypatch.setenv("WEBHOOK_SECRET", "test-secret")
    r = api_client.post(
        "/webhook",
        json={"event": "test", "data": {}},
        headers={"X-Webhook-Signature": "invalid_signature"},
    )
    assert r.status_code == 401


def test_webhook_with_valid_signature_stores_event(api_client, monkeypatch):
    """endpoint /webhook رویدادها را در دیتابیس ذخیره می‌کند (AC)."""
    monkeypatch.setenv("WEBHOOK_SECRET", "test-secret")
    body = json.dumps({"event": "task_created", "data": {"task_id": 1}})
    sig = sign_payload(body, "test-secret")
    r = api_client.post(
        "/webhook",
        content=body,
        headers={
            "X-Webhook-Signature": sig,
            "Content-Type": "application/json",
        },
    )
    assert r.status_code == 200, r.text
    body_out = r.json()
    assert body_out["status"] == "received"
    assert body_out["event"] == "task_created"
    assert "id" in body_out
    assert "received_at" in body_out


def test_webhook_store(api_client, monkeypatch):
    """Alias matching the AC test_node 'tests/test_webhook.py::test_webhook_store'."""
    monkeypatch.setenv("WEBHOOK_SECRET", "test-secret")
    body = json.dumps({"event": "task_created", "data": {"task_id": 1}})
    sig = sign_payload(body, "test-secret")
    r = api_client.post(
        "/webhook",
        content=body,
        headers={"X-Webhook-Signature": sig, "Content-Type": "application/json"},
    )
    assert r.status_code == 200
    assert r.json()["status"] == "received"


@pytest.mark.asyncio
async def test_deliver_webhook_retries_then_succeeds():
    """Failed outgoing webhooks are retried with backoff (AC)."""
    from app.services.integration_service import deliver_webhook

    class FakeResp:
        def __init__(self, code):
            self.status_code = code

    class FakeClient:
        def __init__(self):
            self.calls = 0

        async def post(self, *args, **kwargs):
            self.calls += 1
            if self.calls < 3:
                return FakeResp(500)
            return FakeResp(200)

        async def aclose(self):
            pass

    fake = FakeClient()
    result = await deliver_webhook(
        url="https://example.com/hook",
        payload={"event": "x"},
        secret="s",
        max_attempts=3,
        backoff_seconds=0,  # fast test
        http_client=fake,
    )
    assert fake.calls == 3
    assert result["delivered"] is True
    assert result["status_code"] == 200


@pytest.mark.asyncio
async def test_deliver_webhook_gives_up_after_max_attempts():
    from app.services.integration_service import deliver_webhook

    class FailClient:
        def __init__(self):
            self.calls = 0

        async def post(self, *args, **kwargs):
            self.calls += 1
            raise RuntimeError("network down")

        async def aclose(self):
            pass

    fake = FailClient()
    result = await deliver_webhook(
        url="https://example.com/hook",
        payload={"event": "x"},
        secret="s",
        max_attempts=3,
        backoff_seconds=0,
        http_client=fake,
    )
    assert fake.calls == 3
    assert result["delivered"] is False
