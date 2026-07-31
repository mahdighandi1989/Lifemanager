"""آرشیوِ لاگ فعالیت به گوگل درایو — offload old rows WITHOUT deleting them.

The owner: «چون این لاگ‌ها زیاد می‌شه بهتره بعد از استفاده در گوگل درایو ذخیره
بشن و البته همچنان در برنامه نشون داده بشن.» So this is an APPEND-ONLY export,
not a move: each closed calendar month of activity_logs is written once to
Drive as a JSON file under ``LifeManagerData/ActivityArchive/`` and the rows
stay in the DB (still shown in the app). Which months are already archived is
remembered in global_settings, so re-runs never duplicate.

Runs as a periodic job (jobs_engine). Degrades cleanly: no Drive → skip and
try again next run; a bad month → recorded and skipped, never fatal.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

ARCHIVE_SUBFOLDER = "ActivityArchive"
_STATE_KEY = "activity_archive_state"  # {"archived_months": ["2026-06", ...]}


def _month_key(dt: datetime) -> str:
    return f"{dt.year:04d}-{dt.month:02d}"


async def _load_state(db: AsyncSession) -> Dict[str, Any]:
    from app.models.global_setting import GlobalSetting

    row = (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == _STATE_KEY))
    ).scalar_one_or_none()
    try:
        return json.loads(row.value) if row and row.value else {}
    except Exception:
        return {}


async def _save_state(db: AsyncSession, state: Dict[str, Any]) -> None:
    from app.models.global_setting import GlobalSetting

    row = (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == _STATE_KEY))
    ).scalar_one_or_none()
    payload = json.dumps(state, ensure_ascii=False)
    if row is None:
        db.add(GlobalSetting(key=_STATE_KEY, value=payload))
    else:
        row.value = payload
    await db.commit()


def _serialize_row(r) -> Dict[str, Any]:
    return {
        "id": r.id, "user_id": r.user_id, "action": r.action,
        "entity_type": r.entity_type, "entity_id": r.entity_id,
        "entity_label": r.entity_label, "context_type": r.context_type,
        "context_id": r.context_id, "detail": r.detail,
        "ip_address": r.ip_address,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "occurred_at": r.occurred_at.isoformat() if getattr(r, "occurred_at", None) else None,
    }


async def _closed_months_with_rows(db: AsyncSession) -> List[str]:
    """Month keys (YYYY-MM) that have rows AND are before the current month
    (a month still in progress isn't archived until it closes)."""
    from app.models.activity_log import ActivityLog

    when = func.coalesce(ActivityLog.occurred_at, ActivityLog.created_at)
    rows = (await db.execute(select(when).where(when.isnot(None)))).scalars().all()
    now_key = _month_key(datetime.now(timezone.utc))
    months = set()
    for dt in rows:
        try:
            k = _month_key(dt)
            if k < now_key:
                months.add(k)
        except Exception:
            continue
    return sorted(months)


async def archive_tick(db: AsyncSession) -> Dict[str, Any]:
    """Archive every closed month not yet on Drive. Returns a summary.

    Rows are NEVER deleted — this is a durable copy, the app keeps showing
    everything. Idempotent via the archived-months set in global_settings."""
    from app.models.activity_log import ActivityLog

    result: Dict[str, Any] = {"archived": [], "skipped_no_drive": False, "errors": []}
    try:
        state = await _load_state(db)
        done = set(state.get("archived_months") or [])
        pending = [m for m in await _closed_months_with_rows(db) if m not in done]
        if not pending:
            return result

        # Resolve Drive once; if unavailable, leave everything for next run.
        try:
            from app.services import drive_settings_service as dss
            from app.services import google_drive_service
            from app.services.google_api_client import build_drive_client

            drive_client = await build_drive_client(db)
        except Exception as exc:
            logger.debug("activity archive: drive client unavailable: %r", exc)
            drive_client = None
        if drive_client is None:
            result["skipped_no_drive"] = True
            return result
        refresh_token = await dss.resolve_refresh_token(db)

        when = func.coalesce(ActivityLog.occurred_at, ActivityLog.created_at)
        for month in pending:
            try:
                year, mon = int(month[:4]), int(month[5:7])
                start = datetime(year, mon, 1, tzinfo=timezone.utc)
                end = datetime(year + (mon == 12), (mon % 12) + 1, 1, tzinfo=timezone.utc)
                rows = (
                    await db.execute(
                        select(ActivityLog).where(when >= start, when < end)
                        .order_by(ActivityLog.id.asc())
                    )
                ).scalars().all()
                if not rows:
                    done.add(month)
                    continue
                payload = json.dumps(
                    {"month": month, "count": len(rows),
                     "rows": [_serialize_row(r) for r in rows]},
                    ensure_ascii=False,
                ).encode("utf-8")
                await google_drive_service.upload_file(
                    refresh_token=refresh_token,
                    file_name=f"activity-{month}.json",
                    data_type=ARCHIVE_SUBFOLDER,
                    media=payload,
                    client=drive_client,
                )
                done.add(month)
                result["archived"].append({"month": month, "rows": len(rows)})
            except Exception as exc:
                logger.warning("activity archive: month %s failed: %r", month, exc)
                result["errors"].append({"month": month, "error": repr(exc)[:200]})

        state["archived_months"] = sorted(done)
        state["last_run_at"] = datetime.now(timezone.utc).isoformat()
        await _save_state(db, state)
    except Exception as exc:
        logger.warning("activity archive tick failed: %r", exc)
        result["errors"].append({"error": repr(exc)[:200]})
    return result


async def get_archive_status(db: AsyncSession) -> Dict[str, Any]:
    state = await _load_state(db)
    return {
        "archived_months": state.get("archived_months") or [],
        "last_run_at": state.get("last_run_at"),
    }
