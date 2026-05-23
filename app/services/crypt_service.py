from passlib.context import CryptContext
from cryptography.fernet import Fernet
from typing import Optional
import base64
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── Password hashing ──

def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)

# ── Symmetric encryption / decryption ──

def get_fernet_key(secret: Optional[str] = None) -> bytes:
    """
    Derive a Fernet-compatible key from a secret string.
    If no secret is provided, use a default (for dev only).
    """
    if secret:
        # Use the secret to generate a deterministic 32-byte key
        key = base64.urlsafe_b64encode(secret.encode().ljust(32)[:32])
    else:
        # Fallback: use environment variable or generate a new one
        key = os.environ.get("ENCRYPTION_KEY")
        if not key:
            key = Fernet.generate_key()
        else:
            key = key.encode()
    return key if isinstance(key, bytes) else key.encode()

def encrypt_data(data: str, secret: Optional[str] = None) -> str:
    """Encrypt a string using Fernet symmetric encryption."""
    key = get_fernet_key(secret)
    cipher = Fernet(key)
    encrypted = cipher.encrypt(data.encode())
    return encrypted.decode()

def decrypt_data(encrypted_data: str, secret: Optional[str] = None) -> str:
    """Decrypt a Fernet-encrypted string."""
    key = get_fernet_key(secret)
    cipher = Fernet(key)
    decrypted = cipher.decrypt(encrypted_data.encode())
    return decrypted.decode()

# ── Token / API key generation ──

def generate_api_key() -> str:
    """Generate a secure random API key."""
    return base64.urlsafe_b64encode(os.urandom(32)).decode()

def hash_api_key(api_key: str) -> str:
    """Hash an API key for secure storage (using SHA-256 via hashlib)."""
    import hashlib
    return hashlib.sha256(api_key.encode()).hexdigest()
