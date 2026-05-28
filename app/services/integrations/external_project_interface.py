"""Abstract interface for external project-management integrations
(audit task d2146781).

Concrete adapters (Jira, Linear, Asana, GitHub Projects, ...) live
beside this file and implement ``ExternalProjectInterface``. The
service layer talks to the interface, never to a concrete adapter.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class ExternalProjectConfig:
    """Per-integration configuration. ``api_key`` is encrypted at rest;
    the adapter only ever sees the decrypted value at use-time."""

    base_url: str
    api_key: str
    workspace_id: Optional[str] = None
    extra: dict = field(default_factory=dict)


@dataclass
class ExternalProjectInfo:
    """Minimal view of a project the user has access to in the
    external system. Adapters return a list of these from
    ``list_projects``; the service layer turns them into ``Project``
    rows on demand."""

    external_id: str
    name: str
    url: Optional[str] = None
    status: Optional[str] = None
    extra: dict = field(default_factory=dict)


class ExternalProjectInterface(ABC):
    """Adapter contract."""

    @abstractmethod
    async def authenticate(self, config: ExternalProjectConfig) -> bool:
        """Validate the credentials. Return True on success."""

    @abstractmethod
    async def list_projects(
        self, config: ExternalProjectConfig
    ) -> List[ExternalProjectInfo]:
        """Enumerate every project the configured account can see."""

    @abstractmethod
    async def get_project_details(
        self, config: ExternalProjectConfig, external_id: str
    ) -> Optional[ExternalProjectInfo]:
        """Return one project by its external id, or None if missing."""
