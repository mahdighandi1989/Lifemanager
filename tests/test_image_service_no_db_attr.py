"""Regression guard for the audit task 303dcde8 cleanup.

The previous AIImageService carried a write-only ``self.db`` attribute.
Commit 9bce9a2 removed it. These tests pin that no caller — including
future refactors — re-introduces an unused ``db`` parameter or
attribute on the placeholder.
"""
from __future__ import annotations

import inspect


def test_ai_image_service_init_takes_no_db_parameter():
    from app.services.ai.image_service import AIImageService

    # The default __init__ (object.__init__) accepts no extra params.
    init_sig = inspect.signature(AIImageService.__init__)
    extra_params = [
        p
        for p in init_sig.parameters.values()
        if p.name not in ("self",)
        and p.kind
        not in (inspect.Parameter.VAR_KEYWORD, inspect.Parameter.VAR_POSITIONAL)
    ]
    assert not extra_params, (
        f"AIImageService.__init__ regained surplus parameters: {extra_params}. "
        "Audit task 303dcde8 removed the unused db= param; the cleanup "
        "must stay clean."
    )


def test_ai_image_service_instance_has_no_db_attr():
    from app.services.ai.image_service import AIImageService

    svc = AIImageService()
    assert not hasattr(svc, "db"), (
        "AIImageService instance has a stray ``db`` attribute again — "
        "audit task 303dcde8 regressed"
    )
