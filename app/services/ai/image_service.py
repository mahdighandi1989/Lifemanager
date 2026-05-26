"""AI image-analysis service.

The third split (alongside model_service and nlp_service) of the
legacy app/services/ai_service.py file. Image analysis is not yet
wired to a real provider — this module exposes a stable interface
(``analyze_image``) so route layers and tests can plug in.

Once a provider is selected (OpenAI Vision, Replicate, internal model)
the body of ``analyze_image`` becomes the actual transport call, with
the same env-driven timeout pattern used by provider_service.
"""
from __future__ import annotations

import logging
from typing import Optional

logger = logging.getLogger(__name__)


class AIImageService:
    """Placeholder image-analysis service.

    Kept as a class for parity with AIService — when a real vision
    provider is wired in, the constructor can take a db session, an
    httpx client, or any other dependency without breaking callers.
    """

    def __init__(self, db: Optional[object] = None):
        self.db = db

    async def analyze_image(
        self,
        image_url: str,
        *,
        prompt: Optional[str] = None,
        max_tokens: int = 256,
    ) -> dict:
        """Return a description of the image at ``image_url``.

        Until a real vision provider is wired in, this returns a
        deterministic placeholder so the route layer / tests have a
        stable shape to assert against:

            {"description": str, "model_used": str, "tokens_used": int}
        """
        logger.info(
            "image-analysis placeholder hit for %s (prompt=%r)", image_url, prompt
        )
        return {
            "description": (
                f"[ai-image-placeholder] would analyse {image_url!r}"
                + (f" with prompt={prompt!r}" if prompt else "")
            ),
            "model_used": "placeholder-vision",
            "tokens_used": 0,
        }


async def analyze_image(
    image_url: str,
    *,
    prompt: Optional[str] = None,
    max_tokens: int = 256,
) -> dict:
    """Module-level convenience for callers that don't need a service
    instance. Delegates to AIImageService() so test patches on either
    surface still work.
    """
    return await AIImageService().analyze_image(
        image_url, prompt=prompt, max_tokens=max_tokens
    )
