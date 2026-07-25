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
from app.services.activity_log_service import record_activity


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
    await record_activity(
        action="create", entity_type="person", entity_id=getattr(person, "id", None),
        entity_label=getattr(person, "name", None), detail="ایجاد پروفایل فرد",
        user_id=user_id, db=db,
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
    await record_activity(
        action="update", entity_type="person", entity_id=person_id,
        entity_label=getattr(person, "name", None), detail="ویرایش پروفایل فرد",
        user_id=user_id, db=db,
    )
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
    person = await person_service.get_person(db, person_id=person_id, user_id=user_id)
    name = getattr(person, "name", None) if person is not None else None
    success = await person_service.delete_person(
        db, person_id=person_id, user_id=user_id
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
    await record_activity(
        action="delete", entity_type="person", entity_id=person_id,
        entity_label=name, detail="حذف پروفایل فرد", user_id=user_id, db=db,
    )


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


@router.get("/api/people-profiles/summary", tags=["persons"])
@handle_errors
async def list_people_profiles_summary(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> List[dict]:
    """Each tracked person WITH their behavioural-profile summary (ai_score +
    relationship_type), so the افراد list shows the AI score/relationship at a
    glance ("یه امتیازی بهش می‌ده") instead of just names. LEFT JOIN so people
    without a profile yet still appear (score/relationship null). Additive — the
    plain /api/people-profiles + /api/persons list contracts are unchanged."""
    from sqlalchemy import select

    from app.models.person import Person
    from app.models.person_profile import PersonProfile

    from app.services import person_profile_service as pps

    rows = (
        await db.execute(
            select(Person, PersonProfile)
            .outerjoin(PersonProfile, PersonProfile.person_id == Person.id)
            .where(Person.user_id == user_id)
            .order_by(Person.created_at.desc())
        )
    ).all()
    out: List[dict] = []
    for person, profile in rows:
        rel = pps.effective_relationship(profile) if profile is not None else None
        ledger = pps.build_ledger(profile) if profile is not None else None
        out.append({
            "id": person.id,
            "name": person.name,
            "email": person.email,
            "phone": person.phone,
            "ai_score": profile.ai_score if profile is not None else None,
            "relationship_type": profile.relationship_type if profile is not None else None,
            # افراد (2026-07-25): the effective relationship (owner's verdict
            # wins), its Persian label, the permanent ledger, and the CRM dates
            # — so the list page needs ONE request, not two.
            "relationship": rel,
            "relationship_fa": pps.REL_FA.get(rel, rel) if rel else None,
            "relationship_override": (
                getattr(profile, "relationship_override", None) if profile is not None else None
            ),
            "ledger": ledger,
            "birthday": person.birthday.isoformat() if getattr(person, "birthday", None) else None,
            "next_follow_up": (
                person.next_follow_up.isoformat()
                if getattr(person, "next_follow_up", None) else None
            ),
            "last_analyzed_at": (
                profile.last_analyzed_at.isoformat()
                if (profile is not None and profile.last_analyzed_at)
                else None
            ),
        })
    return out


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
    person = await person_service.create_person(db, user_id=user_id, payload=payload)
    await record_activity(
        action="create", entity_type="person", entity_id=getattr(person, "id", None),
        entity_label=getattr(person, "name", None), detail="ایجاد پروفایل فرد",
        user_id=user_id, db=db,
    )
    return person


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
    return person_profile_service.serialize(profile, person)


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
    await record_activity(
        action="analyze", entity_type="person", entity_id=person_id,
        entity_label=getattr(person, "name", None),
        detail="تحلیل هوش مصنوعی رابطه", user_id=user_id, db=db,
    )
    return person_profile_service.serialize(profile, person)


@router.post("/api/people/{person_id}/profile/note", tags=["persons"])
@handle_errors
async def add_person_profile_note(
    person_id: int,
    payload: _NotePayload = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """AC6 + Step10: persist a note AND analyze its tone (feeds the score)."""
    from app.services import person_profile_service

    person = await person_service.get_person(db, person_id=person_id, user_id=user_id)
    if person is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
    profile = await person_profile_service.set_note(
        db, person_id=person_id, note=payload.user_notes
    )
    await record_activity(
        action="update", entity_type="person_note", entity_id=person_id,
        entity_label=getattr(person, "name", None),
        context_type="person", context_id=person_id,
        detail="ثبت/به‌روزرسانی یادداشت درباره فرد", user_id=user_id, db=db,
    )
    return person_profile_service.serialize(profile, person)


class _DeedPayload(BaseModel):
    kind: str = Field(..., pattern="^(good|bad)$")
    note: str = Field(default="", max_length=2000)
    important: bool = False


@router.post("/api/people/{person_id}/profile/deed", tags=["persons"])
@handle_errors
async def record_person_deed(
    person_id: int,
    payload: _DeedPayload = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Record a good/bad deed (Step 4-5 — "کارهای بد و خوبش ثبت بشه") and
    recompute the score with time decay."""
    from app.services import person_profile_service

    person = await person_service.get_person(db, person_id=person_id, user_id=user_id)
    if person is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
    profile = await person_profile_service.record_deed(
        db, person_id=person_id, kind=payload.kind, note=payload.note, important=payload.important
    )
    await record_activity(
        action="create", entity_type="deed", entity_id=person_id,
        entity_label=getattr(person, "name", None),
        context_type="person", context_id=person_id,
        detail=("ثبت کار خوب" if payload.kind == "good" else "ثبت کار بد")
        + (f" — {payload.note}" if payload.note else ""),
        user_id=user_id, db=db,
    )
    return person_profile_service.serialize(profile, person)


class _RelationshipPayload(BaseModel):
    # None / "" → clear the override and hand the call back to the scorer.
    relationship: str = Field(default="", max_length=32)


@router.put("/api/people/{person_id}/profile/relationship", tags=["persons"])
@handle_errors
async def set_person_relationship(
    person_id: int,
    payload: _RelationshipPayload = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """«نوع رابطه تعیین بشه» — the owner's own verdict, which beats the
    computed one (stored-wins). An empty value clears it."""
    from app.services import person_profile_service

    person = await person_service.get_person(db, person_id=person_id, user_id=user_id)
    if person is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
    try:
        profile = await person_profile_service.set_relationship(
            db, person_id=person_id, relationship=payload.relationship
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    await record_activity(
        action="update", entity_type="person_relationship", entity_id=person_id,
        entity_label=getattr(person, "name", None),
        context_type="person", context_id=person_id,
        detail="تعیین نوع رابطه" + (f" — {payload.relationship}" if payload.relationship else " (واگذاری به سیستم)"),
        user_id=user_id, db=db,
    )
    return person_profile_service.serialize(profile, person)


@router.get("/api/people/{person_id}/profile/reminders", tags=["persons"])
@handle_errors
async def person_reminders(
    person_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Important deeds flagged to not forget (Step 8 — "فراموش نکنم")."""
    from app.services import person_profile_service

    person = await person_service.get_person(db, person_id=person_id, user_id=user_id)
    if person is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
    return {"reminders": await person_profile_service.get_reminders(db, person_id=person_id)}


@router.get("/api/people/{person_id}/profile/suggestions", tags=["persons"])
@handle_errors
async def person_suggestions(
    person_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Actionable suggestions from relationship + deed balance (Step 9)."""
    from app.services import person_profile_service

    person = await person_service.get_person(db, person_id=person_id, user_id=user_id)
    if person is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
    return {"suggestions": await person_profile_service.get_suggestions(db, person_id=person_id)}


@router.get("/api/persons/{person_id}/tasks", tags=["persons"])
@handle_errors
async def person_tasks_list(
    person_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """تسک‌های مرتبط با این فرد — the READ side of person_tasks that never
    existed (2026-07-20 audit #24: the link was write-only)."""
    from sqlalchemy import select

    from app.models.person_task import person_tasks
    from app.models.task import Task

    person = await person_service.get_person(db, person_id=person_id, user_id=user_id)
    if person is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
    rows = (
        await db.execute(
            select(Task)
            .join(person_tasks, person_tasks.c.task_id == Task.id)
            .where(person_tasks.c.person_id == person_id)
            .order_by(Task.id.desc())
        )
    ).scalars().all()
    return {
        "ok": True,
        "person_id": person_id,
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "status": t.status.value if t.status else None,
                "due_date": t.due_date.isoformat() if t.due_date else None,
            }
            for t in rows
        ],
    }
