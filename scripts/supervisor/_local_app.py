#!/usr/bin/env python3
"""Run Lifemanager locally on a throwaway SQLite file — for the supervisor's
browser checks only (`page_map.py`, `screenshot.py`).

`app/database.py` builds its engine with Postgres pool arguments, which SQLite
refuses. Production must not change for a test harness (project rule 3), so the
harness adapts instead: it drops those arguments for a `sqlite` URL before the
app is imported, then serves the real app unchanged.

    DATABASE_URL=sqlite+aiosqlite:////tmp/x.db python3 scripts/supervisor/_local_app.py 8765
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

import sqlalchemy.ext.asyncio as _sa  # noqa: E402

_orig = _sa.create_async_engine


def _create(url, **kw):
    if str(url).startswith("sqlite"):
        for k in ("pool_size", "max_overflow", "pool_timeout"):
            kw.pop(k, None)
    return _orig(url, **kw)


_sa.create_async_engine = _create

if __name__ == "__main__":
    import uvicorn

    from main import app  # noqa: E402

    uvicorn.run(app, host="127.0.0.1", port=int(sys.argv[1]), log_level="warning")
