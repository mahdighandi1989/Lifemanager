"""CRUD service for the Person model (audit task 3cc09436)."""
from __future__ import annotations

import html
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.person import Person
from app.schemas.person_schema import PersonCreate, PersonUpdate


def _sanitize(value: Optional[str]) -> Optional[str]:
    return None if value is None else html.escape(value, quote=True)


async def create_person(
    db: AsyncSession, *, user_id: int, payload: PersonCreate
) -> Person:
    person = Person(
        user_id=user_id,
        name=_sanitize(payload.name),
        email=str(payload.email) if payload.email else None,
        phone=_sanitize(payload.phone),
        notes=_sanitize(payload.notes),
    )
    db.add(person)
    await db.commit()
    await db.refresh(person)
    return person


async def get_person(
    db: AsyncSession, *, person_id: int, user_id: int
) -> Optional[Person]:
    result = await db.execute(
        select(Person).where(
            (Person.id == person_id) & (Person.user_id == user_id)
        )
    )
    return result.scalar_one_or_none()


async def get_all_persons_for_user(
    db: AsyncSession, *, user_id: int
) -> List[Person]:
    result = await db.execute(
        select(Person).where(Person.user_id == user_id).order_by(Person.created_at.desc())
    )
    return list(result.scalars().all())


async def update_person(
    db: AsyncSession,
    *,
    person_id: int,
    user_id: int,
    payload: PersonUpdate,
) -> Optional[Person]:
    person = await get_person(db, person_id=person_id, user_id=user_id)
    if person is None:
        return None
    if payload.name is not None:
        person.name = _sanitize(payload.name)
    if payload.email is not None:
        person.email = str(payload.email)
    if payload.phone is not None:
        person.phone = _sanitize(payload.phone)
    if payload.notes is not None:
        person.notes = _sanitize(payload.notes)
    await db.commit()
    await db.refresh(person)
    return person


async def delete_person(
    db: AsyncSession, *, person_id: int, user_id: int
) -> bool:
    person = await get_person(db, person_id=person_id, user_id=user_id)
    if person is None:
        return False
    await db.delete(person)
    await db.commit()
    return True
