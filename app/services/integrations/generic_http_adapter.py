"""Generic HTTP adapter for external PM systems (audit task d2146781).

A concrete ``ExternalProjectInterface`` that talks to any REST PM API exposing a
JSON list of projects at ``<base_url>/projects`` with a bearer token. Real
vendor adapters (Jira/Linear/Asana) can subclass/override the parsing; this
generic one makes ``fetch_project_data`` return real items the moment a
connection has a base_url + key, instead of an empty stub. Offline / bad creds
degrade to an empty list (never raises into the sync flow).
"""
from __future__ import annotations

from typing import List, Optional

from app.services.integrations.external_project_interface import (
    ExternalProjectConfig,
    ExternalProjectInfo,
    ExternalProjectInterface,
)


class GenericHttpAdapter(ExternalProjectInterface):
    async def authenticate(self, config: ExternalProjectConfig) -> bool:
        return bool(config.base_url and config.api_key)

    async def list_projects(self, config: ExternalProjectConfig) -> List[ExternalProjectInfo]:
        import httpx

        url = config.base_url.rstrip("/") + "/projects"
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(url, headers={"Authorization": f"Bearer {config.api_key}"})
            resp.raise_for_status()
            data = resp.json()
        items = data.get("projects", data) if isinstance(data, dict) else data
        out: List[ExternalProjectInfo] = []
        for it in items or []:
            out.append(
                ExternalProjectInfo(
                    external_id=str(it.get("id") or it.get("external_id") or ""),
                    name=it.get("name") or it.get("title") or "untitled",
                    url=it.get("url"),
                    status=it.get("status"),
                )
            )
        return out

    async def get_project_details(
        self, config: ExternalProjectConfig, external_id: str
    ) -> Optional[ExternalProjectInfo]:
        for p in await self.list_projects(config):
            if p.external_id == external_id:
                return p
        return None
