import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.notification_service import NotificationService


@pytest.fixture
def notification_service():
    return NotificationService()


class TestNotificationService:
    """Tests for NotificationService."""

    def test_service_initialization(self, notification_service):
        """Test that NotificationService can be initialized."""
        assert notification_service is not None
        assert hasattr(notification_service, 'send_notification')
        assert hasattr(notification_service, 'get_user_notifications')
        assert hasattr(notification_service, 'mark_as_read')

    @pytest.mark.asyncio
    async def test_send_notification_success(self, notification_service):
        """Test successful notification sending."""
        with patch.object(notification_service, '_save_notification', new_callable=AsyncMock) as mock_save:
            mock_notification = MagicMock()
            mock_notification.id = 1
            mock_notification.user_id = 123
            mock_notification.message = "Test notification"
            mock_save.return_value = mock_notification

            result = await notification_service.send_notification(
                user_id=123,
                message="Test notification",
                notification_type="info"
            )
            assert result is not None
            assert result.user_id == 123
            assert result.message == "Test notification"

    @pytest.mark.asyncio
    async def test_send_notification_with_email(self, notification_service):
        """Test notification sending with email delivery."""
        with patch.object(notification_service, '_save_notification', new_callable=AsyncMock) as mock_save:
            mock_save.return_value = MagicMock()
            with patch.object(notification_service, '_send_email', new_callable=AsyncMock) as mock_email:
                mock_email.return_value = True
                result = await notification_service.send_notification(
                    user_id=123,
                    message="Email notification",
                    notification_type="email",
                    email="user@example.com"
                )
                assert result is not None
                mock_email.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_user_notifications(self, notification_service):
        """Test retrieving user notifications."""
        with patch.object(notification_service, '_get_notifications_for_user', new_callable=AsyncMock) as mock_get:
            mock_notifications = [MagicMock() for _ in range(3)]
            mock_get.return_value = mock_notifications

            result = await notification_service.get_user_notifications(user_id=123)
            assert len(result) == 3

    @pytest.mark.asyncio
    async def test_get_user_notifications_empty(self, notification_service):
        """Test retrieving notifications for user with none."""
        with patch.object(notification_service, '_get_notifications_for_user', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = []
            result = await notification_service.get_user_notifications(user_id=999)
            assert len(result) == 0

    @pytest.mark.asyncio
    async def test_mark_as_read(self, notification_service):
        """Test marking notification as read."""
        with patch.object(notification_service, '_update_notification_status', new_callable=AsyncMock) as mock_update:
            mock_update.return_value = True
            result = await notification_service.mark_as_read(notification_id=1, user_id=123)
            assert result is True

    @pytest.mark.asyncio
    async def test_mark_as_read_not_found(self, notification_service):
        """Test marking non-existent notification as read."""
        with patch.object(notification_service, '_update_notification_status', new_callable=AsyncMock) as mock_update:
            mock_update.return_value = False
            result = await notification_service.mark_as_read(notification_id=999, user_id=123)
            assert result is False

    @pytest.mark.asyncio
    async def test_send_notification_invalid_type(self, notification_service):
        """Test sending notification with invalid type."""
        with pytest.raises(ValueError, match="Invalid notification type"):
            await notification_service.send_notification(
                user_id=123,
                message="Test",
                notification_type="invalid_type"
            )
