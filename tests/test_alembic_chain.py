"""Guard the alembic chain (audit task 3ea5622b).

Each revision file under migrations/versions/ must:

* declare exactly one ``revision`` and one ``down_revision``;
* form a single linear chain (every down_revision is the previous
  revision's id; exactly one root with down_revision = None);
* leave a single head — branching would silently break
  ``alembic upgrade head`` on Render's free-tier startup.
"""
from __future__ import annotations

import re
from pathlib import Path


VERSIONS = Path(__file__).resolve().parent.parent / "migrations" / "versions"

_REVISION_RE = re.compile(r'^\s*revision\s*:?\s*[A-Za-z\[\],\s\|]*=\s*"([^"]+)"', re.MULTILINE)
_DOWN_RE = re.compile(r'^\s*down_revision\s*:?\s*[A-Za-z\[\],\s\|]*=\s*(.+)$', re.MULTILINE)


def _parse_revs() -> dict[str, str | None]:
    out: dict[str, str | None] = {}
    for path in sorted(VERSIONS.glob("*.py")):
        if path.name.startswith("_"):
            continue
        text = path.read_text(encoding="utf-8")
        rev_match = _REVISION_RE.search(text)
        down_match = _DOWN_RE.search(text)
        assert rev_match, f"{path.name}: no revision id"
        assert down_match, f"{path.name}: no down_revision"
        rev = rev_match.group(1)
        raw_down = down_match.group(1).strip().rstrip(",")
        if raw_down.startswith('"'):
            down = raw_down[1:].split('"', 1)[0]
        elif raw_down.startswith("None"):
            down = None
        else:
            raise AssertionError(f"{path.name}: unparseable down_revision {raw_down!r}")
        out[rev] = down
    return out


def test_single_root_single_head():
    revs = _parse_revs()
    roots = [r for r, d in revs.items() if d is None]
    children: dict[str, list[str]] = {}
    for rev, down in revs.items():
        if down is not None:
            children.setdefault(down, []).append(rev)
    heads = [r for r in revs if r not in children]

    assert len(roots) == 1, f"expected one root revision, found {roots}"
    assert len(heads) == 1, f"expected one head revision, found {heads}"


def test_chain_is_linear():
    """No revision is the down_revision of more than one other rev."""
    revs = _parse_revs()
    child_count: dict[str, int] = {}
    for down in revs.values():
        if down is not None:
            child_count[down] = child_count.get(down, 0) + 1
    branches = {rev: n for rev, n in child_count.items() if n > 1}
    assert not branches, f"alembic chain branched at {branches}"


def test_every_down_revision_exists():
    revs = _parse_revs()
    for rev, down in revs.items():
        if down is not None:
            assert down in revs, f"{rev}: down_revision {down!r} does not exist"


def test_head_is_latest_sync_migration():
    """Audit task 3ea5622b — there is exactly one head and it is the
    highest-numbered migration, so a fresh `alembic upgrade head` reaches
    every table/column. Asserted dynamically (by NNNN_ prefix) so adding new
    migrations doesn't require editing this test, only keeping the chain
    single-headed and linear."""
    import re

    revs = _parse_revs()
    children: dict[str, list[str]] = {}
    for rev, down in revs.items():
        if down is not None:
            children.setdefault(down, []).append(rev)
    heads = [r for r in revs if r not in children]
    assert len(heads) == 1, f"expected a single head, found {heads}"

    def _num(rev: str) -> int:
        m = re.match(r"(\d+)", rev)
        return int(m.group(1)) if m else -1

    assert _num(heads[0]) == max(_num(r) for r in revs), (
        f"head {heads[0]} is not the newest migration"
    )
