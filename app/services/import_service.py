"""Import engine — spreadsheet bulk import + AI document extraction (ALLIN1 port).

Two paths, one persistence core (:func:`import_rows`):
  * **Bulk spreadsheet** (sync): CSV / XLSX / JSON → rows → validate → dry-run or
    commit → ``ImportResult``.
  * **AI document** (async ``ImportJob``): PDF/image/doc → LLM extraction (via the
    AI catalog gateway) → rows → same import core.

Targets are user-scoped, dependency-free entities registered in
:data:`IMPORT_TARGETS` (tasks / people / incomes / assets). Each target declares
its columns, a row→model builder, and a dedup key so re-imports are idempotent.
Mirrors ALLIN1's import while adapting to Lifemanager's domain.
"""
from __future__ import annotations

import asyncio
import csv
import io
import json
import logging
import os
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger("app.imports")

# Background tasks kept referenced so they aren't garbage-collected mid-run.
_BG_TASKS: set = set()


class ImportParseError(Exception):
    """Raised when an uploaded file can't be parsed into rows."""


# --- small coercion helpers --------------------------------------------------
def _s(v: Any) -> Optional[str]:
    if v is None:
        return None
    s = str(v).strip()
    return s or None


def _dec(v: Any) -> Optional[Decimal]:
    s = _s(v)
    if s is None:
        return None
    s = s.replace(",", "")
    try:
        return Decimal(s)
    except (InvalidOperation, ValueError):
        raise ValueError(f"'{v}' is not a number")


def _date(v: Any) -> Optional[date]:
    s = _s(v)
    if s is None:
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d", "%d-%m-%Y"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    raise ValueError(f"'{v}' is not a valid date (use YYYY-MM-DD)")


# --- file parsing ------------------------------------------------------------
def parse_table(content: bytes, filename: str, *, max_rows: int = 5000) -> Tuple[List[str], List[dict]]:
    """Parse CSV / XLSX / JSON bytes into ``(headers, rows)`` (rows are dicts,
    keys lower-cased + stripped). Raises :class:`ImportParseError`."""
    name = (filename or "").lower()
    if name.endswith(".json"):
        return _parse_json(content)
    if name.endswith((".xlsx", ".xlsm")):
        return _parse_xlsx(content, max_rows=max_rows)
    if name.endswith(".csv") or not name:
        return _parse_csv(content, max_rows=max_rows)
    raise ImportParseError(f"فرمت پشتیبانی‌نشده: {filename} (فقط CSV/XLSX/JSON)")


def _norm_headers(headers: List[Any]) -> List[str]:
    return [str(h).strip().lower() if h is not None else "" for h in headers]


def _parse_csv(content: bytes, *, max_rows: int) -> Tuple[List[str], List[dict]]:
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = content.decode("latin-1")
    reader = csv.reader(io.StringIO(text))
    rows = list(reader)
    if not rows:
        raise ImportParseError("فایل خالی است")
    headers = _norm_headers(rows[0])
    out = []
    for r in rows[1:][:max_rows]:
        out.append({headers[i]: (r[i] if i < len(r) else None) for i in range(len(headers))})
    return headers, out


def _parse_json(content: bytes) -> Tuple[List[str], List[dict]]:
    try:
        data = json.loads(content.decode("utf-8-sig"))
    except Exception as exc:
        raise ImportParseError(f"JSON نامعتبر: {exc}") from exc
    if isinstance(data, dict):
        data = data.get("items") or data.get("rows") or []
    if not isinstance(data, list):
        raise ImportParseError("JSON باید آرایه‌ای از ردیف‌ها باشد")
    rows = [{str(k).strip().lower(): v for k, v in (d or {}).items()} for d in data if isinstance(d, dict)]
    headers = sorted({k for r in rows for k in r})
    return headers, rows


def _parse_xlsx(content: bytes, *, max_rows: int) -> Tuple[List[str], List[dict]]:
    try:
        import openpyxl  # lazy: optional dep; CSV/JSON still work without it
    except Exception as exc:  # pragma: no cover - env-dependent
        raise ImportParseError("خواندن XLSX نیازمند openpyxl است؛ از CSV استفاده کن") from exc
    try:
        wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
    except Exception as exc:
        raise ImportParseError(f"اکسل نامعتبر: {exc}") from exc
    ws = wb.active
    rows_iter = ws.iter_rows(values_only=True)
    try:
        header_row = next(rows_iter)
    except StopIteration:
        raise ImportParseError("فایل خالی است")
    headers = _norm_headers(list(header_row))
    out = []
    for i, r in enumerate(rows_iter):
        if i >= max_rows:
            break
        out.append({headers[j]: (r[j] if j < len(r) else None) for j in range(len(headers))})
    return headers, out


# --- target registry ---------------------------------------------------------
def _build_task(row: dict, user_id: int):
    from app.models.task import Task, TaskPriority, TaskStatus

    title = _s(row.get("title"))
    if not title:
        raise ValueError("title لازم است")
    status = (_s(row.get("status")) or "todo").lower()
    priority = (_s(row.get("priority")) or "medium").lower()
    try:
        status_enum = TaskStatus(status)
    except ValueError:
        raise ValueError(f"status نامعتبر: {status}")
    try:
        priority_enum = TaskPriority(priority)
    except ValueError:
        raise ValueError(f"priority نامعتبر: {priority}")
    return Task(
        title=title,
        description=_s(row.get("description")),
        status=status_enum,
        priority=priority_enum,
        due_date=_date(row.get("due_date")),
        user_id=user_id,
    )


def _build_person(row: dict, user_id: int):
    from app.models.person import Person

    name = _s(row.get("name"))
    if not name:
        raise ValueError("name لازم است")
    return Person(
        name=name,
        email=_s(row.get("email")),
        phone=_s(row.get("phone")),
        notes=_s(row.get("notes")),
        user_id=user_id,
    )


def _build_income(row: dict, user_id: int):
    from app.models.finance import Income

    desc = _s(row.get("description"))
    if not desc:
        raise ValueError("description لازم است")
    return Income(
        description=desc,
        amount=_dec(row.get("amount")) or Decimal("0"),
        currency=(_s(row.get("currency")) or "USD")[:8],
        received_on=_date(row.get("received_on")),
        notes=_s(row.get("notes")),
        user_id=user_id,
    )


def _build_asset(row: dict, user_id: int):
    from app.models.finance import Asset

    name = _s(row.get("name"))
    if not name:
        raise ValueError("name لازم است")
    return Asset(
        name=name,
        asset_type=_s(row.get("asset_type")),
        value=_dec(row.get("value")) or Decimal("0"),
        currency=(_s(row.get("currency")) or "USD")[:8],
        notes=_s(row.get("notes")),
        user_id=user_id,
    )


# Each target: model class, columns (name, required), builder, and the natural
# key column used to skip duplicates within the user's scope.
IMPORT_TARGETS: Dict[str, Dict[str, Any]] = {
    "tasks": {
        "label": "کارها / Tasks",
        "model": "app.models.task:Task",
        "columns": [
            ("title", True), ("description", False), ("status", False),
            ("priority", False), ("due_date", False),
        ],
        "build": _build_task,
        "dedup_attr": "title",
        "dedup_key": lambda row: _s(row.get("title")),
    },
    "people": {
        "label": "افراد / People",
        "model": "app.models.person:Person",
        "columns": [("name", True), ("email", False), ("phone", False), ("notes", False)],
        "build": _build_person,
        "dedup_attr": "name",
        "dedup_key": lambda row: _s(row.get("name")),
    },
    "incomes": {
        "label": "درآمدها / Incomes",
        "model": "app.models.finance:Income",
        "columns": [
            ("description", True), ("amount", False), ("currency", False),
            ("received_on", False), ("notes", False),
        ],
        "build": _build_income,
        "dedup_attr": "description",
        "dedup_key": lambda row: _s(row.get("description")),
    },
    "assets": {
        "label": "دارایی‌ها / Assets",
        "model": "app.models.finance:Asset",
        "columns": [
            ("name", True), ("asset_type", False), ("value", False),
            ("currency", False), ("notes", False),
        ],
        "build": _build_asset,
        "dedup_attr": "name",
        "dedup_key": lambda row: _s(row.get("name")),
    },
}


def list_targets() -> List[dict]:
    return [
        {
            "id": key,
            "label": spec["label"],
            "columns": [{"name": n, "required": req} for n, req in spec["columns"]],
            "required": [n for n, req in spec["columns"] if req],
        }
        for key, spec in IMPORT_TARGETS.items()
    ]


def template_csv(target: str) -> str:
    spec = IMPORT_TARGETS[target]
    cols = [n for n, _ in spec["columns"]]
    return ",".join(cols) + "\n"


def _resolve_model(spec: Dict[str, Any]):
    mod, _, cls = spec["model"].partition(":")
    import importlib

    return getattr(importlib.import_module(mod), cls)


async def import_rows(
    db: AsyncSession,
    target: str,
    rows: List[dict],
    *,
    user_id: int,
    dry_run: bool = False,
) -> Dict[str, Any]:
    """Core: validate + dedup + (optionally) persist a list of row-dicts.

    Returns an ImportResult dict. Idempotent: rows whose natural key already
    exists for the user are skipped.
    """
    spec = IMPORT_TARGETS.get(target)
    if spec is None:
        raise ImportParseError(f"مقصد ناشناخته: {target}")
    Model = _resolve_model(spec)
    dedup_attr = spec["dedup_attr"]
    dedup_key = spec["dedup_key"]

    # Existing natural keys for this user (skip duplicates).
    existing_rows = (
        await db.execute(
            select(getattr(Model, dedup_attr)).where(
                (Model.user_id == user_id) | (Model.user_id.is_(None))
            )
        )
    ).scalars().all()
    existing = {str(v).strip().lower() for v in existing_rows if v is not None}
    seen_in_file: set = set()

    created = 0
    skipped = 0
    errors: List[dict] = []
    to_add = []
    for idx, row in enumerate(rows, start=2):  # row 1 is the header
        key = dedup_key(row)
        if key is None:
            # required natural key missing → let build() surface the error
            pass
        else:
            norm = key.strip().lower()
            if norm in existing or norm in seen_in_file:
                skipped += 1
                continue
        try:
            obj = spec["build"](row, user_id)
        except ValueError as exc:
            errors.append({"row": idx, "error": str(exc)})
            continue
        if key is not None:
            seen_in_file.add(key.strip().lower())
        to_add.append(obj)
        created += 1

    if not dry_run and to_add:
        db.add_all(to_add)
        await db.commit()

    return {
        "target": target,
        "dry_run": dry_run,
        "total_rows": len(rows),
        "created": 0 if dry_run else created,
        "would_create": created,
        "skipped_existing": skipped,
        "errors": errors,
    }


async def bulk_import(
    db: AsyncSession,
    target: str,
    content: bytes,
    filename: str,
    *,
    user_id: int,
    dry_run: bool = False,
) -> Dict[str, Any]:
    """Parse a spreadsheet/CSV/JSON file and import it into ``target``."""
    if target not in IMPORT_TARGETS:
        raise ImportParseError(f"مقصد ناشناخته: {target}")
    headers, rows = parse_table(content, filename)
    spec = IMPORT_TARGETS[target]
    required = [n for n, req in spec["columns"] if req]
    missing = [c for c in required if c not in headers]
    if missing:
        raise ImportParseError("ستون‌(های) الزامی موجود نیست: " + ", ".join(missing))
    return await import_rows(db, target, rows, user_id=user_id, dry_run=dry_run)


# --- AI document extraction (async ImportJob) --------------------------------
def parse_model_json(text: str) -> List[dict]:
    """Pull a JSON array of row-objects out of a model reply (tolerates fences)."""
    if not text:
        return []
    s = text.strip()
    if "```" in s:
        # take the content of the first fenced block
        parts = s.split("```")
        for p in parts:
            p = p.strip()
            if p.startswith("json"):
                p = p[4:].strip()
            if p.startswith("[") or p.startswith("{"):
                s = p
                break
    start = s.find("[")
    end = s.rfind("]")
    if start != -1 and end != -1 and end > start:
        s = s[start : end + 1]
    try:
        data = json.loads(s)
    except Exception:
        return []
    if isinstance(data, dict):
        data = data.get("items") or data.get("rows") or [data]
    return [{str(k).strip().lower(): v for k, v in d.items()} for d in data if isinstance(d, dict)]


def _extraction_prompt(target: str) -> str:
    spec = IMPORT_TARGETS[target]
    cols = ", ".join(n for n, _ in spec["columns"])
    return (
        f"Extract every {target} record from this document. "
        f"Return ONLY a JSON array. Each object uses exactly these keys: {cols}. "
        f"Use null for unknown fields. Dates as YYYY-MM-DD. No prose, no code fences."
    )


_IMAGE_EXT = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tif", ".tiff")


async def _extract_rows_with_ai(
    db: AsyncSession, target: str, content: bytes, filename: str, mimetype: str, model_id: Optional[int]
) -> List[dict]:
    """Run the configured AI model over a document and return extracted rows."""
    from app.services.ai.inference_gateway import complete, complete_multimodal

    name = (filename or "").lower()
    prompt = _extraction_prompt(target)
    is_pdf = name.endswith(".pdf") or (mimetype or "").endswith("pdf")
    is_image = name.endswith(_IMAGE_EXT) or (mimetype or "").startswith("image/")
    if is_pdf or is_image:
        res = await complete_multimodal(
            db, prompt,
            [{"filename": filename, "mimetype": mimetype or "application/octet-stream", "data": content}],
            task="document_extraction", model_id=model_id,
        )
    else:
        # text-ish: decode (or convert a table to text) and send as a prompt
        try:
            _, rows = parse_table(content, filename)
            doc_text = json.dumps(rows, ensure_ascii=False)
        except ImportParseError:
            doc_text = content.decode("utf-8", errors="ignore")[:100_000]
        res = await complete(
            db, f"{prompt}\n\nDOCUMENT:\n{doc_text}",
            task="document_extraction", model_id=model_id, max_tokens=8000,
        )
    if not res.get("ok"):
        raise ImportParseError(res.get("error") or "مدل هوش مصنوعی در دسترس نیست")
    return parse_model_json(res.get("text", ""))


def _new_job_id() -> str:
    return os.urandom(8).hex()


async def create_import_job(
    db: AsyncSession, *, job_id: str, target: str, filename: str, user_id: int
) -> None:
    from app.models.import_job import ImportJob

    db.add(ImportJob(id=job_id, status="running", target=target, filename=filename, user_id=user_id))
    await db.commit()


def spawn_analyze_job(
    *, job_id: str, target: str, content: bytes, filename: str, mimetype: str,
    user_id: int, model_id: Optional[int],
) -> None:
    """Fire-and-forget the AI extraction; updates the ImportJob row when done.

    Uses its own SessionLocal session (the request session is closed by then).
    """
    task = asyncio.create_task(
        _run_analyze_job(
            job_id=job_id, target=target, content=content, filename=filename,
            mimetype=mimetype, user_id=user_id, model_id=model_id,
        )
    )
    _BG_TASKS.add(task)
    task.add_done_callback(_BG_TASKS.discard)


async def _run_analyze_job(
    *, job_id: str, target: str, content: bytes, filename: str, mimetype: str,
    user_id: int, model_id: Optional[int],
) -> None:
    from app.database import SessionLocal
    from app.models.import_job import ImportJob

    try:
        async with SessionLocal() as db:
            rows = await _extract_rows_with_ai(db, target, content, filename, mimetype, model_id)
            result = await import_rows(db, target, rows, user_id=user_id, dry_run=False)
            job = await db.get(ImportJob, job_id)
            if job:
                job.status = "done"
                job.result_json = json.dumps(result, ensure_ascii=False)
                job.finished_at = datetime.utcnow()
                await db.commit()
    except Exception as exc:  # never crash the loop; record the failure
        logger.warning("import job %s failed: %s", job_id, exc, exc_info=True)
        try:
            async with SessionLocal() as db:
                job = await db.get(ImportJob, job_id)
                if job:
                    job.status = "error"
                    job.error = str(exc)
                    job.finished_at = datetime.utcnow()
                    await db.commit()
        except Exception:
            pass
