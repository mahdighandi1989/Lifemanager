"""Read a bank/broker email for HOW the attachment password is formed, turn it
into a structured recipe, and derive the password from reusable identity facts.

Owner: «معمولاً تو متنِ ایمیل می‌نویسد رمز از چه ساخته می‌شود — سه رقمِ آخرِ کارت +
تاریخِ تولد و … . همان‌ها را ازم بپرس، نگه دار، و رمز را بساز.»

Security: the email body is UNTRUSTED attacker-controllable text fed to the LLM.
Derivation is therefore PURE token substitution over a whitelisted component
vocabulary — never ``str.format``/``eval``/shell — so a malicious recipe can't
do anything but concatenate the owner's own stored facts. A wrong recipe simply
yields a wrong password, which prepare_bytes rejects → the caller falls back to
asking manually (never a silent loop).
"""
from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ingest.identity_facts import CANONICAL, kind_for, label_for

logger = logging.getLogger(__name__)

_RECIPE_KEY_PREFIX = "ingest_recipe:"
_VOCAB = ", ".join(CANONICAL.keys())

_RECIPE_PROMPT = """متنِ زیر بدنهٔ یک ایمیل از بانک/کارگزار/سرویس است. گاهی توضیح می‌دهد
که رمزِ فایلِ پیوست (PDF) از چه چیزهایی ساخته می‌شود (مثلاً «سه رقمِ آخرِ کارت + تاریخِ تولد»).

اگر چنین توضیحی هست، فقط یک JSON برگردان:
{
  "has_recipe": true,
  "components": [ {"key": "یکی از این‌ها: %s یا custom_<slug>", "label": "برچسبِ فارسیِ کوتاه با فرمتِ لازم", "kind": "digits|date|text"} ],
  "template": "قالبِ رمز فقط با توکن‌های {key}، مثلاً {card_last3}{dob}",
  "notes": "هر نکتهٔ کوتاهِ فرمت"
}
اگر هیچ توضیحی دربارهٔ ساختِ رمز نبود:
{ "has_recipe": false }

قواعد: فقط JSON، بدونِ توضیحِ اضافه. توکن‌های template باید دقیقاً همان key های components باشند.

متنِ ایمیل:
%s
"""


def _parse_json(text: Optional[str]) -> Optional[Dict[str, Any]]:
    if not text:
        return None
    cleaned = re.sub(r"```(?:json)?", "", text).strip()
    m = re.search(r"\{.*\}", cleaned, re.S)
    if not m:
        return None
    try:
        obj = json.loads(m.group(0))
        return obj if isinstance(obj, dict) else None
    except Exception:
        return None


def _canonicalise(recipe: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Validate + normalise: keep only well-formed components, ensure the
    template references exactly the component keys, attach canonical labels."""
    if not recipe or not recipe.get("has_recipe"):
        return {"has_recipe": False}
    template = str(recipe.get("template") or "").strip()
    comps_in = recipe.get("components") or []
    if not template or not isinstance(comps_in, list) or not comps_in:
        return {"has_recipe": False}

    components: List[Dict[str, str]] = []
    seen = set()
    for c in comps_in:
        if not isinstance(c, dict):
            continue
        key = re.sub(r"[^a-z0-9_]", "", str(c.get("key") or "").strip().lower())[:40]
        if not key or key in seen:
            continue
        seen.add(key)
        components.append(
            {
                "key": key,
                "label": str(c.get("label") or label_for(key))[:120],
                "kind": str(c.get("kind") or kind_for(key))[:16],
            }
        )
    # every {token} in the template must be a declared component
    tokens = set(re.findall(r"\{(\w+)\}", template))
    if not tokens or not tokens.issubset({c["key"] for c in components}):
        return {"has_recipe": False}
    # drop any component the template doesn't use
    components = [c for c in components if c["key"] in tokens]
    return {"has_recipe": True, "template": template, "components": components, "notes": str(recipe.get("notes") or "")[:300]}


async def extract_recipe(db: AsyncSession, email_body: Optional[str], sender: str) -> Optional[Dict[str, Any]]:
    """Ask the AI to read the body for a password recipe. Returns a canonicalised
    recipe dict ({has_recipe: false} when none), or None on total failure."""
    if not email_body:
        return {"has_recipe": False}
    try:
        from app.services.ai.inference_gateway import complete

        prompt = _RECIPE_PROMPT % (_VOCAB, email_body[:8000])
        res = await complete(db, prompt, task="document_extraction", max_tokens=400)
        if not (res.get("ok") and res.get("text")):
            return {"has_recipe": False}
        parsed = _parse_json(res.get("text"))
        return _canonicalise(parsed or {})
    except Exception as exc:
        logger.debug("recipe extract skipped: %r", exc)
        return {"has_recipe": False}


def derive_password(template: str, values: Dict[str, str]) -> str:
    """SAFE derivation: substitute {key} tokens with stored values ONLY. No
    str.format, no eval — a hostile template can only concatenate the owner's
    own facts."""
    def repl(m: "re.Match") -> str:
        return str(values.get(m.group(1), "")).strip()

    return re.sub(r"\{(\w+)\}", repl, template or "")


async def store_recipe(db: AsyncSession, *, domain: str, recipe: Dict[str, Any]) -> None:
    """Cache the recipe per sender domain (JSON — not a secret; it only names
    components + a template, never values). Idempotent upsert."""
    from app.models.global_setting import GlobalSetting

    key = _RECIPE_KEY_PREFIX + (domain or "unknown")[:100]
    payload = json.dumps(recipe, ensure_ascii=False)
    row = (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == key))
    ).scalar_one_or_none()
    if row is None:
        db.add(GlobalSetting(key=key, value=payload))
    else:
        row.value = payload


async def get_stored_recipe(db: AsyncSession, *, domain: str) -> Optional[Dict[str, Any]]:
    """Return the cached recipe for a domain, or None if none stored yet."""
    try:
        from app.models.global_setting import GlobalSetting

        row = (
            await db.execute(
                select(GlobalSetting).where(GlobalSetting.key == _RECIPE_KEY_PREFIX + (domain or "unknown")[:100])
            )
        ).scalar_one_or_none()
        if row is None or not row.value:
            return None
        obj = json.loads(row.value)
        return obj if isinstance(obj, dict) else None
    except Exception:
        return None
