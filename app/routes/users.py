"""/users routes — uses @handle_errors for centralized error mapping.

No per-route try/except blocks: app.middleware.handle_errors maps
service-layer exceptions onto the canonical HTTPException codes.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.middleware import handle_errors
from app.models.user import User
from app.schemas.user_schema import UserOut, UserUpdate
from app.services.auth_service import UserService

router = APIRouter()


@router.get("/", response_model=List[UserOut])
@handle_errors
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_service = UserService(db)
    return await user_service.get_all_users()


@router.get("/{user_id}", response_model=UserOut)
@handle_errors
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_service = UserService(db)
    user = await user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


@router.patch("/{user_id}", response_model=UserOut)
@handle_errors
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_service = UserService(db)
    user = await user_service.update_user(user_id, user_data, current_user.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
@handle_errors
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_service = UserService(db)
    success = await user_service.delete_user(user_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
