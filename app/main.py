import os
import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base
from app.middleware import setup_middleware
from app.routes.auth import router as auth_router
from app.routes.ai import router as ai_router
from app.routes.integrations import router as integrations_router
from app.routes.notifications import router as notifications_router
from app.routes.projects import router as projects_router
from app.routes.tasks import router as tasks_router
from app.routes.users import router as users_router


app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
)


setup_middleware(app)


@app.on_event("startup")
async def startup():
    """ایجاد جداول دیتابیس در زمان راه‌اندازی"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


app.include_router(auth_router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["Auth"])
app.include_router(ai_router, prefix=f"{settings.API_V1_PREFIX}/ai", tags=["AI"])
app.include_router(integrations_router, prefix=f"{settings.API_V1_PREFIX}/integrations", tags=["Integrations"])
app.include_router(notifications_router, prefix=f"{settings.API_V1_PREFIX}/notifications", tags=["Notifications"])
app.include_router(projects_router, prefix=f"{settings.API_V1_PREFIX}/projects", tags=["Projects"])
app.include_router(tasks_router, prefix=f"{settings.API_V1_PREFIX}/tasks", tags=["Tasks"])
app.include_router(users_router, prefix=f"{settings.API_V1_PREFIX}/users", tags=["Users"])


# سرو کردن فایل‌های استاتیک فرانت‌اند
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")


@app.get("/health")
async def health_check():
    """بررسی سلامت سرویس"""
    return {"status": "healthy", "app": settings.APP_NAME}