from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


def _normalize_url(url: str) -> str:
    # Render exposes DATABASE_URL with the legacy "postgres://" scheme;
    # SQLAlchemy 2.x requires "postgresql://".
    if url.startswith("postgres://"):
        return "postgresql://" + url[len("postgres://"):]
    return url


def _build_engine() -> Engine | None:
    if not settings.database_url:
        return None
    return create_engine(
        _normalize_url(settings.database_url),
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_timeout=settings.db_pool_timeout,
        pool_recycle=settings.db_pool_recycle,
        pool_pre_ping=True,
        future=True,
    )


engine: Engine | None = _build_engine()

SessionLocal = (
    sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
    if engine is not None
    else None
)


class Base(DeclarativeBase):
    pass


def get_db() -> Iterator[Session]:
    if SessionLocal is None:
        raise RuntimeError("DATABASE_URL is not configured")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
