"""«صفحه‌های افزوده» — owner-attached HTML apps installed as pages, as DATA.

    GET    /api/mini-apps                 the installed pages (sidebar + /apps/:slug)
    POST   /api/mini-apps                 install an inspection attachment as a page
    GET    /api/mini-apps/{slug}/source   the HTML itself (for the sandboxed iframe)
    DELETE /api/mini-apps/{slug}          retire a page (owner only; quarantined, not deleted)

Same door as «نظارت و سرکشی»: the owner, or the supervisor token. The supervisor
may INSTALL (that is how it answers «make this attachment a page»); only the
owner retires. See app/models/mini_app.py for why this is not a code commit.
"""
import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import Response
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.models.inspection import InspectionFile, InspectionReport
from app.models.mini_app import MiniApp
from app.routes.inspection import _gate, _is_reviewer
from app.services import inspection_files as ifiles
from app.services.activity_log_service import record_activity

router = APIRouter()

_SLUG = re.compile(r"^[a-z0-9][a-z0-9-]{1,58}$")
_MAX_BYTES = 10 * 1024 * 1024
_GROUPS = ("daily", "life", "life_pages", "tools", "system")


def _dict(m: MiniApp) -> dict:
    return {"slug": m.slug, "title": m.title, "icon": m.icon or "", "group": m.group or "tools",
            "after": m.after or "", "path": f"/apps/{m.slug}", "source_file_id": m.source_file_id,
            "sha256": m.sha256 or "", "report_number": int(m.report_number or 0),
            "enabled": bool(m.enabled), "created_by": m.created_by or ""}


def _is_html(f: InspectionFile) -> bool:
    name = (f.filename or "").lower()
    return name.endswith((".html", ".htm")) or (f.mime or "").startswith("text/html")


class InstallIn(BaseModel):
    file_id: str = Field(..., min_length=1, max_length=40)
    title: str = Field(..., min_length=1, max_length=120)
    slug: Optional[str] = Field(None, max_length=60)
    icon: str = Field("", max_length=8)
    group: str = Field("tools", max_length=20)
    #: the sidebar link this page sits right after (e.g. "/import")
    after: str = Field("", max_length=80)


@router.get("/api/mini-apps", dependencies=[Depends(_gate)], tags=["mini-apps"])
async def list_apps(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(MiniApp).where(MiniApp.enabled.is_(True))
                             .order_by(MiniApp.id))).scalars().all()
    return {"ok": True, "success": True, "apps": [_dict(m) for m in rows]}


@router.post("/api/mini-apps", dependencies=[Depends(_gate)], tags=["mini-apps"])
async def install_app(request: Request, payload: InstallIn, db: AsyncSession = Depends(get_db),
                      user_id: int = Depends(get_optional_user_id)):
    f = (await db.execute(select(InspectionFile).where(InspectionFile.id == payload.file_id))).scalar_one_or_none()
    if f is None:
        raise HTTPException(status_code=404, detail="فایلِ پیوست پیدا نشد")
    if not _is_html(f):
        raise HTTPException(status_code=422, detail="فقط فایلِ HTML را می‌شود به‌عنوانِ صفحه نصب کرد")
    if int(f.byte_size or 0) > _MAX_BYTES:
        raise HTTPException(status_code=413, detail="فایل برای یک صفحه بزرگ است (سقف ۱۰ مگابایت)")
    slug = (payload.slug or f"app-{f.id[:8]}").strip().lower()
    if not _SLUG.match(slug):
        raise HTTPException(status_code=422, detail="نامکِ نشانی فقط حروفِ کوچکِ لاتین، رقم و خط‌تیره")
    if payload.group not in _GROUPS:
        raise HTTPException(status_code=422, detail="گروهِ منو نامعتبر است")
    r = (await db.execute(select(InspectionReport.number).where(
        InspectionReport.id == f.report_id))).scalar_one_or_none()
    m = (await db.execute(select(MiniApp).where(MiniApp.slug == slug))).scalar_one_or_none()
    if m is not None and m.enabled and m.source_file_id != f.id:
        raise HTTPException(status_code=409, detail=f"صفحهٔ «{slug}» با فایلِ دیگری نصب است")
    if m is None:
        m = MiniApp(slug=slug)
        db.add(m)
    m.title, m.icon, m.group, m.after = payload.title.strip(), payload.icon.strip(), payload.group, payload.after.strip()
    m.source_file_id, m.sha256, m.report_number = f.id, f.sha256 or "", int(r or 0)
    m.enabled, m.created_by = True, ("supervisor" if _is_reviewer(request) else "owner")
    await db.commit()
    await db.refresh(m)
    await record_activity(action="mini_app_install", entity_type="mini_app", entity_id=m.slug,
                          entity_label=m.title, detail=f"/apps/{m.slug} ← فایلِ «{f.filename}» (گزارشِ {m.report_number})",
                          user_id=user_id, request=request, db=db)
    return {"ok": True, "success": True, "app": _dict(m)}


@router.get("/api/mini-apps/{slug}/source", dependencies=[Depends(_gate)], tags=["mini-apps"])
async def app_source(slug: str, db: AsyncSession = Depends(get_db)):
    """Served as TEXT with a sandbox CSP — a direct navigation to this URL must
    never render the owner's HTML on the app's own origin."""
    m = (await db.execute(select(MiniApp).where(MiniApp.slug == slug, MiniApp.enabled.is_(True)))).scalar_one_or_none()
    if m is None:
        raise HTTPException(status_code=404, detail="این صفحه نصب نیست")
    f = (await db.execute(select(InspectionFile).where(InspectionFile.id == m.source_file_id))).scalar_one_or_none()
    if f is None:
        raise HTTPException(status_code=410, detail="فایلِ این صفحه دیگر نیست")
    try:
        data = await ifiles.load(db, f)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=503, detail=f"فایلِ صفحه خوانده نشد: {exc}"[:300]) from exc
    return Response(content=data, media_type="text/plain; charset=utf-8",
                    headers={"X-Content-Type-Options": "nosniff",
                             "Content-Security-Policy": "sandbox",
                             "Cache-Control": "private, max-age=300"})


@router.delete("/api/mini-apps/{slug}", dependencies=[Depends(_gate)], tags=["mini-apps"])
async def retire_app(request: Request, slug: str, db: AsyncSession = Depends(get_db),
                     user_id: int = Depends(get_optional_user_id)):
    if _is_reviewer(request):
        raise HTTPException(status_code=403, detail="برداشتنِ صفحه کارِ مالک است")
    m = (await db.execute(select(MiniApp).where(MiniApp.slug == slug))).scalar_one_or_none()
    if m is None:
        raise HTTPException(status_code=404, detail="این صفحه نصب نیست")
    m.enabled = False
    await db.commit()
    await record_activity(action="mini_app_retire", entity_type="mini_app", entity_id=slug,
                          entity_label=m.title, detail="از منو برداشته شد (قرنطینه — فایل و ردیف می‌مانند)",
                          user_id=user_id, request=request, db=db)
    return {"ok": True, "success": True}
