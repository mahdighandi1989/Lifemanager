"""Aggregate model imports.

Listing every model here keeps SQLAlchemy's metadata registry populated
before `Base.metadata.create_all()` runs at startup. Tools that do
`from app.models import X` also get a single import surface.
"""
from app.models.ai_model_config import AIModelConfig
from app.models.integration import Integration
from app.models.local_file_entry import LocalFileEntry
from app.models.notification import Notification
from app.models.project import Project
from app.models.self_improvement import (
    SelfImprovementCheckIn,
    UserProfileAnalytics,
)
from app.models.task import Task
from app.models.todo_item import TodoItem
from app.models.todo_list import TodoList, todo_list_items
from app.models.user import User
from app.models.user_oauth import OAuthUser
from app.models.webhook_event import WebhookEvent

__all__ = [
    "AIModelConfig",
    "Integration",
    "LocalFileEntry",
    "Notification",
    "OAuthUser",
    "Project",
    "SelfImprovementCheckIn",
    "Task",
    "TodoItem",
    "TodoList",
    "User",
    "UserProfileAnalytics",
    "WebhookEvent",
    "todo_list_items",
]
