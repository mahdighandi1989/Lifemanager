"""Data ingestion + AI recommendation surfaces (audit task 217909d2 ACs 27, 28, 38-42)."""
from __future__ import annotations

import pytest

from app.services.ai.recommendation_service import (
    INTENT_KEYWORDS,
    extract_intent_and_keywords,
    get_recommendations,
)


def test_indexed_data_source_entry_model_imports():
    """AC 27 — model exists with the required columns."""
    from app.models.indexed_data_source_entry import IndexedDataSourceEntry

    cols = {c.name for c in IndexedDataSourceEntry.__table__.columns}
    for required in (
        "user_id",
        "source_path",
        "checksum",
        "last_modified",
        "processed_at",
        "associated_todo_list_id",
    ):
        assert required in cols, f"{required} missing"


@pytest.mark.asyncio
async def test_data_ingestion_service_three_methods(db_session):
    """AC 28 — DataIngestionService has scan / compare_and_ingest /
    process_new_entry, and the compare path is idempotent."""
    from app.services.data_ingestion_service import DataIngestionService

    svc = DataIngestionService(db_session)
    scanned = await svc.scan_external_source(["/a", "/b"])
    assert {s["source_path"] for s in scanned} == {"/a", "/b"}

    first = await svc.compare_and_ingest_new_data(user_id=1, scanned=scanned)
    assert first["created"] == 2 and first["skipped"] == 0

    # Re-running with the same input is idempotent (AC 37).
    second = await svc.compare_and_ingest_new_data(user_id=1, scanned=scanned)
    assert second["created"] == 0 and second["skipped"] == 2


def test_recommendation_extract_intent_and_keywords_persian():
    """AC 42 — Persian "می‌خواهم فیلمی ببینم" surfaces the watch_movie intent."""
    result = extract_intent_and_keywords("می‌خواهم فیلمی ببینم")
    assert result["intent"] == "watch_movie"
    assert "فیلم" in result["keywords"] or "تماشا" in result["keywords"]


def test_recommendation_extract_intent_english():
    result = extract_intent_and_keywords("I want to watch a movie tonight")
    assert result["intent"] == "watch_movie"
    assert "movie" in result["keywords"]


def test_recommendation_intent_keywords_constants_documented():
    """The INTENT_KEYWORDS map keeps the docstring honest."""
    assert "watch_movie" in INTENT_KEYWORDS
    assert "read_book" in INTENT_KEYWORDS


@pytest.mark.asyncio
async def test_recommendations_pull_from_user_data(db_session):
    """Owned items matching the parsed keyword are returned."""
    from app.models.task import Task
    from app.models.local_file_entry import LocalFileEntry

    db_session.add(Task(title="Watch Dune movie", user_id=7))
    db_session.add(LocalFileEntry(user_id=7, source_path="/movies/Arrival.mp4"))
    await db_session.commit()

    recs = await get_recommendations(db_session, user_id=7, query="I want a movie")
    titles = {r["title"] for r in recs}
    assert "Watch Dune movie" in titles
    assert "/movies/Arrival.mp4" in titles


def test_correlate_needs_endpoint_returns_200(api_client):
    """AC 41 — POST /api/ai/correlate_needs returns 200 + a list."""
    resp = api_client.post(
        "/ai/correlate_needs",
        json={"query": "watch a movie"},
    )
    assert resp.status_code == 200, resp.text
    assert isinstance(resp.json(), list)
