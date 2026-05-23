import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_list_notifications_empty():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/notifications")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0


@pytest.mark.asyncio
async def test_create_notification():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/notifications", json={"message": "Test notification", "type": "info"})
        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "Test notification"
        assert "id" in data


@pytest.mark.asyncio
async def test_create_notification_missing_message():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/notifications", json={"type": "warning"})
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_notification_by_id():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_resp = await client.post("/notifications", json={"message": "Get Test", "type": "info"})
        notif_id = create_resp.json()["id"]
        
        response = await client.get(f"/notifications/{notif_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == notif_id
        assert data["message"] == "Get Test"


@pytest.mark.asyncio
async def test_get_notification_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/notifications/99999")
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_mark_notification_read():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_resp = await client.post("/notifications", json={"message": "Read Test", "type": "info"})
        notif_id = create_resp.json()["id"]
        
        response = await client.put(f"/notifications/{notif_id}/read")
        assert response.status_code == 200
        data = response.json()
        assert data["read"] is True


@pytest.mark.asyncio
async def test_mark_notification_read_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.put("/notifications/99999/read")
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_notification():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_resp = await client.post("/notifications", json={"message": "Delete Test", "type": "info"})
        notif_id = create_resp.json()["id"]
        
        response = await client.delete(f"/notifications/{notif_id}")
        assert response.status_code == 204
        
        get_response = await client.get(f"/notifications/{notif_id}")
        assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_delete_notification_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.delete("/notifications/99999")
        assert response.status_code == 404
