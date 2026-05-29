from celery import Celery
from celery.schedules import crontab

celery_app = Celery(
    "lifemanager",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=["app.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Fail fast when the broker is unreachable instead of hanging the
    # caller. The AI-ingestion publish (event_publisher) runs on the
    # request hot path (POST /api/todo-items), so a down/blipping Redis
    # must not add many seconds of connect-retry latency to every write.
    broker_transport_options={
        "socket_connect_timeout": 1,
        "socket_timeout": 1,
    },
    broker_connection_retry_on_startup=False,
)

# Periodic schedule for the Self-Improvement (خودسازی) module.
# Run by celery beat (`celery -A app.celery_app beat`). All times in
# UTC — the user can shift these per their local timezone later.
celery_app.conf.beat_schedule = {
    # 00:05 UTC — pre-create today's pending check-in rows for every
    # active user so the dashboard never shows an empty table.
    "self-improvement-daily-refresh": {
        "task": "app.tasks.refresh_self_improvement_daily",
        "schedule": crontab(hour=0, minute=5),
    },
    # 02:00 UTC — let the AI auto-tick implicit completions from
    # other sources (planner logs, completed TodoItems, etc.).
    "self-improvement-ai-auto-tick": {
        "task": "app.tasks.run_self_improvement_ai_auto_tick",
        "schedule": crontab(hour=2, minute=0),
    },
    # 03:00 UTC — refresh the per-user profile analytics narrative.
    "self-improvement-profile-analytics": {
        "task": "app.tasks.run_self_improvement_profile_analytics",
        "schedule": crontab(hour=3, minute=0),
    },
    # Every 15 minutes — run the context engine so the assistant's task
    # suggestions stay fresh (audit task 2165524b, AC4).
    "analyze-user-context": {
        "task": "app.tasks.analyze_user_context",
        "schedule": crontab(minute="*/15"),
    },
    # 04:00 UTC — classify aging data and tally cold-storage candidates
    # (audit task 7367c6f0, AC8/AC11).
    "tier-cold-data-daily": {
        "task": "app.tasks.tier_cold_data",
        "schedule": crontab(hour=4, minute=0),
    },
    # Every 30 minutes — refresh finance account balances from new bank
    # emails/SMS (audit task 4ae4b3ca, AC 11).
    "process-finance-updates": {
        "task": "app.tasks.process_finance_updates",
        "schedule": crontab(minute="*/30"),
    },
}