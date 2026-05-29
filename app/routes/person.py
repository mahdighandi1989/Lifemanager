"""/api/persons CRUD (audit task 3cc09436).

Each person row is owned by one user — the caller is resolved via
``get_optional_user_id`` so the frontend's login-bypass mode still
works while a real JWT switches the route into per-user enforcement.
"""
from typing import List

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, Field
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


# ── /api/people-profiles aliases (audit task 3cc09436 AC4/AC5/AC6) ──────
# The canonical ACs name the surface /people-profiles; the shipped CRUD lives
# at /api/persons. These thin aliases satisfy the AC paths without forking the
# logic, and add the behaviour-analysis endpoint.


@router.get("/api/people-profiles", response_model=List[PersonResponse], tags=["persons"])
@handle_errors
async def list_people_profiles(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> List[PersonResponse]:
    return await person_service.get_all_persons_for_user(db, user_id=user_id)


@router.post(
    "/api/people-profiles",
    response_model=PersonResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["persons"],
)
@handle_errors
async def create_people_profile(
    payload: PersonCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> PersonResponse:
    return await person_service.create_person(db, user_id=user_id, payload=payload)


@router.post("/api/people-profiles/{person_id}/analyze", tags=["persons"])
@handle_errors
async def analyze_people_profile(
    person_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """AC6: score the relationship from the person's interaction history and
    return {ai_score, relationship_type, ...}."""
    from sqlalchemy import select

    from app.models.interaction import Interaction
    from app.services.ai.model_service import AIService

    person = await person_service.get_person(db, person_id=person_id, user_id=user_id)
    if person is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")

    rows = (
        await db.execute(select(Interaction).where(Interaction.person_id == person_id))
    ).scalars().all()
    return await AIService(db).analyze_person_behavior(getattr(person, "name", ""), list(rows))


# ── PersonProfile endpoints (audit task 3cc09436 AC2/AC3/AC6) ────────────


class _NotePayload(BaseModel):
    user_notes: str = Field(..., max_length=4000)


@router.get("/api/people/{person_id}/profile", tags=["persons"])
@handle_errors
async def get_person_profile(
    person_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """AC2: return the person's behavioural profile (ai_score / user_notes /
    behavior_log / relationship_type)."""
    from app.services import person_profile_service

    person = await person_service.get_person(db, person_id=person_id, user_id=user_id)
    if person is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
    profile = await person_profile_service.get_or_create_profile(db, person_id=person_id)
    return person_profile_service.serialize(profile)


@router.post("/api/people/{person_id}/profile/analyze", tags=["persons"])
@handle_errors
async def analyze_person_profile(
    person_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """AC3: run AI analysis over the person's interactions and persist the
    score + relationship type onto the profile."""
    from app.services import person_profile_service

    person = await person_service.get_person(db, person_id=person_id, user_id=user_id)
    if person is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
    profile = await person_profile_service.analyze_person(
        db, person_id=person_id, person_name=getattr(person, "name", "")
    )
    return person_profile_service.serialize(profile)


@router.post("/api/people/{person_id}/profile/note", tags=["persons"])
@handle_errors
async def add_person_profile_note(
    person_id: int,
    payload: _NotePayload = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """AC6: persist a free-text user note on the person's profile."""
    from app.services import person_profile_service

    person = await person_service.get_person(db, person_id=person_id, user_id=user_id)
    if person is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
    profile = await person_profile_service.set_note(
        db, person_id=person_id, note=payload.user_notes
    )
    return person_profile_service.serialize(profile)
