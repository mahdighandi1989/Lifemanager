import pytest

from app.services.crypt_service import (
    hash_password,
    verify_password,
    encrypt_data,
    decrypt_data,
    generate_key,
)


class TestCryptService:
    """Tests for CryptService functions."""

    def test_password_hashing(self):
        """Test that password hashing works correctly."""
        password = "my_secret_password"
        hashed = hash_password(password)
        assert hashed != password
        assert verify_password(password, hashed) is True
        assert verify_password("wrong_password", hashed) is False

    def test_password_hashing_different_salts(self):
        """Test that same password produces different hashes each time."""
        password = "same_password"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        assert hash1 != hash2
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True

    def test_empty_password(self):
        """Test hashing of empty password."""
        hashed = hash_password("")
        assert verify_password("", hashed) is True
        assert verify_password("not_empty", hashed) is False

    def test_encrypt_decrypt_data(self):
        """Test data encryption and decryption."""
        key = generate_key()
        original_data = "sensitive information"
        encrypted = encrypt_data(original_data, key)
        assert encrypted != original_data
        decrypted = decrypt_data(encrypted, key)
        assert decrypted == original_data

    def test_encrypt_decrypt_with_different_key(self):
        """Test that decryption fails with wrong key."""
        key1 = generate_key()
        key2 = generate_key()
        original_data = "test data"
        encrypted = encrypt_data(original_data, key1)
        with pytest.raises(Exception):
            decrypt_data(encrypted, key2)

    def test_generate_key_uniqueness(self):
        """Test that generated keys are unique."""
        key1 = generate_key()
        key2 = generate_key()
        assert key1 != key2
        assert len(key1) > 0
        assert len(key2) > 0

    def test_encrypt_empty_string(self):
        """Test encryption of empty string."""
        key = generate_key()
        encrypted = encrypt_data("", key)
        decrypted = decrypt_data(encrypted, key)
        assert decrypted == ""

    def test_encrypt_none_data(self):
        """Test encryption with None data."""
        key = generate_key()
        with pytest.raises(TypeError):
            encrypt_data(None, key)
