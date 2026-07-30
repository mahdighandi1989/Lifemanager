"""نبض زندهٔ سیستم — real request activity feeding the live diagram.

The SystemPulseMiddleware (app/main.py) calls :func:`record_request` for
every request that resolved to an ``app.routes.*`` handler. Events land in
a bounded in-memory ring buffer — the request path NEVER touches the
database (fail-open by construction: recording is wrapped, bounded, and
lossy by design; the map is an observer, not a participant).

Two things come out of the buffer:

  * :func:`activity_snapshot` — per-node pulse counts for the last N
    seconds, so the diagram can light the cards and run light along the
    wires where traffic ACTUALLY flows (owner: «باید این نمایش‌ها واقعی
    باشد، نه یک نمایش بصری بی‌معنا»).
  * learned page→router wires — the ``X-LM-Page`` header (attached by the
    SPA's axios client) tells us which page caused each request; the
    accumulated pairs are persisted as JSON in the existing
    ``global_settings`` KV table (house precedent: notification_prefs),
    flushed lazily through the REQUEST-SCOPED session of whoever polls the
    activity endpoint — never through a private engine, so tests and
    dependency overrides keep working.
"""
from __future__ import annotations

import json
import logging
import time
from collections import deque

from sqlalchemy import select

logger = logging.getLogger(__name__)

_LEARNED_KEY = "system_map_learned_edges"
_FLUSH_INTERVAL_SECONDS = 30.0
_EVENTS: deque = deque(maxlen=4000)

# (page_pattern, router_file) → {"hits": int, "last_seen": epoch}
_learned: dict[tuple[str, str], dict] = {}
_learned_loaded = False
_learned_dirty = False
_last_flush = 0.0


def record_request(
    *,
    module: str,
    method: str,
    path: str,
    page: str | None,
    status: int,
    dur_ms: int,
) -> None:
    """Append one observed request. Must never raise (called per-request)."""
    global _learned_dirty
    try:
        from app.services.system_graph_service import _module_file

        router_file = _module_file(module)
        if not router_file:
            return
        now = time.time()
        _EVENTS.append({
            "ts": now,
            "router_file": router_file,
            "method": method,
            "path": path,
            "page": page or None,
            "status": status,
            "dur_ms": dur_ms,
        })
        if page:
            entry = _learned.setdefault((page, router_file), {"hits": 0, "last_seen": 0.0})
            entry["hits"] += 1
            entry["last_seen"] = now
            _learned_dirty = True
    except Exception:  # pragma: no cover — observer must stay silent
        pass


def activity_snapshot(window_seconds: float = 60.0) -> dict:
    """Aggregate the ring buffer over the trailing window.

    Returns per-router pulse info plus the (page, router) pairs active in
    the window — the diagram uses the pairs to animate light along wires.
    """
    now = time.time()
    horizon = now - window_seconds
    routers: dict[str, dict] = {}
    pairs: dict[tuple[str, str], dict] = {}
    for event in reversed(_EVENTS):
        if event["ts"] < horizon:
            break
        node = routers.setdefault(
            event["router_file"],
            {"count": 0, "last_ago": None, "last_path": None, "errors": 0},
        )
        node["count"] += 1
        age = round(now - event["ts"], 1)
        if node["last_ago"] is None or age < node["last_ago"]:
            node["last_ago"] = age
            node["last_path"] = event["path"]
        if event["status"] >= 500:
            node["errors"] += 1
        if event["page"]:
            pair = pairs.setdefault(
                (event["page"], event["router_file"]),
                {"count": 0, "last_ago": age},
            )
            pair["count"] += 1
            if age < pair["last_ago"]:
                pair["last_ago"] = age
    return {
        "window_seconds": window_seconds,
        "server_ts": now,
        "routers": routers,
        "pairs": [
            {"page": page, "router_file": router_file, **info}
            for (page, router_file), info in sorted(pairs.items())
        ],
    }


# ── learned wires persistence (global_settings KV) ───────────────────────────

async def _get_row(db, key: str):
    from app.models.global_setting import GlobalSetting

    return (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == key))
    ).scalar_one_or_none()


async def load_learned_edges(db) -> list[dict]:
    """Merge persisted wires into memory (once per process) and return all."""
    global _learned_loaded
    try:
        if not _learned_loaded:
            row = await _get_row(db, _LEARNED_KEY)
            if row and row.value:
                for item in json.loads(row.value):
                    pair = (item.get("page", ""), item.get("router_file", ""))
                    if not pair[0] or not pair[1]:
                        continue
                    entry = _learned.setdefault(pair, {"hits": 0, "last_seen": 0.0})
                    entry["hits"] = max(entry["hits"], int(item.get("hits", 0)))
                    entry["last_seen"] = max(
                        entry["last_seen"], float(item.get("last_seen", 0.0))
                    )
            _learned_loaded = True
    except Exception as exc:
        logger.debug("system pulse: learned-edge load skipped: %s", exc)
    return [
        {"page": page, "router_file": router_file, **info}
        for (page, router_file), info in sorted(_learned.items())
    ]


async def flush_learned_edges(db, force: bool = False) -> None:
    """Lazily persist the learned wires through the CALLER'S session."""
    global _learned_dirty, _last_flush
    if not _learned_dirty:
        return
    now = time.time()
    if not force and now - _last_flush < _FLUSH_INTERVAL_SECONDS:
        return
    try:
        from app.models.global_setting import GlobalSetting

        payload = json.dumps(
            [
                {"page": page, "router_file": router_file, **info}
                for (page, router_file), info in sorted(_learned.items())
            ],
            ensure_ascii=False,
        )
        row = await _get_row(db, _LEARNED_KEY)
        if row is None:
            db.add(GlobalSetting(key=_LEARNED_KEY, value=payload))
        else:
            row.value = payload
        await db.commit()
        _learned_dirty = False
        _last_flush = now
    except Exception as exc:
        logger.debug("system pulse: learned-edge flush skipped: %s", exc)
        try:
            await db.rollback()
        except Exception:
            pass


def reset_for_tests() -> None:
    """Test seam: wipe process-level pulse state between test cases."""
    global _learned_loaded, _learned_dirty, _last_flush
    _EVENTS.clear()
    _learned.clear()
    _learned_loaded = False
    _learned_dirty = False
    _last_flush = 0.0
