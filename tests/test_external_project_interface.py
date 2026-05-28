"""Smoke test for the ExternalProjectInterface contract (task d2146781)."""
from __future__ import annotations

import inspect

import pytest

from app.services.integrations import (
    ExternalProjectConfig,
    ExternalProjectInfo,
    ExternalProjectInterface,
)


def test_external_project_config_dataclass_shape():
    cfg = ExternalProjectConfig(base_url="https://example.com", api_key="k")
    assert cfg.base_url == "https://example.com"
    assert cfg.api_key == "k"
    assert cfg.workspace_id is None
    assert cfg.extra == {}


def test_external_project_info_dataclass_shape():
    info = ExternalProjectInfo(external_id="p1", name="P One")
    assert info.external_id == "p1"
    assert info.name == "P One"


def test_interface_declares_three_abstract_methods():
    methods = {
        name for name in dir(ExternalProjectInterface)
        if not name.startswith("_")
    }
    assert {"authenticate", "list_projects", "get_project_details"} <= methods

    # Each is async-compatible (a coroutine function on a concrete impl).
    for name in ("authenticate", "list_projects", "get_project_details"):
        method = getattr(ExternalProjectInterface, name)
        assert inspect.iscoroutinefunction(method), f"{name} should be async"


def test_interface_cannot_be_instantiated_directly():
    with pytest.raises(TypeError):
        ExternalProjectInterface()  # type: ignore[abstract]


def test_concrete_subclass_must_implement_all_methods():
    class HalfBaked(ExternalProjectInterface):
        async def authenticate(self, config):  # noqa: ANN001
            return True

    with pytest.raises(TypeError):
        HalfBaked()  # missing list_projects + get_project_details

    class Complete(ExternalProjectInterface):
        async def authenticate(self, config):  # noqa: ANN001
            return True

        async def list_projects(self, config):  # noqa: ANN001
            return []

        async def get_project_details(self, config, external_id):  # noqa: ANN001
            return None

    Complete()  # does not raise
