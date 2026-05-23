from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional

from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, TokenResponse
from app.database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "your-secret-key-here"  # TODO: move to env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


async def register(db: AsyncSession, user_data: UserCreate) -> User:
    existing = await db.execute(select(User).where(User.email == user_data.email))
    if existing.scalar_one_or_none():
        raise ValueError("Email already registered")

    hashed_password = pwd_context.hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def login(db: AsyncSession, credentials: UserLogin) -> TokenResponse:
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    if not user or not pwd_context.verify(credentials.password, user.hashed_password):
        raise ValueError("Invalid email or password")

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return TokenResponse(access_token=access_token, token_type="bearer")


async def get_current_user(db: AsyncSession, token: str) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError, AttributeError):
        raise ValueError("Invalid token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise ValueError("User not found")
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


class AuthService:
    """Class-based wrapper used by app/dependencies/auth.py"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def verify_token(self, token: str) -> Optional[User]:
        try:
            return await get_current_user(self.db, token)
        except ValueError:
            return None


class UserService:
    """Class-based wrapper used by app/routes/users.py"""

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