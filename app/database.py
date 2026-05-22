from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.config import settings

# تبدیل به async engine
engine = create_async_engine(settings.DATABASE_URL, echo=True)

# استفاده از async_sessionmaker به جای sessionmaker
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


async def init_db():
    """ایجاد جداول دیتابیس به صورت async"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    """ارائه session دیتابیس به صورت async"""
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
