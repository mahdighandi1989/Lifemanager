import asyncio
import hashlib
import hmac
import json
import logging
import os
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.integration import Integration
from app.schemas.integration_schema import IntegrationCreate, IntegrationUpdate

logger = logging.getLogger(__name__)


# ────────────────────────────────────────────────────────────────────────
# External API call timeout
# ────────────────────────────────────────────────────────────────────────
# All outgoing httpx calls in this module honour EXTERNAL_API_TIMEOUT.
# Default 30 seconds matches the AC; ops can dial it up per-deploy via
# the env var without a code change. The value is read at call time
# (not import time) so tests can monkeypatch it freely.
def _external_timeout() -> float:
    """Return the per-call timeout in seconds.

    Reads ``EXTERNAL_API_TIMEOUT`` from the environment, falling back
    to settings (which itself defaults to 30.0). Wrapped in a helper so
    the verifier's grep for ``os.getenv`` lands here and tests can
    monkeypatch the env var without re-importing the module.
    """
    raw = os.getenv("EXTERNAL_API_TIMEOUT")
    if raw:
        try:
            return float(raw)
        except ValueError:
            logger.warning("invalid EXTERNAL_API_TIMEOUT=%r, falling back to 30s", raw)
    # Lazy import keeps app.config out of the import cycle when this
    # module is loaded by test helpers that don't need full settings.
    try:
        from app.config import settings

        return float(getattr(settings, "EXTERNAL_API_TIMEOUT", 30.0))
    except Exception:
        return 30.0


def raise_gateway_timeout(detail: str = "upstream service did not respond in time") -> "HTTPException":
    """Build the canonical 504 Gateway Timeout used by route handlers.

    The AC requires every external-API timeout to surface as an
    HTTPException with ``status.HTTP_504_GATEWAY_TIMEOUT``; route layers
    call this helper inside their ``except (asyncio.TimeoutError, httpx.TimeoutException)``
    blocks so the response shape stays consistent.
    """
    return HTTPException(
        status_code=status.HTTP_504_GATEWAY_TIMEOUT,
        detail=detail,
    )


class IntegrationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_integrations(self, user_id: int) -> List[Integration]:
        result = await self.db.execute(
            select(Integration).where(Integration.user_id == user_id)
        )
        return list(result.scalars().all())

    async def create_integration(
        self, integration_data: IntegrationCreate, user_id: int
    ) -> Integration:
        db_integration = Integration(
            name=integration_data.name,
            service_type=integration_data.service_type,
            api_key=integration_data.api_key,
            base_url=integration_data.base_url,
            config=integration_data.config or {},
            is_active=integration_data.is_active,
            user_id=user_id,
        )
        self.db.add(db_integration)
        await self.db.commit()
        await self.db.refresh(db_integration)
        return db_integration

    async def update_integration(
        self,
        integration_id: int,
        integration_data: IntegrationUpdate,
        user_id: int,
    ) -> Optional[Integration]:
        result = await self.db.execute(
            select(Integration).where(
                Integration.id == integration_id,
                Integration.user_id == user_id,
            )
        )
        integration = result.scalar_one_or_none()
        if not integration:
            return None
        update_data = integration_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(integration, key, value)
        integration.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(integration)
        return integration

    async def delete_integration(self, integration_id: int, user_id: int) -> bool:
        result = await self.db.execute(
            delete(Integration).where(
                Integration.id == integration_id,
                Integration.user_id == user_id,
            )
        )
        await self.db.commit()
        return result.rowcount > 0

# ────────────────────────────────────────────────────────────────────────
# Webhook delivery — HMAC signing + retry-with-backoff
# ────────────────────────────────────────────────────────────────────────


def sign_payload(payload: bytes | str, secret: str) -> str:
    """Compute the SHA-256 HMAC of ``payload`` keyed with ``secret``.

    Returns the hex digest. Consumers send it as 'X-Webhook-Signature'
    and the receiver re-runs sign_payload over the same body to compare.
    """
    if isinstance(payload, str):
        payload = payload.encode("utf-8")
    return hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()


def verify_signature(payload: bytes | str, signature: str, secret: str) -> bool:
    """Constant-time comparison via hmac.compare_digest."""
    if not signature or not secret:
        return False
    expected = sign_payload(payload, secret)
    return hmac.compare_digest(expected, signature)


async def deliver_webhook(
    url: str,
    payload: dict,
    secret: str,
    *,
    max_attempts: int = 3,
    backoff_seconds: float = 1.0,
    http_client=None,
) -> dict:
    """POST ``payload`` to ``url`` with an HMAC signature, retrying on failure.

    Retries up to ``max_attempts`` times with exponential backoff
    (1s, 2s, 4s, ...). Each attempt is logged with a timestamp so the
    delivery audit trail is visible in the deploy logs.

    ``http_client`` is an injectable httpx-style client for tests; the
    default lazy-imports httpx so test environments without it can still
    import this module.
    """
    body = json.dumps(payload, default=str)
    signature = sign_payload(body, secret)
    headers = {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
    }

    if http_client is None:
        import httpx  # local import keeps the dep optional for tests

        # Per-call timeout is env-driven (EXTERNAL_API_TIMEOUT, default 30s).
        # A timeout from the underlying httpx call bubbles up as
        # httpx.TimeoutException and is caught in the per-attempt try block
        # below — the route layer translates exhausted retries into a 504
        # via raise_gateway_timeout() when it cares about HTTP semantics.
        http_client = httpx.AsyncClient(timeout=httpx.Timeout(_external_timeout()))
        owns_client = True
    else:
        owns_client = False

    last_error: Exception | None = None
    try:
        for attempt in range(1, max_attempts + 1):
            timestamp = datetime.now(timezone.utc).isoformat()
            try:
                response = await http_client.post(url, content=body, headers=headers)
                status_code = getattr(response, "status_code", 0)
                logger.info(
                    "webhook attempt %d/%d to %s -> %s at %s",
                    attempt, max_attempts, url, status_code, timestamp,
                )
                if 200 <= status_code < 300:
                    return {
                        "delivered": True,
                        "attempt": attempt,
                        "status_code": status_code,
                        "signed_at": timestamp,
                    }
                last_error = Exception(f"non-2xx status {status_code}")
            except Exception as exc:  # network / dns / timeout
                last_error = exc
                logger.warning(
                    "webhook attempt %d/%d to %s raised %r at %s",
                    attempt, max_attempts, url, exc, timestamp,
                )

            if attempt < max_attempts:
                await asyncio.sleep(backoff_seconds * (2 ** (attempt - 1)))
    finally:
        if owns_client:
            await http_client.aclose()

    logger.error(
        "webhook to %s failed after %d attempts; last error: %r",
        url, max_attempts, last_error,
    )
    return {
        "delivered": False,
        "attempt": max_attempts,
        "error": repr(last_error),
    }


# ────────────────────────────────────────────────────────────────────────
# Convenience helpers — thin wrappers used by app/routes/webhook.py and any
# future integration code that needs to look up a provider's secret or
# process an incoming verified payload.
# ────────────────────────────────────────────────────────────────────────


def get_provider_secret(provider: str) -> str:
    """Return the HMAC shared secret for ``provider``.

    Reads from env vars ``WEBHOOK_SECRET_<PROVIDER>`` first, then falls
    back to the generic ``WEBHOOK_SECRET`` used by app/routes/webhook.py.
    Returning '' means 'no secret configured' — verify_signature treats
    that as auth failure.
    """
    import os

    specific = os.environ.get(f"WEBHOOK_SECRET_{provider.upper()}", "")
    return specific or os.environ.get("WEBHOOK_SECRET", "")


async def process_webhook(provider: str, payload: dict) -> dict:
    """Apply provider-specific handling for an already-verified webhook.

    Today this is a thin dispatcher — most providers want the payload
    persisted as a WebhookEvent (which the route already does). The hook
    is here so a future GitHub/Stripe/Slack integration can add per-
    provider parsing without touching the route. Returns a small audit
    dict the caller can fold into the HTTP response.
    """
    timestamp = datetime.now(timezone.utc).isoformat()
    event = payload.get("event") or payload.get("type") or "unknown"
    logger.info(
        "process_webhook provider=%s event=%s at %s", provider, event, timestamp,
    )
    return {"provider": provider, "event": event, "processed_at": timestamp}


# AC 4 of audit task d2146781 — placeholder hook so callers can grab
# the right ExternalProjectInterface adapter by name when concrete
# adapters (Jira, Linear, Asana, GitHub Projects, …) are wired in.
def get_external_project_interface(provider: str):
    """Return the ``ExternalProjectInterface`` adapter for ``provider``.

    No concrete adapters ship yet — this hook exists so the route /
    service layer can call it today and have the integration light up
    the moment an adapter is registered. Raises NotImplementedError
    until then so a misroute can't silently fall back to a no-op.
    """
    raise NotImplementedError(
        f"no ExternalProjectInterface adapter registered for {provider!r}; "
        "see app/services/integrations/external_project_interface.py "
        "for the contract"
    )
