"""Tests for the centralized @handle_errors decorator.

AC node: tests/test_errors.py — the decorator maps service-layer
exceptions onto the correct HTTPException status codes so route
handlers stay free of try/except boilerplate.
"""
from __future__ import annotations

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError, NoResultFound

from app.middleware import handle_errors


@pytest.fixture
def client():
    app = FastAPI()

    @app.get("/raises-value")
    @handle_errors
    async def raise_value():
        raise ValueError("bad input")

    @app.get("/raises-noresult")
    @handle_errors
    async def raise_noresult():
        raise NoResultFound()

    @app.get("/raises-integrity")
    @handle_errors
    async def raise_integrity():
        raise IntegrityError("stmt", {}, Exception("orig"))

    @app.get("/raises-permission")
    @handle_errors
    async def raise_permission():
        raise PermissionError("nope")

    @app.get("/raises-pydantic")
    @handle_errors
    async def raise_pydantic():
        class _M(BaseModel):
            n: int

        _M.model_validate({"n": "x"})  # raises ValidationError

    @app.get("/raises-http")
    @handle_errors
    async def raise_http():
        raise HTTPException(status_code=418, detail="i am a teapot")

    @app.get("/raises-generic")
    @handle_errors
    async def raise_generic():
        raise RuntimeError("kaboom")

    @app.get("/ok")
    @handle_errors
    async def ok():
        return {"ok": True}

    return TestClient(app, raise_server_exceptions=False)


def test_value_error_becomes_400(client):
    r = client.get("/raises-value")
    assert r.status_code == 400
    assert "bad input" in r.json()["detail"]


def test_noresult_becomes_404(client):
    r = client.get("/raises-noresult")
    assert r.status_code == 404


def test_integrity_error_becomes_409(client):
    r = client.get("/raises-integrity")
    assert r.status_code == 409


def test_permission_error_becomes_403(client):
    r = client.get("/raises-permission")
    assert r.status_code == 403


def test_pydantic_validation_becomes_400(client):
    r = client.get("/raises-pydantic")
    assert r.status_code == 400


def test_http_exception_passes_through(client):
    """HTTPException is already shaped for FastAPI; the decorator must
    not double-wrap it."""
    r = client.get("/raises-http")
    assert r.status_code == 418
    assert r.json()["detail"] == "i am a teapot"


def test_generic_exception_becomes_500(client):
    r = client.get("/raises-generic")
    assert r.status_code == 500
    assert r.json()["detail"] == "internal error"


def test_happy_path_unaffected(client):
    r = client.get("/ok")
    assert r.status_code == 200
    assert r.json() == {"ok": True}


# ── static checks: no try/except left in the refactored routes ──


def test_no_try_except_left_in_tasks_route():
    import inspect

    from app.routes import tasks

    src = inspect.getsource(tasks)
    # Comments / docstrings can mention "try" — only flag actual `try:`
    # statements at line start (after optional whitespace).
    for line in src.splitlines():
        stripped = line.strip()
        assert not stripped.startswith("try:"), (
            f"app/routes/tasks.py still contains a try/except: {line!r}"
        )


def test_no_try_except_left_in_projects_route():
    import inspect

    from app.routes import projects

    src = inspect.getsource(projects)
    for line in src.splitlines():
        stripped = line.strip()
        assert not stripped.startswith("try:"), (
            f"app/routes/projects.py still contains a try/except: {line!r}"
        )


def test_handle_errors_decorator_present_in_both_routes():
    """Both refactored route modules import handle_errors at the top."""
    import inspect

    from app.routes import projects, tasks

    for mod in (tasks, projects):
        src = inspect.getsource(mod)
        assert "@handle_errors" in src, f"{mod.__name__} missing @handle_errors"
        assert "from app.middleware import handle_errors" in src, (
            f"{mod.__name__} missing import of handle_errors"
        )
