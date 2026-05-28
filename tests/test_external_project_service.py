"""ExternalProjectService.sync_project_data + OversightService.analyze_time_allocation
(audit task d2146781, AC4 + AC5)."""
import pytest

from app.models.external_project import ExternalProject
from app.services.external_project_service import ExternalProjectService
from app.services.oversight_service import OversightService


@pytest.mark.asyncio
async def test_sync_project_data_with_mock_fetcher(db_session):
    proj = ExternalProject(user_id=1, name="Jira A", provider="jira", base_url="https://jira.example/api")
    db_session.add(proj)
    await db_session.commit()
    await db_session.refresh(proj)

    async def fake_fetch(url, key):
        return [{"id": 1}, {"id": 2}]

    result = await ExternalProjectService(db_session).sync_project_data(proj, fetcher=fake_fetch)
    assert result["ok"] is True
    assert result["synced_items"] == 2
    assert result["project_id"] == proj.id


@pytest.mark.asyncio
async def test_sync_project_data_handles_upstream_error(db_session):
    proj = ExternalProject(user_id=1, name="Linear B", provider="linear", base_url="https://x")
    db_session.add(proj)
    await db_session.commit()

    async def boom(url, key):
        raise RuntimeError("502 bad gateway")

    result = await ExternalProjectService(db_session).sync_project_data(proj, fetcher=boom)
    assert result["ok"] is False
    assert "502" in result["error"]


@pytest.mark.asyncio
async def test_sync_project_data_missing_base_url(db_session):
    proj = ExternalProject(user_id=1, name="No URL", provider="asana")
    db_session.add(proj)
    await db_session.commit()

    result = await ExternalProjectService(db_session).sync_project_data(proj)
    assert result["ok"] is False
    assert "base_url" in result["error"]


@pytest.mark.asyncio
async def test_analyze_time_allocation_groups_by_provider(db_session):
    for prov in ("jira", "jira", "linear"):
        db_session.add(ExternalProject(user_id=7, name=f"{prov}-proj", provider=prov, base_url="https://x"))
    db_session.add(ExternalProject(user_id=99, name="other-user", provider="github", base_url="https://y"))
    await db_session.commit()

    result = await OversightService(db_session).analyze_time_allocation(7)
    assert result["external_project_count"] == 3  # only user 7's projects
    providers = {b["provider"]: b["count"] for b in result["by_provider"]}
    assert providers == {"jira": 2, "linear": 1}
