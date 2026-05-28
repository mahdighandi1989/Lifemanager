"""Integration adapter package — concrete implementations of
``ExternalProjectInterface`` live next to it.
"""
from app.services.integrations.external_project_interface import (
    ExternalProjectConfig,
    ExternalProjectInfo,
    ExternalProjectInterface,
)

__all__ = [
    "ExternalProjectConfig",
    "ExternalProjectInfo",
    "ExternalProjectInterface",
]
