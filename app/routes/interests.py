"""/api/interests — user interest CRUD (audit task 14e65214, Step 1).

Scoped by ``get_optional_user_id`` (login-bypass single-tenant design, same as
tasks/lists/finance/ai-configs): anonymous traffic resolves to user 0 so the
SPA can manage interests without a bearer. Ownership is still enforced on
delete — you can only remove a row whose ``user_id`` matches yours.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.schemas.user_interest_schema import (
    UserInterestCreate,
    UserInterestResponse,
)
from app.services.user_interest_service import UserInterestService

router = APIRouter(prefix="/api/interests", tags=["interests"])


@router.post("", response_model=UserInterestResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=UserInterestResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
@handle_errors
async def create_user_interest(
    interest: UserInterestCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    service = UserInterestService(db)
    return await service.create_interest(user_id=user_id, interest_data=interest)


@router.get("", response_model=List[UserInterestResponse])
@router.get("/", response_model=List[UserInterestResponse], include_in_schema=False)
@handle_errors
async def get_user_interests(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    service = UserInterestService(db)
    return await service.get_interests_by_user(user_id=user_id)


@router.delete("/{interest_id}", status_code=status.HTTP_204_NO_CONTENT)
@handle_errors
async def delete_user_interest(
    interest_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    service = UserInterestService(db)
    success = await service.delete_interest(interest_id=interest_id, user_id=user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interest not found or not authorized",
        )
