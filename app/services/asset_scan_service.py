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
