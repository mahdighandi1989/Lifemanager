"""AssetToTaskLinker — surface scanned assets that match a user's tasks.

Audit task 217909d2, AC6: if the user has a task like "تماشای فیلم Inception"
and an asset ``Inception.mp4`` was scanned, the linker produces a pointer so
the UI can show "you already have this file". Pure name-matching — no DB or OS
access — so it is trivially testable against plain task/asset objects.
"""
from __future__ import annotations

from typing import Any, Iterable


class AssetToTaskLinker:
    @staticmethod
    def _asset_stem(name: str) -> str:
        # Drop a trailing extension ("Inception.mp4" -> "inception").
        base = name.rsplit("/", 1)[-1]
        if "." in base:
            base = base.rsplit(".", 1)[0]
        return base.strip().lower()

    def link(self, tasks: Iterable[Any], assets: Iterable[Any]) -> list[dict]:
        """Return one link per (task, asset) pair whose asset name (sans
        extension) appears in the task title (case-insensitive)."""
        assets = list(assets)
        links: list[dict] = []
        for task in tasks:
            title = (getattr(task, "title", None) or "").lower()
            if not title:
                continue
            for asset in assets:
                name = getattr(asset, "name", None) or ""
                stem = self._asset_stem(name)
                if stem and stem in title:
                    links.append(
                        {
                            "task_id": getattr(task, "id", None),
                            "task_title": getattr(task, "title", None),
                            "asset_id": getattr(asset, "id", None),
                            "asset_name": name,
                        }
                    )
        return links
