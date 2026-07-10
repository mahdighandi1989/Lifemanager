"""/api/writings — نوشته‌های من (long-form personal writings).

CRUD over PersonalWriting. Scoped like tasks/lists: the anon bucket (user 0)
also sees legacy NULL-owner rows. List responses omit ``body`` (documents run
to tens of KB); the detail endpoint returns it whole.
"""
from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.models.personal_writing import PersonalWriting

router = APIRouter()


class WritingCreate(BaseModel):
    title: str
    body: str
    category: Optional[str] = None
    source_note: Optional[str] = None
    written_at: Optional[str] = None  # ISO date


class WritingUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    category: Optional[str] = None
    source_note: Optional[str] = None
    written_at: Optional[str] = None


def _scope(uid: int):
    return or_(PersonalWriting.user_id == uid, PersonalWriting.user_id.is_(None)) \
        if uid == 0 else (PersonalWriting.user_id == uid)


def _summary(w: PersonalWriting) -> dict:
    return {
        "id": w.id, "title": w.title, "category": w.category,
        "source_note": w.source_note,
        "written_at": w.written_at.isoformat() if w.written_at else None,
        "sort_order": w.sort_order, "body_chars": len(w.body or ""),
        "created_at": w.created_at.isoformat() if w.created_at else None,
    }


def _parse_date(value):
    from datetime import date

    if not value:
        return None
    try:
        return date.fromisoformat(str(value)[:10])
    except ValueError:
        return None


@router.get("/api/writings", tags=["writings"])
@handle_errors
async def list_writings(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    stmt = select(PersonalWriting).where(_scope(user_id))
    if category:
        stmt = stmt.where(PersonalWriting.category == category)
    stmt = stmt.order_by(PersonalWriting.sort_order, PersonalWriting.id)
    rows = (await db.execute(stmt)).scalars().all()
    return {"ok": True, "writings": [_summary(w) for w in rows]}


@router.get("/api/writings/{writing_id}", tags=["writings"])
@handle_errors
async def get_writing(
    writing_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    w = (await db.execute(
        select(PersonalWriting).where(PersonalWriting.id == writing_id, _scope(user_id))
    )).scalars().first()
    if w is None:
        raise HTTPException(status_code=404, detail="Writing not found")
    return {"ok": True, **_summary(w), "body": w.body}


@router.post("/api/writings", status_code=201, tags=["writings"])
@handle_errors
async def create_writing(
    payload: WritingCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    w = PersonalWriting(
        title=payload.title.strip()[:500], body=payload.body,
        category=(payload.category or "").strip()[:120] or None,
        source_note=(payload.source_note or "").strip()[:500] or None,
        written_at=_parse_date(payload.written_at),
        user_id=user_id,
    )
    db.add(w)
    await db.commit()
    await db.refresh(w)
    return {"ok": True, **_summary(w), "body": w.body}


@router.put("/api/writings/{writing_id}", tags=["writings"])
@handle_errors
async def update_writing(
    writing_id: int,
    payload: WritingUpdate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    w = (await db.execute(
        select(PersonalWriting).where(PersonalWriting.id == writing_id, _scope(user_id))
    )).scalars().first()
    if w is None:
        raise HTTPException(status_code=404, detail="Writing not found")
    data = payload.model_dump(exclude_unset=True)
    if "title" in data and data["title"]:
        w.title = data["title"].strip()[:500]
    if "body" in data and data["body"] is not None:
        w.body = data["body"]
    if "category" in data:
        w.category = (data["category"] or "").strip()[:120] or None
    if "source_note" in data:
        w.source_note = (data["source_note"] or "").strip()[:500] or None
    if "written_at" in data:
        w.written_at = _parse_date(data["written_at"])
    await db.commit()
    await db.refresh(w)
    return {"ok": True, **_summary(w), "body": w.body}


@router.delete("/api/writings/{writing_id}", status_code=204, tags=["writings"])
@handle_errors
async def delete_writing(
    writing_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    w = (await db.execute(
        select(PersonalWriting).where(PersonalWriting.id == writing_id, _scope(user_id))
    )).scalars().first()
    if w is None:
        raise HTTPException(status_code=404, detail="Writing not found")
    await db.delete(w)
    await db.commit()
