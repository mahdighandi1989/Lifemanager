from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.services.auth_service import AuthService
from app.models.user_oauth import OAuthUser
from app.core.config import settings

security = HTTPBearer()
# Optional bearer — auto_error=False so the dependency returns None
# instead of 403'ing when no Authorization header is present. Used
# by routes that need to behave correctly while the frontend's
# login bypass is enabled (see AuthContext.jsx::isLoginBypassEnabled).
optional_security = HTTPBearer(auto_error=False)


# Default user id used by routes that resolve identity optionally —
# the frontend currently runs with isLoginBypassEnabled=true, so
# anonymous traffic still needs a stable per-user scope for
# per-user features (self-improvement check-ins, profile analytics).
# Treat user_id=0 as "the default single-tenant user" until a real
# auth flow is re-enabled, at which point this falls away.
DEFAULT_ANON_USER_ID = 0


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: AsyncSession = Depends(get_db)) -> User:
    token = credentials.credentials
    auth_service = AuthService(db)
    user = await auth_service.verify_token(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return user


async def get_optional_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_security),
    db: AsyncSession = Depends(get_db),
) -> int:
    """Return the caller's user_id, or ``DEFAULT_ANON_USER_ID`` if anon.

    Three cases handled:
      1. No Authorization header → DEFAULT_ANON_USER_ID. Matches the
         current frontend's login-bypass mode so the routes don't 403
         the user out of their own dashboard.
      2. Header present, token resolves → that user's id.
      3. Header present, token invalid → still falls back to the
         default rather than 401. Logging the user out for a stale
         token feels worse than serving the default scope; the route
         layer is free to wrap this with a stricter dep when a real
         multi-tenant auth flow gets re-enabled.

    Returns just the ``int`` because most callers only need the id —
    no need to round-trip a full User row from the DB on every read.
    """
    if credentials is None:
        return DEFAULT_ANON_USER_ID
    try:
        auth_service = AuthService(db)
        user = await auth_service.verify_token(credentials.credentials)
    except Exception:
        return DEFAULT_ANON_USER_ID
    if user is None:
        return DEFAULT_ANON_USER_ID
    return int(user.id)


async def get_current_active_user(
    current_user=Depends(get_current_user),
):
    """Get current active user (approved or admin).

    Type-loose intentionally: the upstream ``get_current_user`` is
    typed to return ``User`` (the password-auth model), but the OAuth
    bolt-on flow constructs ``OAuthUser`` instances that carry the
    ``status`` field this branch reads. ``getattr`` with a default
    keeps the password-auth path safe — a regular ``User`` without
    a ``status`` column simply passes through as "active". When the
    OAuth flow lands and consistently returns OAuthUser, switch
    this type hint to ``User | OAuthUser`` for clarity.
    """
    status_value = getattr(current_user, "status", None)
    if status_value == "pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is pending approval. Please wait for admin approval.",
        )
    return current_user

async def get_current_admin_user(
    current_user=Depends(get_current_user),
):
    """Get current admin user.

    Same type-loose pattern as ``get_current_active_user`` — gets a
    ``User`` from password-auth or an ``OAuthUser`` from the Google
    flow. Both carry ``email``, so the admin check is portable. The
    helper is currently UNUSED (grep finds zero callers), but we keep
    it in place for the admin-panel route that the auth_google flow
    is expected to add.
    """
    if getattr(current_user, "email", None) != "mohamad.mahdi1988@gmail.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user