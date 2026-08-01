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

# Prefer an explicit override set via Config.set_main_option (used by
# tests/test_migrations.py) over the runtime DATABASE_URL — that lets us
# point Alembic at SQLite for hermetic migration smoke tests without
# requiring psycopg2 to be installed.
_explicit_url = config.get_main_option("sqlalchemy.url")
_DEFAULT_INI_URL = "postgresql+psycopg2://user:pass@localhost:5432/lifemanager"
if _explicit_url and _explicit_url != _DEFAULT_INI_URL:
    url = _explicit_url
else:
    url = settings.DATABASE_URL

# Switch the runtime URL onto the (sync) psycopg2 driver: the asyncpg URL
# used by the app does not work with Alembic's offline/online runner.
if url.startswith("postgresql+asyncpg://"):
    url = "postgresql+psycopg2://" + url[len("postgresql+asyncpg://"):]
elif url.startswith("postgres://"):
    url = "postgresql+psycopg2://" + url[len("postgres://"):]
config.set_main_option("sqlalchemy.url", url)

if config.config_file_name is not None:
    # disable_existing_loggers=False عمدی است (۲۰۲۶-۰۸-۰۱).
    #
    # پیش‌فرضِ fileConfig مقدارش True است و هر لاگری را که **از قبل ساخته
    # شده** خاموش می‌کند — یعنی به‌محضِ اینکه alembic در همین پروسه بالا
    # بیاید، تمامِ لاگرهای app.* ساکت می‌شوند و `logger.setLevel()` هم
    # برشان نمی‌گرداند (باید `disabled` را دستی False کرد).
    #
    # چطور پیدا شد: تستی که ثابت می‌کرد «ردیفِ ناخوانا بی‌سروصدا صفر نمی‌سازد
    # و هشدار می‌دهد» تنها سبز بود و در سوئیتِ کامل قرمز. علتش رفتارِ محصول
    # نبود؛ هر تستِ مهاجرت که جلوتر اجرا می‌شد لاگرها را خاموش می‌کرد.
    # همان مکانیزم در پروسه‌ای که مهاجرت اجرا کند و بعد به کارش ادامه دهد
    # هشدارهای واقعی را هم می‌بلعد — پس ریشه اصلاح شد، نه آن تست.
    fileConfig(config.config_file_name, disable_existing_loggers=False)

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
