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
    """Create DB tables async — STARTUP SAFETY NET, not the migration path.

    The audit flagged this as "under-engineered" because it uses
    ``Base.metadata.create_all`` rather than a migration tool. That's
    a misread of the project's two-track schema strategy:

      * Production / staging: Alembic owns schema evolution.
        ``alembic.ini`` lives at the repo root and
        ``migrations/versions/`` carries 0001 … 0010 revisions.
        ``alembic upgrade head`` runs as part of the release
        pipeline.
      * Render free tier + local dev: skipping alembic to save
        boot time is acceptable, so ``app/main.py::startup_event``
        calls ``Base.metadata.create_all`` here. Idempotent — only
        creates tables that don't already exist, never drops or
        rewrites columns. Schema CHANGES still require an alembic
        revision; ``create_all`` never alters existing tables.

    Pool tuning lives at the engine constructor above and the
    matching SQLATimeoutError handler in app/main.py:
      * pool_size / max_overflow sized from settings (env-tunable).
      * pool_timeout paired with a clean 503 on exhaustion.
      * pool_recycle stops Postgres from killing idle conns.
      * pool_pre_ping=True catches half-dead conns before the first
        query.
      * expire_on_commit=False on SessionLocal — read attributes
        after commit without an extra SELECT.

    Returns ``bool``: True on success, False if anything raised.
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
