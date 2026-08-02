"""`?focus=` — the app must be able to address a ROW, not just a page.

The defect this closes: `/api/search` held `task.id` and emitted `"/tasks"`,
and the sahat attention cards named one specific overdue task and linked to
`/tasks`. The owner searched, clicked, landed on a page root, and had to find
the thing again by eye — a bridge that exists but does not say where it lands.

The primitive is deliberately ignorable: a page that has not opted in sees an
unknown query param and renders exactly as before. That is what makes it safe
to emit from every producer before every page consumes it, so these tests pin
BOTH halves — that links carry the row, and that nothing else changed.
"""
from __future__ import annotations

import pytest

from app.services.focus_service import FOCUS_KINDS, focus_token, focus_url


# ── the primitive ────────────────────────────────────────────────────

@pytest.mark.parametrize(
    "url,kind,id_,expected",
    [
        ("/tasks", "task", 12, "/tasks?focus=task%3A12"),
        ("/lists/5", "todo", 9, "/lists/5?focus=todo%3A9"),
        # an existing query string is preserved, never clobbered
        ("/settings?tab=drive", "email", 3, "/settings?tab=drive&focus=email%3A3"),
    ],
)
def test_focus_url_appends(url, kind, id_, expected):
    assert focus_url(url, kind, id_) == expected


@pytest.mark.parametrize(
    "url,kind,id_",
    [
        ("/tasks", "task", None),          # no id → nothing to address
        ("/tasks", "not_a_kind", 1),       # typo'd kind must not emit a dud
        ("", "task", 1),
        ("https://example.com", "task", 1),  # external links untouched
        ("/tasks?focus=task%3A1", "task", 2),  # never double-stamp
    ],
)
def test_focus_url_is_a_no_op_when_unaddressable(url, kind, id_):
    """Callers wrap every link unconditionally, so the unhappy paths must
    return the url unchanged rather than raise or emit a broken target."""
    assert focus_url(url, kind, id_) == url


def test_aliases_collapse_to_one_spelling():
    """`/api/search` says `todo_item`, the inbox filer says `todo`. If both
    spellings survived, the page's `data-focus-id` would match half the
    links — a deep link that silently highlights nothing."""
    assert focus_token("todo_item", 4) == focus_token("todo", 4) == "todo:4"
    assert focus_token("note", 4) == focus_token("writing", 4) == "writing:4"


def test_kinds_have_no_aliases_shadowing_them():
    from app.services.focus_service import FOCUS_ALIASES

    # An alias whose key is also a canonical kind would make normalisation
    # depend on lookup order.
    assert not (set(FOCUS_ALIASES) & set(FOCUS_KINDS))
    assert set(FOCUS_ALIASES.values()) <= set(FOCUS_KINDS)


# ── the producers actually emit it ───────────────────────────────────

@pytest.mark.asyncio
async def test_search_hits_carry_their_row(api_client):
    r = api_client.post("/api/tasks", json={"title": "قرار دندان‌پزشکی"})
    assert r.status_code in (200, 201), r.text
    task_id = r.json()["id"]

    hits = api_client.get("/api/search?q=دندان").json()["results"]
    task_hits = [h for h in hits if h["kind"] == "task" and h["id"] == task_id]
    assert task_hits, f"search did not find the task: {hits}"
    # THE point of this file: the url addresses the row, not the page root.
    assert task_hits[0]["url"] == f"/tasks?focus=task%3A{task_id}"


@pytest.mark.asyncio
async def test_search_still_returns_its_old_shape(api_client):
    """Behaviour-preserving: only `url` gained a suffix — no key renamed,
    no key dropped, and non-addressable rows keep their plain url."""
    api_client.post("/api/tasks", json={"title": "چیزی برای جستجو"})
    body = api_client.get("/api/search?q=جستجو").json()
    assert body["ok"] is True and "results" in body and "total" in body
    for hit in body["results"]:
        assert {"kind", "kind_fa", "id", "title", "snippet", "url"} <= set(hit)
        assert hit["url"].startswith("/")


def test_sahat_attention_links_are_row_addressed():
    """`att()` is the one choke point for every attention card. Guard that
    the focus argument reaches the link, so future cards inherit it."""
    import inspect

    from app.services import sahat_service

    src = inspect.getsource(sahat_service.build_sahat_map)
    assert "focus_url(link" in src, "att() no longer stamps the row address"
    # the cards that name ONE row must pass one
    for producer in ('focus=("task"', 'focus=("todo"', 'focus=("person"'):
        assert producer in src, f"{producer} card lost its row address"
