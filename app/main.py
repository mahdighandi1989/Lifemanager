from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import settings
from app.routes.auth import router as auth_router
from app.routes.ai import router as ai_router
from app.routes.users import router as users_router
from app.routes.tasks import router as tasks_router
from app.routes.projects import router as projects_router
from app.routes.notifications import router as notifications_router
from app.routes.integrations import router as integrations_router
from app.middleware import setup_middleware
import os

app = FastAPI(title="Lifemanager API", version="1.0.0")

# Setup middleware
setup_middleware(app)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(ai_router, prefix="/api/ai", tags=["ai"])
app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(tasks_router, prefix="/api/tasks", tags=["tasks"])
app.include_router(projects_router, prefix="/api/projects", tags=["projects"])
app.include_router(notifications_router, prefix="/api/notifications", tags=["notifications"])
app.include_router(integrations_router, prefix="/api/integrations", tags=["integrations"])

# Serve static files from frontend/dist
# Use absolute path based on current working directory
frontend_dist = os.path.join(os.getcwd(), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"message": "Frontend not built yet. Run 'cd frontend && npm run build' first."}
else:
    @app.get("/")
    async def root():
        return {"message": "Frontend not built yet. Run 'cd frontend && npm run build' first."}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}