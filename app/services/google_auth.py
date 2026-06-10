import logging
import httpx
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.models.user_oauth import OAuthUser, UserRole, UserPermission

logger = logging.getLogger(__name__)

# Valid Google ID-token issuers. Anything else is rejected outright.
_GOOGLE_ISSUERS = {"accounts.google.com", "https://accounts.google.com"}


async def verify_google_token(token: str) -> Optional[dict]:
    """Verify a Google ID token and return its claims, or None.

    Uses Google's tokeninfo endpoint to validate the signature/expiry, then
    enforces TWO security checks that the bare endpoint does NOT:

      * ``iss`` MUST be one of Google's issuers, and
      * ``aud`` MUST equal our ``GOOGLE_CLIENT_ID`` (when configured) — this
        is what stops an ID token minted for *another* OAuth client from
        being replayed against us (token-substitution). Skipped only when no
        client id is configured (local dev), with a loud warning.

    Returns the claims dict (``sub``, ``email``, ``name``, ``picture`` …) on
    success.
    """
    if not token:
        return None
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": token},
            )
            if response.status_code != 200:
                logger.warning("Google tokeninfo rejected token (status=%s)", response.status_code)
                return None
            claims = response.json()
    except Exception as exc:
        logger.warning("Google token verification failed: %s", exc)
        return None

    if claims.get("iss") not in _GOOGLE_ISSUERS:
        logger.warning("Google token has invalid issuer: %s", claims.get("iss"))
        return None

    client_id = (settings.GOOGLE_CLIENT_ID or "").strip()
    if client_id:
        if claims.get("aud") != client_id:
            logger.warning("Google token audience mismatch (aud=%s)", claims.get("aud"))
            return None
    else:
        logger.warning("GOOGLE_CLIENT_ID not set — verifying token WITHOUT audience check")

    if not claims.get("email"):
        return None
    return claims

async def exchange_code_for_token(code: str) -> Optional[dict]:
    """Exchange authorization code for tokens."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code",
                },
            )
            if response.status_code != 200:
                return None
            return response.json()
    except Exception:
        return None

async def get_or_create_user(db: AsyncSession, email: str, name: Optional[str] = None) -> OAuthUser:
    """Get existing user or create new one."""
    result = await db.execute(select(OAuthUser).where(OAuthUser.email == email))
    user = result.scalar_one_or_none()
    
    if user:
        return user
    
    # Bootstrap admins: an email in the operator-configured ADMIN_EMAILS list
    # is seeded with the ADMIN role/permissions and pre-approved. This replaces
    # the previous hardcoded-email literal — the identity now lives in env, not
    # source, and request-time authz is role-based (see app/dependencies/auth.py
    # ::is_admin). Comparison is case-insensitive via admin_emails_list.
    if (email or "").strip().lower() in settings.admin_emails_list:
        role = UserRole.ADMIN
        permissions = UserPermission.ADMIN
        status = "approved"
    else:
        role = UserRole.PENDING
        permissions = UserPermission.READ_ONLY
        status = "pending"
    
    new_user = OAuthUser(
        email=email,
        name=name,
        role=role,
        permissions=permissions,
        status=status
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

def create_jwt_token(user: OAuthUser) -> str:
    """Create a session JWT for an OAuth user.

    ``sub`` is the integer ``oauth_users.id`` (as a string), and ``typ`` is
    ``"oauth"`` — this is the contract ``app.dependencies.auth.get_current_user``
    relies on to (a) know which table to resolve the token against
    (``oauth_users`` vs the local ``users`` table) and (b) parse ``sub`` as an
    int. The previous version stored the EMAIL in ``sub``; the dependency then
    did ``int(sub)`` and looked the id up in the local ``users`` table, so an
    OAuth token could NEVER resolve and every /auth/me, /dashboard and /admin
    call 401'd. Storing the id + a type marker is what makes the whole Google
    sign-in flow actually work end-to-end.

    The role/permissions/status claims are carried for convenience/debugging
    only — authorization is ALWAYS recomputed from the fresh DB row at request
    time (see is_admin / the user-management gates), so an admin's permission
    change takes effect immediately without waiting for the token to expire.
    """
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "sub": str(user.id),
        "typ": "oauth",
        "email": user.email,
        "role": user.role.value if hasattr(user.role, "value") else user.role,
        "permissions": user.permissions.value if hasattr(user.permissions, "value") else user.permissions,
        "status": user.status,
        "exp": expire,
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_oauth_user_by_id(db: AsyncSession, user_id: int) -> Optional[OAuthUser]:
    """Resolve an OAuth user by primary key (used by the auth dependency)."""
    result = await db.execute(select(OAuthUser).where(OAuthUser.id == user_id))
    return result.scalar_one_or_none()

async def get_all_pending_users(db: AsyncSession) -> list[OAuthUser]:
    """Get all users with pending status."""
    result = await db.execute(
        select(OAuthUser).where(OAuthUser.status == "pending")
    )
    return list(result.scalars().all())

async def approve_user(db: AsyncSession, user_id: int, permissions: str = "read-only") -> Optional[OAuthUser]:
    """Approve a pending user and set permissions."""
    result = await db.execute(select(OAuthUser).where(OAuthUser.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        return None
    
    user.status = "approved"
    user.role = UserRole.APPROVED
    
    perm_map = {
        "read-only": UserPermission.READ_ONLY,
        "editor": UserPermission.EDITOR,
        "admin": UserPermission.ADMIN
    }
    user.permissions = perm_map.get(permissions, UserPermission.READ_ONLY)

    await db.commit()
    await db.refresh(user)
    return user


# ── Full admin user management (audit: role/permission/status control) ──────
# These power the admin panel and the React "User Management" page. They are
# the lifemanager-native equivalent of trading-system's AuthService.update_user
# / delete_user, kept server-side so privilege decisions never trust the
# client. The operator-configured ADMIN_EMAILS super-admins are protected:
# they can't be demoted, locked out, or deleted by anyone.

# Accepted values, mapped to the stored enums. The three-tier access level is
# carried on ``permissions``; ``role`` doubles as the management flag (ADMIN)
# vs an ordinary approved/pending account.
_PERMISSION_MAP = {
    "read-only": UserPermission.READ_ONLY,
    "editor": UserPermission.EDITOR,
    "admin": UserPermission.ADMIN,
}
_VALID_STATUSES = {"pending", "approved", "rejected"}


def is_super_admin_email(email: Optional[str]) -> bool:
    """True if the email is in the operator-configured ADMIN_EMAILS list."""
    return bool(email) and (email or "").strip().lower() in settings.admin_emails_list


async def list_all_oauth_users(db: AsyncSession) -> list[OAuthUser]:
    """Every OAuth user, newest first — backs the admin management views."""
    result = await db.execute(select(OAuthUser).order_by(OAuthUser.created_at.desc()))
    return list(result.scalars().all())


async def admin_update_oauth_user(
    db: AsyncSession,
    user_id: int,
    *,
    role: Optional[str] = None,
    permissions: Optional[str] = None,
    status: Optional[str] = None,
) -> Optional[OAuthUser]:
    """Update an OAuth user's role / access level / status (admin action).

    Semantics, mirroring the trading-system model:
      * ``role="admin"``  → full admin: role=ADMIN, permissions=ADMIN, and
        status forced to approved (no "pending admin" limbo).
      * ``role="user"``   → ordinary account: role=APPROVED (kept out of the
        admin set); the access level is whatever ``permissions`` says.
      * ``permissions``   → the three-tier access level (read-only/editor/admin).
      * ``status``        → approved / pending / rejected (gates app access).

    A super-admin (ADMIN_EMAILS) is immutable here: any attempt to lower their
    role/permissions or set a non-approved status is ignored, so the operator
    can never be locked out of their own deployment. Returns the updated row,
    or None if no such user.
    """
    user = await get_oauth_user_by_id(db, user_id)
    if not user:
        return None

    protected = is_super_admin_email(user.email)

    if role is not None:
        if role == "admin":
            user.role = UserRole.ADMIN
            user.permissions = UserPermission.ADMIN
            user.status = "approved"
        elif role == "user" and not protected:
            user.role = UserRole.APPROVED

    if permissions is not None and not protected:
        mapped = _PERMISSION_MAP.get(permissions)
        if mapped is not None:
            user.permissions = mapped

    if status is not None and not protected:
        if status in _VALID_STATUSES:
            user.status = status

    await db.commit()
    await db.refresh(user)
    return user


async def delete_oauth_user(db: AsyncSession, user_id: int) -> bool:
    """Delete an OAuth user. Super-admins (ADMIN_EMAILS) cannot be deleted.

    Returns True on deletion, False if the user is missing or protected.
    """
    user = await get_oauth_user_by_id(db, user_id)
    if not user or is_super_admin_email(user.email):
        return False
    await db.delete(user)
    await db.commit()
    return True