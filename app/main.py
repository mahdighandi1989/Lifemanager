from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from pathlib import Path
import logging

from app.config import settings
from app.database import init_db
from app.routes.auth_google import router as auth_google_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Lifemanager",
    description="Life Management Application",
    version="1.0.0",
)

# Include routers
app.include_router(auth_google_router)

# Mount static files if directory exists
static_dir = Path(__file__).parent.parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    try:
        await init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.warning(f"Could not initialize database: {e}")
        logger.warning("App will continue without database — set DATABASE_URL in Render env vars.")

@app.get("/")
async def root():
    """Redirect to Google login."""
    return RedirectResponse(url="/auth/google")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}