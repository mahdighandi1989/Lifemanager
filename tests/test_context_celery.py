"""Context-engine Celery job + Task context fields (audit task 2165524b, AC2/AC4)."""


def test_task_has_context_fields():
    """AC2: the context-trigger columns exist on the Task model."""
    from app.models.task import Task

    cols = {c.name for c in Task.__table__.columns}
    required = {
        "location_lat",
        "location_lng",
        "heart_rate_threshold",
        "activity_required",
        "mood_tag",
    }
    assert required <= cols, f"Task missing context columns: {required - cols}"


def test_analyze_user_context_task_runs():
    """AC4: the scheduled task runs the engine and returns a suggestion count."""
    from app.tasks import analyze_user_context

    result = analyze_user_context()
    assert "suggestions" in result
    assert result["suggestions"] >= 1


def test_analyze_user_context_in_beat_schedule():
    """AC4: the job is registered to run every 15 minutes via celery beat."""
    from app.celery_app import celery_app

    sched = celery_app.conf.beat_schedule
    assert "analyze-user-context" in sched
    assert sched["analyze-user-context"]["task"] == "app.tasks.analyze_user_context"
