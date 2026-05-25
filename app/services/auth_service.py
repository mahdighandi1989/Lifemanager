"""Authentication service — single source of truth for JWT and password ops.

Functions exposed:
    hash_password / verify_password   — bcrypt via passlib
    create_access_token               — sign a JWT with the canonical secret
    validate_token                    — decode + verify a JWT; returns payload
                                        or None. THE only place that calls
                                        jwt.decode for our own access tokens.
    register / login                  — pure service layer, raise ValueError on
                                        invalid input so routes can translate
                                        to the correct HTTP status code.
    get_current_user                  — async helper that resolves a token to
                                        a User row; raises ValueError if not
                                        found or token invalid.

Class wrappers (AuthService, UserService) preserve the existing call-sites
in app/dependencies/auth.py and app/routes/users.py.
"""
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user import User
from app.schemas.auth import TokenResponse, UserCreate, UserLogin

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# --- Password helpers --------------------------------------------------------

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# --- JWT helpers -------------------------------------------------------------

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def validate_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT. Returns the payload dict, or None on any
    failure (bad signature, expired, malformed, missing 'sub').

    Every caller that needs to validate one of OUR access tokens MUST use
    this function so signature/algorithm/expiry handling stays consistent.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
    except JWTError:
        return None
    if "sub" not in payload:
        return None
    return payload


# --- High-level operations ---------------------------------------------------

async def register(db: AsyncSession, user_data: UserCreate) -> User:
    existing = await db.execute(select(User).where(User.email == user_data.email))
    if existing.scalar_one_or_none():
        raise ValueError("Email already registered")

    db_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hash_password(user_data.password),
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def login(db: AsyncSession, credentials: UserLogin) -> TokenResponse:
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(credentials.password, user.hashed_password):
        # Audit critical auth failures. notify_event swallows its own
        # DB errors so a notification outage can never block the 401.
        # silent=False + priority="high" matches the AC for the
        # verify_failed notification path.
        from app.services.notification_service import notify_event

        try:
            await notify_event(
                "verify_failed",
                user_id=getattr(user, "id", 0) or 0,
                db=db,
                priority="high",
                silent=False,
            )
        except Exception:  # never let notifications mask the 401
            pass
        raise ValueError("Invalid email or password")

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return TokenResponse(access_token=token, token_type="bearer")


async def get_current_user(db: AsyncSession, token: str) -> User:
    payload = validate_token(token)
    if payload is None:
        raise ValueError("Invalid token")
    try:
        user_id = int(payload["sub"])
    except (TypeError, ValueError):
        raise ValueError("Invalid token") from None

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise ValueError("User not found")
    return user


# --- Class wrappers (preserve existing call-sites) ---------------------------

class AuthService:
    """Used by app/dependencies/auth.py via Depends."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def verify_token(self, token: str) -> Optional[User]:
        try:
            return await get_current_user(self.db, token)
        except ValueError:
            return None


class UserService:
    """Used by app/routes/users.py."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_users(self):
        result = await self.db.execute(select(User))
        return list(result.scalars().all())

    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def update_user(self, user_id: int, user_data, current_user_id: int) -> Optional[User]:
        user = await self.get_user_by_id(user_id)
        if not user:
            return None
        update_data = user_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(user, key, value)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def delete_user(self, user_id: int, current_user_id: int) -> bool:
        user = await self.get_user_by_id(user_id)
        if not user:
            return False
        await self.db.delete(user)
        await self.db.commit()
        return True
