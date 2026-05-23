import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.integration_service import IntegrationService


@pytest.fixture
def integration_service():
    return IntegrationService()


class TestIntegrationService:
    """Tests for IntegrationService."""

    def test_service_initialization(self, integration_service):
        """Test that IntegrationService can be initialized."""
        assert integration_service is not None
        assert hasattr(integration_service, 'connect_service')
        assert hasattr(integration_service, 'disconnect_service')
        assert hasattr(integration_service, 'get_connected_services')
        assert hasattr(integration_service, 'sync_data')

    @pytest.mark.asyncio
    async def test_connect_service_success(self, integration_service):
        """Test successful service connection."""
        with patch.object(integration_service, '_save_connection', new_callable=AsyncMock) as mock_save:
            mock_connection = MagicMock()
            mock_connection.id = 1
            mock_connection.service_name = "google_calendar"
            mock_connection.user_id = 123
            mock_save.return_value = mock_connection

            result = await integration_service.connect_service(
                user_id=123,
                service_name="google_calendar",
                credentials={"access_token": "token123", "refresh_token": "refresh123"}
            )
            assert result is not None
            assert result.service_name == "google_calendar"

    @pytest.mark.asyncio
    async def test_connect_service_duplicate(self, integration_service):
        """Test connecting already connected service."""
        with patch.object(integration_service, '_get_existing_connection', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = MagicMock()
            with pytest.raises(ValueError, match="Service already connected"):
                await integration_service.connect_service(
                    user_id=123,
                    service_name="google_calendar",
                    credentials={}
                )

    @pytest.mark.asyncio
    async def test_disconnect_service(self, integration_service):
        """Test disconnecting a service."""
        with patch.object(integration_service, '_get_connection', new_callable=AsyncMock) as mock_get:
            mock_connection = MagicMock()
            mock_connection.user_id = 123
            mock_get.return_value = mock_connection

            with patch.object(integration_service, '_delete_connection', new_callable=AsyncMock) as mock_delete:
                mock_delete.return_value = True
                result = await integration_service.disconnect_service(
                    user_id=123,
                    connection_id=1
                )
                assert result is True

    @pytest.mark.asyncio
    async def test_disconnect_service_not_found(self, integration_service):
        """Test disconnecting non-existent service."""
        with patch.object(integration_service, '_get_connection', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = None
            result = await integration_service.disconnect_service(
                user_id=123,
                connection_id=999
            )
            assert result is False

    @pytest.mark.asyncio
    async def test_get_connected_services(self, integration_service):
        """Test retrieving connected services."""
        with patch.object(integration_service, '_get_connections_for_user', new_callable=AsyncMock) as mock_get:
            mock_connections = [
                MagicMock(service_name="google_calendar"),
                MagicMock(service_name="github"),
                MagicMock(service_name="slack")
            ]
            mock_get.return_value = mock_connections

            result = await integration_service.get_connected_services(user_id=123)
            assert len(result) == 3
            assert result[0].service_name == "google_calendar"

    @pytest.mark.asyncio
    async def test_get_connected_services_empty(self, integration_service):
        """Test retrieving connected services when none exist."""
        with patch.object(integration_service, '_get_connections_for_user', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = []
            result = await integration_service.get_connected_services(user_id=999)
            assert len(result) == 0

    @pytest.mark.asyncio
    async def test_sync_data_success(self, integration_service):
        """Test successful data synchronization."""
        with patch.object(integration_service, '_get_connection', new_callable=AsyncMock) as mock_get:
            mock_connection = MagicMock()
            mock_connection.service_name = "google_calendar"
            mock_connection.user_id = 123
            mock_get.return_value = mock_connection

            with patch.object(integration_service, '_sync_with_service', new_callable=AsyncMock) as mock_sync:
                mock_sync.return_value = {"synced_items": 10, "status": "success"}
                result = await integration_service.sync_data(
                    user_id=123,
                    connection_id=1
                )
                assert result["status"] == "success"
                assert result["synced_items"] == 10

    @pytest.mark.asyncio
    async def test_sync_data_connection_lost(self, integration_service):
        """Test sync when connection is lost."""
        with patch.object(integration_service, '_get_connection', new_callable=AsyncMock) as mock_get:
            mock_connection = MagicMock()
            mock_connection.service_name = "google_calendar"
            mock_connection.user_id = 123
            mock_get.return_value = mock_connection

            with patch.object(integration_service, '_sync_with_service', new_callable=AsyncMock) as mock_sync:
                mock_sync.side_effect = Exception("Connection lost")
                with pytest.raises(Exception, match="Sync failed"):
                    await integration_service.sync_data(
                        user_id=123,
                        connection_id=1
                    )

    @pytest.mark.asyncio
    async def test_sync_data_unauthorized(self, integration_service):
        """Test sync with unauthorized access."""
        with patch.object(integration_service, '_get_connection', new_callable=AsyncMock) as mock_get:
            mock_connection = MagicMock()
            mock_connection.user_id = 456
            mock_get.return_value = mock_connection

            with pytest.raises(PermissionError, match="Unauthorized access to connection"):
                await integration_service.sync_data(
                    user_id=123,
                    connection_id=1
                )
