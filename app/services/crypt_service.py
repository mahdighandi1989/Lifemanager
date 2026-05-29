"""Crypto helpers — password hashing + Fernet encryption-at-rest.

Audit task 3b90d409 (Step 2): an early automated scan flagged this module as an
"orphan"/dead-code candidate. That verdict is STALE — it is actively imported
and NOT dead. Current consumers (do not delete):

  * ``app/services/external_project_service.py`` — ``encrypt_data`` /
    ``decrypt_data`` so an external-PM API token is encrypted before it ever
    hits the DB (audit task d2146781).
  * ``app/routes/oversight.py`` — encrypts the connection token at rest.
  * ``tests/test_services.py::test_crypt_service_has_no_dead_encrypt_function``
    pins the module's surface.

Surface: ``hash_password`` / ``verify_password`` (bcrypt via passlib),
``get_fernet_key`` / ``generate_key`` / ``encrypt_data`` / ``decrypt_data``
(Fernet), ``generate_api_key`` / ``hash_api_key``.
"""
from passlib.context import CryptContext
from cryptography.fernet import Fernet
from typing import Optional
import base64
import os

# Dead-code removal marker: the legacy sha256-based password helper that
# used to live here was removed because all password storage now goes
# through `hash_password` below (bcrypt via passlib). Do NOT reintroduce
# a sha256 password wrapper — sha256 is not appropriate for passwords.
# Marker: removed-encrypt-password (dead code).

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

def generate_key() -> str:
    """Return a fresh, random Fernet key as a urlsafe-base64 ``str``.

    Each call yields a unique key (``Fernet.generate_key`` draws from
    ``os.urandom``). Returned as ``str`` so it round-trips cleanly through
    ``encrypt_data``/``decrypt_data``'s ``secret`` parameter, which derives
    its Fernet key from the string via :func:`get_fernet_key`.
    """
    return Fernet.generate_key().decode()


def encrypt_data(data: str, secret: Optional[str] = None) -> str:
    """Encrypt a string using Fernet symmetric encryption."""
    if not isinstance(data, str):
        # Fernet operates on bytes; encoding ``None``/non-str would raise an
        # opaque AttributeError. Surface a clear TypeError instead so callers
        # get an actionable contract violation.
        raise TypeError("encrypt_data() expects `data` to be a str")
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
