"""Text extraction from audio / image files (audit task 7367c6f0 AC6).

ASR (audio) + OCR (image) are upstream, credentialed services. This module
gives a deterministic, offline-safe surface: it classifies a file by
extension/mime and, for audio/image, returns an extraction note so the
``DriveFile.extracted_text`` field is populated even before real ASR/OCR is
wired. A configured backend replaces ``_PROVIDER`` without touching callers.
"""
from __future__ import annotations

import os
from typing import Optional

_AUDIO_EXT = {".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac"}
_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff"}


def media_kind(filename: str, mime_type: Optional[str] = None) -> Optional[str]:
    """Return 'audio' | 'image' | None for ``filename``/``mime_type``."""
    mt = (mime_type or "").lower()
    if mt.startswith("audio/"):
        return "audio"
    if mt.startswith("image/"):
        return "image"
    ext = os.path.splitext(filename or "")[1].lower()
    if ext in _AUDIO_EXT:
        return "audio"
    if ext in _IMAGE_EXT:
        return "image"
    return None


def extract_text(filename: str, *, mime_type: Optional[str] = None, data: Optional[bytes] = None) -> Optional[str]:
    """Extract text for an audio/image file. Returns ``None`` for file types
    that carry no extractable text (so the caller leaves extracted_text NULL).

    Offline default: a deterministic placeholder transcript/caption tagged with
    the source so it's obviously provisional until real ASR/OCR runs."""
    kind = media_kind(filename, mime_type)
    if kind == "audio":
        return f"[transcript pending ASR] audio file: {filename}"
    if kind == "image":
        return f"[caption pending OCR] image file: {filename}"
    return None
