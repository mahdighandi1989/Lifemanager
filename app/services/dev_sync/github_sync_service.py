"""GitHub repo sync — mirrors the owner's repos into ``dev_projects``.

Modeled on the sibling PM app's oversight sync: paginated
``GET /user/repos?per_page=100&sort=pushed&affiliation=…`` with the token in
the ``Authorization`` header. The fetcher is injectable so tests never hit
the network, and every public entry point returns ``{ok, ...}`` instead of
raising (graceful degradation without credentials — repo convention).
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dev_sync import DevProject
from app.services.dev_sync import token_service

logger = logging.getLogger(__name__)

GITHUB_API = "https://api.github.com"
DEFAULT_MAX_PAGES = 5
_TIMEOUT = 20.0


def _headers(token: str) -> Dict[str, str]:
    return {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


async def _default_fetcher(url: str, headers: Dict[str, str]) -> Any:
    import httpx

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        return resp.json()


def parse_gh_datetime(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except Exception:
        return None


def normalize_repo(raw: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Reduce a GitHub repo payload to the columns we store. Bad rows → None."""
    try:
        full_name = raw.get("full_name") or ""
        if not full_name:
            return None
        return {
            "repo_full_name": full_name,
            "name": raw.get("name") or full_name.split("/")[-1],
            "description": raw.get("description"),
            "html_url": raw.get("html_url"),
            "default_branch": raw.get("default_branch"),
            "language": raw.get("language"),
            "is_private": bool(raw.get("private")),
            "is_archived": bool(raw.get("archived")),
            "pushed_at": parse_gh_datetime(raw.get("pushed_at")),
            "stars": raw.get("stargazers_count"),
            "forks": raw.get("forks_count"),
            "open_issues": raw.get("open_issues_count"),
            "topics": raw.get("topics") or [],
        }
    except Exception:
        return None


async def fetch_repos(
    token: str,
    max_pages: int = DEFAULT_MAX_PAGES,
    fetcher: Optional[Callable] = None,
) -> List[Dict[str, Any]]:
    """Paginate the authenticated user's repos. Raises on transport errors —
    callers (sync_repos / the /test probe) wrap it."""
    fetch = fetcher or _default_fetcher
    repos: List[Dict[str, Any]] = []
    for page in range(1, max_pages + 1):
        url = (
            f"{GITHUB_API}/user/repos?per_page=100&page={page}"
            "&sort=pushed&affiliation=owner,collaborator,organization_member"
        )
        batch = await fetch(url, _headers(token))
        if not isinstance(batch, list) or not batch:
            break
        repos.extend(batch)
        if len(batch) < 100:
            break
    normalized = [n for n in (normalize_repo(r) for r in repos) if n]
    return normalized


async def sync_repos(
    db: AsyncSession,
    user_id: Optional[int] = None,
    fetcher: Optional[Callable] = None,
    max_pages: int = DEFAULT_MAX_PAGES,
) -> Dict[str, Any]:
    """Upsert dev_projects from GitHub. Never raises: ``{ok, synced, created,
    error}``. Repos that disappear upstream are NOT deleted (quarantine rule)
    — they simply stop updating."""
    token, source = await token_service.get_token(db, "github", user_id)
    if not token:
        return {"ok": False, "error": "no_token", "synced": 0, "created": 0}
    try:
        normalized = await fetch_repos(token, max_pages=max_pages, fetcher=fetcher)
    except Exception as exc:
        msg = token_service.sanitize_error(exc, token)
        logger.warning("github repo fetch failed: %s", msg)
        await token_service.record_sync_result(db, "github", False, msg, user_id)
        return {"ok": False, "error": msg, "synced": 0, "created": 0}

    now = datetime.now(timezone.utc)
    # Upsert key is repo_full_name across ALL scopes: the background engine
    # (user_id=None) and a logged-in manual sync must maintain ONE row set,
    # not per-scope duplicates.
    existing_rows = (await db.execute(select(DevProject))).scalars().all()
    by_full_name = {row.repo_full_name: row for row in existing_rows}
    created = 0
    for repo in normalized:
        row = by_full_name.get(repo["repo_full_name"])
        if row is None:
            row = DevProject(user_id=user_id, provider="github", **repo)
            db.add(row)
            by_full_name[repo["repo_full_name"]] = row
            created += 1
        else:
            for field, value in repo.items():
                setattr(row, field, value)
        row.last_synced_at = now
    try:
        await db.commit()
    except Exception as exc:  # keep the session usable — never poison the tick
        await db.rollback()
        msg = token_service.sanitize_error(exc, token)
        logger.warning("github sync commit failed: %s", msg)
        await token_service.record_sync_result(db, "github", False, msg, user_id)
        return {"ok": False, "error": msg, "synced": 0, "created": 0}
    await token_service.record_sync_result(db, "github", True, None, user_id)
    logger.info("github sync: %d repos (%d new) via %s token", len(normalized), created, source)
    return {"ok": True, "synced": len(normalized), "created": created, "error": None}


async def probe(token: str, fetcher: Optional[Callable] = None) -> Dict[str, Any]:
    """Live «بررسی اتصال» — GET /user. Returns {ok, login?, error?}."""
    fetch = fetcher or _default_fetcher
    try:
        data = await fetch(f"{GITHUB_API}/user", _headers(token))
        return {"ok": True, "login": (data or {}).get("login")}
    except Exception as exc:
        return {"ok": False, "error": token_service.sanitize_error(exc, token)}
