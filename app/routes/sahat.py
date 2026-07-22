"""/api/sahat — خداشهر (the God-city: human-dimensions layer over everything).

* ``GET  /api/sahat/map``              — the live city map: six sahats, honest
  weighted flags, thread (نخِ تسبیح) progress, + score history for trends.
* ``GET  /api/sahat/district/{key}``   — one district («محله») item-level:
  a sahat key or 'khod' (aggregates the three facets of self).
* ``POST /api/sahat/refresh``          — build + persist one snapshot.
* ``POST /api/sahat/assign``           — the owner's correction: persist a
  sahat on a task/list/writing/directive/project (stored value always wins).
* ``GET/POST/PATCH /api/sahat/threads`` — the editable thread registry
  (deactivation is soft — quarantine, not delete).

Mutations are gated by ``enforce_auth_when_required`` (same contract as
directives); reads stay lenient for the single-tenant anon scope.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import enforce_auth_when_required, get_optional_user_id
from app.middleware import handle_errors

router = APIRouter()


@router.get("/api/sahat/map", tags=["sahat"])
@handle_errors
async def get_map(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    from app.services.sahat_service import build_sahat_map, get_sahat_history

    data = await build_sahat_map(db, user_id)
    data["history"] = await get_sahat_history(db, user_id)
    return {"ok": True, "success": True, **data}


@router.get("/api/sahat/district/{key}", tags=["sahat"])
@handle_errors
async def get_district(
    key: str,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    from app.services.sahat_service import build_sahat_district

    data = await build_sahat_district(db, user_id, key)
    if data is None:
        raise HTTPException(status_code=404, detail="ساحت ناشناخته")
    return {"ok": True, "success": True, **data}


@router.post("/api/sahat/refresh", tags=["sahat"])
@handle_errors
async def refresh_map(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    from app.services.sahat_service import get_sahat_history, snapshot_sahat_map

    data = await snapshot_sahat_map(db, user_id)
    data["history"] = await get_sahat_history(db, user_id)
    return {"ok": True, "success": True, **data}


class AssignBody(BaseModel):
    entity_type: str = Field(..., max_length=16)  # task|list|writing|directive|project
    entity_id: int
    sahat: str = Field(..., max_length=16)


@router.post("/api/sahat/assign", tags=["sahat"])
@handle_errors
async def assign(
    body: AssignBody,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    from app.services.sahat_service import assign_sahat

    try:
        found = await assign_sahat(db, user_id, body.entity_type, body.entity_id, body.sahat)
    except ValueError:
        raise HTTPException(status_code=422, detail="ساحت یا نوعِ موجودیت ناشناخته")
    if not found:
        # Cross-tenant / missing rows are indistinguishable — hidden as 404.
        raise HTTPException(status_code=404, detail="پیدا نشد")
    return {"ok": True, "success": True, "sahat": body.sahat}


class ThreadBody(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    sahat: str = Field(..., max_length=16)
    tokens: List[str] = Field(..., min_length=1, max_length=20)
    link: Optional[str] = Field(None, max_length=120)


class ThreadPatch(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    sahat: Optional[str] = Field(None, max_length=16)
    tokens: Optional[List[str]] = Field(None, min_length=1, max_length=20)
    link: Optional[str] = Field(None, max_length=120)
    is_active: Optional[bool] = None


@router.get("/api/sahat/threads", tags=["sahat"])
@handle_errors
async def list_threads(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    from app.models.sahat_thread import SahatThread
    from app.services.sahat_service import _scope, ensure_threads_seeded

    await ensure_threads_seeded(db, user_id)
    rows = (
        await db.execute(
            select(SahatThread)
            .where(_scope(SahatThread.user_id, user_id))
            .order_by(SahatThread.sort_order, SahatThread.id)
        )
    ).scalars().all()
    return {
        "ok": True, "success": True,
        "threads": [
            {
                "id": r.id, "key": r.key, "title": r.title, "sahat": r.sahat,
                "tokens": list(r.tokens or ()), "link": r.link,
                "is_active": bool(r.is_active),
            }
            for r in rows
        ],
    }


@router.post("/api/sahat/threads", tags=["sahat"])
@handle_errors
async def add_thread(
    body: ThreadBody,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    import re as _re
    import unicodedata

    from app.models.sahat_thread import SahatThread
    from app.services.sahat_service import SAHATS, _scope

    if body.sahat not in SAHATS:
        raise HTTPException(status_code=422, detail="ساحت ناشناخته")
    tokens = [t.strip() for t in body.tokens if t and t.strip()]
    if not tokens:
        raise HTTPException(status_code=422, detail="دست‌کم یک نشانهٔ تطبیق لازم است")
    # Slug from the title; uniqueness per scope is enforced by suffixing.
    base = unicodedata.normalize("NFKC", body.title)
    base = _re.sub(r"\W+", "_", base, flags=_re.UNICODE).strip("_")[:48] or "thread"
    existing = {
        r.key
        for r in (
            await db.execute(select(SahatThread).where(_scope(SahatThread.user_id, user_id)))
        ).scalars().all()
    }
    key, n = base, 2
    while key in existing:
        key, n = f"{base}_{n}", n + 1
    row = SahatThread(
        user_id=None if user_id == 0 else user_id,
        key=key, title=body.title.strip(), sahat=body.sahat,
        tokens=tokens, link=body.link or "/lists",
        sort_order=len(existing),
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return {"ok": True, "success": True, "id": row.id, "key": row.key}


@router.patch("/api/sahat/threads/{thread_id}", tags=["sahat"])
@handle_errors
async def patch_thread(
    thread_id: int,
    body: ThreadPatch,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    from app.models.sahat_thread import SahatThread
    from app.services.sahat_service import SAHATS, _scope

    row = (
        await db.execute(
            select(SahatThread).where(
                SahatThread.id == thread_id, _scope(SahatThread.user_id, user_id)
            )
        )
    ).scalars().first()
    if row is None:
        raise HTTPException(status_code=404, detail="پیدا نشد")
    if body.sahat is not None:
        if body.sahat not in SAHATS:
            raise HTTPException(status_code=422, detail="ساحت ناشناخته")
        row.sahat = body.sahat
    if body.title is not None:
        row.title = body.title.strip()
    if body.tokens is not None:
        tokens = [t.strip() for t in body.tokens if t and t.strip()]
        if not tokens:
            raise HTTPException(status_code=422, detail="دست‌کم یک نشانهٔ تطبیق لازم است")
        row.tokens = tokens
    if body.link is not None:
        row.link = body.link
    if body.is_active is not None:
        # Soft deactivate — quarantine, not delete (rule 2).
        row.is_active = bool(body.is_active)
    await db.commit()
    return {"ok": True, "success": True}
