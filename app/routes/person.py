"""/api/persons CRUD (audit task 3cc09436).

Each person row is owned by one user — the caller is resolved via
``get_optional_user_id`` so the frontend's login-bypass mode still
works while a real JWT switches the route into per-user enforcement.
"""
from typing import List

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.schemas.person_schema import (
    PersonCreate,
    PersonResponse,
    PersonUpdate,
)
from app.services import person_service


router = APIRouter()


@router.post(
    "/api/persons",
    response_model=PersonResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["persons"],
)
@handle_errors
async def create_person(
    payload: PersonCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> PersonResponse:
    person = await person_service.create_person(
        db, user_id=user_id, payload=payload
    )
    return person


@router.get(
    "/api/persons",
    response_model=List[PersonResponse],
    tags=["persons"],
)
@handle_errors
async def list_persons(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> List[PersonResponse]:
    return await person_service.get_all_persons_for_user(db, user_id=user_id)


@router.get(
    "/api/persons/{person_id}",
    response_model=PersonResponse,
    tags=["persons"],
)
@handle_errors
async def get_person(
    person_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> PersonResponse:
    person = await person_service.get_person(db, person_id=person_id, user_id=user_id)
    if person is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
    return person


@router.put(
    "/api/persons/{person_id}",
    response_model=PersonResponse,
    tags=["persons"],
)
@handle_errors
async def update_person(
    person_id: int,
    payload: PersonUpdate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> PersonResponse:
    person = await person_service.update_person(
        db, person_id=person_id, user_id=user_id, payload=payload
    )
    if person is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
    return person


@router.delete(
    "/api/persons/{person_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["persons"],
)
@handle_errors
async def delete_person(
    person_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    success = await person_service.delete_person(
        db, person_id=person_id, user_id=user_id
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
