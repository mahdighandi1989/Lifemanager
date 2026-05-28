"""Aggregate model imports.

Listing every model here keeps SQLAlchemy's metadata registry populated
before `Base.metadata.create_all()` runs at startup. Tools that do
`from app.models import X` also get a single import surface.
"""
from app.models.ai_model_config import AIModelConfig
from app.models.ai_provider import AIProvider, GlobalAnalysisPrompt
from app.models.external_project import ExternalProject
from app.models.indexed_data_source_entry import IndexedDataSourceEntry
from app.models.finance import Asset, FinancialAccount, Income
from app.models.integration import Integration
from app.models.local_file_entry import LocalFileEntry
from app.models.notification import Notification
from app.models.person import Person
from app.models.interaction import Interaction, InteractionType
from app.models.ai_assessment import AIAssessment
from app.models.user_comment import UserComment
from app.models.behavior_log import BehaviorLog, BehaviorType
from app.models.user_location import UserLocation
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
    "AIProvider",
    "ExternalProject",
    "Asset",
    "FinancialAccount",
    "GlobalAnalysisPrompt",
    "Income",
    "Integration",
    "LocalFileEntry",
    "Notification",
    "Person",
    "Interaction",
    "InteractionType",
    "AIAssessment",
    "UserComment",
    "BehaviorLog",
    "BehaviorType",
    "UserLocation",
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
