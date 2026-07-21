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
from typing import Optional, Union

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.services.auth_service import validate_token
from app.services.google_auth import get_oauth_user_by_id
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


def _extract_token(request: Request) -> Optional[str]:
    """Pull the session token from the Authorization header OR the
    ``access_token`` cookie.

    The React SPA and JSON API clients send ``Authorization: Bearer <jwt>``.
    The server-rendered Google sign-in pages (the /dashboard, /admin/panel
    HTML flow) instead carry the token in an httponly ``access_token`` cookie
    set by the OAuth callback — a plain browser navigation can't add an
    Authorization header, so without cookie support those pages always 401'd.
    Either form is accepted; the value may be bare or ``Bearer <jwt>``.
    """
    header = request.headers.get("Authorization", "") or ""
    if header.lower().startswith("bearer "):
        return header[7:].strip() or None
    cookie = request.cookies.get("access_token")
    if cookie:
        return cookie[7:].strip() if cookie.lower().startswith("bearer ") else cookie.strip()
    return None


async def _resolve_token_to_user(token: str, db: AsyncSession) -> Optional[AuthContext]:
    """Resolve a validated JWT to either an OAuthUser or a local User.

    The token's ``typ`` claim disambiguates which table to hit:
      * ``typ == "oauth"`` → ``oauth_users`` (Google sign-in identity), and
      * anything else      → the local ``users`` table (password accounts).

    Authorization is recomputed from this fresh row on every request, so an
    admin's role/permission change is effective immediately.
    """
    payload = validate_token(token)
    if payload is None:
        return None
    try:
        user_id = int(payload["sub"])
    except (KeyError, TypeError, ValueError):
        return None

    if payload.get("typ") == "oauth":
        return await get_oauth_user_by_id(db, user_id)

    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def _resolve_data_scope_user_id(token: str, db: AsyncSession) -> Optional[int]:
    """Map a token to a per-user DATA scope id (the ``users.id`` space).

    This is DELIBERATELY different from :func:`_resolve_token_to_user`, which
    is for auth/admin gating. The per-user data tables (``user_contexts``,
    finance, assets, …) carry a foreign key to the LOCAL ``users.id``. A Google
    OAuth identity lives in a SEPARATE table (``oauth_users``) whose id is NOT
    a valid ``users.id`` — using it as a data-scope id violates those FKs (the
    cause of the /api/context/location 409s after Google sign-in went live).

    So the mapping is:
      * OAuth token  → ``DEFAULT_ANON_USER_ID``: the single-tenant shared scope,
        identical to the pre-auth behaviour. This personal deployment has one
        real operator, so their data lives in that one scope rather than under
        an FK-incompatible oauth id. Returns an int, never None.
      * Local token  → the verified ``users.id`` if the row exists, else None.
      * Invalid token → None.
    """
    payload = validate_token(token)
    if payload is None:
        return None
    if payload.get("typ") == "oauth":
        return DEFAULT_ANON_USER_ID
    try:
        uid = int(payload["sub"])
    except (KeyError, TypeError, ValueError):
        return None
    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    return user.id if user else None


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> AuthContext:
    """Resolve the session token to a user row.

    The return type is ``AuthContext`` — either a ``User`` or an
    ``OAuthUser``. Downstream helpers must not assume one concrete
    shape; they probe attributes with ``getattr``. The token is read
    from the Authorization header or the ``access_token`` cookie (see
    :func:`_extract_token`), and resolved against the correct table by
    its ``typ`` claim (see :func:`_resolve_token_to_user`).
    """
    token = _extract_token(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = await _resolve_token_to_user(token, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return user


async def get_optional_user_id(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> int:
    """Return the caller's user_id, or ``DEFAULT_ANON_USER_ID`` if anon.

    This is the *lenient* identity dependency. It verifies the JWT
    signature/expiry but never hard-fails: it is used by routes that must
    keep serving the dashboard for anonymous traffic. Three cases handled:

      1. No token (header or cookie) → DEFAULT_ANON_USER_ID.
      2. Token resolves → that user's id (OAuth or local — see
         :func:`_resolve_token_to_user`).
      3. Token present but invalid → still falls back to the default
         rather than 401. Sensitive routes use :func:`get_required_user_id`
         instead, which DOES reject a present-but-invalid token.

    Returns just the ``int`` because most callers only need the id.
    """
    token = _extract_token(request)
    if token is None:
        return DEFAULT_ANON_USER_ID
    try:
        uid = await _resolve_data_scope_user_id(token, db)
    except Exception:
        return DEFAULT_ANON_USER_ID
    return DEFAULT_ANON_USER_ID if uid is None else uid


async def get_required_user_id(
    request: Request,
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
    token = _extract_token(request)
    if token is None:
        if settings.REQUIRE_AUTH:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return DEFAULT_ANON_USER_ID
    # A token was supplied — it MUST be one of our valid tokens. An OAuth token
    # resolves to the shared single-tenant scope (see
    # :func:`_resolve_data_scope_user_id`); a local token resolves to its
    # users.id; an invalid token yields None → 401.
    try:
        uid = await _resolve_data_scope_user_id(token, db)
    except Exception:
        uid = None
    if uid is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return uid


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

async def enforce_auth_when_required(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> None:
    """Strict-when-configured gate (data-safety phase 0, refined 2026-07-20).

    Composed NEXT TO ``get_optional_user_id`` so identity resolution stays
    overridable in tests (the f17880d0 suite pins authorization semantics
    through that override) while strictness is enforced separately:

      * token present but invalid → 401 always (attack signal).
      * no token + ``REQUIRE_AUTH=true`` → 401 (anon access refused).
      * no token + ``REQUIRE_AUTH=false`` (default) → allowed, unchanged.

    Used on BOTH mutation endpoints and the read endpoints that expose the
    owner's whole-DB surface (backup export, finance reports, the global
    assistant/search, trash, settings status) — so flipping REQUIRE_AUTH
    on genuinely locks the public URL down, not just the /finance writes.
    """
    token = _extract_token(request)
    if token is None:
        if settings.REQUIRE_AUTH:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return
    try:
        uid = await _resolve_data_scope_user_id(token, db)
    except Exception:
        uid = None
    if uid is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# Back-compat alias — the mutation routes import this name.
enforce_write_auth = enforce_auth_when_required
