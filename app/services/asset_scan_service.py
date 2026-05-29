"""Asset scanner (audit task 217909d2, AC2).

Walks a server-side directory and classifies each file by extension so the
scan endpoint can persist UserAsset rows. Pure stdlib (os.walk) — safe and
testable against a temp dir.
"""
from __future__ import annotations

import os
from typing import List

_EXT_TYPE = {
    ".mp4": "movie", ".mkv": "movie", ".avi": "movie", ".mov": "movie",
    ".pdf": "book", ".epub": "book", ".mobi": "book",
    ".doc": "document", ".docx": "document", ".txt": "document", ".md": "document",
    ".mp3": "audio", ".wav": "audio", ".m4a": "audio",
    ".jpg": "image", ".jpeg": "image", ".png": "image",
}


def classify(filename: str) -> str:
    return _EXT_TYPE.get(os.path.splitext(filename)[1].lower(), "file")


# Mount roots where OSes surface removable/external media.
_EXTERNAL_MOUNT_ROOTS = ("/media", "/mnt", "/run/media", "/Volumes")


def detect_external_drives(_partitions_provider=None, mount_roots=None) -> List[str]:
    """Return mountpoints of connected external/removable drives (audit task
    217909d2 AC6 — "هر بار چیزی متصل شد ... داده‌هاش رو استخراج بکنه").

    Strategy, in order:
      1. ``_partitions_provider`` (injectable, for tests) or ``psutil`` if
         installed — keep partitions whose opts mark them removable or whose
         mountpoint lives under a known external root.
      2. No psutil → enumerate existing subdirectories of the external mount
         roots (/media, /mnt, /run/media, /Volumes).

    Never raises: a host without removable media (or without psutil) yields []
    rather than blowing up the scan flow.
    """
    roots = mount_roots or _EXTERNAL_MOUNT_ROOTS

    provider = _partitions_provider
    if provider is None:
        try:  # psutil is optional — absent on the test/runtime image
            import psutil  # type: ignore

            provider = psutil.disk_partitions
        except Exception:
            provider = None

    drives: List[str] = []
    if provider is not None:
        try:
            for part in provider(all=False) if _accepts_all(provider) else provider():
                opts = (getattr(part, "opts", "") or "").lower()
                mount = getattr(part, "mountpoint", "") or ""
                if "removable" in opts or any(mount.startswith(r) for r in roots):
                    if mount:
                        drives.append(mount)
        except Exception:
            pass

    if not drives:
        for root in roots:
            if os.path.isdir(root):
                try:
                    for name in os.listdir(root):
                        full = os.path.join(root, name)
                        if os.path.isdir(full):
                            drives.append(full)
                except OSError:
                    continue

    # de-dup, preserve order
    return list(dict.fromkeys(drives))


def _accepts_all(fn) -> bool:
    """True if ``fn`` takes an ``all`` kwarg (psutil.disk_partitions does)."""
    import inspect

    try:
        return "all" in inspect.signature(fn).parameters
    except (TypeError, ValueError):
        return False


def scan_directory(path: str, limit: int = 5000) -> List[dict]:
    """Return [{name, asset_type, path}] for files under ``path`` (capped at
    ``limit``). An empty/missing/inaccessible path yields an empty list rather
    than raising."""
    results: List[dict] = []
    if not path or not os.path.isdir(path):
        return results
    for root, _dirs, files in os.walk(path):
        for fname in files:
            results.append(
                {
                    "name": fname,
                    "asset_type": classify(fname),
                    "path": os.path.join(root, fname),
                }
            )
            if len(results) >= limit:
                return results
    return results
