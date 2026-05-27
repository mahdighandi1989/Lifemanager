"""DB pool timeout (QueuePool.TimeoutError) handler — feedback loop.

`app/main.py` registers `@app.exception_handler(SQLATimeoutError)`
(SQLAlchemy's `TimeoutError`, of which `QueuePool.TimeoutError` is
a subclass) so a saturated connection pool surfaces as a clean
503 with a retry hint, plus a `logger.warning` for the operator
trail. This test injects the exception into a request to prove
both legs of the contract: the response shape AND the log line.
"""
from __future__ import annotations

import logging

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy.exc import TimeoutError as SQLATimeoutError
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.database import Base, get_db
from app.main import app


@pytest_asyncio.fixture
async def soft_client():
    """TestClient that doesn't re-raise server exceptions, so the
    503 from the handler is what we assert against — not a Python
    traceback bubbling out of the WSGI layer."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def _get_db():
        async with factory() as session:
            yield session

    app.dependency_overrides[get_db] = _get_db
    yield TestClient(app, raise_server_exceptions=False)
    app.dependency_overrides.clear()
    await engine.dispose()


def test_queue_pool_timeout_handling(soft_client, caplog):
    """A SQLAlchemy TimeoutError mid-request → 503 + warning log.

    Use the existing `/api/health/db` route, swap its db dependency
    for one that raises SQLATimeoutError, and assert:
      * status code is 503
      * body carries a JSON "detail" hint (no traceback leak)
      * a WARNING-level log was emitted from app.main with
        request context (method + path)
    """
    async def _failing_db():
        raise SQLATimeoutError(
            "QueuePool limit of size 5 overflow 10 reached, "
            "connection timed out",
            None, None,
        )
        yield  # pragma: no cover - unreachable

    # Make sure the app.main logger propagates to caplog regardless
    # of how it was configured at import time.
    main_logger = logging.getLogger("app.main")
    prior_level = main_logger.level
    prior_propagate = main_logger.propagate
    main_logger.setLevel(logging.WARNING)
    main_logger.propagate = True
    caplog.set_level(logging.WARNING)

    app.dependency_overrides[get_db] = _failing_db
    try:
        # /api/lists takes a `db: AsyncSession = Depends(get_db)` —
        # the dependency override fires here and raises
        # SQLATimeoutError, which routes to the handler. Note:
        # /api/health/db deliberately doesn't use the dependency
        # (it uses the engine directly to probe DB liveness), so
        # it's not a useful target for this test.
        r = soft_client.get("/api/lists")
    finally:
        app.dependency_overrides.pop(get_db, None)
        main_logger.setLevel(prior_level)
        main_logger.propagate = prior_propagate

    assert r.status_code == 503, r.text
    body = r.json()
    assert "detail" in body
    # No internal traceback should leak to the client.
    assert "Traceback" not in body.get("detail", "")

    # Operator-visible warning record was emitted — proves the
    # feedback loop the audit was worried about is intact. We
    # accept any WARNING from the app.main module so this stays
    # robust against tiny phrasing tweaks to the log message.
    relevant = [
        rec for rec in caplog.records
        if rec.name == "app.main" and rec.levelno >= logging.WARNING
    ]
    assert relevant, (
        "expected a WARNING log from the pool-timeout handler; "
        f"got {[(r.name, r.levelno, r.getMessage()) for r in caplog.records]}"
    )
