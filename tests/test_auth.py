from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_auth_root():
    response = client.get("/auth/")
    assert response.status_code == 200
    assert response.json() == {"message": "Auth endpoint"}
