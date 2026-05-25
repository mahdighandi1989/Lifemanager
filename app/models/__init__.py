"""Aggregate model imports.

Listing every model here keeps SQLAlchemy's metadata registry populated
before `Base.metadata.create_all()` runs at startup. Tools that do
`from app.models import X` also get a single import surface.
"""
from app.models.ai_model_config import AIModelConfig
from app.models.integration import Integration
from app.models.notification import Notification
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.models.user_oauth import OAuthUser
from app.models.webhook_event import WebhookEvent

__all__ = [
    "AIModelConfig",
    "Integration",
    "Notification",
    "OAuthUser",
    "Project",
    "Task",
    "User",
    "WebhookEvent",
]
