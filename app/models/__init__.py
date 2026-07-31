"""Aggregate model imports.

Listing every model here keeps SQLAlchemy's metadata registry populated
before `Base.metadata.create_all()` runs at startup. Tools that do
`from app.models import X` also get a single import surface.
"""
from app.models.activity_log import ActivityLog
from app.models.attention_mark import AttentionMark
from app.models.ai_model_config import AIModelConfig
from app.models.ai_provider import AIProvider, GlobalAnalysisPrompt
from app.models.ai_usage import AIUsageLog
from app.models.ai_catalog import AICatalogModel, AICatalogProvider, AITaskRoute
from app.models.import_job import ImportJob
from app.models.clarification import Clarification
from app.models.inbox_item import InboxItem
from app.models.analysis_prompt import AnalysisPrompt
from app.models.external_project import ExternalProject, ExternalProjectConnection
from app.models.oversight_task import OversightTask
from app.models.drive_file import DriveFile
from app.models.user_asset import UserAsset
from app.models.person_task import person_tasks  # noqa: F401  (association table)
from app.models.indexed_data_source_entry import IndexedDataSourceEntry
from app.models.finance import Asset, BudgetPlan, FinancialAccount, Income, Transaction
from app.models.subscription_account import SubscriptionAccount
from app.models.identity_document import IdentityDocument
from app.models.identity_fact import IdentityFact
from app.models.bank_account import BankShareSheetAccount
from app.models.uae_license import UAEDrivingLicenseRecord
from app.models.rta_account import RTAAccount
from app.models.neteller_wallet import NetellerWalletSnapshot
from app.models.context import UserContext
from app.models.global_setting import GlobalSetting
from app.models.recommendation import ContextualRecommendation
from app.models.integration import Integration
from app.models.local_file_entry import LocalFileEntry
from app.models.notification import Notification
from app.models.person import Person
from app.models.person_profile import PersonProfile
from app.models.interaction import Interaction, InteractionType
from app.models.ai_assessment import AIAssessment
from app.models.ai_feedback import AIFeedback
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
from app.models.user_interest import UserInterest
from app.models.user_taste import UserTaste
from app.models.personality import PersonalityAssessment, PersonalityTrait
from app.models.user_oauth import OAuthUser
from app.models.brain import BrainUpload
from app.models.personal_writing import PersonalWriting
from app.models.directive import Directive, DirectiveCheckin
from app.models.sahat_thread import SahatThread
from app.models.webhook_event import WebhookEvent
from app.models.weekly_review import WeeklyReview
from app.models.personal_sync import PersonalEmail, PersonalEvent
from app.models.dev_sync import (
    DevErrorIssue,
    DevIntegration,
    DevLog,
    DevLogSummary,
    DevProject,
    DevService,
)

__all__ = [
    "ActivityLog",
    "AttentionMark",
    "AIModelConfig",
    "AIProvider",
    "AIUsageLog",
    "AICatalogProvider",
    "AICatalogModel",
    "AITaskRoute",
    "ImportJob",
    "Clarification",
    "InboxItem",
    "AnalysisPrompt",
    "ExternalProject",
    "ExternalProjectConnection",
    "OversightTask",
    "Asset",
    "BudgetPlan",
    "ContextualRecommendation",
    "FinancialAccount",
    "SubscriptionAccount",
    "IdentityDocument",
    "IdentityFact",
    "BankShareSheetAccount",
    "UAEDrivingLicenseRecord",
    "RTAAccount",
    "NetellerWalletSnapshot",
    "GlobalAnalysisPrompt",
    "GlobalSetting",
    "Income",
    "Transaction",
    "UserContext",
    "Integration",
    "LocalFileEntry",
    "Notification",
    "Person",
    "PersonProfile",
    "Interaction",
    "InteractionType",
    "AIAssessment",
    "AIFeedback",
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
    "UserInterest",
    "UserTaste",
    "PersonalityAssessment",
    "PersonalityTrait",
    "UserProfileAnalytics",
    "BrainUpload",
    "PersonalWriting",
    "Directive",
    "DirectiveCheckin",
    "WebhookEvent",
    "WeeklyReview",
    "PersonalEmail",
    "PersonalEvent",
    "DevErrorIssue",
    "DevIntegration",
    "DevProject",
    "DevService",
    "DevLog",
    "DevLogSummary",
    "todo_list_items",
]
