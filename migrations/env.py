"""Alembic migration environment.

Reads DATABASE_URL from app.config so migrations stay in sync with the
runtime configuration. Falls back to the sqlalchemy.url in alembic.ini
for `alembic --sql` style offline generation.
"""
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.config import settings
from app.database import Base
# Importing models registers their tables on Base.metadata so autogenerate
# can pick them up.
import app.models  # noqa: F401

config = context.config

# Switch the runtime URL onto the (sync) psycopg2 driver: the asyncpg URL
# used by the app does not work with Alembic's offline/online runner.
url = settings.DATABASE_URL
if url.startswith("postgresql+asyncpg://"):
    url = "postgresql+psycopg2://" + url[len("postgresql+asyncpg://"):]
elif url.startswith("postgres://"):
    url = "postgresql+psycopg2://" + url[len("postgres://"):]
config.set_main_option("sqlalchemy.url", url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
