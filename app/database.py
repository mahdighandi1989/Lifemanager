from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.config import settings


def _normalize_url(url: str) -> str:
    # Render's Postgres add-on exposes DATABASE_URL with the legacy "postgres://"
    # scheme. SQLAlchemy 2.x needs "postgresql://", and our async stack needs
    # the asyncpg driver, so upgrade the URL to "postgresql+asyncpg://".
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    if url.startswith("postgresql://") and "+asyncpg" not in url:
        url = "postgresql+asyncpg://" + url[len("postgresql://"):]
    return url


engine = create_async_engine(
    _normalize_url(settings.DATABASE_URL),
    echo=settings.DEBUG,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_pre_ping=True,
)

SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


async def init_db():
    """ایجاد جداول دیتابیس به صورت async

    Returns:
        bool: True اگر جداول با موفقیت ایجاد شدند، False در غیر این صورت
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
