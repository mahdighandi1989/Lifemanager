import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_login_invalid_credentials():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/auth/login", json={"username": "invalid", "password": "wrong"})
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_valid_credentials():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/auth/login", json={"username": "testuser", "password": "testpass"})
        assert response.status_code == 200
        assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_token_validation_valid():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # First login to get a token
        login_response = await client.post("/auth/login", json={"username": "testuser", "password": "testpass"})
        token = login_response.json()["access_token"]
        
        # Then validate the token
        response = await client.get("/auth/validate", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert response.json()["valid"] is True


@pytest.mark.asyncio
async def test_token_validation_invalid():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/auth/validate", headers={"Authorization": "Bearer invalid_token"})
        assert response.status_code == 401
