import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timedelta

from app.services.planner_service import PlannerService


@pytest.fixture
def planner_service():
    return PlannerService()


class TestPlannerService:
    """Tests for PlannerService."""

    def test_service_initialization(self, planner_service):
        """Test that PlannerService can be initialized."""
        assert planner_service is not None
        assert hasattr(planner_service, 'create_plan')
        assert hasattr(planner_service, 'get_plan')
        assert hasattr(planner_service, 'update_plan')
        assert hasattr(planner_service, 'delete_plan')

    @pytest.mark.asyncio
    async def test_create_plan_success(self, planner_service):
        """Test successful plan creation."""
        with patch.object(planner_service, '_save_plan', new_callable=AsyncMock) as mock_save:
            mock_plan = MagicMock()
            mock_plan.id = 1
            mock_plan.title = "Test Plan"
            mock_plan.user_id = 123
            mock_save.return_value = mock_plan

            result = await planner_service.create_plan(
                user_id=123,
                title="Test Plan",
                description="A test plan",
                start_date=datetime.now(),
                end_date=datetime.now() + timedelta(days=7)
            )
            assert result is not None
            assert result.title == "Test Plan"
            assert result.user_id == 123

    @pytest.mark.asyncio
    async def test_create_plan_invalid_dates(self, planner_service):
        """Test plan creation with invalid date range."""
        with pytest.raises(ValueError, match="End date must be after start date"):
            await planner_service.create_plan(
                user_id=123,
                title="Invalid Plan",
                description="Test",
                start_date=datetime.now(),
                end_date=datetime.now() - timedelta(days=1)
            )

    @pytest.mark.asyncio
    async def test_get_plan(self, planner_service):
        """Test retrieving a plan."""
        with patch.object(planner_service, '_get_plan_by_id', new_callable=AsyncMock) as mock_get:
            mock_plan = MagicMock()
            mock_plan.id = 1
            mock_plan.user_id = 123
            mock_get.return_value = mock_plan

            result = await planner_service.get_plan(plan_id=1, user_id=123)
            assert result is not None
            assert result.id == 1

    @pytest.mark.asyncio
    async def test_get_plan_not_found(self, planner_service):
        """Test retrieving non-existent plan."""
        with patch.object(planner_service, '_get_plan_by_id', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = None
            result = await planner_service.get_plan(plan_id=999, user_id=123)
            assert result is None

    @pytest.mark.asyncio
    async def test_get_plan_unauthorized(self, planner_service):
        """Test retrieving plan belonging to another user."""
        with patch.object(planner_service, '_get_plan_by_id', new_callable=AsyncMock) as mock_get:
            mock_plan = MagicMock()
            mock_plan.user_id = 456
            mock_get.return_value = mock_plan

            result = await planner_service.get_plan(plan_id=1, user_id=123)
            assert result is None

    @pytest.mark.asyncio
    async def test_update_plan(self, planner_service):
        """Test updating a plan."""
        with patch.object(planner_service, '_get_plan_by_id', new_callable=AsyncMock) as mock_get:
            mock_plan = MagicMock()
            mock_plan.user_id = 123
            mock_get.return_value = mock_plan

            with patch.object(planner_service, '_update_plan_in_db', new_callable=AsyncMock) as mock_update:
                mock_update.return_value = MagicMock(title="Updated Plan")
                result = await planner_service.update_plan(
                    plan_id=1,
                    user_id=123,
                    title="Updated Plan"
                )
                assert result.title == "Updated Plan"

    @pytest.mark.asyncio
    async def test_delete_plan(self, planner_service):
        """Test deleting a plan."""
        with patch.object(planner_service, '_get_plan_by_id', new_callable=AsyncMock) as mock_get:
            mock_plan = MagicMock()
            mock_plan.user_id = 123
            mock_get.return_value = mock_plan

            with patch.object(planner_service, '_delete_plan_from_db', new_callable=AsyncMock) as mock_delete:
                mock_delete.return_value = True
                result = await planner_service.delete_plan(plan_id=1, user_id=123)
                assert result is True

    @pytest.mark.asyncio
    async def test_delete_plan_not_found(self, planner_service):
        """Test deleting non-existent plan."""
        with patch.object(planner_service, '_get_plan_by_id', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = None
            result = await planner_service.delete_plan(plan_id=999, user_id=123)
            assert result is False

    @pytest.mark.asyncio
    async def test_get_user_plans(self, planner_service):
        """Test retrieving all plans for a user."""
        with patch.object(planner_service, '_get_plans_for_user', new_callable=AsyncMock) as mock_get:
            mock_plans = [MagicMock() for _ in range(5)]
            mock_get.return_value = mock_plans

            result = await planner_service.get_user_plans(user_id=123)
            assert len(result) == 5
