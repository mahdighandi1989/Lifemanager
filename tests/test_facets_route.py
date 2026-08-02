"""/api/facets — the spine's second mouth, and the curation that makes it safe.

Why this endpoint is curated rather than generic, pinned as a test because it
is the whole point of the feature:

Running ``collect()`` against a database with 8 rows (3 tasks + 4 todo items)
returns EXACTLY ONE facet — ``self_model_diligence``, tone=watch:

    «پشتکارت این دوره پایین بوده؛ … از هر ۱۰ تا حدود ۰ تا را نگه داشته‌ای.»

So the only thing the app would say about its owner is a low-willpower
verdict. That is «شاخص پشتکار ۱۰/۱۰۰» — the thing he called «احمقانه» —
reborn as a sentence, and every test in the repo stays green while it ships.
Curation is the feature.
"""
from __future__ import annotations

import pytest

from app.routes.facets import QUARANTINED_KEYS, QUIET_GROUPS, curate


def _f(key, group="self", **kw):
    return {"key": key, "group": group, "surfaces": [], **kw}


# ── the curation rule itself ─────────────────────────────────────────

def test_quiet_groups_are_out_by_default():
    """`unlinked` is a schema audit addressed to «تو»; `facts` is a copy of
    his own ID card. Neither is wrong — both are wrong DAILY."""
    out = curate([
        _f("a", "self"), _f("b", "unlinked"), _f("c", "facts"), _f("d", "habits"),
    ])
    assert {f["key"] for f in out} == {"a", "d"}


def test_explicit_groups_reopen_the_door():
    """Nothing is deleted (rule 2): /system-map can still ask for its own
    report, and /life-file for the documents."""
    for group in QUIET_GROUPS:
        out = curate([_f("x", group), _f("y", "self")], groups=[group])
        assert [f["key"] for f in out] == ["x"], group


def test_defective_facets_are_quarantined():
    """Not merely verbose — measurably broken. `self_model_diligence` claims
    «این دوره» over an all-time ratio that can never improve;
    `self_model_interests` runs a substring categoriser that maps
    «برنامه‌ریزی»→technology and «خدا»/«خانواده»→general (discarded)."""
    out = curate([_f(k) for k in QUARANTINED_KEYS] + [_f("keep")])
    assert [f["key"] for f in out] == ["keep"]


def test_quarantine_is_reversible_by_name():
    out = curate([_f(QUARANTINED_KEYS[0])], include=[QUARANTINED_KEYS[0]])
    assert len(out) == 1


def test_surface_requires_an_explicit_opt_in():
    """A facet reaches a page's strip only when its author wrote the surface
    down — never by a score that gets tuned until it means nothing."""
    facets = [_f("a", surfaces=["dashboard"]), _f("b", surfaces=[]), _f("c", surfaces=["tasks"])]
    assert [f["key"] for f in curate(facets, surface="dashboard")] == ["a"]
    assert [f["key"] for f in curate(facets, surface="")] == ["a", "b", "c"]


# ── the endpoint ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_facets_endpoint_answers_twice(api_client):
    """The registry regression that once made this 500 on the SECOND call:
    a `providers()` function shadowed by the `providers/` subpackage. Any
    new caller of collect() must re-pin it."""
    for _ in range(2):
        r = api_client.get("/api/facets")
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["ok"] is True and body["success"] is True
        assert isinstance(body["facets"], list)
        assert body["degraded"] is False


@pytest.mark.asyncio
async def test_endpoint_never_serves_the_quarantined_or_quiet(api_client):
    body = api_client.get("/api/facets").json()
    keys = {f["key"] for f in body["facets"]}
    groups = {f["group"] for f in body["facets"]}
    assert keys.isdisjoint(QUARANTINED_KEYS)
    assert groups.isdisjoint(QUIET_GROUPS)


@pytest.mark.asyncio
async def test_limit_is_honoured(api_client):
    assert len(api_client.get("/api/facets?limit=1").json()["facets"]) <= 1


@pytest.mark.asyncio
async def test_quiet_is_reported_apart_from_degraded(api_client):
    """`collect()` returns None for "no data", for a timeout AND for a crash,
    so `unavailable` cannot tell silence from breakage. `degraded` can."""
    body = api_client.get("/api/facets").json()
    assert "quiet" in body and "degraded" in body
    assert body["degraded"] is False


@pytest.mark.asyncio
async def test_identity_profile_contract_is_untouched(api_client):
    """Behaviour-preserving (rule 3): the aggregator page still gets
    EVERYTHING, including the facets this endpoint quarantines."""
    r = api_client.post(
        "/auth/register",
        json={"email": "facets@example.com", "password": "hunter2-long", "username": "fx"},
    )
    assert r.status_code == 201, r.text
    tok = r.json()["access_token"]
    body = api_client.get(
        "/api/identity-profile", headers={"Authorization": f"Bearer {tok}"}
    ).json()
    assert body["ok"] is True
    assert {"groups", "sources", "unavailable"} <= set(body)


# ── the door on every facet ──────────────────────────────────────────

def test_every_facet_door_is_a_real_page():
    """The gap the suite had: `test_owner_insight_spine` asserts owns_page on
    the PROVIDER, never on the facet. A facet whose door is empty or bogus
    renders as a dead end and nothing fails."""
    import importlib
    import re
    import pathlib

    from app.services.system_graph_service import parse_routes_meta

    known = {e.get("path") for e in parse_routes_meta() if e.get("path")}
    assert known, "routesMeta did not parse — the guard would be vacuous"

    src_dir = pathlib.Path("app/services/owner_insight/providers")
    # Every `owns_page=` in this package is written as a module constant
    # (PAGE / PAGE_LISTS / …), so scanning for string literals finds NOTHING
    # and the guard silently passes. Resolve the constants instead.
    checked, bad = 0, []
    for path in sorted(src_dir.glob("*.py")):
        if path.name.startswith("_"):
            continue
        names = set(re.findall(r"owns_page=(\w+)", path.read_text()))
        assert names, f"{path.name}: no owns_page found — did the pattern change?"
        mod = importlib.import_module(f"app.services.owner_insight.providers.{path.stem}")
        for name in names:
            value = getattr(mod, name, None)
            assert isinstance(value, str) and value, f"{path.name}: {name} unresolved"
            checked += 1
            if value not in known:
                bad.append(f"{path.name}: {name}={value!r}")
    assert checked >= 8, f"only {checked} doors checked — guard is too weak"
    assert not bad, f"facets point at non-existent pages: {bad}"


def test_facet_link_carries_the_row_when_one_exists():
    """`owns_page` stays a bare path (≈20 assertions pin it); `link` is where
    the row address lands."""
    from app.services.owner_insight.base import Facet

    plain = Facet(key="k", title="t", statement="s", owns_page="/writings")
    assert plain.link == "/writings" and plain.focus == ""

    precise = Facet(
        key="k", title="t", statement="s", owns_page="/writings",
        focus_kind="writing", focus_id=7,
    )
    assert precise.owns_page == "/writings", "owns_page must not change"
    assert precise.focus == "writing:7"
    assert precise.link == "/writings?focus=writing%3A7"


def test_as_dict_is_additive_only():
    """Existing consumers read fixed keys; new ones must not displace them."""
    from app.services.owner_insight.base import Facet

    d = Facet(key="k", title="t", statement="s").as_dict()
    assert {"key", "title", "statement", "group", "kind", "tone", "confidence",
            "evidence", "source_label", "owns_page", "owner_locked",
            "editable_field"} <= set(d)
    assert {"focus", "link", "surfaces"} <= set(d)
