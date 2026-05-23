import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.auth_service import AuthService


@pytest.fixture
def auth_service():
    return AuthService()


class TestAuthService:
    """Tests for AuthService."""

    def test_service_initialization(self, auth_service):
        """Test that AuthService can be initialized."""
        assert auth_service is not None
        assert hasattr(auth_service, 'authenticate')
        assert hasattr(auth_service, 'create_user')

    @pytest.mark.asyncio
    async def test_authenticate_success(self, auth_service):
        """Test successful authentication."""
        with patch.object(auth_service, '_get_user_by_email', new_callable=AsyncMock) as mock_get_user:
            mock_user = MagicMock()
            mock_user.email = "test@example.com"
            mock_user.password_hash = "$2b$12$LJ3m4ys3Lk0TSwHn9s8XoO"
            mock_get_user.return_value = mock_user

            with patch.object(auth_service, '_verify_password') as mock_verify:
                mock_verify.return_value = True
                result = await auth_service.authenticate("test@example.com", "password123")
                assert result is not None
                assert result.email == "test@example.com"

    @pytest.mark.asyncio
    async def test_authenticate_invalid_credentials(self, auth_service):
        """Test authentication with invalid credentials."""
        with patch.object(auth_service, '_get_user_by_email', new_callable=AsyncMock) as mock_get_user:
            mock_get_user.return_value = None
            result = await auth_service.authenticate("invalid@example.com", "wrongpassword")
            assert result is None

    @pytest.mark.asyncio
    async def test_create_user_success(self, auth_service):
        """Test successful user creation."""
        with patch.object(auth_service, '_hash_password') as mock_hash:
            mock_hash.return_value = "$2b$12$hashedpassword"
            with patch.object(auth_service, '_save_user', new_callable=AsyncMock) as mock_save:
                mock_user = MagicMock()
                mock_user.id = 1
                mock_user.email = "new@example.com"
                mock_save.return_value = mock_user

                result = await auth_service.create_user("new@example.com", "securepassword")
                assert result is not None
                assert result.email == "new@example.com"

    @pytest.mark.asyncio
    async def test_create_user_duplicate_email(self, auth_service):
        """Test user creation with duplicate email."""
        with patch.object(auth_service, '_get_user_by_email', new_callable=AsyncMock) as mock_get_user:
            mock_get_user.return_value = MagicMock()
            with pytest.raises(ValueError, match="Email already exists"):
                await auth_service.create_user("existing@example.com", "password123")

    def test_password_hashing(self, auth_service):
        """Test password hashing and verification."""
        password = "my_secret_password"
        hashed = auth_service._hash_password(password)
        assert hashed != password
        assert auth_service._verify_password(password, hashed) is True
        assert auth_service._verify_password("wrong_password", hashed) is False
