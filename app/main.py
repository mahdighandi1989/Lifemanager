import asyncio
import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy import text
from sqlalchemy.exc import TimeoutError as SQLATimeoutError

from app.database import Base, engine
from app.rate_limit import limiter
from app.routes import (
    ai,
    auth,
    integrations,
    notifications,
    projects,
    tasks,
    users,
    webhook,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Lifemanager API", version="0.1.0")

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


# Health endpoints — registered BEFORE the SPA catch-all so they always win.
# `/api/health` matches the path configured in render.yaml's healthCheckPath.
@app.get("/api/health", tags=["health"])
@app.get("/health", tags=["health"])
async def health():
    return {"status": "healthy"}


@app.get("/api/health/db", tags=["health"])
@app.get("/health/db", tags=["health"])
async def health_db():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"database unreachable: {exc}") from exc
    return {"status": "healthy", "database": "reachable"}


# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
app.include_router(webhook.router, prefix="/webhook", tags=["webhook"])

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

    # API prefixes that must NOT be swallowed by the SPA catch-all below.
    # Without this, requests like GET /tasks (no trailing slash) would be
    # served the SPA index.html — fetch() in the frontend would then fail
    # to parse it as JSON and report the API as offline.
    _API_PREFIXES = (
        "auth", "tasks", "projects", "notifications", "ai",
        "users", "integrations", "webhook", "health", "api",
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
