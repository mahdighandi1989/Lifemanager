from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.config import settings

# تبدیل به async engine
engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG)

# استفاده از async_sessionmaker به جای sessionmaker
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


async def init_db():
    """ایجاد جداول دیتابیس به صورت async
    
    Returns:
        bool: True اگر جداول با موفقیت ایجاد شدند، False در غیر این صورت
    
    Raises:
        Exception: خطاهای غیرمنتظره را به caller منتقل می‌کند
    """
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("[INFO] Database tables created successfully.")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to create database tables: {e}")
        return False


async def get_db():
    """ارائه session دیتابیس به صورت async"""
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()