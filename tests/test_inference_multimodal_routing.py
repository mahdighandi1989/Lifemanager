"""complete_multimodal must route a file to the capability it actually needs
(audio/video → 'audio', PDF → 'documents', image → 'vision') so resolution picks
ANY enabled model carrying that capability — not a hard-coded provider."""
from __future__ import annotations

import pytest

from app.services.ai import inference_gateway as gw
from app.services.ai.manager import ai_manager

pytestmark = pytest.mark.asyncio


def _patch_capture(monkeypatch):
    captured: dict = {}

    # since 2026-10-14 the gateway asks the manager for ordered CANDIDATES that carry the needed
    # capability (pin ⇒ automatic order, with failover) — the capability is still what is asserted
    async def _candidates(db, task="general", need=None, limit=3):
        captured["need"] = need
        return []  # no model → returns no_capable_model, but we asserted `need`

    async def _capable(db, need="documents"):
        return []

    monkeypatch.setattr(ai_manager, "candidates", _candidates)
    monkeypatch.setattr(ai_manager, "capable_models", _capable)
    return captured


async def test_audio_routes_to_audio_capability(monkeypatch):
    captured = _patch_capture(monkeypatch)
    res = await gw.complete_multimodal(
        None, "transcribe", [{"filename": "v.ogg", "mimetype": "audio/ogg", "data": b"x"}]
    )
    assert captured["need"] == "audio"
    assert res["error"] == "no_capable_model"


async def test_video_routes_to_audio_capability(monkeypatch):
    captured = _patch_capture(monkeypatch)
    await gw.complete_multimodal(
        None, "describe", [{"filename": "c.mp4", "mimetype": "video/mp4", "data": b"x"}]
    )
    assert captured["need"] == "audio"


async def test_image_routes_to_vision(monkeypatch):
    captured = _patch_capture(monkeypatch)
    await gw.complete_multimodal(
        None, "describe", [{"filename": "p.jpg", "mimetype": "image/jpeg", "data": b"x"}]
    )
    assert captured["need"] == "vision"


async def test_pdf_routes_to_documents(monkeypatch):
    captured = _patch_capture(monkeypatch)
    await gw.complete_multimodal(
        None, "extract", [{"filename": "d.pdf", "mimetype": "application/pdf", "data": b"x"}]
    )
    assert captured["need"] == "documents"
