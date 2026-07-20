"""/api/trash — سطل زباله (recoverable deletes, data-safety phase 0).

DELETE on todo items and personal writings soft-deletes (stamps
``deleted_at``); this router lists the trashed rows, restores them, or
purges them for real. Purge is the ONLY hard-delete path left for these
two content types — a deliberate second step so years-old owner content
never disappears on a single wrong click.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import enforce_write_auth, get_optional_user_id
from app.middleware import handle_errors
from app.models.personal_writing import PersonalWriting
from app.services import todo_item_service
from app.services.activity_log_service import record_activity

router = APIRouter()


def _iso(dt) -> str | None:
    return dt.isoformat() if dt else None


@router.get("/api/trash", tags=["trash"])
@handle_errors
async def list_trash(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    items = await todo_item_service.list_trashed_items(db)
    writings = (
        await db.execute(
            select(PersonalWriting)
            .where(PersonalWriting.deleted_at.is_not(None))
            .order_by(PersonalWriting.deleted_at.desc(), PersonalWriting.id)
        )
    ).scalars().all()
    return {
        "ok": True,
        "items": [
            {
                "id": it.id,
                "content": it.content,
                "description": it.description,
                "due_date": _iso(it.due_date),
                "is_completed": it.is_completed,
                "deleted_at": _iso(it.deleted_at),
            }
            for it in items
        ],
        "writings": [
            {
                "id": w.id,
                "title": w.title,
                "category": w.category,
                "body_chars": len(w.body or ""),
                "deleted_at": _iso(w.deleted_at),
            }
            for w in writings
        ],
    }


@router.post("/api/trash/todo-items/{item_id}/restore", tags=["trash"])
@handle_errors
async def restore_todo_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _write_gate: None = Depends(enforce_write_auth),
) -> dict:
    item = await todo_item_service.restore_item(db, item_id)
    await record_activity(
        action="update", entity_type="todo_item", entity_id=item.id,
        entity_label=item.content, detail="بازیابی آیتم از سطل زباله",
        user_id=user_id, db=db,
    )
    return {"ok": True, "id": item.id, "content": item.content}


@router.delete(
    "/api/trash/todo-items/{item_id}", status_code=204, tags=["trash"]
)
@handle_errors
async def purge_todo_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _write_gate: None = Depends(enforce_write_auth),
) -> None:
    # Purge only accepts rows that are already in the trash — a live
    # item must go through the normal (soft) DELETE first.
    obj = await todo_item_service.get_item(db, item_id, include_deleted=True)
    if obj.deleted_at is None:
        raise HTTPException(
            status_code=409,
            detail="Item is not in the trash — soft-delete it first",
        )
    label = obj.content
    await todo_item_service.delete_item(db, item_id)
    await record_activity(
        action="delete", entity_type="todo_item", entity_id=item_id,
        entity_label=label, detail="حذف قطعی از سطل زباله",
        user_id=user_id, db=db,
    )
    return None


@router.post("/api/trash/writings/{writing_id}/restore", tags=["trash"])
@handle_errors
async def restore_writing(
    writing_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _write_gate: None = Depends(enforce_write_auth),
) -> dict:
    w = (
        await db.execute(
            select(PersonalWriting).where(
                PersonalWriting.id == writing_id,
                PersonalWriting.deleted_at.is_not(None),
            )
        )
    ).scalars().first()
    if w is None:
        raise HTTPException(status_code=404, detail="Writing not in trash")
    w.deleted_at = None
    await db.commit()
    await record_activity(
        action="update", entity_type="writing", entity_id=w.id,
        entity_label=w.title, detail="بازیابی نوشته از سطل زباله",
        user_id=user_id, db=db,
    )
    return {"ok": True, "id": w.id, "title": w.title}


@router.delete(
    "/api/trash/writings/{writing_id}", status_code=204, tags=["trash"]
)
@handle_errors
async def purge_writing(
    writing_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _write_gate: None = Depends(enforce_write_auth),
) -> None:
    w = (
        await db.execute(
            select(PersonalWriting).where(
                PersonalWriting.id == writing_id,
                PersonalWriting.deleted_at.is_not(None),
            )
        )
    ).scalars().first()
    if w is None:
        raise HTTPException(status_code=404, detail="Writing not in trash")
    snapshot = {
        "title": w.title, "category": w.category, "body": w.body,
        "source_note": w.source_note,
        "written_at": w.written_at.isoformat() if w.written_at else None,
        "purged_at": datetime.now(timezone.utc).isoformat(),
    }
    title = w.title
    await db.delete(w)
    await db.commit()
    await record_activity(
        action="delete", entity_type="writing", entity_id=writing_id,
        entity_label=title, detail="حذف قطعی نوشته از سطل زباله",
        payload_before=snapshot, user_id=user_id, db=db,
    )
    return None
