#!/usr/bin/env python3
"""Where the supervisor routine finds Lifemanager — and proves it is the supervisor.

No secret lives in the repo and nothing has to be configured by hand, the same
mechanism Detective-1 uses: the Claude Code environment's outbound proxy
authenticates `api.render.com`, so at RUN TIME this reads

  * the service URL     — the Render service whose repo is mahdighandi1989/Lifemanager
  * the supervisor token — `SUPERVISOR_TOKEN` on that service if set, otherwise
                           derived from its `AUTH_JWT_SECRET` exactly as the server
                           derives it (`app/services/supervisor_auth.py`).

The token is held in memory only: never printed, never written to disk, never
put in a commit. For a local/manual run, set instead:

    LM_SUPERVISOR_API_BASE=http://localhost:8000   LM_SUPERVISOR_TOKEN=…

Standard library only — a recycled routine container has nothing installed.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import urllib.error
import urllib.parse
import urllib.request

REPO_SUFFIX = "mahdighandi1989/lifemanager"
RENDER = "https://api.render.com/v1"
TIMEOUT = float(os.getenv("LM_SUPERVISOR_TIMEOUT", "90"))
_DERIVE_LABEL = b"lifemanager:supervisor:v1"
HEADER = "X-Supervisor-Token"


class SupervisorError(RuntimeError):
    """Carries WHAT to fix, in the owner's language — not just that it failed."""


def _get_json(url: str, headers: dict | None = None):
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return json.loads(r.read().decode("utf-8") or "null")


def _render_lookup() -> tuple[str, str, str]:
    """`(base_url, token, source)` from the Render API, or a SupervisorError."""
    try:
        services = _get_json(f"{RENDER}/services?limit=100")
    except urllib.error.HTTPError as e:
        raise SupervisorError(
            f"Render API پاسخِ {e.code} داد — پروکسیِ محیط api.render.com را احراز نکرد. "
            "LM_SUPERVISOR_API_BASE و LM_SUPERVISOR_TOKEN را دستی بده.") from e
    except urllib.error.URLError as e:
        raise SupervisorError(f"به api.render.com نرسیدم ({e.reason}) — Network access محیط را ببین.") from e
    svc = next((s.get("service", s) for s in services or []
                if (s.get("service", s).get("repo") or "").lower().endswith(REPO_SUFFIX)), None)
    if not svc:
        raise SupervisorError("سرویسِ Lifemanager روی Render پیدا نشد (repo=mahdighandi1989/Lifemanager)")
    base = ((svc.get("serviceDetails") or {}).get("url") or "").rstrip("/")
    if not base:
        raise SupervisorError("سرویسِ Lifemanager روی Render نشانیِ عمومی ندارد")
    env = {}
    cursor = ""
    for _ in range(10):
        q = f"?limit=100" + (f"&cursor={urllib.parse.quote(cursor)}" if cursor else "")
        rows = _get_json(f"{RENDER}/services/{svc['id']}/env-vars{q}") or []
        for row in rows:
            ev = row.get("envVar", row)
            env[ev.get("key")] = ev.get("value")
        cursor = (rows[-1].get("cursor") if rows else "") or ""
        if len(rows) < 100 or not cursor:
            break
    token = (env.get("SUPERVISOR_TOKEN") or "").strip()
    if token:
        return base, token, "render:SUPERVISOR_TOKEN"
    secret = (env.get("AUTH_JWT_SECRET") or "").strip()
    if len(secret) >= 16:
        return base, derive(secret), "render:AUTH_JWT_SECRET (derived)"
    raise SupervisorError(
        "نه SUPERVISOR_TOKEN روی سرویسِ Render هست نه AUTH_JWT_SECRET — "
        "یکی از این دو باید روی سرویس تعریف شود تا ناظر شناخته شود")


def derive(secret: str) -> str:
    return hmac.new(secret.encode("utf-8"), _DERIVE_LABEL, hashlib.sha256).hexdigest()


_cache: dict = {}


def credentials() -> dict:
    """`{base, token, source}` — env first (local runs), then Render."""
    if _cache:
        return _cache
    base = (os.getenv("LM_SUPERVISOR_API_BASE") or "").strip().rstrip("/")
    token = (os.getenv("LM_SUPERVISOR_TOKEN") or "").strip()
    if base and token:
        _cache.update(base=base, token=token, source="env")
        return _cache
    b, t, src = _render_lookup()
    _cache.update(base=base or b, token=token or t, source=src)
    return _cache


def request(path: str, *, body: bytes | None = None, headers: dict | None = None,
            method: str = "GET", timeout: float | None = None) -> tuple[int, bytes]:
    c = credentials()
    h = {HEADER: c["token"], **(headers or {})}
    req = urllib.request.Request(f"{c['base']}{path}", data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout or TIMEOUT) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()
    except urllib.error.URLError as e:
        raise SupervisorError(f"به «{c['base']}» نرسیدم ({e.reason}) — سرور بالا است؟ وسطِ دیپلوی؟") from e


def api(path: str, *, payload: dict | None = None, method: str = "GET") -> dict:
    data = json.dumps(payload, ensure_ascii=False).encode() if payload is not None else None
    headers = {"Content-Type": "application/json"} if data is not None else {}
    st, raw = request(path, body=data, headers=headers, method=method)
    if st in (200, 201):
        return json.loads(raw or b"{}")
    detail = ""
    try:
        detail = str((json.loads(raw) or {}).get("detail") or "")
    except Exception:  # noqa: BLE001
        detail = raw[:200].decode("utf-8", "replace")
    if st == 404:
        raise SupervisorError(f"«{path}» پیدا نشد (۴۰۴) — هنوز دیپلوی نشده؟ {detail}")
    if st == 401:
        raise SupervisorError(f"توکنِ ناظر رد شد (۴۰۱): {detail}")
    raise SupervisorError(f"«{path}» پاسخِ HTTP {st} داد: {detail}")
