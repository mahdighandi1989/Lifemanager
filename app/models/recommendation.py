"""ContextualRecommendation — a smart suggestion produced for the user.

Audit task 2165524b (AC 2). Each row is one suggestion (location-based /
physiological / behavioral) optionally tied to a Task, with the context
snapshot that produced it so the UI can explain "why now".

The canonical model now lives in ``app.models.context`` as ``Recommendation``
(audit task 14e65214, Step 4 AC20). This module re-exports it under the
historical name ``ContextualRecommendation`` so existing imports keep working.
"""
from app.models.context import Recommendation as ContextualRecommendation

__all__ = ["ContextualRecommendation"]
