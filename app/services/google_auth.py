import httpx
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.models.user_oauth import OAuthUser, UserRole, UserPermission

async def verify_google_token(token: str) -> Optional[dict]:
    """Verify Google OAuth token and return user info."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
            )
            if response.status_code != 200:
                return None
            return response.json()
    except Exception:
        return None

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
    """Create JWT token for OAuth user."""
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "sub": user.email,
        "role": user.role.value if hasattr(user.role, 'value') else user.role,
        "permissions": user.permissions.value if hasattr(user.permissions, 'value') else user.permissions,
        "status": user.status,
        "exp": expire
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

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