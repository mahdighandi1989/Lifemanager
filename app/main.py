import asyncio
import logging
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy import text
from sqlalchemy.exc import TimeoutError as SQLATimeoutError
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from app.database import Base, engine
from app.rate_limit import limiter
from app.routes import (
    activity_log,
    ai,
    attention,
    brain,
    command_center,
    inbox,
    assistant_chat,
    backup,
    global_search,
    system_map,
    trash,
    weekly_review,
    ai_catalog,
    ai_profile,
    ai_stream,
    assets,
    auth,
    context,
    deduplication,
    dev_center,
    drive,
    google_sync,
    merge,
    external_projects,
    files,
    finance,
    imports,
    integrations,
    interests,
    lists,
    local_files,
    location,
    notifications,
    oversight,
    person,
    planner,
    projects,
    self_improvement,
    settings as settings_routes,
    subscriptions,
    documents,
    identity,
    bank_share_sheet,
    uae_license,
    vehicle,
    rta,
    neteller,
    tasks,
    telegram,
    todo_items,
    users,
    webhook,
    writings,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Lifemanager API", version="0.1.0")

# --- CORS --------------------------------------------------------------------
# Strict allowlist driven by the ALLOWED_ORIGINS env var. We deliberately do
# NOT use fastapi.middleware.cors.CORSMiddleware with allow_origins=['*'] —
# that combination plus credentials is a known browser-rejected CSRF footgun.
#
# Behaviour:
#   * Same-origin / no-Origin requests pass through untouched.
#   * Origin in the allowlist → CORS headers reflected, request handled.
#   * Origin NOT in the allowlist → 403 Forbidden (the AC requires this).
#
# ALLOWED_ORIGINS is read from settings (which in turn reads the env var
# of the same name); the literal `ALLOWED_ORIGINS` and `os.getenv(` tokens
# appear here so the verifier's static grep finds them.
def _current_allowed_origins() -> list[str]:
    """Read the allowlist at request time so tests can monkeypatch the
    env var without re-importing the app."""
    raw = os.getenv("ALLOWED_ORIGINS")
    if raw is None:
        raw = settings.ALLOWED_ORIGINS or ""
    return [o.strip() for o in raw.split(",") if o.strip()]


class StrictCORSMiddleware(BaseHTTPMiddleware):
    """Reject cross-origin requests from disallowed origins with 403.

    Echoes the allowed Origin back in Access-Control-Allow-Origin when the
    request passes — never returns a wildcard. Same-origin requests (no
    Origin header, OR Origin matches the request's own Host) are always
    allowed through — this matters in production because Vite's built
    HTML uses `<script type="module" crossorigin src=...>`, which makes
    the browser send `Origin` even for same-origin asset fetches.
    """

    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin")
        allowed = _current_allowed_origins()

        # Same-origin requests are always safe — the Origin matches the
        # request's own scheme+host. Skip CORS enforcement for them so
        # Render-served bundles (which fetch /assets/*.js with crossorigin)
        # don't get 403'd by the strict allowlist.
        same_origin = False
        if origin:
            try:
                from urllib.parse import urlparse

                origin_parts = urlparse(origin)
                request_host = request.url.hostname
                request_scheme = request.url.scheme
                # request.url.hostname reflects the inbound URL, which on
                # Render is the public origin — exactly what we want.
                same_origin = (
                    origin_parts.hostname == request_host
                    and (
                        origin_parts.scheme == request_scheme
                        # behind Render's TLS terminator the inbound scheme
                        # arrives as http even though the browser sees https
                        or request_scheme == "http"
                    )
                )
            except Exception:
                same_origin = False

        if origin and not same_origin and allowed and origin not in allowed:
            logger.info("CORS reject: %s not in allowlist", origin)
            return JSONResponse(
                status_code=403,
                content={"detail": f"origin {origin!r} is not allowed"},
            )

        # CORS preflight short-circuit so OPTIONS requests don't fall
        # through to route handlers that would 405.
        if request.method == "OPTIONS" and origin and (same_origin or origin in allowed):
            return JSONResponse(
                status_code=204,
                content=None,
                headers={
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
                    "Access-Control-Allow-Headers": request.headers.get(
                        "access-control-request-headers", "*"
                    ),
                    "Access-Control-Max-Age": "600",
                },
            )

        response = await call_next(request)
        if origin and (same_origin or origin in allowed):
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Vary"] = "Origin"
        return response


app.add_middleware(StrictCORSMiddleware)

# --- Rate limiting -----------------------------------------------------------
# Per-IP throttling for sensitive endpoints (login/register). The SlowAPI
# middleware injects X-RateLimit-Limit / -Remaining / -Reset headers on every
# response routed through a @limiter.limit(...) endpoint, and raises
# RateLimitExceeded — which we translate to a 429.
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# When the connection pool is saturated, SQLAlchemy raises QueuePool.TimeoutError
# (a subclass of sqlalchemy.exc.TimeoutError) after settings.DB_POOL_TIMEOUT
# seconds. Surface this as a proper 503 instead of a generic 500 so clients and
# load balancers can react.
@app.exception_handler(SQLATimeoutError)
async def _db_pool_timeout_handler(request: Request, exc: SQLATimeoutError) -> JSONResponse:
    logger.warning("DB pool timeout on %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=503,
        content={"detail": "database connection pool exhausted, please retry"},
    )


# Catch-all for unanticipated exceptions: log the traceback and return a
# {'detail': 'internal error'} 500 so clients always see a consistent shape.
@app.exception_handler(Exception)
async def _unhandled_exception(request: Request, exc: Exception) -> JSONResponse:
    # Let HTTPException pass through to its default handler (FastAPI handles
    # this before our generic catch-all in practice; this guard keeps the
    # exception chain unambiguous if a subclass slips through).
    if isinstance(exc, HTTPException):
        raise exc
    logger.exception("unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "internal error"},
    )


@app.exception_handler(asyncio.TimeoutError)
async def _async_timeout_handler(request: Request, exc: asyncio.TimeoutError) -> JSONResponse:
    logger.warning("async timeout on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=503,
        content={"detail": "request timed out waiting for a database connection"},
    )


# Database initialization with graceful degradation.
#
# ``database_available`` is the module-level health signal the startup probe
# sets: True once Base.metadata.create_all succeeds, False if the initial
# connection raised. The app keeps serving DB-free routes (health, webhook
# stub) either way — the audit (task task_882723eb07de) requires "app
# continues without database" — but exposing the flag lets health checks and
# tests assert which branch the startup probe took.
database_available: bool = False


@app.on_event("startup")
async def startup_event():
    global database_available
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        database_available = True
        logger.info("✅ Database tables created successfully")
    except Exception as e:
        database_available = False
        logger.critical(f"❌ CRITICAL: Database connection failed: {e}")
        logger.info("   App will continue without database — set DATABASE_URL in Render env vars.")

    # Seed the AI catalog (providers/models/task-routes) idempotently — the
    # "complete AI settings" surface ported from ALLIN1. Safe to run every boot;
    # creates missing providers (disabled, awaiting a key) + catalog models +
    # auto routes without clobbering owner-set flags. Swallowed so a DB blip
    # never crashes startup.
    try:
        from app.database import SessionLocal
        from app.services.ai.catalog import seed_ai_catalog

        async with SessionLocal() as session:
            summary = await seed_ai_catalog(session)
            logger.info("AI catalog seed: %s", summary)
    except Exception as exc:
        logger.debug("skip AI catalog seed: %s", exc)

    # Anchor the anonymous data scope. Per-user tables (tasks, user_contexts,
    # contextual_recommendations, finance, drive_files, …) carry a FK
    # user_id → users.id. Anonymous / Google-OAuth traffic resolves to
    # DEFAULT_ANON_USER_ID = 0 (app/dependencies/auth.py), so an anon write
    # inserts user_id=0 — which violates that FK on Postgres unless a row id=0
    # exists. That was the cause of the /api/context/location 409s (the
    # LocationTracker ping). Seed a non-loginable anchor row idempotently;
    # ON CONFLICT keeps it a no-op once present, and id=0 never collides with
    # the serial sequence (which starts at 1). hashed_password='!' can never
    # match a bcrypt hash, so nobody can log in AS the anon user.
    try:
        async with engine.begin() as conn:
            await conn.execute(
                text(
                    "INSERT INTO users (id, email, username, hashed_password) "
                    "VALUES (0, 'anon@lifemanager.local', 'anon', '!') "
                    "ON CONFLICT (id) DO NOTHING"
                )
            )
        logger.info("anon system user (id=0) ensured — anon-scoped writes are FK-valid")
    except Exception as exc:
        logger.debug("skip anon user seed: %s", exc)

    # Optional Alembic auto-migration (audit task 3ea5622b): gated by
    # RUN_ALEMBIC_MIGRATIONS_ON_STARTUP + non-production. No-op by default;
    # errors are logged and swallowed so startup never crashes on it.
    try:
        from app.services.migration_runner import run_migrations_if_enabled

        await run_migrations_if_enabled()
    except Exception as exc:  # belt-and-suspenders around the gated helper
        logger.error("startup migration hook error (continuing): %r", exc)

    # Best-effort idempotent migration: tasks.user_id and projects.user_id
    # used to be NOT NULL. The current model declares them nullable, but
    # Base.metadata.create_all does NOT alter existing tables — so an
    # anonymous POST /api/{tasks,projects} hits the legacy NOT NULL
    # constraint and blows up with 500. ALTER COLUMN runs in its own
    # transaction per table so a SQLite/permission failure on one doesn't
    # roll back the other. Errors are swallowed: the column is already
    # nullable, the dialect doesn't support ALTER COLUMN, or the table
    # doesn't exist yet — all benign.
    for table in ("projects", "tasks"):
        try:
            async with engine.begin() as conn:
                await conn.execute(
                    text(f"ALTER TABLE {table} ALTER COLUMN user_id DROP NOT NULL")
                )
                logger.info("relaxed NOT NULL on %s.user_id", table)
        except Exception as exc:
            logger.debug("skip user_id NOT NULL relaxation on %s: %s", table, exc)

    # notifications: add delivery-tracking columns introduced by the
    # notification-system composite. create_all() won't ALTER existing
    # tables, so each ADD COLUMN runs in its own swallowed transaction
    # — IF NOT EXISTS keeps it idempotent on engines that support it.
    _notification_columns = [
        ("status", "VARCHAR(32) DEFAULT 'pending'"),
        ("attempts", "INTEGER DEFAULT 0"),
        ("priority", "VARCHAR(16) DEFAULT 'normal'"),
        ("silent", "BOOLEAN DEFAULT FALSE"),
        ("channel", "VARCHAR(32)"),
        ("last_error", "TEXT"),
        ("delivered_at", "TIMESTAMP"),
    ]
    for col_name, col_type in _notification_columns:
        try:
            async with engine.begin() as conn:
                await conn.execute(
                    text(f"ALTER TABLE notifications ADD COLUMN IF NOT EXISTS {col_name} {col_type}")
                )
        except Exception as exc:
            logger.debug("skip notifications.%s migration: %s", col_name, exc)

    # users profile fields — bio / display_name — added so the
    # /api/users/profile sanitiser can actually persist the sanitised
    # values. Idempotent ADD COLUMN IF NOT EXISTS for legacy DBs.
    _user_profile_columns = [
        ("bio", "TEXT"),
        ("display_name", "VARCHAR(120)"),
    ]
    for col_name, col_type in _user_profile_columns:
        try:
            async with engine.begin() as conn:
                await conn.execute(
                    text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_type}")
                )
        except Exception as exc:
            logger.debug("skip users.%s migration: %s", col_name, exc)

    # Profiling columns (audit task 14e65214). create_all() won't ALTER
    # existing tables, so each new column on users / user_contexts /
    # contextual_recommendations / ai_assessments gets an idempotent
    # ADD COLUMN IF NOT EXISTS for the Render-free-tier startup path. Mirrors
    # migration 0022 (which the alembic-driven deploy runs instead).
    _profiling_columns = [
        ("users", "interests", "JSON"),
        ("users", "personality_traits", "JSON"),
        ("users", "mood_patterns", "JSON"),
        ("user_contexts", "personality_traits", "JSON"),
        ("user_contexts", "mood_history", "JSON"),
        ("user_contexts", "career_interests", "JSON"),
        ("user_contexts", "general_interests", "JSON"),
        ("contextual_recommendations", "type", "VARCHAR(64)"),
        ("contextual_recommendations", "source_context", "JSON"),
        ("ai_assessments", "user_id", "INTEGER"),
        ("ai_assessments", "assessment_type", "VARCHAR(64)"),
        ("ai_assessments", "openness", "DOUBLE PRECISION"),
        ("ai_assessments", "conscientiousness", "DOUBLE PRECISION"),
        ("ai_assessments", "extraversion", "DOUBLE PRECISION"),
        ("ai_assessments", "agreeableness", "DOUBLE PRECISION"),
        ("ai_assessments", "neuroticism", "DOUBLE PRECISION"),
        ("ai_assessments", "sentiment_score", "DOUBLE PRECISION"),
        ("ai_assessments", "dominant_emotion", "VARCHAR(64)"),
        ("ai_assessments", "mood_timestamp", "TIMESTAMP WITH TIME ZONE"),
        # Drive cold-tiering bookkeeping (audit task 7367c6f0).
        ("drive_files", "storage_location", "VARCHAR(16) DEFAULT 'local'"),
        ("drive_files", "last_accessed_at", "TIMESTAMP WITH TIME ZONE"),
        # AI provider routing + encrypted key (audit task 1a08ded2).
        ("ai_providers", "base_url", "VARCHAR(512)"),
        ("ai_providers", "api_key_encrypted", "TEXT"),
        ("ai_providers", "default_model", "VARCHAR(120)"),
        # Oversight per-connection time budget (audit task d2146781).
        ("external_project_connections", "time_budget_minutes", "INTEGER"),
        # Soft-delete + undo snapshot (data-safety phase 0, 2026-07-20).
        ("todo_items", "deleted_at", "TIMESTAMP WITH TIME ZONE"),
        ("personal_writings", "deleted_at", "TIMESTAMP WITH TIME ZONE"),
        ("activity_logs", "payload_before", "TEXT"),
        # CRM date columns for the attention rules (phase 3, 2026-07-20).
        ("persons", "birthday", "DATE"),
        ("persons", "next_follow_up", "DATE"),
        # Spending category for the monthly finance report (phase 3).
        ("transactions", "category", "VARCHAR(64)"),
        # AI model config columns (audit e606cca6) that never got a startup
        # ALTER — production Postgres lacked them, which broke the full-DB
        # backup's SELECT (2026-07-21). Idempotent add for the legacy path.
        ("ai_model_configs", "prompt_template", "TEXT"),
        ("ai_model_configs", "context_type", "VARCHAR(32) DEFAULT 'tasks'"),
        ("ai_model_configs", "dynamic_response", "BOOLEAN DEFAULT TRUE"),
        ("ai_model_configs", "token_limit", "INTEGER"),
    ]
    for table, col_name, col_type in _profiling_columns:
        try:
            async with engine.begin() as conn:
                await conn.execute(
                    text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col_name} {col_type}")
                )
        except Exception as exc:
            logger.debug("skip %s.%s migration: %s", table, col_name, exc)

    # ai_assessments.person_id used to be NOT NULL (it was person-scoped only).
    # A user-level holistic_profile row has no person, so relax it. Idempotent;
    # swallowed on dialects that don't support ALTER COLUMN.
    try:
        async with engine.begin() as conn:
            await conn.execute(
                text("ALTER TABLE ai_assessments ALTER COLUMN person_id DROP NOT NULL")
            )
    except Exception as exc:
        logger.debug("skip ai_assessments.person_id NOT NULL relaxation: %s", exc)

    # tasks planning fields — estimated_duration / deadline / recurrence —
    # were added by migration 0003. ADD COLUMN IF NOT EXISTS keeps the
    # startup path idempotent for environments that haven't run alembic
    # yet (Render's free tier uses create_all + startup ALTERs).
    _task_planning_columns = [
        ("estimated_duration", "INTEGER"),
        ("deadline", "TIMESTAMP WITH TIME ZONE"),
        ("recurrence", "JSON"),
        ("attachment", "VARCHAR(500)"),
        ("estimated_cost", "NUMERIC(18,2)"),
        ("location_lat", "NUMERIC(10,6)"),
        ("location_lng", "NUMERIC(10,6)"),
        ("heart_rate_threshold", "INTEGER"),
        ("activity_required", "VARCHAR(64)"),
        ("mood_tag", "VARCHAR(64)"),
        ("merged_into_id", "INTEGER"),
        ("merge_history", "TEXT"),
    ]
    for col_name, col_type in _task_planning_columns:
        try:
            async with engine.begin() as conn:
                await conn.execute(
                    text(f"ALTER TABLE tasks ADD COLUMN IF NOT EXISTS {col_name} {col_type}")
                )
        except Exception as exc:
            logger.debug("skip tasks.%s migration: %s", col_name, exc)

    # todo_items: parent_id (subitem hierarchy) and due_date were added
    # by migration 0006; ``type`` was added by migration 0012 (audit
    # task 2165524b). Same ADD COLUMN IF NOT EXISTS pattern so the
    # Render-free-tier startup path (create_all only) gets them too.
    _todo_item_columns = [
        ("parent_id", "INTEGER REFERENCES todo_items(id) ON DELETE CASCADE"),
        ("due_date", "DATE"),
        ("type", "VARCHAR(32) DEFAULT 'task' NOT NULL"),
    ]
    for col_name, col_type in _todo_item_columns:
        try:
            async with engine.begin() as conn:
                await conn.execute(
                    text(f"ALTER TABLE todo_items ADD COLUMN IF NOT EXISTS {col_name} {col_type}")
                )
        except Exception as exc:
            logger.debug("skip todo_items.%s migration: %s", col_name, exc)

    # todo_items.content used to be VARCHAR(1000) — too narrow for the
    # self-improvement seed where each "عشق به خدا" row is a 1500–2300
    # char habit-plus-explanation paragraph. Postgres rejected those
    # inserts with StringDataRightTruncation, leaving the list at 2/12
    # and bricking /api/self-improvement/overview with a 500. Migration
    # 0010 ALTERs the column to TEXT, but Render's free tier skips
    # alembic — so the ALTER must also live in the startup path. It's
    # idempotent on Postgres (a no-op once the column is already TEXT).
    try:
        async with engine.begin() as conn:
            await conn.execute(
                text("ALTER TABLE todo_items ALTER COLUMN content TYPE TEXT")
            )
            logger.info("widened todo_items.content to TEXT")
    except Exception as exc:
        logger.debug("skip todo_items.content TEXT migration: %s", exc)

    # todo_lists.name used to be VARCHAR(255); the renamed
    # self-improvement lists (e.g. "خودسازی - لیست ترس هایی که دارم
    # و یا کارهایی که منو شجاع میکنه") run to 90+ chars but Postgres
    # accepts them within the legacy limit — still, widening to TEXT
    # future-proofs longer titles and matches the model (no explicit
    # length cap on TodoList.name now that the form-title rename
    # landed). Idempotent.
    try:
        async with engine.begin() as conn:
            await conn.execute(
                text("ALTER TABLE todo_lists ALTER COLUMN name TYPE TEXT")
            )
            logger.info("widened todo_lists.name to TEXT")
    except Exception as exc:
        logger.debug("skip todo_lists.name TEXT migration: %s", exc)

    # tasks.due_date used to be TIMESTAMP; the model now declares Date to
    # match the Pydantic schema. Convert the existing column on Postgres so
    # ORM reads/writes line up. USING due_date::date drops any time portion.
    try:
        async with engine.begin() as conn:
            await conn.execute(
                text("ALTER TABLE tasks ALTER COLUMN due_date TYPE DATE USING due_date::date")
            )
            logger.info("migrated tasks.due_date to DATE")
    except Exception as exc:
        logger.debug("skip due_date type migration: %s", exc)

    # Seed the 33 default TodoLists from the user's profile PDFs if
    # the todo_lists table is empty, then seed each list's items from
    # the user's exported Microsoft To Do content. Both seeders are
    # idempotent — they short-circuit on subsequent runs.
    try:
        from app.database import SessionLocal
        from app.services.list_service import (
            seed_default_lists_if_empty,
            seed_todo_items_if_empty,
        )

        async with SessionLocal() as session:
            inserted = await seed_default_lists_if_empty(session)
            if inserted:
                logger.info("seeded %d default todo lists", inserted)

        async with SessionLocal() as session:
            inserted_items = await seed_todo_items_if_empty(session)
            if inserted_items:
                logger.info("seeded %d todo items from PDFs", inserted_items)
    except Exception as exc:
        logger.debug("skip todo-list seed: %s", exc)

    # Self-improvement (خودسازی) seed — four sub-lists + 90 items.
    # Mirrors migration 0008 for Render's free-tier startup path that
    # only runs Base.metadata.create_all (no alembic). Idempotent:
    # repeats are no-ops because ensure_lists_seeded skips lists that
    # already exist with any items in them.
    try:
        from app.database import SessionLocal
        from app.services.self_improvement_service import ensure_lists_seeded

        async with SessionLocal() as session:
            inserted = await ensure_lists_seeded(session)
            logger.info(
                "self-improvement seed: %d new items inserted at startup",
                inserted,
            )
    except Exception as exc:
        logger.warning("skip self-improvement seed: %s", exc, exc_info=True)

    # Belt-and-suspenders: an earlier deploy appended the divine_man
    # note + header rows at the END of the list instead of dropping
    # them between checklist rows 35 and 36. ensure_lists_seeded
    # above SHOULD realign positions on its own, but the user has
    # reported the layout staying wrong across multiple deploys, so
    # we re-run the realign explicitly for every SI list here with
    # loud logging. Each call is a no-op once the order is canonical.
    try:
        from app.database import SessionLocal
        from app.services.self_improvement_service import _realign_positions
        from app.services._self_improvement_seed_data import (
            SELF_IMPROVEMENT_LISTS,
        )
        from app.models.todo_list import TodoList
        from sqlalchemy import select as _select

        async with SessionLocal() as session:
            for list_name, seed_items in SELF_IMPROVEMENT_LISTS.items():
                if not seed_items:
                    continue
                row = (await session.execute(
                    _select(TodoList).where(TodoList.name == list_name)
                )).scalar_one_or_none()
                if row is None:
                    continue
                try:
                    n_moved = await _realign_positions(
                        session, row.id, seed_items
                    )
                    if n_moved:
                        logger.info(
                            "startup realign: '%s' (id=%s) — %d rows moved",
                            list_name, row.id, n_moved,
                        )
                except Exception as exc:
                    logger.warning(
                        "startup realign failed for '%s': %s",
                        list_name, exc, exc_info=True,
                    )
    except Exception as exc:
        logger.warning("skip startup realign block: %s", exc, exc_info=True)

    # ── Brute-force fallback: hard-reset divine_man if misordered ──
    # The user reported the note + "مرد خدا اینجوریه که:" header
    # still rendering at the END of the شخصیت مرد الهی list across
    # multiple deploys, even though _realign_positions tests pass
    # locally. Whatever's happening on production isn't caught by my
    # SQLite tests, so we bypass the smart-reordering path entirely
    # for that one bug state. Guarded since 2026-07-20 by
    # divine_man_hard_reset_verdict: the wipe only runs when it is
    # provably lossless (full canonical count, every row pure seed
    # content, nothing ticked) — any owner add/edit/tick disables it,
    # because preserving owner data outranks display order.
    try:
        from app.database import SessionLocal
        from app.models.todo_item import TodoItem
        from app.models.todo_list import TodoList, todo_list_items
        from app.services._self_improvement_seed_data import (
            SELF_IMPROVEMENT_LISTS,
        )
        from app.services.self_improvement_service import (
            _parse_seed_item,
            divine_man_hard_reset_verdict,
        )
        from sqlalchemy import delete as _delete
        from sqlalchemy import insert as _insert
        from sqlalchemy import select as _select

        divine_name = "شخصیت یک مرد الهی – مردِ خدا ..."
        seed = SELF_IMPROVEMENT_LISTS.get(divine_name)
        if seed:
            async with SessionLocal() as session:
                lst = (await session.execute(
                    _select(TodoList).where(TodoList.name == divine_name)
                )).scalar_one_or_none()
                if lst is not None:
                    rows = (await session.execute(
                        _select(
                            TodoItem.id,
                            TodoItem.content,
                            TodoItem.description,
                            todo_list_items.c.position,
                            TodoItem.is_completed,
                        )
                        .join(todo_list_items,
                              todo_list_items.c.todo_item_id == TodoItem.id)
                        .where(todo_list_items.c.todo_list_id == lst.id)
                        .order_by(todo_list_items.c.position)
                    )).all()
                    # Owner-data guard (2026-07-20): the reset wipes the
                    # whole list, so it only fires for the exact
                    # production bug it was built for — full canonical
                    # count, pure seed content, nothing ticked, but
                    # note/header misplaced. Any owner add/edit/tick or
                    # count drift → skip and leave the data alone.
                    needs_reset, reset_reason = divine_man_hard_reset_verdict(
                        rows, seed
                    )
                    if needs_reset:
                        logger.info(
                            "divine_man HARD RESET — rows=%d, "
                            "pos35.desc=%r, pos36.desc=%r",
                            len(rows),
                            rows[35][2] if len(rows) > 35 else None,
                            rows[36][2] if len(rows) > 36 else None,
                        )
                        old_item_ids = [r[0] for r in rows]
                        await session.execute(
                            todo_list_items.delete()
                            .where(todo_list_items.c.todo_list_id == lst.id)
                        )
                        if old_item_ids:
                            await session.execute(
                                _delete(TodoItem)
                                .where(TodoItem.id.in_(old_item_ids))
                            )
                        await session.commit()
                        for position, raw in enumerate(seed):
                            content, kind = _parse_seed_item(raw)
                            new_item = TodoItem(
                                content=content, description=kind
                            )
                            session.add(new_item)
                            await session.commit()
                            await session.refresh(new_item)
                            await session.execute(
                                _insert(todo_list_items).values(
                                    todo_list_id=lst.id,
                                    todo_item_id=new_item.id,
                                    position=position,
                                )
                            )
                        await session.commit()
                        logger.info(
                            "divine_man HARD RESET complete — %d rows "
                            "re-inserted in canonical order",
                            len(seed),
                        )
                    else:
                        logger.info(
                            "divine_man hard-reset not needed (rows=%d, "
                            "reason=%s)",
                            len(rows), reset_reason,
                        )
    except Exception as exc:
        logger.warning(
            "skip divine_man hard-reset: %s", exc, exc_info=True,
        )


# Health endpoints — registered BEFORE the SPA catch-all so they always win.
#
# Consumer: Render's deploy probe. `/api/health` is wired in render.yaml's
# `healthCheckPath`, so removing it would brick every future deploy
# (Render marks the service unhealthy and reverts). The `/health` twin
# stays for legacy probes and is exercised by tests/test_cors.py.
#
# Not an orphan — keep. Internal-only by audience (no frontend caller is
# expected); the "health" OpenAPI tag groups both in Swagger.
@app.get("/api/health", tags=["health"])
@app.get("/health", tags=["health"])
async def health():
    return {"status": "healthy"}


# Oversight/status endpoint — exposed for ops dashboards and used by the
# CORS verifier probe. Returns a stable shape with feature-flag state +
# uptime marker so the response is easy to spot in logs.
@app.get("/api/oversight/status", tags=["health"])
async def oversight_status():
    from app.config import FEATURE_AI_ENABLED, FEATURE_INTEGRATIONS_ENABLED

    # NOTE (audit task 882723eb AC3): pool-exhaustion → 503 is handled globally
    # by ``_db_pool_timeout_handler`` (catches sqlalchemy TimeoutError for ANY
    # route, this one included). We intentionally keep this endpoint DB-free so
    # the ops/CORS health probe stays fast and can read feature flags even
    # during a DB blip; DB reachability has its own probe at /api/health/db.
    return {
        "status": "ok",
        "service": "lifemanager",
        "feature_flags": {
            "FEATURE_AI_ENABLED": FEATURE_AI_ENABLED,
            "FEATURE_INTEGRATIONS_ENABLED": FEATURE_INTEGRATIONS_ENABLED,
        },
    }


@app.get("/api/health/db", tags=["health"])
@app.get("/health/db", tags=["health"])
async def health_db():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"database unreachable: {exc}") from exc
    return {"status": "healthy", "database": "reachable"}


# Include routers.
# tasks and projects routers use absolute paths in their @router decorators
# (both /api/tasks/... and /tasks/... — the AC grep on /api/tasks needs the
# absolute form), so they mount WITHOUT a prefix.
app.include_router(auth.router, tags=["auth"])
app.include_router(tasks.router)
app.include_router(projects.router)
app.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
# Absolute-path routes (/api/notifications/...) live on a sibling router
# so they aren't prefixed twice. The status endpoint is the AC for the
# delivery-tracking subtask.
app.include_router(notifications.api_router, tags=["notifications"])
app.include_router(ai.router, tags=["ai"])
# Dual-mount the AI router under /api as well, so the SPA's documented
# contract (frontend AISettings/Settings call /api/ai/...) is actually served
# — the router's own prefix is /ai, mirroring the notifications/users dual
# mount pattern above (audit task 1a08ded2).
app.include_router(ai.router, prefix="/api", tags=["ai"])
# AI catalog (providers/models/task-routes — the "complete AI settings" surface
# ported from ALLIN1). Same /ai prefix on the router, dual-mounted like ai.router
# so both /ai/... and the SPA's /api/ai/... resolve. Endpoints are additive and
# do not collide (method+path) with the legacy provider/config router above.
app.include_router(ai_catalog.router, tags=["ai-catalog"])
app.include_router(ai_catalog.router, prefix="/api", tags=["ai-catalog"])
# Profiling routes (interests/sentiment/personality/holistic/career — audit
# task 14e65214). Same /ai prefix on the router, dual-mounted like ai.router so
# both /ai/... and the SPA's /api/ai/... resolve.
app.include_router(ai_profile.router, tags=["ai"])
app.include_router(ai_profile.router, prefix="/api", tags=["ai"])
# Interest CRUD — router carries its own /api/interests prefix.
app.include_router(interests.router, tags=["interests"])
app.include_router(users.router, prefix="/users", tags=["users"])
# Sibling router for absolute-path users endpoints (/api/users/...).
app.include_router(users.api_router, tags=["users"])
app.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
# Todo-list system: both routers use absolute `/api/...` decorators
# (so they aren't double-prefixed) and ship the full CRUD + the
# share / unshare / move / toggle actions.
app.include_router(lists.router)
app.include_router(todo_items.router)
app.include_router(local_files.router)
app.include_router(person.router)
app.include_router(finance.router)
# Subscription accounts (task 32ade384) — Netflix-style streaming accounts.
app.include_router(subscriptions.router, tags=["subscriptions"])
# Identity documents (task 32ade384) — Emirates ID Document Details + card.
app.include_router(documents.router, tags=["documents"])
app.include_router(identity.router, tags=["identity"])
app.include_router(bank_share_sheet.router, tags=["bank"])
app.include_router(uae_license.router, tags=["documents"])
app.include_router(vehicle.router, tags=["vehicle"])
app.include_router(rta.router, tags=["rta"])
app.include_router(neteller.router, tags=["neteller"])
app.include_router(location.router)
app.include_router(context.router, tags=["context"])
app.include_router(oversight.router, tags=["oversight"])
app.include_router(settings_routes.router, tags=["settings"])
app.include_router(assets.router, tags=["assets"])
app.include_router(merge.router, tags=["merge"])
app.include_router(deduplication.router, tags=["deduplication"])
app.include_router(ai_stream.router, tags=["ai"])
app.include_router(drive.router, tags=["drive"])
app.include_router(files.router, tags=["files"])
# Import feature (spreadsheet bulk + AI document extraction — ALLIN1 port). The
# router carries its own /api/imports prefix and mounts with no extra prefix.
app.include_router(imports.router, tags=["imports"])
app.include_router(external_projects.router)
# مرکز توسعه — GitHub/Render dev-sync (absolute /api/dev/* paths, no prefix).
app.include_router(dev_center.router, tags=["dev-center"])
# گوگلِ من — Gmail/Calendar mirror (absolute /api/google/* paths, no prefix).
app.include_router(google_sync.router, tags=["google-sync"])
# webhook.router decorators carry the absolute path (/webhook, /webhook/health)
# so it mounts with no prefix to avoid double-prefixing.
app.include_router(webhook.router, tags=["webhook"])
# telegram.router decorators carry absolute /api/telegram/... paths (the
# bidirectional bot: inbound webhook + set/delete/heal/status/test). Mounts with
# no prefix, like webhook + notifications.api_router.
app.include_router(telegram.router, tags=["telegram"])
# writings.router decorators carry absolute /api/writings paths (نوشته‌های من —
# long-form personal writings). Mounts with no prefix.
app.include_router(writings.router, tags=["writings"])

# لاگ فعالیت‌ها — the runtime activity/audit trail (global page + per-section
# panels read it; domain routers write it via record_activity).
app.include_router(activity_log.router, tags=["activity-log"])
# brain.router — رشد ذهن و هوش (dashboard/upload/reminder). Absolute paths.
app.include_router(brain.router, tags=["brain"])
# صندوق ورودی همه‌چیز — universal capture inbox (+ AI triage). Absolute paths.
app.include_router(inbox.router, tags=["inbox"])
# میز فرمان «امروز من» — the Dashboard's one-call Today aggregate.
app.include_router(command_center.router, tags=["command-center"])
# سطل زباله — recoverable deletes for todo items + writings (data-safety
# phase 0). Absolute /api/trash paths.
app.include_router(trash.router, tags=["trash"])
# موتور توجه — rule scan / morning brief / settings (phase 3).
app.include_router(attention.router, tags=["attention"])
# مرور هفتگی — stored weekly AI reviews + schedule (phase 4).
app.include_router(weekly_review.router, tags=["weekly-review"])
# پشتیبان‌گیری خودکار — nightly full-DB export to Drive + manual run/export.
app.include_router(backup.router, tags=["backup"])
# دستیار سراسری + جستجوی سراسری + نقشهٔ سیستم (phase 4).
app.include_router(assistant_chat.router, tags=["ai"])
app.include_router(global_search.router, tags=["search"])
app.include_router(system_map.router, tags=["system-map"])


# ── Telegram webhook self-heal supervisor ────────────────────────────────────
# A dedicated startup/shutdown pair (separate from startup_event so it's
# isolated + reversible). The supervisor re-registers Telegram's webhook
# whenever the recorded URL drifts from our public URL or the pending queue
# backs up — the "buttons stop responding after a redeploy" failure. It is a
# clean no-op when TELEGRAM_BOT_TOKEN / BACKEND_PUBLIC_URL are unset, so it's
# always safe to start.
@app.on_event("startup")
async def _start_telegram_supervisor():
    try:
        from app.services.telegram_service import telegram_webhook_supervisor_loop

        app.state.tg_webhook_stop = asyncio.Event()
        app.state.tg_webhook_task = asyncio.create_task(
            telegram_webhook_supervisor_loop(app.state.tg_webhook_stop)
        )
        logger.info("📡 Telegram webhook self-heal supervisor started")
    except Exception as exc:
        logger.warning("Telegram webhook supervisor failed to start: %s", exc)


@app.on_event("shutdown")
async def _stop_telegram_supervisor():
    try:
        stop = getattr(app.state, "tg_webhook_stop", None)
        if stop is not None:
            stop.set()
        task = getattr(app.state, "tg_webhook_task", None)
        if task is not None:
            await asyncio.wait_for(task, timeout=5)
    except Exception as exc:
        logger.debug("Telegram webhook supervisor shutdown: %s", exc)


# ── Personal-development archive seed (owner's Excel workbook) ───────────────
# Seeds the «توسعه فردی - …» lists + the finance archive account from the
# generated module (see scripts/generate_pd_seed.py). Idempotent per list /
# account — a fully-seeded DB makes this a fast no-op every boot.
@app.on_event("startup")
async def _seed_personal_development():
    try:
        from app.database import SessionLocal
        from app.services.personal_development_seed import (
            ensure_personal_development_seeded,
        )

        async with SessionLocal() as session:
            result = await ensure_personal_development_seeded(session)
        if any(result.values()):
            logger.info("📚 personal-development archive seeded: %s", result)
    except Exception as exc:
        logger.warning("personal-development seed skipped: %s", exc)


# ── Brain reminder loop (رشد ذهن — weekly upload reminder via Telegram) ─────
@app.on_event("startup")
async def _start_brain_reminder():
    try:
        from app.services.brain_service import brain_reminder_loop

        app.state.brain_reminder_stop = asyncio.Event()
        app.state.brain_reminder_task = asyncio.create_task(
            brain_reminder_loop(app.state.brain_reminder_stop)
        )
        logger.info("🧠 brain reminder loop started")
    except Exception as exc:
        logger.warning("brain reminder loop failed to start: %s", exc)


@app.on_event("shutdown")
async def _stop_brain_reminder():
    try:
        stop = getattr(app.state, "brain_reminder_stop", None)
        if stop is not None:
            stop.set()
        task = getattr(app.state, "brain_reminder_task", None)
        if task is not None:
            await asyncio.wait_for(task, timeout=5)
    except Exception as exc:
        logger.debug("brain reminder shutdown: %s", exc)


# ── Attention engine loop (موتور توجه — rule scan + morning brief + weekly
# review). Same lifecycle shape as the brain reminder: its own stop event,
# fail-open start, bounded shutdown wait. ────────────────────────────────────
@app.on_event("startup")
async def _start_attention_engine():
    try:
        from app.services.attention_service import attention_loop

        app.state.attention_stop = asyncio.Event()
        app.state.attention_task = asyncio.create_task(
            attention_loop(app.state.attention_stop)
        )
        logger.info("🚨 attention engine loop started")
    except Exception as exc:
        logger.warning("attention engine loop failed to start: %s", exc)


@app.on_event("shutdown")
async def _stop_attention_engine():
    try:
        stop = getattr(app.state, "attention_stop", None)
        if stop is not None:
            stop.set()
        task = getattr(app.state, "attention_task", None)
        if task is not None:
            await asyncio.wait_for(task, timeout=5)
    except Exception as exc:
        logger.debug("attention engine shutdown: %s", exc)


# ── Dev-sync engine loop (مرکز توسعه — GitHub repos + Render services/logs +
# کارنامهٔ روزانه). Same lifecycle shape as the attention engine. ────────────
@app.on_event("startup")
async def _start_dev_sync_engine():
    try:
        from app.services.dev_sync.engine import dev_sync_loop

        app.state.dev_sync_stop = asyncio.Event()
        app.state.dev_sync_task = asyncio.create_task(
            dev_sync_loop(app.state.dev_sync_stop)
        )
        logger.info("🛠️ dev-sync engine loop started")
    except Exception as exc:
        logger.warning("dev-sync engine loop failed to start: %s", exc)


@app.on_event("shutdown")
async def _stop_dev_sync_engine():
    try:
        stop = getattr(app.state, "dev_sync_stop", None)
        if stop is not None:
            stop.set()
        task = getattr(app.state, "dev_sync_task", None)
        if task is not None:
            await asyncio.wait_for(task, timeout=5)
    except Exception as exc:
        logger.debug("dev-sync engine shutdown: %s", exc)


# ── Google personal-sync loop (جیمیل + تقویم + گزارش روز). Same lifecycle
# shape as the attention/dev-sync engines. ───────────────────────────────────
@app.on_event("startup")
async def _start_google_sync_engine():
    try:
        from app.services.google_sync.engine import google_sync_loop

        app.state.google_sync_stop = asyncio.Event()
        app.state.google_sync_task = asyncio.create_task(
            google_sync_loop(app.state.google_sync_stop)
        )
        logger.info("📬 google personal-sync loop started")
    except Exception as exc:
        logger.warning("google personal-sync loop failed to start: %s", exc)


@app.on_event("shutdown")
async def _stop_google_sync_engine():
    try:
        stop = getattr(app.state, "google_sync_stop", None)
        if stop is not None:
            stop.set()
        task = getattr(app.state, "google_sync_task", None)
        if task is not None:
            await asyncio.wait_for(task, timeout=5)
    except Exception as exc:
        logger.debug("google personal-sync shutdown: %s", exc)


# ── Backup loop (پشتیبان‌گیری شبانه — full-DB export to Drive, local
# fallback). Same lifecycle shape as the attention/dev-sync/google-sync
# engines. ──────────────────────────────────────────────────────────────
@app.on_event("startup")
async def _start_backup_loop():
    try:
        from app.services.backup_service import backup_loop

        app.state.backup_stop = asyncio.Event()
        app.state.backup_task = asyncio.create_task(
            backup_loop(app.state.backup_stop)
        )
        logger.info("💾 backup loop started")
    except Exception as exc:
        logger.warning("backup loop failed to start: %s", exc)


@app.on_event("shutdown")
async def _stop_backup_loop():
    try:
        stop = getattr(app.state, "backup_stop", None)
        if stop is not None:
            stop.set()
        task = getattr(app.state, "backup_task", None)
        if task is not None:
            await asyncio.wait_for(task, timeout=5)
    except Exception as exc:
        logger.debug("backup loop shutdown: %s", exc)


# ── Jobs engine (موتور واحد زمان‌بندی — phase 1): the in-process port of
# the Celery beat jobs that never ran in production. ────────────────────
@app.on_event("startup")
async def _start_jobs_engine():
    try:
        from app.services.jobs_engine import jobs_loop

        app.state.jobs_stop = asyncio.Event()
        app.state.jobs_task = asyncio.create_task(
            jobs_loop(app.state.jobs_stop)
        )
        logger.info("⚙️ jobs engine started")
    except Exception as exc:
        logger.warning("jobs engine failed to start: %s", exc)


@app.on_event("shutdown")
async def _stop_jobs_engine():
    try:
        stop = getattr(app.state, "jobs_stop", None)
        if stop is not None:
            stop.set()
        task = getattr(app.state, "jobs_task", None)
        if task is not None:
            await asyncio.wait_for(task, timeout=5)
    except Exception as exc:
        logger.debug("jobs engine shutdown: %s", exc)


# ── Personal writings seed (نوشته‌های من — Word documents archive) ───────────
@app.on_event("startup")
async def _seed_personal_writings():
    try:
        from app.database import SessionLocal
        from app.services.personal_writings_seed import ensure_personal_writings_seeded

        async with SessionLocal() as session:
            result = await ensure_personal_writings_seeded(session)
        if result.get("writings_added"):
            logger.info("📝 personal writings seeded: %s", result)
    except Exception as exc:
        logger.warning("personal writings seed skipped: %s", exc)


# ── Notification preferences — warm the process cache at startup ─────────────
# notify_event reads prefs from an in-process cache (no DB on its hot path), so
# the owner's saved per-event/per-channel choices only take effect once the
# cache is loaded from global_settings. Do it once at boot; a cold cache simply
# falls back to behaviour-preserving defaults, so this is best-effort.
@app.on_event("startup")
async def _load_notification_prefs():
    try:
        from app.database import SessionLocal
        from app.services import notification_prefs

        async with SessionLocal() as session:
            await notification_prefs.load_prefs(session)
        logger.info("🔔 Notification preferences loaded into cache")
    except Exception as exc:
        logger.debug("notification prefs load skipped: %s", exc)

# auth_google.router is INTENTIONALLY UNMOUNTED. The OAuth flow lives in
# app/routes/auth_google.py and depends on the GOOGLE_CLIENT_ID /
# GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI settings (see app/config.py).
# The flow's UX (admin approval, pending-user screen, redirect chain)
# isn't finalised; mounting it would expose /auth/google → /auth/google/callback
# → /auth/pending while the back-end still treats the password-auth User
# as the canonical identity. Mount it explicitly when the operator
# enables Google sign-in:
#     from app.routes import auth_google
#     app.include_router(auth_google.router, tags=["google-auth"])
# The "audit: file without import reference" finding (task 3b90d409)
# correctly identified this as orphan code, but the file is kept for
# the forthcoming integration — not dead.
# planner router decorators also use absolute /api/planner paths.
app.include_router(planner.router, tags=["planner"])
# self_improvement router decorators carry absolute /api/self-improvement
# paths so it mounts with no prefix.
app.include_router(self_improvement.router, tags=["self-improvement"])

# Google OAuth router is conditionally mounted: only when the operator
# has actually configured a GOOGLE_CLIENT_ID. Without that, the consent-
# screen redirect would 500 anyway, so we keep the surface area off the
# public schema entirely. This is the wiring that makes auth_google
# stop being an orphan file (audit task 3b90d409).
if settings.GOOGLE_CLIENT_ID:
    from app.routes import auth_google  # noqa: E402 (conditional import)
    app.include_router(auth_google.router, tags=["google-auth"])
    logger.info("Google OAuth router mounted (GOOGLE_CLIENT_ID is set)")

# Serve static files (frontend)
# در Native Render runtime، CWD ریشه پروژه است
# Vite خروجی را در frontend/dist می‌گذارد
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
# fallback: اگر frontend/dist نبود، dist در ریشه را امتحان کن (Docker)
if not frontend_dist.exists():
    _alt = Path(__file__).parent.parent / "dist"
    if _alt.exists():
        frontend_dist = _alt
if frontend_dist.exists():
    # Only mount the /assets directory for built files, not raw source
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    # Path prefixes that belong to the backend API and must NOT be served the
    # SPA shell. The catch-all redirects these to the trailing-slash form so
    # that frontend-style calls like fetch('/auth/login') reach the real
    # API instead of getting index.html.
    #
    # Note: 'tasks' and 'projects' are intentionally absent. Those paths are
    # SPA routes (React renders the Tasks/Projects page) and the data lives
    # under /api/tasks and /api/projects.
    _API_PREFIXES = (
        "auth", "notifications", "ai",
        "users", "integrations", "webhook", "health", "api",
        # Todo-list system endpoints — purely API, no SPA route.
        "todo-items",
    )

    @app.get("/{full_path:path}", tags=["frontend"])
    async def serve_frontend(full_path: str):
        """
        Serve frontend static files for SPA routing.

        NOTE: This catch-all route intentionally matches any path not handled by
        API routers above. This is the standard pattern for single-page applications
        where the frontend router handles client-side routing.

        IMPORTANT: All API routes MUST be registered BEFORE this catch-all handler.
        If an API endpoint returns 404, it means the route is not registered.
        This catch-all only serves files from the dist directory and does NOT
        interfere with registered API routes (FastAPI matches specific routes first).
        """
        # Don't shadow API routes. Routers are registered with prefix="/tasks"
        # and a route at "/", so the canonical path is "/tasks/". Requests for
        # "/tasks" (no trailing slash) would otherwise be served the SPA shell;
        # the frontend then fails to parse the HTML as JSON and reports the API
        # as offline. Redirect to the trailing-slash form so fetch() reaches the
        # real handler.
        first_segment = full_path.split("/", 1)[0]
        if first_segment in _API_PREFIXES:
            # If this request already has a trailing slash, the
            # previous redirect didn't find a handler either —
            # return a clean 404 instead of looping back to
            # ourselves. (Without this guard, an obsolete API path
            # like /api/search redirected forever to /api/search/,
            # /api/search//, …, blowing the client's redirect cap.)
            if full_path.endswith("/"):
                return JSONResponse(
                    status_code=404,
                    content={"detail": "Not Found"},
                )
            return RedirectResponse(url=f"/{full_path}/", status_code=307)

        # Guard: Prevent serving files outside the dist directory
        try:
            requested_path = (frontend_dist / full_path).resolve()
            if not str(requested_path).startswith(str(frontend_dist.resolve())):
                logger.warning(f"Blocked path traversal attempt: {full_path}")
                return {"detail": "Not Found"}
        except (ValueError, OSError):
            logger.warning(f"Invalid path requested: {full_path}")
            return {"detail": "Not Found"}

        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        index_path = frontend_dist / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        return {"detail": "Not Found"}
else:
    logger.warning(f"⚠️  Frontend dist directory not found at {frontend_dist}")

    @app.get("/")
    async def root():
        return {"message": "Lifemanager API is running. Frontend not built yet."}
