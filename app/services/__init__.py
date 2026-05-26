"""Service-layer package.

Hosts the ``StorageBackend`` abstraction and its concrete
implementations (``LocalStorage`` for the filesystem, ``S3Storage`` for
AWS S3). The backend used at runtime is chosen by the
``STORAGE_BACKEND`` env var:

    STORAGE_BACKEND=local  → LocalStorage  (default; writes under uploads/)
    STORAGE_BACKEND=s3     → S3Storage     (requires STORAGE_S3_BUCKET +
                                              standard AWS_* env vars)

Callers should use ``get_storage_backend()`` instead of instantiating a
backend directly — it reads the env var and caches the singleton.
"""
from __future__ import annotations

import logging
import os
from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO, Optional, Union

logger = logging.getLogger(__name__)


class StorageBackend(ABC):
    """Interface every storage backend must implement.

    Both methods are sync for simplicity — the file IO happens inline
    on the request. Wrap in ``run_in_threadpool`` if you need to keep
    the event loop free for large uploads.
    """

    @abstractmethod
    def upload(self, key: str, data: Union[bytes, BinaryIO]) -> str:
        """Persist ``data`` under ``key`` and return the canonical path/URL."""

    @abstractmethod
    def download(self, key: str) -> bytes:
        """Read the bytes previously stored under ``key``."""

    @abstractmethod
    def exists(self, key: str) -> bool:
        """True iff a value is currently stored under ``key``."""

    @abstractmethod
    def delete(self, key: str) -> bool:
        """Remove ``key`` from the backing store. Returns True on success."""


class LocalStorage(StorageBackend):
    """Filesystem-backed storage.

    Files live under ``base_dir`` (defaults to env ``STORAGE_LOCAL_DIR``
    or ``./uploads``). ``key`` is used as a relative path; subdirectories
    are created on demand.
    """

    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = Path(
            base_dir
            or os.environ.get("STORAGE_LOCAL_DIR")
            or "./uploads"
        ).resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _path(self, key: str) -> Path:
        # Reject path-traversal attempts — `key` is user-controlled.
        target = (self.base_dir / key).resolve()
        if self.base_dir not in target.parents and target != self.base_dir:
            raise ValueError(f"refusing to write outside base_dir: {key!r}")
        target.parent.mkdir(parents=True, exist_ok=True)
        return target

    def upload(self, key: str, data: Union[bytes, BinaryIO]) -> str:
        target = self._path(key)
        if isinstance(data, (bytes, bytearray)):
            target.write_bytes(bytes(data))
        else:
            target.write_bytes(data.read())
        return str(target)

    def download(self, key: str) -> bytes:
        return self._path(key).read_bytes()

    def exists(self, key: str) -> bool:
        try:
            return self._path(key).exists()
        except ValueError:
            return False

    def delete(self, key: str) -> bool:
        try:
            self._path(key).unlink()
            return True
        except FileNotFoundError:
            return False


class S3Storage(StorageBackend):
    """AWS S3-backed storage. Lazy-imports boto3 so installs that don't
    use S3 don't have to ship the dependency.

    Reads ``STORAGE_S3_BUCKET`` from the env at construction time; AWS
    credentials follow the standard boto3 resolution chain (env vars,
    instance profile, ~/.aws/credentials).
    """

    def __init__(self, bucket: Optional[str] = None):
        self.bucket = bucket or os.environ.get("STORAGE_S3_BUCKET")
        if not self.bucket:
            raise RuntimeError(
                "S3Storage requires STORAGE_S3_BUCKET (or bucket=... arg)"
            )

    def _client(self):
        # Lazy import keeps boto3 optional. Tests that exercise S3
        # logic monkeypatch this method to return a Stubber.
        import boto3  # type: ignore[import-not-found]

        return boto3.client("s3")

    def upload(self, key: str, data: Union[bytes, BinaryIO]) -> str:
        body = bytes(data) if isinstance(data, (bytes, bytearray)) else data.read()
        self._client().put_object(Bucket=self.bucket, Key=key, Body=body)
        return f"s3://{self.bucket}/{key}"

    def download(self, key: str) -> bytes:
        obj = self._client().get_object(Bucket=self.bucket, Key=key)
        return obj["Body"].read()

    def exists(self, key: str) -> bool:
        try:
            self._client().head_object(Bucket=self.bucket, Key=key)
            return True
        except Exception:
            return False

    def delete(self, key: str) -> bool:
        try:
            self._client().delete_object(Bucket=self.bucket, Key=key)
            return True
        except Exception:
            return False


# Singleton resolution. STORAGE_BACKEND is the env var that selects
# which concrete class is used at runtime; LocalStorage is the safe
# default for dev / test.
_BACKEND_INSTANCE: Optional[StorageBackend] = None


def get_storage_backend(refresh: bool = False) -> StorageBackend:
    """Return the configured StorageBackend singleton.

    Reads ``STORAGE_BACKEND`` from the environment (`local` / `s3`).
    Pass ``refresh=True`` in tests to force a fresh lookup after
    monkey-patching the env var.
    """
    global _BACKEND_INSTANCE
    if _BACKEND_INSTANCE is not None and not refresh:
        return _BACKEND_INSTANCE

    choice = os.getenv("STORAGE_BACKEND", "local").lower().strip()
    if choice == "s3":
        _BACKEND_INSTANCE = S3Storage()
    elif choice == "local":
        _BACKEND_INSTANCE = LocalStorage()
    else:
        logger.warning(
            "unknown STORAGE_BACKEND=%r, falling back to local", choice
        )
        _BACKEND_INSTANCE = LocalStorage()
    return _BACKEND_INSTANCE


__all__ = [
    "LocalStorage",
    "S3Storage",
    "StorageBackend",
    "get_storage_backend",
]
