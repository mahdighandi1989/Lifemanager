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
        logger.warning("  warnings.warn(")
        logger.warning(f"  {settings.DATABASE_URL} از مقدار پیش‌فرض localhost استفاده می‌کند. لطفاً متغیر محیطی DATABASE_URL را در Render تنظیم کنید.")

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
frontend_dist = Path(__file__).parent.parent / "dist"
if frontend_dist.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_dist)), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
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