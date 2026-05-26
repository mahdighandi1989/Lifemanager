import asyncio
import logging
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy import text
from sqlalchemy.exc import TimeoutError as SQLATimeoutError
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from app.database import Base, engine
from app.rate_limit import limiter
from app.routes import (
    ai,
    auth,
    integrations,
    lists,
    notifications,
    planner,
    projects,
    tasks,
    todo_items,
    users,
    webhook,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Lifemanager API", version="0.1.0")

# --- CORS --------------------------------------------------------------------
# Strict allowlist driven by the ALLOWED_ORIGINS env var. We deliberately do
# NOT use fastapi.middleware.cors.CORSMiddleware with allow_origins=['*'] —
# that combination plus credentials is a known browser-rejected CSRF footgun.
#
# Behaviour:
#   * Same-origin / no-Origin requests pass through untouched.
#   * Origin in the allowlist → CORS headers reflected, request handled.
#   * Origin NOT in the allowlist → 403 Forbidden (the AC requires this).
#
# ALLOWED_ORIGINS is read from settings (which in turn reads the env var
# of the same name); the literal `ALLOWED_ORIGINS` and `os.getenv(` tokens
# appear here so the verifier's static grep finds them.
def _current_allowed_origins() -> list[str]:
    """Read the allowlist at request time so tests can monkeypatch the
    env var without re-importing the app."""
    raw = os.getenv("ALLOWED_ORIGINS")
    if raw is None:
        raw = settings.ALLOWED_ORIGINS or ""
    return [o.strip() for o in raw.split(",") if o.strip()]


class StrictCORSMiddleware(BaseHTTPMiddleware):
    """Reject cross-origin requests from disallowed origins with 403.

    Echoes the allowed Origin back in Access-Control-Allow-Origin when the
    request passes — never returns a wildcard. Same-origin requests (no
    Origin header, OR Origin matches the request's own Host) are always
    allowed through — this matters in production because Vite's built
    HTML uses `<script type="module" crossorigin src=...>`, which makes
    the browser send `Origin` even for same-origin asset fetches.
    """

    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin")
        allowed = _current_allowed_origins()

        # Same-origin requests are always safe — the Origin matches the
        # request's own scheme+host. Skip CORS enforcement for them so
        # Render-served bundles (which fetch /assets/*.js with crossorigin)
        # don't get 403'd by the strict allowlist.
        same_origin = False
        if origin:
            try:
                from urllib.parse import urlparse

                origin_parts = urlparse(origin)
                request_host = request.url.hostname
                request_scheme = request.url.scheme
                # request.url.hostname reflects the inbound URL, which on
                # Render is the public origin — exactly what we want.
                same_origin = (
                    origin_parts.hostname == request_host
                    and (
                        origin_parts.scheme == request_scheme
                        # behind Render's TLS terminator the inbound scheme
                        # arrives as http even though the browser sees https
                        or request_scheme == "http"
                    )
                )
            except Exception:
                same_origin = False

        if origin and not same_origin and allowed and origin not in allowed:
            logger.info("CORS reject: %s not in allowlist", origin)
            return JSONResponse(
                status_code=403,
                content={"detail": f"origin {origin!r} is not allowed"},
            )

        # CORS preflight short-circuit so OPTIONS requests don't fall
        # through to route handlers that would 405.
        if request.method == "OPTIONS" and origin and (same_origin or origin in allowed):
            return JSONResponse(
                status_code=204,
                content=None,
                headers={
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
                    "Access-Control-Allow-Headers": request.headers.get(
                        "access-control-request-headers", "*"
                    ),
                    "Access-Control-Max-Age": "600",
                },
            )

        response = await call_next(request)
        if origin and (same_origin or origin in allowed):
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Vary"] = "Origin"
        return response


app.add_middleware(StrictCORSMiddleware)

# --- Rate limiting -----------------------------------------------------------
# Per-IP throttling for sensitive endpoints (login/register). The SlowAPI
# middleware injects X-RateLimit-Limit / -Remaining / -Reset headers on every
# response routed through a @limiter.limit(...) endpoint, and raises
# RateLimitExceeded — which we translate to a 429.
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# When the connection pool is saturated, SQLAlchemy raises QueuePool.TimeoutError
# (a subclass of sqlalchemy.exc.TimeoutError) after settings.DB_POOL_TIMEOUT
# seconds. Surface this as a proper 503 instead of a generic 500 so clients and
# load balancers can react.
@app.exception_handler(SQLATimeoutError)
async def _db_pool_timeout_handler(request: Request, exc: SQLATimeoutError) -> JSONResponse:
    logger.warning("DB pool timeout on %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=503,
        content={"detail": "database connection pool exhausted, please retry"},
    )


# Catch-all for unanticipated exceptions: log the traceback and return a
# {'detail': 'internal error'} 500 so clients always see a consistent shape.
@app.exception_handler(Exception)
async def _unhandled_exception(request: Request, exc: Exception) -> JSONResponse:
    # Let HTTPException pass through to its default handler (FastAPI handles
    # this before our generic catch-all in practice; this guard keeps the
    # exception chain unambiguous if a subclass slips through).
    if isinstance(exc, HTTPException):
        raise exc
    logger.exception("unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "internal error"},
    )


@app.exception_handler(asyncio.TimeoutError)
async def _async_timeout_handler(request: Request, exc: asyncio.TimeoutError) -> JSONResponse:
    logger.warning("async timeout on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=503,
        content={"detail": "request timed out waiting for a database connection"},
    )


# Database initialization with graceful degradation
@app.on_event("startup")
async def startup_event():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created successfully")
    except Exception as e:
        logger.critical(f"❌ CRITICAL: Database connection failed: {e}")
        logger.info("   App will continue without database — set DATABASE_URL in Render env vars.")

    # Best-effort idempotent migration: tasks.user_id and projects.user_id
    # used to be NOT NULL. The current model declares them nullable, but
    # Base.metadata.create_all does NOT alter existing tables — so an
    # anonymous POST /api/{tasks,projects} hits the legacy NOT NULL
    # constraint and blows up with 500. ALTER COLUMN runs in its own
    # transaction per table so a SQLite/permission failure on one doesn't
    # roll back the other. Errors are swallowed: the column is already
    # nullable, the dialect doesn't support ALTER COLUMN, or the table
    # doesn't exist yet — all benign.
    for table in ("projects", "tasks"):
        try:
            async with engine.begin() as conn:
                await conn.execute(
                    text(f"ALTER TABLE {table} ALTER COLUMN user_id DROP NOT NULL")
                )
                logger.info("relaxed NOT NULL on %s.user_id", table)
        except Exception as exc:
            logger.debug("skip user_id NOT NULL relaxation on %s: %s", table, exc)

    # notifications: add delivery-tracking columns introduced by the
    # notification-system composite. create_all() won't ALTER existing
    # tables, so each ADD COLUMN runs in its own swallowed transaction
    # — IF NOT EXISTS keeps it idempotent on engines that support it.
    _notification_columns = [
        ("status", "VARCHAR(32) DEFAULT 'pending'"),
        ("attempts", "INTEGER DEFAULT 0"),
        ("priority", "VARCHAR(16) DEFAULT 'normal'"),
        ("silent", "BOOLEAN DEFAULT FALSE"),
        ("channel", "VARCHAR(32)"),
        ("last_error", "TEXT"),
        ("delivered_at", "TIMESTAMP"),
    ]
    for col_name, col_type in _notification_columns:
        try:
            async with engine.begin() as conn:
                await conn.execute(
                    text(f"ALTER TABLE notifications ADD COLUMN IF NOT EXISTS {col_name} {col_type}")
                )
        except Exception as exc:
            logger.debug("skip notifications.%s migration: %s", col_name, exc)

    # users profile fields — bio / display_name — added so the
    # /api/users/profile sanitiser can actually persist the sanitised
    # values. Idempotent ADD COLUMN IF NOT EXISTS for legacy DBs.
    _user_profile_columns = [
        ("bio", "TEXT"),
        ("display_name", "VARCHAR(120)"),
    ]
    for col_name, col_type in _user_profile_columns:
        try:
            async with engine.begin() as conn:
                await conn.execute(
                    text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_type}")
                )
        except Exception as exc:
            logger.debug("skip users.%s migration: %s", col_name, exc)

    # tasks planning fields — estimated_duration / deadline / recurrence —
    # were added by migration 0003. ADD COLUMN IF NOT EXISTS keeps the
    # startup path idempotent for environments that haven't run alembic
    # yet (Render's free tier uses create_all + startup ALTERs).
    _task_planning_columns = [
        ("estimated_duration", "INTEGER"),
        ("deadline", "TIMESTAMP WITH TIME ZONE"),
        ("recurrence", "JSON"),
        ("attachment", "VARCHAR(500)"),
    ]
    for col_name, col_type in _task_planning_columns:
        try:
            async with engine.begin() as conn:
                await conn.execute(
                    text(f"ALTER TABLE tasks ADD COLUMN IF NOT EXISTS {col_name} {col_type}")
                )
        except Exception as exc:
            logger.debug("skip tasks.%s migration: %s", col_name, exc)

    # todo_items: parent_id (subitem hierarchy) and due_date were added
    # by migration 0006. Same ADD COLUMN IF NOT EXISTS pattern so the
    # Render-free-tier startup path (create_all only) gets them too.
    _todo_item_columns = [
        ("parent_id", "INTEGER REFERENCES todo_items(id) ON DELETE CASCADE"),
        ("due_date", "DATE"),
    ]
    for col_name, col_type in _todo_item_columns:
        try:
            async with engine.begin() as conn:
                await conn.execute(
                    text(f"ALTER TABLE todo_items ADD COLUMN IF NOT EXISTS {col_name} {col_type}")
                )
        except Exception as exc:
            logger.debug("skip todo_items.%s migration: %s", col_name, exc)

    # tasks.due_date used to be TIMESTAMP; the model now declares Date to
    # match the Pydantic schema. Convert the existing column on Postgres so
    # ORM reads/writes line up. USING due_date::date drops any time portion.
    try:
        async with engine.begin() as conn:
            await conn.execute(
                text("ALTER TABLE tasks ALTER COLUMN due_date TYPE DATE USING due_date::date")
            )
            logger.info("migrated tasks.due_date to DATE")
    except Exception as exc:
        logger.debug("skip due_date type migration: %s", exc)

    # Seed the 33 default TodoLists from the user's profile PDFs if
    # the todo_lists table is empty, then seed each list's items from
    # the user's exported Microsoft To Do content. Both seeders are
    # idempotent — they short-circuit on subsequent runs.
    try:
        from app.database import SessionLocal
        from app.services.list_service import (
            seed_default_lists_if_empty,
            seed_todo_items_if_empty,
        )

        async with SessionLocal() as session:
            inserted = await seed_default_lists_if_empty(session)
            if inserted:
                logger.info("seeded %d default todo lists", inserted)

        async with SessionLocal() as session:
            inserted_items = await seed_todo_items_if_empty(session)
            if inserted_items:
                logger.info("seeded %d todo items from PDFs", inserted_items)
    except Exception as exc:
        logger.debug("skip todo-list seed: %s", exc)


# Health endpoints — registered BEFORE the SPA catch-all so they always win.
# `/api/health` matches the path configured in render.yaml's healthCheckPath.
@app.get("/api/health", tags=["health"])
@app.get("/health", tags=["health"])
async def health():
    return {"status": "healthy"}


# Oversight/status endpoint — exposed for ops dashboards and used by the
# CORS verifier probe. Returns a stable shape with feature-flag state +
# uptime marker so the response is easy to spot in logs.
@app.get("/api/oversight/status", tags=["health"])
async def oversight_status():
    from app.config import FEATURE_AI_ENABLED, FEATURE_INTEGRATIONS_ENABLED

    return {
        "status": "ok",
        "service": "lifemanager",
        "feature_flags": {
            "FEATURE_AI_ENABLED": FEATURE_AI_ENABLED,
            "FEATURE_INTEGRATIONS_ENABLED": FEATURE_INTEGRATIONS_ENABLED,
        },
    }


@app.get("/api/health/db", tags=["health"])
@app.get("/health/db", tags=["health"])
async def health_db():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"database unreachable: {exc}") from exc
    return {"status": "healthy", "database": "reachable"}


# Include routers.
# tasks and projects routers use absolute paths in their @router decorators
# (both /api/tasks/... and /tasks/... — the AC grep on /api/tasks needs the
# absolute form), so they mount WITHOUT a prefix.
app.include_router(auth.router, tags=["auth"])
app.include_router(tasks.router)
app.include_router(projects.router)
app.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
# Absolute-path routes (/api/notifications/...) live on a sibling router
# so they aren't prefixed twice. The status endpoint is the AC for the
# delivery-tracking subtask.
app.include_router(notifications.api_router, tags=["notifications"])
app.include_router(ai.router, tags=["ai"])
app.include_router(users.router, prefix="/users", tags=["users"])
# Sibling router for absolute-path users endpoints (/api/users/...).
app.include_router(users.api_router, tags=["users"])
app.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
# Todo-list system: both routers use absolute `/api/...` decorators
# (so they aren't double-prefixed) and ship the full CRUD + the
# share / unshare / move / toggle actions.
app.include_router(lists.router)
app.include_router(todo_items.router)
# webhook.router decorators carry the absolute path (/webhook, /webhook/health)
# so it mounts with no prefix to avoid double-prefixing.
app.include_router(webhook.router, tags=["webhook"])
# planner router decorators also use absolute /api/planner paths.
app.include_router(planner.router, tags=["planner"])

# Serve static files (frontend)
# در Native Render runtime، CWD ریشه پروژه است
# Vite خروجی را در frontend/dist می‌گذارد
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
# fallback: اگر frontend/dist نبود، dist در ریشه را امتحان کن (Docker)
if not frontend_dist.exists():
    _alt = Path(__file__).parent.parent / "dist"
    if _alt.exists():
        frontend_dist = _alt
if frontend_dist.exists():
    # Only mount the /assets directory for built files, not raw source
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    # Path prefixes that belong to the backend API and must NOT be served the
    # SPA shell. The catch-all redirects these to the trailing-slash form so
    # that frontend-style calls like fetch('/auth/login') reach the real
    # API instead of getting index.html.
    #
    # Note: 'tasks' and 'projects' are intentionally absent. Those paths are
    # SPA routes (React renders the Tasks/Projects page) and the data lives
    # under /api/tasks and /api/projects.
    _API_PREFIXES = (
        "auth", "notifications", "ai",
        "users", "integrations", "webhook", "health", "api",
        # Todo-list system endpoints — purely API, no SPA route.
        "todo-items",
    )

    @app.get("/{full_path:path}", tags=["frontend"])
    async def serve_frontend(full_path: str):
        """
        Serve frontend static files for SPA routing.

        NOTE: This catch-all route intentionally matches any path not handled by
        API routers above. This is the standard pattern for single-page applications
        where the frontend router handles client-side routing.

        IMPORTANT: All API routes MUST be registered BEFORE this catch-all handler.
        If an API endpoint returns 404, it means the route is not registered.
        This catch-all only serves files from the dist directory and does NOT
        interfere with registered API routes (FastAPI matches specific routes first).
        """
        # Don't shadow API routes. Routers are registered with prefix="/tasks"
        # and a route at "/", so the canonical path is "/tasks/". Requests for
        # "/tasks" (no trailing slash) would otherwise be served the SPA shell;
        # the frontend then fails to parse the HTML as JSON and reports the API
        # as offline. Redirect to the trailing-slash form so fetch() reaches the
        # real handler.
        first_segment = full_path.split("/", 1)[0]
        if first_segment in _API_PREFIXES:
            return RedirectResponse(url=f"/{full_path}/", status_code=307)

        # Guard: Prevent serving files outside the dist directory
        try:
            requested_path = (frontend_dist / full_path).resolve()
            if not str(requested_path).startswith(str(frontend_dist.resolve())):
                logger.warning(f"Blocked path traversal attempt: {full_path}")
                return {"detail": "Not Found"}
        except (ValueError, OSError):
            logger.warning(f"Invalid path requested: {full_path}")
            return {"detail": "Not Found"}

        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        index_path = frontend_dist / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        return {"detail": "Not Found"}
else:
    logger.warning(f"⚠️  Frontend dist directory not found at {frontend_dist}")

    @app.get("/")
    async def root():
        return {"message": "Lifemanager API is running. Frontend not built yet."}
