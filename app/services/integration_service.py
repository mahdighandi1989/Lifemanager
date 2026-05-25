import asyncio
import hashlib
import hmac
import json
import logging
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.integration import Integration
from app.schemas.integration_schema import IntegrationCreate, IntegrationUpdate

logger = logging.getLogger(__name__)


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

        http_client = httpx.AsyncClient(timeout=10.0)
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
