import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_list_projects_empty():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/projects")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0


@pytest.mark.asyncio
async def test_create_project():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/projects", json={"name": "Test Project", "description": "A test project"})
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Project"
        assert "id" in data


@pytest.mark.asyncio
async def test_create_project_missing_name():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/projects", json={"description": "Missing name"})
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_project_by_id():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_resp = await client.post("/projects", json={"name": "Get Test", "description": "To be retrieved"})
        project_id = create_resp.json()["id"]
        
        response = await client.get(f"/projects/{project_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == project_id
        assert data["name"] == "Get Test"


@pytest.mark.asyncio
async def test_get_project_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/projects/99999")
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_project():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_resp = await client.post("/projects", json={"name": "Update Test", "description": "To be updated"})
        project_id = create_resp.json()["id"]
        
        response = await client.put(f"/projects/{project_id}", json={"name": "Updated Name", "status": "completed"})
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["status"] == "completed"


@pytest.mark.asyncio
async def test_update_project_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.put("/projects/99999", json={"name": "Ghost"})
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_project():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_resp = await client.post("/projects", json={"name": "Delete Test", "description": "To be deleted"})
        project_id = create_resp.json()["id"]
        
        response = await client.delete(f"/projects/{project_id}")
        assert response.status_code == 204
        
        get_response = await client.get(f"/projects/{project_id}")
        assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_delete_project_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.delete("/projects/99999")
        assert response.status_code == 404
