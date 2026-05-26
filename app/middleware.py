"""Shared middleware utilities.

Currently exposes ``handle_errors`` — a decorator that wraps a route
handler with the canonical try/except → HTTPException mapping. Lifting
this out of every route removes the duplicated boilerplate that
existed in app/routes/{tasks,projects,users}.py.
"""
from __future__ import annotations

import functools
import logging
from typing import Any, Awaitable, Callable, TypeVar

from fastapi import HTTPException, status
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError, NoResultFound, SQLAlchemyError

logger = logging.getLogger(__name__)

F = TypeVar("F", bound=Callable[..., Awaitable[Any]])


def handle_errors(func: F) -> F:
    """Decorator that maps common service-layer exceptions to HTTPException.

    Mapping:
      * ``HTTPException`` → re-raised untouched (already shaped for FastAPI).
      * ``ValidationError`` / ``ValueError`` → 400 Bad Request.
      * ``NoResultFound`` → 404 Not Found.
      * ``IntegrityError`` → 409 Conflict.
      * ``PermissionError`` → 403 Forbidden.
      * any other ``SQLAlchemyError`` → 500 Internal Server Error.
      * unhandled ``Exception`` → 500 Internal Server Error (logged with
        the full traceback so we can debug in production logs).

    Usage:

        from app.middleware import handle_errors

        @router.post("/")
        @handle_errors
        async def create_task(payload: TaskCreate, db: AsyncSession = Depends(get_db)):
            return await planner_service.create_task(db, payload, user_id=0)

    The decorator is async-aware — the wrapped function MUST be a
    coroutine. Synchronous routes are not supported (FastAPI defaults
    to async for everything in this codebase).
    """

    @functools.wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:
        try:
            return await func(*args, **kwargs)
        except HTTPException:
            # Already shaped for FastAPI; let it through.
            raise
        except (ValidationError, ValueError) as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
            ) from exc
        except NoResultFound as exc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="not found"
            ) from exc
        except IntegrityError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="conflict — record exists or constraint violation",
            ) from exc
        except PermissionError as exc:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail=str(exc) or "forbidden"
            ) from exc
        except SQLAlchemyError as exc:
            logger.exception("database error in %s", func.__name__)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="database error",
            ) from exc
        except Exception as exc:
            logger.exception("unhandled error in %s", func.__name__)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="internal error",
            ) from exc

    return wrapper  # type: ignore[return-value]


# ── Legacy compatibility ────────────────────────────────────────────


def setup_middleware(app):
    """Deprecated no-op.

    The previous implementation installed Starlette's CORSMiddleware
    with `allow_origins=['*']` — a CSRF footgun. CORS is now handled
    by `StrictCORSMiddleware` in app/main.py, which reads the allowlist
    from env. This function is kept so any legacy `from app.middleware
    import setup_middleware` call still imports cleanly.
    """
    logger.debug("setup_middleware() is a no-op — CORS lives in app/main.py")
