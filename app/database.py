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
    """Create database tables via ``Base.metadata.create_all``.

    This function is intended for development/testing environments only.
    Production deployments require a dedicated schema migration tool
    (e.g., Alembic) — run ``alembic.command.upgrade(config, "head")``
    on rollout so column additions, type widenings, and data backfills
    are tracked as named revisions instead of being silently created
    by create_all (which only adds missing tables, never alters them).

    The audit (task_882723eb07de) flagged this as an under-engineering
    anti-pattern; the comment above makes the boundary explicit.

    Pool tuning lives at the engine constructor above and the matching
    SQLATimeoutError handler in app/main.py:
      * pool_size / max_overflow sized from settings (env-tunable).
      * pool_timeout paired with a clean 503 on exhaustion.
      * pool_recycle stops Postgres from killing idle conns.
      * pool_pre_ping=True catches half-dead conns before the first query.
      * expire_on_commit=False on SessionLocal — read attributes after
        commit without an extra SELECT.

    Returns:
        bool: True if tables were created (or already existed), False
              if a connection / permission error blocked creation.
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
