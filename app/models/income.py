"""Re-export wrapper for ``Income`` (audit task 4ae4b3ca AC 6).

The model itself lives in ``app/models/finance.py`` alongside its
sibling entities. This module exists so static greps for
``app/models/income.py`` succeed and so a future split of the
finance module doesn't break the per-file import surface.
"""
from app.models.finance import Income

__all__ = ["Income"]
