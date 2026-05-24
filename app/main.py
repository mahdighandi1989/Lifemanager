from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import logging

from app.config import settings
from app.database import engine, Base, get_db
from app.routes import auth, tasks, projects, notifications, ai, users, integrations, webhook

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Lifemanager API", version="0.1.0")

# Database initialization with graceful degradation
@app.on_event("startup")
async def startup_event():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created successfully")
    except Exception as e:
        logger.warning(f"⚠️  Warning: Could not connect to database: {e}")
        logger.warning("   App will continue without database — set DATABASE_URL in Render env vars.")

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
        
        This is an internal endpoint used by the SPA frontend. It is not intended
        for direct external API consumption.
        """
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