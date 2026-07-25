"""کارهای یک پروژه — the read side «پروژه‌های من» never had.

2026-07-25 survey: a project showed a name and a description and nothing
else, so it could not be the container for work it is meant to be.
"""


def _project(api_client, name="مهاجرت"):
    return api_client.post("/api/projects", json={"name": name}).json()["id"]


def test_project_tasks_lists_only_that_projects_tasks(api_client):
    pid = _project(api_client)
    other = _project(api_client, "خانه")
    api_client.post("/api/tasks", json={"title": "کار اول", "project_id": pid})
    api_client.post("/api/tasks", json={"title": "کار دوم", "project_id": pid})
    api_client.post("/api/tasks", json={"title": "کارِ پروژهٔ دیگر", "project_id": other})

    body = api_client.get(f"/api/projects/{pid}/tasks").json()
    assert body["ok"] is True and body["success"] is True
    titles = {t["title"] for t in body["tasks"]}
    assert titles == {"کار اول", "کار دوم"}
    assert all("status" in t and "due_date" in t for t in body["tasks"])


def test_project_tasks_empty_and_missing(api_client):
    pid = _project(api_client, "پروژهٔ خالی")
    assert api_client.get(f"/api/projects/{pid}/tasks").json()["tasks"] == []
    assert api_client.get("/api/projects/987654/tasks").status_code == 404
