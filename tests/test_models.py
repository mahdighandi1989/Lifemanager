import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.user import User
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.project import Project
from app.models.notification import Notification, NotificationType
from app.models.ai_model_config import AIModelConfig


@pytest.fixture(scope="module")
def db_session():
    """Create an in-memory SQLite database for testing."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


def test_user_model_attributes(db_session):
    """Test User model creation and default attributes."""
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password="hashed_pass_123"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    assert user.id is not None
    assert user.email == "test@example.com"
    assert user.username == "testuser"
    assert user.hashed_password == "hashed_pass_123"
    assert user.is_active is True
    assert user.is_superuser is False
    assert user.created_at is not None
    # updated_at should be None initially (no onupdate trigger yet)
    assert user.updated_at is None


def test_user_model_unique_constraints(db_session):
    """Test that unique constraints on email and username are enforced."""
    user1 = User(
        email="unique@example.com",
        username="uniqueuser",
        hashed_password="pass1"
    )
    db_session.add(user1)
    db_session.commit()

    # Duplicate email should fail
    user2 = User(
        email="unique@example.com",
        username="otheruser",
        hashed_password="pass2"
    )
    db_session.add(user2)
    with pytest.raises(Exception):
        db_session.commit()
    db_session.rollback()

    # Duplicate username should fail
    user3 = User(
        email="other@example.com",
        username="uniqueuser",
        hashed_password="pass3"
    )
    db_session.add(user3)
    with pytest.raises(Exception):
        db_session.commit()
    db_session.rollback()


def test_user_model_nullable_fields(db_session):
    """Test that nullable=False fields raise errors when omitted."""
    with pytest.raises(Exception):
        user = User(
            email=None,  # type: ignore
            username="testuser",
            hashed_password="pass"
        )
        db_session.add(user)
        db_session.commit()
    db_session.rollback()

    with pytest.raises(Exception):
        user = User(
            email="test@example.com",
            username=None,  # type: ignore
            hashed_password="pass"
        )
        db_session.add(user)
        db_session.commit()
    db_session.rollback()

    with pytest.raises(Exception):
        user = User(
            email="test@example.com",
            username="testuser",
            hashed_password=None  # type: ignore
        )
        db_session.add(user)
        db_session.commit()
    db_session.rollback()


def test_task_model_attributes(db_session):
    """Test Task model creation with all fields."""
    # First create a user for the foreign key
    user = User(
        email="taskuser@example.com",
        username="taskuser",
        hashed_password="pass"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    task = Task(
        title="Test Task",
        description="A test task description",
        status=TaskStatus.TODO,
        priority=TaskPriority.MEDIUM,
        user_id=user.id
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)

    assert task.id is not None
    assert task.title == "Test Task"
    assert task.description == "A test task description"
    assert task.status == TaskStatus.TODO
    assert task.priority == TaskPriority.MEDIUM
    assert task.user_id == user.id
    assert task.created_at is not None


def test_task_model_enum_values(db_session):
    """Test TaskStatus and TaskPriority enum values."""
    user = User(
        email="enumuser@example.com",
        username="enumuser",
        hashed_password="pass"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Test all status values
    for status in TaskStatus:
        task = Task(
            title=f"Task {status.value}",
            status=status,
            priority=TaskPriority.LOW,
            user_id=user.id
        )
        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)
        assert task.status == status

    # Test all priority values
    for priority in TaskPriority:
        task = Task(
            title=f"Task {priority.value}",
            status=TaskStatus.TODO,
            priority=priority,
            user_id=user.id
        )
        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)
        assert task.priority == priority


def test_task_model_required_fields(db_session):
    """Test that required fields (title, user_id) raise errors when omitted."""
    user = User(
        email="requireduser@example.com",
        username="requireduser",
        hashed_password="pass"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Missing title still raises — title is nullable=False.
    with pytest.raises(Exception):
        task = Task(
            title=None,  # type: ignore
            user_id=user.id
        )
        db_session.add(task)
        db_session.commit()
    db_session.rollback()

    # user_id is intentionally nullable now (Task.user_id nullable=True —
    # "anonymous task creation is allowed today"; routes populate it). So a
    # task without a user must persist rather than raise.
    task = Task(title="Task without user", user_id=None)  # type: ignore
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)
    assert task.id is not None
    assert task.user_id is None


def test_project_model_attributes(db_session):
    """Test Project model creation."""
    user = User(
        email="projectuser@example.com",
        username="projectuser",
        hashed_password="pass"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    project = Project(
        name="Test Project",
        description="A test project",
        user_id=user.id
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    assert project.id is not None
    assert project.name == "Test Project"
    assert project.description == "A test project"
    assert project.user_id == user.id
    assert project.created_at is not None


def test_project_model_relationship(db_session):
    """Test the Project→User link.

    Project carries a `user_id` FK to users.id (no ORM back-reference is
    declared on the model). Verify the FK value resolves to the owning user.
    """
    user = User(
        email="reluser@example.com",
        username="reluser",
        hashed_password="pass"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    project = Project(
        name="Relationship Test",
        user_id=user.id
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    # The FK links back to the owning user.
    assert project.user_id == user.id
    linked = db_session.get(User, project.user_id)
    assert linked.email == "reluser@example.com"


def test_notification_model_attributes(db_session):
    """Test Notification model creation."""
    user = User(
        email="notifuser@example.com",
        username="notifuser",
        hashed_password="pass"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    notification = Notification(
        title="Test Notification",
        message="This is a test notification",
        type=NotificationType.SYSTEM,
        user_id=user.id
    )
    db_session.add(notification)
    db_session.commit()
    db_session.refresh(notification)

    assert notification.id is not None
    assert notification.title == "Test Notification"
    assert notification.message == "This is a test notification"
    assert notification.type == NotificationType.SYSTEM
    assert notification.user_id == user.id
    assert notification.is_read is False
    assert notification.created_at is not None


def test_notification_model_enum_values(db_session):
    """Test NotificationType enum values."""
    user = User(
        email="notifenum@example.com",
        username="notifenum",
        hashed_password="pass"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    for notif_type in NotificationType:
        notification = Notification(
            title=f"Notification {notif_type.value}",
            message=f"Message for {notif_type.value}",
            type=notif_type,
            user_id=user.id
        )
        db_session.add(notification)
        db_session.commit()
        db_session.refresh(notification)
        assert notification.type == notif_type


def test_ai_model_config_attributes(db_session):
    """Test AIModelConfig model creation."""
    config = AIModelConfig(
        name="gpt-4-attrs",
        model_name="gpt-4",
        provider="openai",
        parameters={"temperature": 0.7, "max_tokens": 2000},
        is_active=True
    )
    db_session.add(config)
    db_session.commit()
    db_session.refresh(config)

    assert config.id is not None
    assert config.model_name == "gpt-4"
    assert config.provider == "openai"
    assert config.parameters == {"temperature": 0.7, "max_tokens": 2000}
    assert config.is_active is True
    assert config.created_at is not None


def test_ai_model_config_json_field(db_session):
    """Test AIModelConfig JSON parameters field."""
    config = AIModelConfig(
        name="claude-3-json",
        model_name="claude-3",
        provider="anthropic",
        parameters={
            "temperature": 0.5,
            "max_tokens": 4096,
            "top_p": 0.9,
            "stop_sequences": ["\n\nHuman:", "\n\nAssistant:"]
        },
        is_active=True
    )
    db_session.add(config)
    db_session.commit()
    db_session.refresh(config)

    assert config.parameters["temperature"] == 0.5
    assert config.parameters["max_tokens"] == 4096
    assert config.parameters["top_p"] == 0.9
    assert len(config.parameters["stop_sequences"]) == 2


def test_ai_model_config_defaults(db_session):
    """Test AIModelConfig default values."""
    config = AIModelConfig(
        name="default-test-cfg",
        model_name="default-test",
        provider="test"
    )
    db_session.add(config)
    db_session.commit()
    db_session.refresh(config)

    assert config.is_active is True
    assert config.parameters == {}


def test_user_context_user_id_matches_user_id():
    """Coherence guard (audit task 42eab35f): UserContext.user_id is the
    integer FK to users.id, and AuthContext (frontend) surfaces that same
    integer `id`. This pins the cross-tier contract: a UserContext created
    with `user.id` round-trips and stays linked to the right user.

    Uses its own in-memory engine (not the shared module session) so the
    coherence guarantee is verified independently of sibling tests.
    """
    from app.models.context import UserContext

    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(bind=engine)
    session = sessionmaker(bind=engine)()
    try:
        user = User(
            email="ctxlink@example.com",
            username="ctxlink",
            hashed_password="hashed",
        )
        session.add(user)
        session.commit()
        session.refresh(user)

        # The frontend's `user.id` is exactly this integer primary key.
        assert isinstance(user.id, int)

        ctx = UserContext(user_id=user.id, activity_status="active")
        session.add(ctx)
        session.commit()
        session.refresh(ctx)

        # The FK stores the same integer the frontend sends back as user.id.
        assert ctx.user_id == user.id
        assert isinstance(ctx.user_id, int)
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


def test_user_context_user_id_is_integer_fk_to_users(db_session):
    """The `user_id` column must be an Integer FK pointing at `users.id`,
    so the frontend contract (`user.id` is a number) is the correct one —
    NOT a UUID/string. Verified against the SQLAlchemy column metadata.
    """
    from sqlalchemy import Integer

    from app.models.context import UserContext

    col = UserContext.__table__.c.user_id
    assert isinstance(col.type, Integer)
    fk = next(iter(col.foreign_keys))
    assert fk.column.table.name == "users"
    assert fk.column.name == "id"
