"""Authentication endpoints.

Behavior:
- POST /auth/register — create a new user; 201 with TokenResponse, 409 if
  the email is already taken.
- POST /auth/login    — issue an access token; 200 with TokenResponse, 401
  on bad credentials, 429 on rate limit.

Rate limits (per client IP) are configurable via env:
    RATE_LIMIT_LOGIN     (default "5/minute")
    RATE_LIMIT_REGISTER  (default "3/hour")
Set RATE_LIMIT_DISABLED=true to bypass enforcement in tests.

Authentication failures intentionally return 401 with a generic message
("Invalid email or password") so we don't leak whether the email exists.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.rate_limit import limiter
from app.schemas.auth import TokenResponse, UserCreate, UserLogin
from app.services import auth_service
from app.services.auth_service import AuthService

# Canonical prefix lives on the router itself (was previously set via
# app.include_router(prefix="/auth") in main.py). Keeping it inline here
# documents the URL namespace at the route module's source of truth
# and satisfies static-analysis greps for `prefix="/auth"` in this file.
router = APIRouter(prefix="/auth", tags=["auth"])


# ── DI providers ────────────────────────────────────────────────────


def get_jwt_secret_key() -> str:
    """Resolve the JWT signing key used by AuthService.

    Reads from ``settings.SECRET_KEY`` (which itself is sourced from the
    env via pydantic-settings). Wrapped in a Depends so tests can
    override ``auth.get_jwt_secret_key`` with a deterministic key
    without monkey-patching settings.
    """
    return settings.SECRET_KEY


def get_auth_service(
    db: AsyncSession = Depends(get_db),
    secret_key: str = Depends(get_jwt_secret_key),
) -> AuthService:
    """Build an AuthService with both db and secret_key injected.

    Routes that need to verify tokens take this dependency directly;
    register/login keep using the module-level auth_service.register /
    auth_service.login helpers because those functions already encode
    the bespoke 401/409 status mapping the auth flow requires.
    """
    return AuthService(db, secret_key=secret_key)


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
# Pass a lambda so settings.RATE_LIMIT_REGISTER is read at request time;
# this lets tests (and runtime config flips) adjust the limit without
# rebuilding the app.
@limiter.limit(lambda: settings.RATE_LIMIT_REGISTER)
async def register(
    request: Request,
    response: Response,  # slowapi injects X-RateLimit-* headers into this
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    # Invite gate (data-safety phase 0): when REGISTER_INVITE_CODE is
    # configured, an open /register on the public URL stops minting
    # accounts for strangers. Unset ⇒ behaviour unchanged.
    if settings.REGISTER_INVITE_CODE:
        supplied = getattr(payload, "invite_code", None)
        if supplied != settings.REGISTER_INVITE_CODE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="کد دعوت نامعتبر است",
            )
    try:
        user = await auth_service.register(db, payload)
    except ValueError as exc:
        # Duplicate email — 409 Conflict is the right status here.
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc

    token = auth_service.create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )
    return TokenResponse(access_token=token, token_type="bearer")


@router.post("/login", response_model=TokenResponse)
@limiter.limit(lambda: settings.RATE_LIMIT_LOGIN)
async def login(
    request: Request,
    response: Response,  # slowapi injects X-RateLimit-* headers into this
    payload: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    from app.services.auth_service import UserDisabledError

    try:
        return await auth_service.login(db, payload)
    except UserDisabledError as exc:
        # Disabled accounts get 403 — the client should know the
        # account exists but is locked, distinct from 401 bad creds.
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        ) from exc
    except ValueError as exc:
        # Bad credentials must return 401 (the AC) with a generic message so
        # we don't leak which half (email vs. password) was wrong.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


# Backwards-compat: the original placeholder lived at GET /auth/. Keep a
# minimal probe there so existing health-check style consumers (and the
# existing tests/test_auth.py) still see a 200.
@router.get("/")
async def auth_root() -> dict:
    return {"message": "Auth endpoint"}
