import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_list_tasks_empty():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/tasks")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0


@pytest.mark.asyncio
async def test_create_task():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/tasks", json={"title": "Test Task", "description": "A test task"})
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Task"
        assert "id" in data


@pytest.mark.asyncio
async def test_create_task_missing_title():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/tasks", json={"description": "Missing title"})
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_task_by_id():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # First create a task
        create_resp = await client.post("/tasks", json={"title": "Get Test", "description": "To be retrieved"})
        task_id = create_resp.json()["id"]
        
        # Then get it by ID
        response = await client.get(f"/tasks/{task_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == task_id
        assert data["title"] == "Get Test"


@pytest.mark.asyncio
async def test_get_task_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/tasks/99999")
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_task():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # First create a task
        create_resp = await client.post("/tasks", json={"title": "Update Test", "description": "To be updated"})
        task_id = create_resp.json()["id"]
        
        # Then update it
        response = await client.put(f"/tasks/{task_id}", json={"title": "Updated Title", "completed": True})
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["completed"] is True


@pytest.mark.asyncio
async def test_update_task_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.put("/tasks/99999", json={"title": "Ghost"})
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_task():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # First create a task
        create_resp = await client.post("/tasks", json={"title": "Delete Test", "description": "To be deleted"})
        task_id = create_resp.json()["id"]
        
        # Then delete it
        response = await client.delete(f"/tasks/{task_id}")
        assert response.status_code == 204
        
        # Verify it's gone
        get_response = await client.get(f"/tasks/{task_id}")
        assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_delete_task_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.delete("/tasks/99999")
        assert response.status_code == 404
