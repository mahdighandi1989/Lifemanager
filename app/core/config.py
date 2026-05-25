"""Compatibility shim.

Some modules (e.g. app/dependencies/auth.py, app/services/google_auth.py)
import `from app.core.config import settings`. The canonical Settings now
live in app.config — re-export here so we don't drift two copies of
SECRET_KEY/ALGORITHM/... out of sync.
"""
from app.config import settings  # noqa: F401  (re-export)

__all__ = ["settings"]
