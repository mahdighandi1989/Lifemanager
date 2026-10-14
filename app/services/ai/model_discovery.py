"""Automatic AI model refresh — no hard-coded model list, no button (owner 2026-10-12).

Providers retire models silently (production ran for months on two shut-down
Gemini models). Once a day (job ``ai_model_refresh``) — and whenever the owner
presses «همگام‌سازیِ مدل‌ها» — every enabled, keyed provider is asked for its
LIVE model list and the catalog is reconciled:

* a model the provider no longer lists is switched OFF (kept, never deleted)
  and labelled; the resolver then routes around it automatically;
* a new text model is added with capabilities, limits and a ranking inferred
  from the provider's own metadata; for families we understand (Gemini,
  Claude) the newest STABLE models are switched on automatically, previews
  stay off; unknown families are added switched off;
* models the owner edited by hand (on/off, priority, capabilities ⇒ ``[owner]``
  in notes) keep that choice — only a vanished model is ever switched off for them;
* every reconciled row gets ``source="live"``; the boot-time seed then stops
  refreshing its metadata, so the static catalog can never undo a refresh;
* ``max_output_tokens`` / ``context_window`` come from the provider when it
  reports them (Gemini does).

The static ``PROVIDER_CATALOG`` in ``catalog.py`` stays only as the first-boot
seed; after the first refresh the live list decides.
"""
from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_catalog import AICatalogModel, AICatalogProvider

logger = logging.getLogger(__name__)

OWNER_MARK = "[owner]"
GONE_MARK = "[gone]"
GONE_SUFFIX = " (دیگر در فهرستِ ارائه‌دهنده نیست)"

# --- classification ----------------------------------------------------------

_GEMINI = re.compile(r"^gemini-(\d+(?:\.\d+)?)-(pro|flash-lite|flash)(?:-(\d{3}))?$")
_GEMINI_ANY = re.compile(r"^gemini-(\d+(?:\.\d+)?)-(pro|flash-lite|flash)\b")
_GEMINI_SKIP = ("embedding", "imagen", "veo", "tts", "aqa", "image", "live", "audio", "robotics",
                "computer-use", "learnlm", "thinking-exp")
# minor version is 1–2 digits: «claude-opus-4-20250514» is v4 + a date, not v4.2025 (it used to outrank 4.1)
_CLAUDE = re.compile(r"^claude-(opus|sonnet|haiku)-(\d+)(?:-(\d{1,2}))?(?:-(\d{8}))?$")


def _num(v: str) -> float:
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def classify(provider_key: str, info: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Map one live model entry to catalog fields, or None to ignore it
    (not a text-generation model). ``stable`` decides auto-enable; ``rank``
    orders models of the same provider (higher = newer/better)."""
    mid = info["id"]
    if provider_key == "gemini":
        if "generateContent" not in (info.get("methods") or ["generateContent"]):
            return None
        if any(s in mid for s in _GEMINI_SKIP):
            return None
        m = _GEMINI.match(mid)
        loose = m or _GEMINI_ANY.match(mid)
        if not loose:
            return None  # gemma/legacy/other families: not routed automatically
        ver, tier = _num(loose.group(1)), loose.group(2)
        caps = ["text", "vision", "audio", "documents", "long_context", "code"]
        if tier == "pro" or (tier == "flash" and ver >= 2.5):
            caps.append("reasoning")
        if tier in ("flash", "flash-lite"):
            caps.append("fast")
        stable = bool(m) and "latest" not in mid
        return {"caps": caps, "stable": stable, "tier": tier, "rank": ver,
                "max_out": info.get("output_limit"), "ctx": info.get("input_limit"),
                "name": info.get("display") or mid}
    if provider_key in ("anthropic", "claude_subscription"):
        m = _CLAUDE.match(mid)
        if not m:
            return None
        tier = m.group(1)
        ver = _num(f"{m.group(2)}.{m.group(3) or 0}")
        caps = ["text", "vision", "documents", "code", "reasoning", "long_context"]
        if tier == "haiku":
            caps.append("fast")
        return {"caps": caps, "stable": True, "tier": tier, "rank": ver,
                "max_out": None, "ctx": None, "name": info.get("display") or mid}
    # other OpenAI-compatible families: listed, never auto-enabled
    return {"caps": ["text"], "stable": False, "tier": "other", "rank": 0.0, "max_out": None, "ctx": None,
            "name": info.get("display") or mid}


# Priority (lower = preferred by the resolver among models that have the
# capability a task needs). Cheapest capable first: Flash / Sonnet for
# reasoning, Flash-Lite / Haiku for fast work, Pro / Opus only on explicit pin.
_TIER_PRIORITY = {"flash": 2, "sonnet": 2, "flash-lite": 3, "haiku": 3, "pro": 4, "opus": 4, "other": 6}


def assign_priorities(entries: List[Dict[str, Any]]) -> None:
    """Newest stable model of each tier gets the tier's priority; older
    stable ones +2; previews 7."""
    newest: Dict[str, float] = {}
    for e in entries:
        c = e["cls"]
        if c["stable"]:
            newest[c["tier"]] = max(newest.get(c["tier"], -1.0), c["rank"])
    for e in entries:
        c = e["cls"]
        base = _TIER_PRIORITY.get(c["tier"], 6)
        if not c["stable"]:
            e["priority"] = 7
        elif c["rank"] >= newest.get(c["tier"], 0.0):
            e["priority"] = base
            e["newest"] = True
        else:
            e["priority"] = base + 2


# --- live lists ----------------------------------------------------------------


async def list_live_models(provider: AICatalogProvider, key: str) -> List[Dict[str, Any]]:
    """[{id, display, methods, input_limit, output_limit}] — all pages."""
    import httpx

    from app.services.ai.manager import AIManager

    root = (AIManager.safe_base_url(provider) or "").rstrip("/")
    out: List[Dict[str, Any]] = []
    async with httpx.AsyncClient(timeout=30.0) as client:
        if provider.key == "gemini":
            token = None
            for _ in range(20):
                params = {"pageSize": 1000}
                if token:
                    params["pageToken"] = token
                r = await client.get(f"{root}/v1beta/models", params=params, headers={"x-goog-api-key": key})
                r.raise_for_status()
                body = r.json()
                for m in body.get("models", []):
                    name = m.get("name", "")
                    out.append({"id": name.split("/")[-1], "display": m.get("displayName"),
                                "methods": m.get("supportedGenerationMethods") or [],
                                "input_limit": m.get("inputTokenLimit"), "output_limit": m.get("outputTokenLimit")})
                token = body.get("nextPageToken")
                if not token:
                    break
            return out
        if provider.key in ("anthropic", "claude_subscription"):
            headers = {"anthropic-version": "2023-06-01"}
            if provider.auth_scheme == "oauth_bearer":
                headers["authorization"] = f"Bearer {key}"
                headers["anthropic-beta"] = "oauth-2025-04-20"
                headers["user-agent"] = "claude-cli/1.0 (external)"
            else:
                headers["x-api-key"] = key
            after = None
            for _ in range(20):
                params = {"limit": 1000}
                if after:
                    params["after_id"] = after
                r = await client.get(f"{root}/v1/models", params=params, headers=headers)
                r.raise_for_status()
                body = r.json()
                data = body.get("data", [])
                out += [{"id": m["id"], "display": m.get("display_name")} for m in data]
                if not body.get("has_more") or not data:
                    break
                after = body.get("last_id") or data[-1]["id"]
            return out
        r = await client.get(f"{root}/models", headers={"Authorization": f"Bearer {key}"})
        r.raise_for_status()
        return [{"id": m["id"]} for m in r.json().get("data", []) if m.get("id")]


# --- reconcile ------------------------------------------------------------------


def _key_for(provider_key: str, mid: str, taken: Dict[str, AICatalogModel]) -> str:
    """model_key is unique across ALL rows (Claude ids exist under both the
    API-key and the subscription provider; an owner's custom row may already
    use the bare id). Only called for ids this provider has no row for, so any
    existing holder of the key is someone else's ⇒ derive a free key."""
    if mid not in taken:
        return mid
    base = f"{mid}-sub" if provider_key == "claude_subscription" else f"{provider_key}:{mid}"
    key, n = base[:120], 2
    while key in taken:
        key, n = f"{base}-{n}"[:120], n + 1
    return key


async def reconcile(db: AsyncSession, provider: AICatalogProvider, live: List[Dict[str, Any]]) -> Dict[str, Any]:
    all_models = (await db.execute(select(AICatalogModel))).scalars().all()
    by_key = {m.model_key: m for m in all_models}
    mine = [m for m in all_models if m.provider_key == provider.key and not m.is_custom]
    by_api = {m.api_id: m for m in mine}

    entries = []
    for info in live:
        c = classify(provider.key, info)
        if c is not None:
            entries.append({"info": info, "cls": c})
    assign_priorities(entries)
    live_ids = {i["id"] for i in live}  # ANY live id (text or not) keeps its row alive

    added = enabled = gone = updated = 0
    for e in entries:
        mid, c = e["info"]["id"], e["cls"]
        row = by_api.get(mid)
        auto_on = c["stable"] and c["tier"] != "other" and e.get("newest", False)
        if row is None:
            key = _key_for(provider.key, mid, by_key)
            row = AICatalogModel(model_key=key, api_model_id=None if key == mid else mid,
                                 provider_key=provider.key, display_name=str(c["name"])[:120],
                                 enabled=bool(auto_on), capabilities=c["caps"], priority=e["priority"],
                                 max_output_tokens=c["max_out"], context_window=c["ctx"],
                                 source="live", is_custom=False, notes="")
            db.add(row)
            by_key[key] = row
            added += 1
            enabled += int(bool(auto_on))
            continue
        owner = OWNER_MARK in (row.notes or "")
        row.source = "live"  # the live list now owns this row's metadata (seed stops refreshing it)
        if GONE_MARK in (row.notes or ""):  # it came back
            row.notes = (row.notes or "").replace(GONE_MARK, "").strip()
            row.display_name = (row.display_name or "").replace(GONE_SUFFIX, "")
        if c["tier"] != "other" and not owner:
            row.capabilities = c["caps"]
            row.priority = e["priority"]
        if c["max_out"]:
            row.max_output_tokens = c["max_out"]
        if c["ctx"]:
            row.context_window = c["ctx"]
        if not owner and auto_on and not row.enabled:
            row.enabled = True
            enabled += 1
        updated += 1
    for row in mine:
        if row.api_id in live_ids:
            continue
        row.source = "live"  # the seed must not relabel/re-enable it on the next boot
        if row.enabled or GONE_MARK not in (row.notes or ""):
            row.enabled = False
            row.notes = ((row.notes or "") + " " + GONE_MARK).strip()
            if GONE_SUFFIX not in (row.display_name or ""):
                row.display_name = ((row.display_name or row.model_key) + GONE_SUFFIX)[:120]
            row.priority = 9
            gone += 1
    await db.commit()
    return {"ok": True, "provider": provider.key, "live": len(live), "text_models": len(entries),
            "added": added, "enabled": enabled, "retired": gone, "updated": updated}


async def refresh_provider(db: AsyncSession, provider_key: str) -> Dict[str, Any]:
    from app.services.ai.inference_gateway import safe_error_text
    from app.services.ai.manager import ai_manager

    provider = await db.get(AICatalogProvider, provider_key)
    if provider is None:
        return {"ok": False, "provider": provider_key, "message": "ارائه‌دهنده پیدا نشد"}
    key = ai_manager.effective_api_key(provider)
    if not key:
        return {"ok": False, "provider": provider_key, "message": "کلید API تنظیم نشده"}
    try:
        live = await list_live_models(provider, key)
    except Exception as exc:  # noqa: BLE001 — a provider outage must not retire anything
        return {"ok": False, "provider": provider_key, "message": f"فهرست مدل‌ها دریافت نشد: {safe_error_text(exc)}"}
    if not live:
        return {"ok": False, "provider": provider_key, "message": "فهرست مدلی برنگشت (چیزی خاموش نشد)"}
    res = await reconcile(db, provider, live)
    res["message"] = (f"همگام شد · {res['live']} مدل · {res['added']} تازه · {res['enabled']} روشن · "
                      f"{res['retired']} خاموش (دیگر در فهرست نیست)")
    return res


async def refresh_all(db: AsyncSession) -> Dict[str, Any]:
    """Every enabled + keyed provider (the daily job)."""
    from app.services.ai.manager import ai_manager

    out: Dict[str, Any] = {}
    providers = (await db.execute(select(AICatalogProvider))).scalars().all()
    # keys captured up front: a rollback after one provider's failure expires
    # the ORM objects (async lazy-load would then raise).
    keys = [p.key for p in providers if p.enabled and ai_manager.provider_configured(p)]
    for pk in keys:
        try:
            out[pk] = await refresh_provider(db, pk)
        except Exception as exc:  # noqa: BLE001 — one provider must not stop the others
            from app.services.ai.inference_gateway import safe_error_text

            await db.rollback()
            logger.warning("model refresh %s failed: %s", pk, safe_error_text(exc))
            out[pk] = {"ok": False, "message": safe_error_text(exc)}
    out["_routes"] = await release_dead_pins(db)
    return out


async def release_dead_pins(db: AsyncSession) -> Dict[str, Any]:
    """A task pinned to a model the provider no longer lists («[gone]», switched off) goes back to the
    automatic pick — the pin is released (noted on the route), never left pointing at a dead model.
    A pin to a model that is merely switched off by the owner is the owner's choice and stays."""
    from app.models.ai_catalog import AITaskRoute

    released = []
    try:
        routes = (await db.execute(select(AITaskRoute).where(AITaskRoute.model_id.isnot(None)))).scalars().all()
        for r in routes:
            m = await db.get(AICatalogModel, r.model_id)
            if m is not None and not m.enabled and "[gone]" in (m.notes or ""):
                r.notes = ((r.notes or "") + f" [auto-released {datetime.now(timezone.utc).date()}: «{m.api_id}» retired]").strip()[:500]
                r.model_id = None
                released.append(r.task)
        if released:
            await db.commit()
    except Exception as exc:  # noqa: BLE001 — releasing pins must never fail the refresh
        await db.rollback()
        logger.warning("release_dead_pins failed: %s", exc)
    return {"ok": True, "released": released}
