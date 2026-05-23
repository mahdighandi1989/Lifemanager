import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_ai_chat_basic():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/ai/chat", json={"message": "Hello, AI!"})
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert isinstance(data["response"], str)


@pytest.mark.asyncio
async def test_ai_chat_empty_message():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/ai/chat", json={"message": ""})
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_ai_chat_missing_message():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/ai/chat", json={})
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_ai_suggestions():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/ai/suggestions", params={"context": "task_management"})
        assert response.status_code == 200
        data = response.json()
        assert "suggestions" in data
        assert isinstance(data["suggestions"], list)


@pytest.mark.asyncio
async def test_ai_suggestions_missing_context():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/ai/suggestions")
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_ai_analyze():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/ai/analyze", json={"text": "I need to organize my daily tasks better"})
        assert response.status_code == 200
        data = response.json()
        assert "analysis" in data
        assert isinstance(data["analysis"], dict)


@pytest.mark.asyncio
async def test_ai_analyze_empty_text():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/ai/analyze", json={"text": ""})
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_ai_analyze_missing_text():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/ai/analyze", json={})
        assert response.status_code == 422
