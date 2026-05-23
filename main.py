from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pathlib import Path
import os

app = FastAPI(title="LifeManager API")

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# Mount static files ONLY from dist/ directory - NEVER from src/
frontend_dist = Path("frontend/dist")
if frontend_dist.exists() and frontend_dist.is_dir():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
else:
    # Fallback for development - serve nothing, return 404 for static files
    @app.get("/{full_path:path}")
    async def catch_all(full_path: str):
        return JSONResponse(
            status_code=404,
            content={"detail": "Not Found - frontend/dist/ does not exist. Run 'npm run build' first."}
        )

# Import and include routers
from app.routes import auth, tasks, habits, notes, goals, calendar, settings

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(habits.router, prefix="/api/habits", tags=["habits"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(goals.router, prefix="/api/goals", tags=["goals"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["calendar"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
