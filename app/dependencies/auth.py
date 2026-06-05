"""Auth dependencies for FastAPI routes.

The codebase has two distinct user ORM models, each backing a distinct
authentication flow (audit task b7638cb2):

  * ``app.models.user.User`` — table ``users``. Username/email +
    bcrypt password. Powers the local register/login flow served by
    ``app/routes/auth.py`` and ``app/services/auth_service.py``.
  * ``app.models.user_oauth.OAuthUser`` — table ``oauth_users``.
    Google-issued identity (no password), plus ``role`` /
    ``permissions`` / ``status`` columns for the admin-approval flow
    served by ``app/routes/auth_google.py``.

Both models live behind the same JWT — ``get_current_user`` returns
whichever ORM instance ``AuthService.verify_token`` looked up — so
downstream helpers cannot assume a single concrete shape. They probe
attributes with ``getattr`` (defensive: a User token answers
``status="active"``, an OAuthUser token answers its real status).
The active/admin gates are still meaningful — a pending OAuthUser
still gets 403 — but they no longer crash on a User-backed token
where the column doesn't exist.
"""
from typing import Union

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.services.auth_service import AuthService
from app.models.user_oauth import OAuthUser, UserRole, UserPermission
from app.core.config import settings


AuthContext = Union[User, OAuthUser]

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


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> AuthContext:
    """Resolve the bearer token to a user row.

    The return type is ``AuthContext`` — either a ``User`` or an
    ``OAuthUser``. Downstream helpers must not assume one concrete
    shape; they probe attributes with ``getattr``.
    """
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

    This is the *lenient* identity dependency. It verifies the JWT
    signature (via ``AuthService.verify_token`` →
    ``auth_service.validate_token``, which checks signature, algorithm
    and expiry) but never hard-fails: it is used by routes that must
    keep serving the dashboard while the frontend's login-bypass mode
    is enabled. Three cases handled:

      1. No Authorization header → DEFAULT_ANON_USER_ID. Matches the
         current frontend's login-bypass mode so the routes don't 403
         the user out of their own dashboard.
      2. Header present, token resolves → that user's id.
      3. Header present, token invalid → still falls back to the
         default rather than 401. Logging the user out for a stale
         token feels worse than serving the default scope; sensitive
         routes use :func:`get_required_user_id` instead, which DOES
         reject a present-but-invalid token.

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


async def get_required_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_security),
    db: AsyncSession = Depends(get_db),
) -> int:
    """Strict identity dependency for sensitive routes (finance, assets,
    context, …). Unlike :func:`get_optional_user_id` it never silently
    downgrades a bad credential to the anon scope. Security task 9a5a3b4d.

    Behaviour:
      1. **Header present, token VALID** → that user's id.
      2. **Header present, token INVALID/expired/forged** → 401, *always*,
         regardless of ``settings.REQUIRE_AUTH``. A present-but-invalid
         bearer is an attack signal (someone is probing with a guessed or
         stale token); it must never resolve to user 0's data. This is the
         core fix behind the task's validation probe::

             curl /api/finance/incomes -H 'Authorization: Bearer invalid_token'
             → 401

      3. **No Authorization header** → governed by ``settings.REQUIRE_AUTH``:
         * ``False`` (default): fall back to ``DEFAULT_ANON_USER_ID`` so the
           current single-tenant login-bypass frontend keeps working and the
           existing user-0 data stays reachable until it is migrated to real
           accounts (the manual AC3 data migration).
         * ``True``: reject with 401 — anonymous access to sensitive routes
           is refused once the operator has migrated the data and opted in.

    Returns just the ``int`` for parity with :func:`get_optional_user_id`,
    so route handlers can swap one dependency for the other without
    touching their bodies.
    """
    if credentials is None:
        if settings.REQUIRE_AUTH:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return DEFAULT_ANON_USER_ID
    # A header was supplied — it MUST carry one of our valid tokens.
    auth_service = AuthService(db)
    try:
        user = await auth_service.verify_token(credentials.credentials)
    except Exception:
        user = None
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return int(user.id)


async def get_current_active_user(
    current_user: AuthContext = Depends(get_current_user),
) -> AuthContext:
    """Block the OAuth ``pending`` state from active routes.

    ``status`` is OAuthUser-only. Local ``User`` rows have no such
    column, so we probe with ``getattr`` and treat its absence as
    "active enough" — local users are gated by ``is_active`` on the
    User model and the login flow has its own UserDisabledError path,
    so they never reach here in the disabled state.
    """
    status_value = getattr(current_user, "status", None)
    if status_value == "pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is pending approval. Please wait for admin approval.",
        )
    return current_user

def is_admin(current_user: AuthContext) -> bool:
    """Role-based admin check across both user shapes.

    This replaces the previous ``email == "<hardcoded literal>"`` test, which
    bypassed RBAC entirely: a user explicitly granted ``UserRole.ADMIN`` /
    ``UserPermission.ADMIN`` (e.g. via the approve flow) wasn't recognised,
    while a real person's identity was baked into source. A caller is admin
    when EITHER:

      * their ``role`` column is ``UserRole.ADMIN`` — the canonical RBAC
        signal carried on ``OAuthUser`` (the local ``User`` has no role
        column, so ``getattr`` yields ``None`` and this is simply skipped),
      * their ``permissions`` column is ``UserPermission.ADMIN``, or
      * their email is in the operator-configured ``ADMIN_EMAILS`` bootstrap
        list (case-insensitive) — how the first admin is seeded on a fresh
        deploy before anyone has been granted the role in the DB.

    Both enum members and their raw ``str`` values compare equal because
    ``UserRole``/``UserPermission`` subclass ``str``; we still normalise via
    ``getattr(x, "value", x)`` so a plain string column survives too.
    """
    role = getattr(current_user, "role", None)
    if getattr(role, "value", role) == UserRole.ADMIN.value:
        return True
    perm = getattr(current_user, "permissions", None)
    if getattr(perm, "value", perm) == UserPermission.ADMIN.value:
        return True
    email = (getattr(current_user, "email", None) or "").strip().lower()
    return bool(email) and email in settings.admin_emails_list


async def get_current_admin_user(
    current_user: AuthContext = Depends(get_current_user),
) -> AuthContext:
    """Admin gate. Works for both User and OAuthUser shapes — authorization
    is role-based (see :func:`is_admin`), not a hardcoded-email comparison."""
    if not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user