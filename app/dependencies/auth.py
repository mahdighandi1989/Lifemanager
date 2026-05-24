from fastapi import Depends, HTTPException, status
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.services.auth_service import AuthService

from app.database import get_db
from app.models.user_oauth import OAuthUser
from app.core.config import settings

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: AsyncSession = Depends(get_db)) -> User:
    token = credentials.credentials
    auth_service = AuthService(db)
    user = await auth_service.verify_token(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return user

async def get_current_active_user(
    current_user: OAuthUser = Depends(get_current_user),
) -> OAuthUser:
    """Get current active user (approved or admin)."""
    if current_user.status == "pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is pending approval. Please wait for admin approval.",
        )
    return current_user

async def get_current_admin_user(
    current_user: OAuthUser = Depends(get_current_user),
) -> OAuthUser:
    """Get current admin user."""
    if current_user.email != "mohamad.mahdi1988@gmail.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user