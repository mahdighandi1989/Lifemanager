"""`?focus=` — the app's missing primitive: an address for a single ROW.

Every part of this app could already find the exact thing the owner meant,
and then dropped it at the link. `/api/search` holds `task.id` and emits
`"/tasks"`; the sahat cards hold the row and emit `"/writings"`. So the
owner searched, clicked, landed on a page root, and had to find the item
again by eye. That is a large part of «همه‌چیز جزیره‌ای است»: the bridges
exist, they just do not say WHERE they land.

This module is the whole contract, and it is deliberately tiny:

    focus_url("/tasks", "task", 12)   ->  "/tasks?focus=task%3A12"

`frontend/src/lib/focus.js` is the other half — it reads the param, scrolls
the matching `data-focus-id` element into view and flashes it.

Two properties make this safe to spread everywhere:

* **Ignorable.** A page that has not opted in renders exactly as it does
  today; an unknown query param changes nothing. So this can be emitted
  from every producer immediately and consumed page by page.
* **Additive.** `focus_url` never replaces an existing query string and
  never invents a target — no id, no change.

Later callers (the identity facets' «رفتن به سرچشمه‌اش» door, notifications,
the Telegram deep links) should build their links through here rather than
re-deriving the format, so there stays exactly one spelling of a row's
address.
"""
from __future__ import annotations

from typing import Any, Optional
from urllib.parse import quote

# The vocabulary a producer may address. Kept explicit rather than free
# text: a typo'd kind is a link that silently never highlights anything,
# which is indistinguishable from the old broken behaviour.
FOCUS_KINDS = (
    "task", "todo", "list", "writing", "person", "project",
    "transaction", "document", "email", "place", "trip",
    "inbox", "subscription", "account", "asset", "directive",
)


# Producers already spell the same row two ways (`/api/search` says
# `todo_item`, the inbox filer says `todo`). Both must produce ONE token or
# the page's `data-focus-id` matches half the links — so the aliases are
# folded here, the same normalisation `inbox_service.file_item` does.
FOCUS_ALIASES = {
    "todo_item": "todo",
    "item": "todo",
    "todo_list": "list",
    "personal_writing": "writing",
    "note": "writing",
    "contact": "person",
}


def focus_token(kind: str, id_: Any) -> Optional[str]:
    """``("task", 12)`` → ``"task:12"``; ``None`` when unaddressable."""
    kind = (kind or "").strip().lower()
    kind = FOCUS_ALIASES.get(kind, kind)
    if kind not in FOCUS_KINDS or id_ is None:
        return None
    ident = str(id_).strip()
    if not ident or ident.lower() in ("none", "null"):
        return None
    return f"{kind}:{ident}"


def focus_url(url: str, kind: str, id_: Any) -> str:
    """Append ``?focus=kind:id`` to ``url``, unharmfully.

    Returns ``url`` untouched when the target is not addressable, when the
    url is empty/external, or when it already carries a ``focus``. Callers
    can wrap every link they emit without checking anything first.
    """
    if not url or not url.startswith("/"):
        return url
    token = focus_token(kind, id_)
    if not token or "focus=" in url:
        return url
    sep = "&" if "?" in url else "?"
    return f"{url}{sep}focus={quote(token, safe='')}"
