from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_users_root():
    response = client.get("/users/")
    assert response.status_code == 200
    assert response.json() == {"message": "Users endpoint"}
