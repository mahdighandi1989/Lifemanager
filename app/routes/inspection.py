"""/api/inspection — «نظارت و سرکشی»: the owner's sheets and the supervisor's answers.

THE LOOP
    owner draws a box on any screen (or files a general request)  →  a sheet
    with the way BACK to that spot  →  the supervisor routine reads the queue,
    does the work, writes the result UNDER the sheet with its dependency walk
    and, for a claimed fix, an after-picture  →  the owner looks and ticks  →
    the next round (urgent OR full) archives it into a binder.

WHAT THIS ROUTER REFUSES, AND WHY (every one paid for in ALLIN1 / Detective-1):
  * `outcome='fixed'` with no after-shot → 422. A false green makes the owner
    stop looking, and then the whole board is worthless.
  * the supervisor's token on approve / delete / ⚡ / file-removal → 403. The
    tick is the owner's; a rule only written down gets broken.
  * a supervisor reply while an attached file is still UNREAD → 422, naming the
    file and what is left. «حجم هم باعث نشه ناظر نتونه بگه من نمیخونمش».
  * a remote URL as a shot → dropped. Only a data-URL image is accepted, so
    this can never become a server-side request forgery.
  * a WRONG supervisor token → 401. Otherwise a misconfigured routine would be
    taken for the owner and its answers filed as the owner's follow-ups.

No `from __future__ import annotations` and no `@handle_errors` here: every
failure is an explicit HTTPException with a Persian sentence the owner can act on.
"""
import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from fastapi import (APIRouter, Depends, File, Form, HTTPException, Query, Request,
                     Response, UploadFile)
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
import app.config as _config
from app.dependencies.auth import (
    _extract_token,
    _resolve_token_to_user,
    enforce_auth_when_required,
    get_optional_user_id,
    is_admin,
)
from app.models.global_setting import GlobalSetting
from app.models.inspection import (
    BINDER_CAPACITY,
    EXTRACT_LABEL,
    GENERAL_PAGE,
    GENERAL_SECTION,
    OUTCOME_FIXED,
    OUTCOME_NEEDS_OWNER,
    OUTCOMES,
    STATUS_ANSWERED,
    STATUS_APPROVED,
    STATUS_FILED,
    STATUS_OPEN,
    URGENT_CLAIM_TTL_S,
    InspectionBinder,
    InspectionFile,
    InspectionReport,
    InspectionShot,
    file_read_debt,
    sheet_glow,
)
from app.services import inspection_files as ifiles
from app.services import inspection_drive as idrive
from app.services import supervisor_auth
from app.services.activity_log_service import record_activity
from app.services.supervisor_rounds import next_full_round, next_round, record_round

router = APIRouter()

MAX_TEXT = 8000
#: A picture travels inside a JSON body and is decoded in memory, so SOME
#: ceiling must exist — ~12 MB of base64. The page re-encodes every picture
#: before sending (`shrinkShot`), so in practice nothing the owner pastes
#: reaches this (ALLIN1 v175: «ریشه‌ای درست کن که محدودیتی نباشه»).
MAX_SHOT_BYTES = 12_000_000
MAX_ACTIVE = 500
_DATA_URL = "data:image/"
_ALLOWED_MIME = ("image/png", "image/jpeg", "image/webp")
_UPLOAD_CHUNK = 1024 * 1024

URGENT_LOG_KEY = "inspection_urgent_rounds"
FULL_LOG_KEY = "inspection_full_rounds"


# ---------------------------------------------------------------------------
# Who is calling
# ---------------------------------------------------------------------------
def _presented_token(request: Request) -> Optional[str]:
    return request.headers.get(supervisor_auth.HEADER)


def _is_reviewer(request: Request) -> bool:
    """True for the supervisor routine; 401 for a token that is WRONG."""
    presented = _presented_token(request)
    if presented is None:
        return False
    if supervisor_auth.is_supervisor_token(presented):
        return True
    raise HTTPException(
        status_code=401,
        detail=("توکنِ ناظر نادرست است — اگر این روتینِ ناظر است، "
                "SUPERVISOR_TOKEN / AUTH_JWT_SECRET روی سرور و در اجرا یکی نیستند"))


async def _gate(request: Request, db: AsyncSession = Depends(get_db)) -> None:
    """A valid supervisor token passes; everyone else goes through the app's
    gate AND must be the OWNER.

    Why the owner check (2026-10-08): the supervisor routine turns a sheet into
    code on `main` (= a deploy). Production registration has no invite code, so
    without this any stranger could sign up and file a sheet carrying code for
    the routine to ship — the routine's own permission guard rightly refused to
    integrate an attachment for exactly that reason. «Owner» = the app's admin
    (`is_admin`: ADMIN_EMAILS or an admin role). With no admin configured (local
    runs, tests) behaviour is unchanged."""
    if _is_reviewer(request):
        return
    await enforce_auth_when_required(request, db)
    if not _config.settings.admin_emails_list:  # read at call time — tests swap the object
        return
    token = _extract_token(request)
    user = await _resolve_token_to_user(token, db) if token else None
    if user is None or not is_admin(user):
        raise HTTPException(status_code=403,
                            detail="«نظارت و سرکشی» فقط برای مالکِ سامانه است")


def _refuse_reviewer(request: Request, detail: str) -> None:
    if _is_reviewer(request):
        raise HTTPException(status_code=403, detail=detail)


def _require_reviewer(request: Request, detail: str) -> None:
    if not _is_reviewer(request):
        raise HTTPException(status_code=403, detail=detail)


def _actor(request: Request) -> str:
    return "supervisor" if _is_reviewer(request) else "owner"


# ---------------------------------------------------------------------------
# Small helpers
# ---------------------------------------------------------------------------
def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso() -> str:
    return _now().isoformat()


def _utc(dt, plus: int = 0) -> Optional[str]:
    """Always-zoned ISO — SQLite hands back naive datetimes, Postgres aware ones."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return (dt + timedelta(seconds=plus)).isoformat()


def _clean(v: Any, limit: int = MAX_TEXT) -> str:
    return str(v or "").replace("\x00", "")[:limit].strip()


def _headline(text: str) -> str:
    first = next((ln for ln in text.split("\n") if ln.strip()), "بدونِ عنوان")
    return first.strip()[:120]


def _check_shot_size(v: Optional[str]) -> Optional[str]:
    if isinstance(v, str) and len(v) > MAX_SHOT_BYTES:
        raise ValueError(
            f"تصویر بیش از حد بزرگ است (~{len(v) // 1_000_000} مگابایت). صفحه تصویرها را "
            "پیش از ارسال کوچک می‌کند؛ صفحه را تازه کن و دوباره تلاش کن.")
    return v


def _split_data_url(shot: Optional[str]) -> Optional[tuple]:
    if not isinstance(shot, str) or not shot.startswith(_DATA_URL):
        return None
    if len(shot) > MAX_SHOT_BYTES:
        raise HTTPException(status_code=413, detail="تصویر بیش از حد بزرگ است")
    try:
        head, payload = shot.split(",", 1)
    except ValueError:
        return None
    mime = head[5:].split(";")[0]
    if mime not in _ALLOWED_MIME or not payload:
        return None
    return mime, payload


def _notes(r: InspectionReport) -> List[dict]:
    try:
        v = json.loads(r.notes_json or "[]")
        return v if isinstance(v, list) else []
    except Exception:  # noqa: BLE001 - a corrupt row must not break the board
        return []


def _deps(r: InspectionReport) -> List[dict]:
    try:
        v = json.loads(r.deps_json or "[]")
        return v if isinstance(v, list) else []
    except Exception:  # noqa: BLE001
        return []


def _json_or_none(raw: Optional[str]):
    try:
        return json.loads(raw) if (raw or "").strip() else None
    except Exception:  # noqa: BLE001
        return None


async def _store_shot(db, report_id: str, note_id: str, kind: str, shot: Optional[str]) -> Optional[str]:
    parsed = _split_data_url(shot)
    if parsed is None:
        return None
    mime, payload = parsed
    sid = uuid.uuid4().hex[:24]
    db.add(InspectionShot(id=sid, report_id=report_id, note_id=note_id, kind=kind,
                          mime=mime, data=payload, byte_size=len(payload)))
    return sid


def _file_dict(f) -> dict:
    total = int(f.text_chars or 0)
    got = int(f.read_chars or 0)
    return {
        "id": f.id, "report_id": f.report_id, "note_id": f.note_id or "",
        "filename": f.filename or "", "mime": f.mime or "",
        "byte_size": int(f.byte_size or 0), "size_label": ifiles.human_size(f.byte_size or 0),
        "caption": f.caption or "", "uploaded_by": f.uploaded_by or "",
        "created_at": _utc(f.created_at),
        "store": f.store or "", "store_note": f.store_note or "",
        "drive_link": f.drive_link or "", "durable": (f.store or "") in ("drive", "db"),
        "extract_status": f.extract_status or "pending",
        "extract_label": EXTRACT_LABEL.get(f.extract_status or "pending", ""),
        "extract_note": f.extract_note or "",
        "text_chars": total, "page_count": int(f.page_count or 0),
        "text_truncated": bool(f.text_truncated),
        "read_chars": got,
        "read_percent": (round(100 * got / total) if total else None),
        "fully_read": bool(total and got >= total),
        "read_at": _utc(f.read_at), "read_by": f.read_by or "",
        "viewed_at": _utc(f.viewed_at),
    }


class _FileRow:
    """Attribute view over a partial row (no `text`), so listings never ship it."""

    __slots__ = ("_m",)

    def __init__(self, row) -> None:
        self._m = row._mapping

    def __getattr__(self, name: str):
        try:
            return self._m[name]
        except KeyError:
            return "" if name == "text" else None


async def _files_of(db, report_id: str) -> List[InspectionFile]:
    return list((await db.execute(
        select(InspectionFile).where(InspectionFile.report_id == report_id)
        .order_by(InspectionFile.created_at))).scalars().all())


async def _files_by_report(db, report_ids: List[str]) -> dict:
    """Files for MANY sheets in one query, WITHOUT the extracted text."""
    out: dict = {rid: [] for rid in report_ids}
    if not report_ids:
        return out
    cols = (InspectionFile.id, InspectionFile.report_id, InspectionFile.note_id,
            InspectionFile.filename, InspectionFile.mime, InspectionFile.byte_size,
            InspectionFile.caption, InspectionFile.uploaded_by, InspectionFile.created_at,
            InspectionFile.store, InspectionFile.store_note, InspectionFile.drive_link,
            InspectionFile.extract_status, InspectionFile.extract_note,
            InspectionFile.text_chars, InspectionFile.page_count,
            # MUST be selected: `file_read_debt` reads it, and a missing column
            # reads as False — the queue would say «nothing to read» on a file
            # the answer endpoint then refuses.
            InspectionFile.text_truncated,
            InspectionFile.read_chars, InspectionFile.read_at, InspectionFile.read_by,
            InspectionFile.viewed_at)
    rows = (await db.execute(select(*cols).where(InspectionFile.report_id.in_(report_ids))
                             .order_by(InspectionFile.created_at))).all()
    for row in rows:
        out.setdefault(row.report_id, []).append(_FileRow(row))
    return out


def _claim_expired(r: InspectionReport) -> bool:
    if r.urgent_claimed_at is None:
        return True
    started = r.urgent_claimed_at
    if started.tzinfo is None:
        started = started.replace(tzinfo=timezone.utc)
    return (_now() - started).total_seconds() > URGENT_CLAIM_TTL_S


def _urgent_state(r: InspectionReport) -> dict:
    claimed = r.urgent_claimed_at is not None and not _claim_expired(r)
    return {
        "urgent": r.urgent_at is not None and r.urgent_done_at is None,
        "urgent_at": _utc(r.urgent_at),
        "urgent_done_at": _utc(r.urgent_done_at),
        "urgent_in_progress": claimed and r.urgent_done_at is None,
        "urgent_claimed_by": (r.urgent_claimed_by or "") if claimed else "",
        "urgent_claimed_at": _utc(r.urgent_claimed_at) if claimed else None,
        "urgent_claim_expires_at": _utc(r.urgent_claimed_at, plus=URGENT_CLAIM_TTL_S) if claimed else None,
    }


def _to_dict(r: InspectionReport, files: Optional[list] = None) -> dict:
    notes = _notes(r)
    files = files or []
    return {
        "id": r.id, "number": r.number,
        "created_at": _utc(r.created_at), "updated_at": _utc(r.updated_at),
        "status": r.status, "title": r.title or "", "created_by": r.created_by or "",
        "page": r.page or "", "page_label": r.page_label or "",
        "section_id": r.section_id or "", "section_label": r.section_label or "",
        "reopen": r.reopen or "", "dom_path": r.dom_path or "",
        "covered_text": r.covered_text or "",
        "general": (r.section_id or "") == GENERAL_SECTION,
        "rect": _json_or_none(r.rect_json), "viewport": _json_or_none(r.viewport_json),
        # None for a general request or an old sheet — the overlay then draws
        # nothing rather than guessing
        "geometry": _json_or_none(r.geometry_json),
        "notes": notes,
        "dependencies": _deps(r),
        "glow": sheet_glow(r.status, notes),
        **_urgent_state(r),
        "files": [_file_dict(f) for f in files],
        "read_debt": file_read_debt(files),
        "drive_folder_link": idrive.folder_link(getattr(r, "drive_folder_id", "") or ""),
        "binder": ({"id": r.binder_id, "number": r.binder_number, "page": r.binder_page,
                    "filed_at": _utc(r.filed_at)} if r.binder_id else None),
    }


async def _report_or_404(db, report_id: str) -> InspectionReport:
    r = (await db.execute(select(InspectionReport).where(
        InspectionReport.id == report_id))).scalar_one_or_none()
    if r is None:
        raise HTTPException(status_code=404, detail="گزارش پیدا نشد")
    return r


async def _setting(db, key: str) -> Optional[str]:
    row = (await db.execute(select(GlobalSetting).where(GlobalSetting.key == key))).scalar_one_or_none()
    return row.value if row else None


async def _knock(db, key: str) -> None:
    """A round announced itself. Its own commit, so a lost heartbeat never
    costs a claimed sheet and a failed claim still counts as «it came»."""
    row = (await db.execute(select(GlobalSetting).where(GlobalSetting.key == key))).scalar_one_or_none()
    value = record_round(row.value if row else None, _now())
    if row:
        row.value = value
    else:
        db.add(GlobalSetting(key=key, value=value))
    await db.commit()


async def _rounds(db) -> dict:
    now = _now()
    return {"urgent": next_round(now, await _setting(db, URGENT_LOG_KEY)),
            "full": next_full_round(now, await _setting(db, FULL_LOG_KEY))}


async def _log(db, request, user_id, action: str, r: Optional[InspectionReport], detail: str) -> None:
    await record_activity(
        action=action, entity_type="inspection", entity_id=(r.id if r else None),
        entity_label=(f"گزارشِ {r.number} — {r.title}" if r else None),
        detail=detail, user_id=user_id, request=request, db=db)


# ---------------------------------------------------------------------------
# Reading
# ---------------------------------------------------------------------------
@router.get("/api/inspection", dependencies=[Depends(_gate)], tags=["inspection"])
async def list_reports(
    status: Optional[str] = Query(None),
    page: Optional[str] = Query(None, description="فقط برگه‌های همین صفحه (الگوی مسیر)"),
    reopen: Optional[str] = Query(None),
    include_filed: bool = Query(False),
    limit: int = Query(500, ge=1, le=2000),
    db: AsyncSession = Depends(get_db),
):
    q = select(InspectionReport)
    if status:
        q = q.where(InspectionReport.status == status)
    elif not include_filed:
        q = q.where(InspectionReport.status != STATUS_FILED)
    if page:
        q = q.where(InspectionReport.page == page)
    if reopen:
        q = q.where(InspectionReport.reopen == reopen)
    rows = (await db.execute(q.order_by(InspectionReport.number.desc()).limit(limit))).scalars().all()
    counts = {s: 0 for s in (STATUS_OPEN, STATUS_ANSWERED, STATUS_APPROVED, STATUS_FILED)}
    for s, n in (await db.execute(select(InspectionReport.status, func.count(InspectionReport.id))
                                  .group_by(InspectionReport.status))).all():
        counts[s] = int(n or 0)
    fmap = await _files_by_report(db, [r.id for r in rows])
    return {"ok": True, "success": True,
            "reports": [_to_dict(r, fmap.get(r.id, [])) for r in rows],
            "counts": counts, "binder_capacity": BINDER_CAPACITY}


@router.get("/api/inspection/whoami", dependencies=[Depends(_gate)], tags=["inspection"])
async def whoami(request: Request):
    """Lets the routine prove, before doing anything, that it IS the supervisor
    here — a wrong token is a 401 above, an unconfigured server says so."""
    return {"ok": True, "success": True, "supervisor": _is_reviewer(request),
            "supervisor_configured": supervisor_auth.configured()}


@router.get("/api/inspection/queue", dependencies=[Depends(_gate)], tags=["inspection"])
async def queue(request: Request, db: AsyncSession = Depends(get_db)):
    """What the supervisor OWES — the first job of every full round.

    `partial` / `not-done` / a reply with no outcome are still OWED: a sheet is
    finished only when DONE WITH PROOF (`fixed` + after picture) or parked on
    the owner's decision (`needs-owner`). Pulled by the full round, so it is
    that round's heartbeat.
    """
    if _is_reviewer(request):
        await _knock(db, FULL_LOG_KEY)
    rows = (await db.execute(
        select(InspectionReport)
        .where(InspectionReport.status.in_([STATUS_OPEN, STATUS_ANSWERED]))
        .order_by(InspectionReport.number))).scalars().all()
    fmap = await _files_by_report(db, [r.id for r in rows])
    reports = [_to_dict(r, fmap.get(r.id, [])) for r in rows]
    unanswered = [r for r in reports if r["status"] == STATUS_OPEN]
    unfinished = [r for r in reports if r["status"] == STATUS_ANSWERED
                  and (r["glow"] or {}).get("outcome") not in (OUTCOME_FIXED, OUTCOME_NEEDS_OWNER)]
    to_file = (await db.execute(select(func.count(InspectionReport.id))
                                .where(InspectionReport.status == STATUS_APPROVED))).scalar() or 0
    return {
        "ok": True, "success": True,
        "owed": len(unanswered) + len(unfinished),
        "unanswered": len(unanswered),
        "unfinished": len(unfinished),
        "unfinished_numbers": [r["number"] for r in unfinished],
        "waiting_for_owner": len(rows) - len(unanswered) - len(unfinished),
        "to_file": int(to_file),
        "files_to_read": sum(len(r["read_debt"]) for r in reports),
        "reports": reports,
    }


@router.get("/api/inspection/rounds", dependencies=[Depends(_gate)], tags=["inspection"])
async def rounds(db: AsyncSession = Depends(get_db)):
    """When each round is next due — measured from its own visits."""
    return {"ok": True, "success": True, **(await _rounds(db))}


@router.get("/api/inspection/urgent", dependencies=[Depends(_gate)], tags=["inspection"])
async def urgent_queue(db: AsyncSession = Depends(get_db)):
    """The fast queue, oldest request first — the order the owner pressed ⚡."""
    rows = (await db.execute(
        select(InspectionReport)
        .where(InspectionReport.urgent_at.isnot(None), InspectionReport.urgent_done_at.is_(None),
               InspectionReport.status != STATUS_FILED)
        .order_by(InspectionReport.urgent_at))).scalars().all()
    fmap = await _files_by_report(db, [r.id for r in rows])
    out = []
    for i, r in enumerate(rows):
        d = _to_dict(r, fmap.get(r.id, []))
        d["position"] = i + 1
        d["claimable"] = _claim_expired(r)
        out.append(d)
    rr = await _rounds(db)
    return {"ok": True, "success": True, "waiting": len(out), "reports": out,
            "next_round": rr["urgent"], "next_full_round": rr["full"]}


@router.get("/api/inspection/inventory", dependencies=[Depends(_gate)], tags=["inspection"])
async def inventory(request: Request, db: AsyncSession = Depends(get_db)):
    """Every page and sub-page the app has RIGHT NOW, derived from source — and
    how many sheets each carries. A page added later appears with no edit."""
    from app.services import inspection_inventory

    counts: Dict[str, Dict[str, int]] = {}
    for page, status, n in (await db.execute(
            select(InspectionReport.page, InspectionReport.status, func.count(InspectionReport.id))
            .group_by(InspectionReport.page, InspectionReport.status))).all():
        counts.setdefault(page or "", {})[status] = int(n or 0)
    inv = inspection_inventory.build(request.app, counts)
    inv["backend"]["routes"] = None if inv["backend"]["routes"] is None else len(inv["backend"]["routes"])
    return {"ok": True, "success": True, **inv}


@router.get("/api/inspection/binders", dependencies=[Depends(_gate)], tags=["inspection"])
async def binders(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(InspectionBinder).order_by(InspectionBinder.number))).scalars().all()
    return {"ok": True, "success": True, "binders": [
        {"id": b.id, "number": b.number, "label": b.label, "subtitle": b.subtitle,
         "opened_at": _utc(b.opened_at), "closed_at": _utc(b.closed_at),
         "count": len(_json_or_none(b.report_ids_json) or []), "capacity": BINDER_CAPACITY}
        for b in rows]}


class ClaimIn(BaseModel):
    by: str = Field("", max_length=80)


@router.post("/api/inspection/urgent/claim", dependencies=[Depends(_gate)], tags=["inspection"])
async def claim_next_urgent(request: Request, payload: ClaimIn, db: AsyncSession = Depends(get_db)):
    """Take the NEXT urgent sheet, one at a time.

    The claim is committed BEFORE the caller learns which sheet it got, and a
    sheet claimed within the TTL is skipped — two runs never answer one sheet.
    `{report: null}` is the normal, quiet case. Every call is the urgent round's
    heartbeat, recorded first, so a run that then fails still counts as «it came».
    """
    _require_reviewer(request, "صفِ فوری را فقط ناظر برمی‌دارد")
    await _knock(db, URGENT_LOG_KEY)
    rows = (await db.execute(
        select(InspectionReport)
        .where(InspectionReport.urgent_at.isnot(None), InspectionReport.urgent_done_at.is_(None),
               InspectionReport.status != STATUS_FILED)
        .order_by(InspectionReport.urgent_at))).scalars().all()
    nxt = next((r for r in rows if _claim_expired(r)), None)
    if nxt is None:
        return {"ok": True, "success": True, "report": None, "waiting": len(rows), "busy": len(rows)}
    nxt.urgent_claimed_at = _now()
    nxt.urgent_claimed_by = _clean(payload.by, 80) or "routine"
    await db.commit()
    await db.refresh(nxt)
    return {"ok": True, "success": True, "waiting": len(rows),
            "report": _to_dict(nxt, await _files_of(db, nxt.id))}


@router.post("/api/inspection/file", dependencies=[Depends(_gate)], tags=["inspection"])
async def file_approved(request: Request, db: AsyncSession = Depends(get_db),
                        user_id: int = Depends(get_optional_user_id)):
    """Move every sheet the owner ticked (blue) into a binder. Run by EVERY round
    — urgent and full — so a tick leaves the owner's page at the next round."""
    rows = (await db.execute(select(InspectionReport).where(InspectionReport.status == STATUS_APPROVED)
                             .order_by(InspectionReport.number))).scalars().all()
    if not rows:
        return {"ok": True, "success": True, "filed": 0, "pages": []}
    all_binders = list((await db.execute(select(InspectionBinder)
                                         .order_by(InspectionBinder.number))).scalars().all())
    current = next((b for b in reversed(all_binders) if b.closed_at is None), None)
    touched = []
    for r in rows:
        ids = json.loads(current.report_ids_json or "[]") if current else []
        if current is None or len(ids) >= BINDER_CAPACITY:
            if current is not None:
                current.closed_at = _now()
            n = max((b.number for b in all_binders), default=0) + 1
            current = InspectionBinder(
                id=uuid.uuid4().hex[:24], number=n, label=f"زونکنِ نظارت — شمارهٔ {n}",
                subtitle="برگه‌های تأییدشدهٔ نظارت و سرکشی", report_ids_json="[]")
            db.add(current)
            all_binders.append(current)
            ids = []
        ids.append(r.id)
        current.report_ids_json = json.dumps(ids, ensure_ascii=False)
        r.status = STATUS_FILED
        r.binder_id, r.binder_number, r.binder_page = current.id, current.number, len(ids)
        r.filed_at = _now()
        touched.append({"number": r.number, "binder": current.number, "page": len(ids)})
    await db.commit()
    await _log(db, request, user_id, "inspection_filed", None,
               f"{len(touched)} برگهٔ تأییدشده بایگانی شد ({_actor(request)})")
    return {"ok": True, "success": True, "filed": len(touched), "pages": touched}


# ---------------------------------------------------------------------------
# FILES — any type, up to 100 MB, and the reviewer has to read them.
# ---------------------------------------------------------------------------
async def _file_or_404(db, file_id: str) -> InspectionFile:
    row = (await db.execute(select(InspectionFile).where(InspectionFile.id == file_id))).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="فایل پیدا نشد")
    return row


@router.get("/api/inspection/files/{file_id}", dependencies=[Depends(_gate)], tags=["inspection"])
async def file_meta(file_id: str, db: AsyncSession = Depends(get_db)):
    return {"ok": True, "success": True, "file": _file_dict(await _file_or_404(db, file_id))}


@router.get("/api/inspection/files/{file_id}/text", dependencies=[Depends(_gate)], tags=["inspection"])
async def file_text(request: Request, file_id: str, offset: int = Query(0, ge=0),
                    limit: int = Query(0, ge=0), db: AsyncSession = Depends(get_db)):
    """The extracted text in slices — and, for the SUPERVISOR, how far it got.

    Only a CONTIGUOUS read counts: jumping to the end leaves the middle unread.
    The owner reading their own sample back does not discharge the supervisor's
    duty, so only the supervisor's reads move the counter.
    """
    row = await _file_or_404(db, file_id)
    text = row.text or ""
    total = len(text)
    n = min(limit or ifiles.SLICE_CHARS, ifiles.MAX_SLICE_CHARS)
    part = text[offset:offset + n]
    end = offset + len(part)
    if _is_reviewer(request) and offset <= int(row.read_chars or 0) < end:
        row.read_chars = end
        row.read_at = _now()
        row.read_by = "supervisor"
        await db.commit()
        await db.refresh(row)
    return {"ok": True, "success": True, "file_id": row.id, "filename": row.filename or "",
            "caption": row.caption or "", "extract_status": row.extract_status or "",
            "extract_note": row.extract_note or "", "offset": offset, "returned": len(part),
            "text": part, "text_chars": total, "has_more": end < total,
            "next_offset": end if end < total else None,
            "read_chars": int(row.read_chars or 0),
            "fully_read": total > 0 and int(row.read_chars or 0) >= total,
            "page_count": int(row.page_count or 0)}


@router.get("/api/inspection/files/{file_id}/raw", dependencies=[Depends(_gate)], tags=["inspection"])
async def file_raw(request: Request, file_id: str, db: AsyncSession = Depends(get_db)):
    """The bytes themselves. For the supervisor, fetching this IS «looked at it»."""
    from urllib.parse import quote

    row = await _file_or_404(db, file_id)
    try:
        data = await ifiles.load(db, row)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=410, detail=str(exc)[:300]) from exc
    if _is_reviewer(request):
        row.viewed_at = _now()
        await db.commit()
    disp = "inline" if (row.mime or "").startswith("image/") else "attachment"
    # A Persian filename cannot go in a latin-1 header (ALLIN1 v152 returned 500
    # for every one of the owner's samples) — RFC 5987, and quote/CRLF stripped.
    name = (row.filename or "file").replace('"', "").replace("\r", "").replace("\n", "")
    ascii_name = name.encode("ascii", "ignore").decode() or "file"
    header = f"{disp}; filename=\"{ascii_name}\"; filename*=UTF-8''{quote(name)}"
    return Response(content=data, media_type=row.mime or "application/octet-stream",
                    headers={"Content-Disposition": header, "Cache-Control": "private, max-age=300"})


@router.delete("/api/inspection/files/{file_id}", dependencies=[Depends(_gate)], tags=["inspection"])
async def delete_file(request: Request, file_id: str, db: AsyncSession = Depends(get_db),
                      user_id: int = Depends(get_optional_user_id)):
    """Only the OWNER removes a sample — the supervisor cannot delete its homework.
    The Drive copy is deliberately left in place (rule 2: quarantine, not delete)."""
    _refuse_reviewer(request, "ناظر فایلِ نمونه را حذف نمی‌کند — این کارِ مالک است")
    row = await _file_or_404(db, file_id)
    r = (await db.execute(select(InspectionReport).where(InspectionReport.id == row.report_id))).scalar_one_or_none()
    name = row.filename
    await ifiles.drop_chunks(db, row.id)
    await db.delete(row)
    await db.commit()
    await _log(db, request, user_id, "inspection_file_delete", r,
               f"«{name}» از برگه برداشته شد (نسخهٔ درایو دست‌نخورده ماند)")
    return {"ok": True, "success": True}


@router.get("/api/inspection/storage", dependencies=[Depends(_gate)], tags=["inspection"])
async def storage_status(db: AsyncSession = Depends(get_db)):
    """Where the sheets' files and pictures live: Drive connected? which folder?
    how much is still waiting in the database?"""
    return {"success": True, **await idrive.status(db)}


@router.post("/api/inspection/storage/offload", dependencies=[Depends(_gate)], tags=["inspection"])
async def storage_offload(request: Request, db: AsyncSession = Depends(get_db),
                          user_id: int = Depends(get_optional_user_id)):
    """Move everything still held in the database to its sheet's Drive folder.
    The supervisor runs it every round (`inspection.py file`); the owner has a
    button. Nothing is deleted from the DB before Drive's checksum matched."""
    res = await idrive.offload(db)
    if res["files_moved"] or res["shots_moved"]:
        await record_activity(action="inspection_offload", entity_type="inspection", entity_id="storage",
                              entity_label="نظارت و سرکشی → درایو",
                              detail=f"{res['files_moved']} فایل و {res['shots_moved']} تصویر به درایو رفت",
                              user_id=user_id, request=request, db=db)
    return {"success": True, **res}


@router.get("/api/inspection/shots/{shot_id}", dependencies=[Depends(_gate)], tags=["inspection"])
async def get_shot(shot_id: str, db: AsyncSession = Depends(get_db)):
    import base64

    shot = (await db.execute(select(InspectionShot).where(InspectionShot.id == shot_id))).scalar_one_or_none()
    if shot is None:
        raise HTTPException(status_code=404, detail="تصویر پیدا نشد")
    if (shot.store or "") == "drive" and shot.drive_id:
        client, why = await idrive.client_or_reason(db)
        if client is None:
            raise HTTPException(status_code=503, detail=f"تصویر در درایو است ولی الان در دسترس نیست — {why}")
        try:
            raw = await client.download(shot.drive_id)
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(status_code=502, detail=f"گرفتنِ تصویر از درایو نشد: {exc}"[:300]) from exc
        return Response(content=raw, media_type=shot.mime or "image/jpeg",
                        headers={"Cache-Control": "private, max-age=86400"})
    try:
        raw = base64.b64decode(shot.data or "")
    except Exception:  # noqa: BLE001
        raise HTTPException(status_code=422, detail="تصویر خوانده نشد")
    return Response(content=raw, media_type=shot.mime or "image/jpeg",
                    headers={"Cache-Control": "private, max-age=86400"})


# NOTE — `/{report_id}` stays BELOW every literal path. A literal declared after
# a path parameter is never reached (ALLIN1: «/urgent» matched as a report id).
@router.get("/api/inspection/{report_id}", dependencies=[Depends(_gate)], tags=["inspection"])
async def get_report(report_id: str, db: AsyncSession = Depends(get_db)):
    r = await _report_or_404(db, report_id)
    return {"ok": True, "success": True, "report": _to_dict(r, await _files_of(db, r.id))}


# ---------------------------------------------------------------------------
# Writing
# ---------------------------------------------------------------------------
class SpotIn(BaseModel):
    page: str = Field("", max_length=200)
    page_label: str = Field("", max_length=200)
    section_id: str = Field("", max_length=120)
    section_label: str = Field("", max_length=200)
    reopen: str = Field("", max_length=400)
    dom_path: str = Field("", max_length=400)
    covered_text: str = Field("", max_length=MAX_TEXT)
    rect: Optional[dict] = None
    viewport: Optional[dict] = None
    geometry: Optional[dict] = None


class CreateIn(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_TEXT)
    #: Omitted (or empty) ⇒ a «درخواستِ عمومی» that points at no place on screen.
    spot: Optional[SpotIn] = None
    shot: Optional[str] = None

    _shot_size = field_validator("shot")(_check_shot_size)


def _spot_dict(sp: SpotIn) -> dict:
    return {
        "page": _clean(sp.page, 200), "page_label": _clean(sp.page_label, 200),
        "section_id": _clean(sp.section_id, 120), "section_label": _clean(sp.section_label, 200),
        "reopen": _clean(sp.reopen, 400), "dom_path": _clean(sp.dom_path, 400),
        "covered_text": _clean(sp.covered_text),
        "rect": sp.rect if isinstance(sp.rect, dict) else None,
        "viewport": sp.viewport if isinstance(sp.viewport, dict) else None,
        "geometry": sp.geometry if isinstance(sp.geometry, dict) else None,
    }


@router.post("/api/inspection", dependencies=[Depends(_gate)], tags=["inspection"])
async def create_report(request: Request, payload: CreateIn, db: AsyncSession = Depends(get_db),
                        user_id: int = Depends(get_optional_user_id)):
    """File a sheet — from a box on a page, or as a general request.

    The supervisor files nothing: a sheet is the owner's observation, and a
    routine that opened its own sheets could answer itself into a clean board.
    """
    _refuse_reviewer(request, "برگه را مالک ثبت می‌کند، نه ناظر")
    text = _clean(payload.text)
    if not text:
        raise HTTPException(status_code=422, detail="متنِ گزارش خالی است")
    active = (await db.execute(select(func.count(InspectionReport.id))
                               .where(InspectionReport.status != STATUS_FILED))).scalar() or 0
    if active >= MAX_ACTIVE:
        raise HTTPException(status_code=422,
                            detail=f"سقفِ {MAX_ACTIVE} برگهٔ باز پر است — اول چند تا را تأیید کن تا بایگانی شوند")
    top = (await db.execute(select(func.max(InspectionReport.number)))).scalar() or 0
    spot = _spot_dict(payload.spot) if payload.spot else {}
    if not spot or not (spot.get("page") or spot.get("reopen")):
        spot = {"page": GENERAL_PAGE, "page_label": "درخواستِ عمومی",
                "section_id": GENERAL_SECTION, "section_label": "بدونِ محلِ مشخص",
                "reopen": GENERAL_PAGE, "dom_path": "", "covered_text": "",
                "rect": None, "viewport": None, "geometry": None}
    rid = uuid.uuid4().hex[:24]
    nid = uuid.uuid4().hex[:16]
    shot_id = await _store_shot(db, rid, nid, "before", payload.shot)
    note = {"id": nid, "by": "owner", "at": _iso(), "text": text, "shot_id": shot_id}
    r = InspectionReport(
        id=rid, number=int(top) + 1, status=STATUS_OPEN, title=_headline(text),
        created_by="owner",
        page=spot["page"], page_label=spot["page_label"],
        section_id=spot["section_id"], section_label=spot["section_label"],
        reopen=spot["reopen"], dom_path=spot["dom_path"], covered_text=spot["covered_text"],
        rect_json=json.dumps(spot["rect"] or {}, ensure_ascii=False),
        viewport_json=json.dumps(spot["viewport"] or {}, ensure_ascii=False),
        geometry_json=json.dumps(spot["geometry"], ensure_ascii=False) if spot["geometry"] else "",
        notes_json=json.dumps([note], ensure_ascii=False), deps_json="[]")
    db.add(r)
    await db.commit()
    await db.refresh(r)
    await _log(db, request, user_id, "inspection_report_created", r, f"{r.reopen}")
    # the picture goes to the sheet's Drive folder now (best effort, bounded);
    # if Drive is down it waits in the DB for the supervisor's next round
    await idrive.offload_quietly(db, r.id)
    await db.refresh(r)
    return {"ok": True, "success": True, "report": _to_dict(r, [])}


@router.post("/api/inspection/{report_id}/files", dependencies=[Depends(_gate)], tags=["inspection"])
async def upload_file(
    request: Request, report_id: str,
    file: UploadFile = File(...), caption: str = Form(""), note_id: str = Form(""),
    db: AsyncSession = Depends(get_db), user_id: int = Depends(get_optional_user_id),
):
    """Attach ONE file of ANY type to a sheet (or, via `note_id`, to one note).

    Read with a running total so an oversized body is refused mid-stream. Text is
    extracted BEFORE storing: if the bytes cannot be kept, the reviewer still
    gets the readable content.
    """
    r = await _report_or_404(db, report_id)
    if r.status == STATUS_FILED:
        raise HTTPException(status_code=422, detail="برگهٔ بایگانی‌شده بسته است")
    chunks: List[bytes] = []
    size = 0
    while True:
        chunk = await file.read(_UPLOAD_CHUNK)
        if not chunk:
            break
        size += len(chunk)
        if size > ifiles.MAX_BYTES:
            raise HTTPException(status_code=413,
                                detail=f"حجمِ فایل از سقفِ {ifiles.MAX_MB} مگابایت بیشتر است "
                                       "(INSPECTION_MAX_FILE_MB)")
        chunks.append(chunk)
    data = b"".join(chunks)
    chunks.clear()
    if not data:
        raise HTTPException(status_code=422, detail="فایل خالی است")
    filename = ifiles.safe_filename(file.filename or "file")
    mime = (file.content_type or "").strip() or "application/octet-stream"
    ex = ifiles.extract(data, filename, mime)
    fid = uuid.uuid4().hex[:24]
    placed = await ifiles.store(db, data=data, filename=filename, mime=mime,
                                report_number=int(r.number or 0), file_id=fid,
                                report=r, note_id=_clean(note_id, 40))
    row = InspectionFile(
        id=fid, report_id=r.id, note_id=_clean(note_id, 40), uploaded_by=_actor(request),
        filename=placed["filename"], mime=mime, byte_size=placed["byte_size"],
        sha256=placed["sha256"], caption=_clean(caption),
        store=placed["store"], drive_id=placed["drive_id"], drive_link=placed["drive_link"],
        local_path=placed["local_path"], store_note=placed["store_note"],
        extract_status=ex["status"], extract_note=ex["note"], text=ex["text"],
        text_chars=len(ex["text"] or ""), page_count=int(ex.get("page_count") or 0),
        text_truncated=bool(ex.get("truncated")))
    db.add(row)
    # New material from the owner re-opens an answered sheet: the previous answer
    # did not see it.
    if r.status == STATUS_ANSWERED and not _is_reviewer(request):
        r.status = STATUS_OPEN
    await db.commit()
    await db.refresh(row)
    await db.refresh(r)
    await _log(db, request, user_id, "inspection_file_upload", r,
               f"«{row.filename}» ({ifiles.human_size(row.byte_size)}، {row.store}، "
               f"استخراج: {row.extract_status})")
    return {"ok": True, "success": True, "file": _file_dict(row),
            "report": _to_dict(r, await _files_of(db, r.id))}


class NoteIn(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_TEXT)
    shot: Optional[str] = None
    #: Supervisor only — what really happened.
    outcome: Optional[str] = Field(None, max_length=16)
    #: Supervisor only — the proof it looked after fixing.
    after_shot: Optional[str] = None
    commits: List[str] = Field(default_factory=list, max_length=20)
    #: Supervisor only — the dependency walk behind the answer.
    dependencies: List[dict] = Field(default_factory=list, max_length=60)
    #: A follow-up drawn on the page carries its OWN box; the parent's is never
    #: overwritten.
    spot: Optional[SpotIn] = None
    #: Files uploaded FOR THIS NOTE (uploaded first, then claimed here), so a
    #: follow-up's samples never mix with the sheet's earlier ones — «فایل هایی که
    #: پیوستش میخوام بکنم نباید قاتی فایل های پیوست قبلی باشه».
    file_ids: List[str] = Field(default_factory=list, max_length=40)

    _shot_size = field_validator("shot")(_check_shot_size)
    _after_size = field_validator("after_shot")(_check_shot_size)


@router.post("/api/inspection/{report_id}/notes", dependencies=[Depends(_gate)], tags=["inspection"])
async def add_note(request: Request, report_id: str, payload: NoteIn,
                   db: AsyncSession = Depends(get_db),
                   user_id: int = Depends(get_optional_user_id)):
    r = await _report_or_404(db, report_id)
    if r.status == STATUS_FILED:
        raise HTTPException(status_code=422, detail="برگهٔ بایگانی‌شده بسته است — برگهٔ تازه ثبت کن")
    text = _clean(payload.text)
    if not text:
        raise HTTPException(status_code=422, detail="متنِ یادداشت خالی است")
    reviewer = _is_reviewer(request)

    if payload.outcome is not None:
        if not reviewer:
            raise HTTPException(status_code=422, detail="«نتیجه» را فقط ناظر ثبت می‌کند")
        if payload.outcome not in OUTCOMES:
            raise HTTPException(status_code=422, detail="نتیجهٔ نامعتبر")
        if payload.outcome == OUTCOME_FIXED and not _split_data_url(payload.after_shot):
            raise HTTPException(
                status_code=422,
                detail="«درست شد» بدونِ تصویرِ بعدش پذیرفته نمی‌شود — یا تصویر بفرست یا "
                       "نتیجه را «نیمه‌کاره»/«درست نشد» بگذار")
    elif reviewer:
        raise HTTPException(status_code=422,
                            detail="جوابِ ناظر باید «نتیجه» داشته باشد: fixed | partial | needs-owner | not-done")

    if reviewer:
        debt = file_read_debt(await _files_of(db, r.id))
        if debt:
            parts = []
            for d in debt[:6]:
                if d["reason"] == "text":
                    parts.append(f"«{d['filename']}»: {d['remaining']} نویسه از {d['text_chars']} خوانده نشده")
                elif d["reason"] == "truncated":
                    parts.append(f"«{d['filename']}»: متنش بریده شده بود، پس خودِ فایل را هم باید باز کنی")
                else:
                    parts.append(f"«{d['filename']}»: هنوز باز نشده")
            raise HTTPException(
                status_code=422,
                detail=("پیش از پاسخ باید فایل‌های پیوستِ برگه را کامل بخوانی — " + "؛ ".join(parts)
                        + ". متن را از /api/inspection/files/{id}/text تکه‌تکه بگیر "
                          "(و برای تصویر/فایلِ بی‌متن، /raw را باز کن)"))

    nid = uuid.uuid4().hex[:16]
    shot_id = await _store_shot(db, r.id, nid, "before", payload.shot)
    after_id = await _store_shot(db, r.id, nid, "after", payload.after_shot) if reviewer else None
    note: Dict[str, Any] = {"id": nid, "by": "reviewer" if reviewer else "owner", "at": _iso(),
                            "text": text, "shot_id": shot_id}
    if payload.spot is not None:
        note["spot"] = _spot_dict(payload.spot)
    if reviewer:
        note["outcome"] = payload.outcome
        note["after_shot_id"] = after_id
        note["commits"] = [_clean(c, 60) for c in (payload.commits or [])][:20]

    notes = _notes(r)
    notes.append(note)
    r.notes_json = json.dumps(notes, ensure_ascii=False)

    if payload.file_ids:
        wanted = [_clean(x, 40) for x in payload.file_ids if _clean(x, 40)][:40]
        if wanted:
            for fr in (await db.execute(select(InspectionFile).where(
                    InspectionFile.id.in_(wanted), InspectionFile.report_id == r.id))).scalars().all():
                if not (fr.note_id or ""):       # never steal a file from an earlier note
                    fr.note_id = nid

    if reviewer and payload.dependencies:
        deps = _deps(r)
        for d in payload.dependencies[:60]:
            if isinstance(d, dict):
                deps.append({"name": _clean(d.get("name"), 160), "status": _clean(d.get("status"), 20),
                             "note": _clean(d.get("note"), 300), "at": _iso()})
        r.deps_json = json.dumps(deps, ensure_ascii=False)

    if reviewer:
        if r.status in (STATUS_OPEN, STATUS_ANSWERED):
            r.status = STATUS_ANSWERED
        # The urgent request is DISCHARGED by the answer; `urgent_at` is kept so
        # the page can say «what you rushed was answered».
        if r.urgent_at is not None and r.urgent_done_at is None:
            r.urgent_done_at = _now()
            r.urgent_claimed_at = None
            r.urgent_claimed_by = ""
    else:
        # Two independent facts, two independent statements (ALLIN1 v158 — an
        # `elif` here left a rushed+answered sheet green after a follow-up).
        if r.urgent_done_at is not None:
            # asking again ⇒ back into the fast queue at its ORIGINAL position
            r.urgent_done_at = None
        if r.status in (STATUS_ANSWERED, STATUS_APPROVED):
            # The owner writing again means it is not settled — the colour goes
            # back to amber. APPROVED included: the tick was theirs to take back.
            r.status = STATUS_OPEN
    await db.commit()
    await db.refresh(r)
    await _log(db, request, user_id,
               "inspection_reviewer_note" if reviewer else "inspection_owner_note", r,
               (f"نتیجه: {payload.outcome}" if reviewer else "یادداشتِ مالک"))
    await idrive.offload_quietly(db, r.id)
    await db.refresh(r)
    return {"ok": True, "success": True, "report": _to_dict(r, await _files_of(db, r.id))}


class EditNoteIn(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_TEXT)


@router.patch("/api/inspection/{report_id}/notes/{note_id}", dependencies=[Depends(_gate)],
              tags=["inspection"])
async def edit_note(request: Request, report_id: str, note_id: str, payload: EditNoteIn,
                    db: AsyncSession = Depends(get_db),
                    user_id: int = Depends(get_optional_user_id)):
    """Correct what a note SAYS, in place — the original is kept (`original_text`),
    only your own side may be edited, and a filed sheet is closed for good."""
    r = await _report_or_404(db, report_id)
    if r.status == STATUS_FILED:
        raise HTTPException(status_code=422, detail="برگهٔ بایگانی‌شده ویرایش نمی‌شود")
    text = _clean(payload.text)
    if not text:
        raise HTTPException(status_code=422, detail="متنِ یادداشت خالی است")
    notes = _notes(r)
    target = next((n for n in notes if n.get("id") == note_id), None)
    if target is None:
        raise HTTPException(status_code=404, detail="یادداشت پیدا نشد")
    mine = "reviewer" if _is_reviewer(request) else "owner"
    if (target.get("by") or "owner") != mine:
        raise HTTPException(status_code=403,
                            detail="یادداشتِ طرفِ مقابل ویرایش نمی‌شود — یادداشتِ تازه بنویس")
    if not target.get("original_text"):
        target["original_text"] = target.get("text", "")
    target["text"] = text
    target["edited_at"] = _iso()
    if notes and notes[0].get("id") == note_id:
        r.title = _headline(text)
    r.notes_json = json.dumps(notes, ensure_ascii=False)
    await db.commit()
    await db.refresh(r)
    await _log(db, request, user_id, "inspection_note_edit", r, "یادداشت ویرایش شد")
    return {"ok": True, "success": True, "report": _to_dict(r, await _files_of(db, r.id))}


async def _urgent_ahead(db, r: InspectionReport) -> int:
    if r.urgent_at is None:
        return 0
    return int((await db.execute(select(func.count(InspectionReport.id)).where(
        InspectionReport.urgent_at.isnot(None), InspectionReport.urgent_done_at.is_(None),
        InspectionReport.status != STATUS_FILED, InspectionReport.urgent_at < r.urgent_at))).scalar() or 0)


@router.post("/api/inspection/{report_id}/urgent", dependencies=[Depends(_gate)], tags=["inspection"])
async def mark_urgent(request: Request, report_id: str, db: AsyncSession = Depends(get_db),
                      user_id: int = Depends(get_optional_user_id)):
    """«⚡ فوری» — ahead of the twice-weekly round. Pressing it again keeps the
    original request time: «whichever I pressed first» is the promise."""
    _refuse_reviewer(request, "درخواستِ فوری کارِ مالک است، نه ناظر")
    r = await _report_or_404(db, report_id)
    if r.status in (STATUS_FILED, STATUS_APPROVED):
        raise HTTPException(status_code=422, detail="برگهٔ تأییدشده یا بایگانی‌شده نوبتِ فوری نمی‌گیرد")
    if r.urgent_at is None or r.urgent_done_at is not None:
        r.urgent_at = _now()
        r.urgent_done_at = None
        r.urgent_claimed_at = None
        r.urgent_claimed_by = ""
        await db.commit()
        await db.refresh(r)
        await _log(db, request, user_id, "inspection_urgent", r, "فوری شد")
    rr = await _rounds(db)
    return {"ok": True, "success": True, "position": await _urgent_ahead(db, r) + 1,
            "next_round": rr["urgent"], "report": _to_dict(r, await _files_of(db, r.id))}


@router.delete("/api/inspection/{report_id}/urgent", dependencies=[Depends(_gate)], tags=["inspection"])
async def unmark_urgent(request: Request, report_id: str, db: AsyncSession = Depends(get_db)):
    _refuse_reviewer(request, "لغوِ فوری کارِ مالک است")
    r = await _report_or_404(db, report_id)
    r.urgent_at = None
    r.urgent_claimed_at = None
    r.urgent_claimed_by = ""
    r.urgent_done_at = None
    await db.commit()
    await db.refresh(r)
    return {"ok": True, "success": True, "report": _to_dict(r, await _files_of(db, r.id))}


class StatusIn(BaseModel):
    status: str = Field(..., max_length=12)


@router.post("/api/inspection/{report_id}/status", dependencies=[Depends(_gate)], tags=["inspection"])
async def set_status(request: Request, report_id: str, payload: StatusIn,
                     db: AsyncSession = Depends(get_db),
                     user_id: int = Depends(get_optional_user_id)):
    """The owner's tick (blue) and un-tick. The supervisor is REFUSED — a guard."""
    want = (payload.status or "").strip()
    if want not in (STATUS_OPEN, STATUS_APPROVED):
        raise HTTPException(status_code=422, detail="فقط «open» یا «approved» پذیرفته می‌شود")
    _refuse_reviewer(request, "تیکِ تأیید فقط دستِ مالک است — ناظر نمی‌تواند کارِ خودش را تأیید کند")
    r = await _report_or_404(db, report_id)
    if r.status == STATUS_FILED:
        raise HTTPException(status_code=422, detail="برگهٔ بایگانی‌شده بسته است")
    r.status = want
    if want == STATUS_APPROVED and r.urgent_at is not None and r.urgent_done_at is None:
        # a ticked sheet needs nothing more — it leaves the fast queue with the tick
        r.urgent_done_at = _now()
        r.urgent_claimed_at = None
        r.urgent_claimed_by = ""
    await db.commit()
    await db.refresh(r)
    await _log(db, request, user_id,
               "inspection_approved" if want == STATUS_APPROVED else "inspection_reopened", r,
               "تأیید شد — دورِ بعدِ ناظر بایگانی‌اش می‌کند" if want == STATUS_APPROVED else "دوباره باز شد")
    return {"ok": True, "success": True, "report": _to_dict(r, await _files_of(db, r.id))}


@router.delete("/api/inspection/{report_id}", dependencies=[Depends(_gate)], tags=["inspection"])
async def delete_report(request: Request, report_id: str, db: AsyncSession = Depends(get_db),
                        user_id: int = Depends(get_optional_user_id)):
    """The owner's own delete. Shots and file rows go with the sheet (ALLIN1 v149:
    orphaned file rows were unreachable but still held megabytes); Drive copies
    are left in place — evidence is quarantined, not destroyed."""
    _refuse_reviewer(request, "ناظر نمی‌تواند برگه حذف کند")
    r = await _report_or_404(db, report_id)
    for s in (await db.execute(select(InspectionShot).where(InspectionShot.report_id == report_id))).scalars().all():
        await db.delete(s)
    removed = 0
    for f in (await db.execute(select(InspectionFile).where(InspectionFile.report_id == report_id))).scalars().all():
        await ifiles.drop_chunks(db, f.id)
        await db.delete(f)
        removed += 1
    number, title = r.number, r.title
    await db.delete(r)
    await db.commit()
    await record_activity(action="inspection_delete", entity_type="inspection", entity_id=report_id,
                          entity_label=f"گزارشِ {number} — {title}",
                          detail=f"حذف شد" + (f" — {removed} فایلِ پیوست هم (نسخهٔ درایو ماند)" if removed else ""),
                          user_id=user_id, request=request, db=db)
    return {"ok": True, "success": True, "files_removed": removed}
