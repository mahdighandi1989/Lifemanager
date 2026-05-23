import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_list_integrations_empty():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/integrations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0


@pytest.mark.asyncio
async def test_create_integration():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/integrations", json={
            "name": "Test Integration",
            "type": "calendar",
            "config": {"url": "https://example.com/calendar"}
        })
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Integration"
        assert "id" in data


@pytest.mark.asyncio
async def test_create_integration_missing_name():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/integrations", json={"type": "calendar"})
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_integration_by_id():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_resp = await client.post("/integrations", json={
            "name": "Get Test",
            "type": "email",
            "config": {"email": "test@example.com"}
        })
        integration_id = create_resp.json()["id"]
        
        response = await client.get(f"/integrations/{integration_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == integration_id
        assert data["name"] == "Get Test"


@pytest.mark.asyncio
async def test_get_integration_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/integrations/99999")
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_integration():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_resp = await client.post("/integrations", json={
            "name": "Update Test",
            "type": "slack",
            "config": {"webhook": "https://hooks.slack.com/test"}
        })
        integration_id = create_resp.json()["id"]
        
        response = await client.put(f"/integrations/{integration_id}", json={
            "name": "Updated Name",
            "config": {"webhook": "https://hooks.slack.com/updated"}
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"


@pytest.mark.asyncio
async def test_update_integration_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.put("/integrations/99999", json={"name": "Ghost"})
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_integration():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_resp = await client.post("/integrations", json={
            "name": "Delete Test",
            "type": "github",
            "config": {"token": "test_token"}
        })
        integration_id = create_resp.json()["id"]
        
        response = await client.delete(f"/integrations/{integration_id}")
        assert response.status_code == 204
        
        get_response = await client.get(f"/integrations/{integration_id}")
        assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_delete_integration_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http/test") as client:
        response = await client.delete("/integrations/99999")
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_sync_integration():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_resp = await client.post("/integrations", json={
            "name": "Sync Test",
            "type": "calendar",
            "config": {"url": "https://example.com/cal"}
        })
        integration_id = create_resp.json()["id"]
        
        response = await client.post(f"/integrations/{integration_id}/sync")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data


@pytest.mark.asyncio
async def test_sync_integration_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/integrations/99999/sync")
        assert response.status_code == 404
