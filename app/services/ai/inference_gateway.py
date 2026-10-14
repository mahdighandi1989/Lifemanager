"""Inference gateway — dispatch a resolved catalog model to its provider API.

Native support for three provider families (ported from ALLIN1):
  * Anthropic  → POST {base_url}/v1/messages  (x-api-key, or Bearer for OAuth)
  * Gemini     → POST {base_url}/v1beta/models/{model}:generateContent (key in x-goog-api-key)
  * OpenAI-compatible (everything else) → POST {base_url}/chat/completions

``complete`` does text; ``complete_multimodal`` sends PDFs/images for extraction.
Both resolve through :data:`app.services.ai.manager.ai_manager` and return a
uniform ``{ok, text, model, error}`` dict — never raising into the caller, so a
route can always degrade to a placeholder.
"""
from __future__ import annotations

import base64
import re
import os
from typing import Any, Dict, List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ai.catalog import CLAUDE_CODE_SYSTEM
from app.services.ai.manager import ResolvedModel, ai_manager


def _timeout() -> float:
    raw = os.environ.get("EXTERNAL_API_TIMEOUT")
    if raw:
        try:
            return float(raw)
        except ValueError:
            pass
    return 60.0


def _is_anthropic(rm: ResolvedModel) -> bool:
    return rm.provider_key in {"anthropic", "claude_subscription"} or rm.auth_scheme == "oauth_bearer"


def _is_gemini(rm: ResolvedModel) -> bool:
    return rm.provider_key == "gemini"


# --- text completion ---------------------------------------------------------

# --- safety helpers (2026-10-12 hardening review) ----------------------------
_SECRET_PATTERNS = (
    re.compile(r"([?&]key=)[^&\s'\"]+"),
    re.compile(r"AIza[0-9A-Za-z_\-]{20,}"),
    re.compile(r"sk-[A-Za-z0-9_\-]{16,}"),
)


def scrub_secrets(text: str) -> str:
    """Remove API keys from any text that may reach a client or a log."""
    out = str(text or "")
    for rx in _SECRET_PATTERNS:
        out = rx.sub(lambda m: (m.group(1) + "***") if m.groups() else "***", out)
    return out


def safe_error_text(exc: BaseException) -> str:
    """A provider failure as a short, key-free message: HTTP status + the
    provider's own error message — never the request URL (which used to carry
    the Gemini key in its query string and leaked it to the browser)."""
    resp = getattr(exc, "response", None)
    code = getattr(resp, "status_code", None)
    if code is not None:
        detail = ""
        try:
            body = resp.json()
            err = body.get("error") if isinstance(body, dict) else None
            if isinstance(err, dict):
                detail = str(err.get("message") or err.get("status") or err.get("type") or "")
            elif isinstance(err, str):
                detail = err
        except Exception:
            detail = (getattr(resp, "text", "") or "")[:200]
        return scrub_secrets(f"HTTP {code}" + (f": {detail[:300]}" if detail else ""))
    return scrub_secrets(f"{type(exc).__name__}: {exc}")[:400]


class EmptyAnswer(RuntimeError):
    """The provider answered 200 but with no usable text (blocked, safety,
    cut off before any answer…) — a failure, not an empty success."""


async def complete(
    db: AsyncSession,
    prompt: str,
    *,
    task: str = "chat",
    system: Optional[str] = None,
    max_tokens: int = 1024,
    temperature: Optional[float] = None,
    model_id: Optional[int] = None,
) -> Dict[str, Any]:
    """Complete a text prompt with the resolved model for ``task``.

    Automatic pick (no ``model_id``): up to three candidates in order (owner's live pin, then the
    automatic order); a failed call — retired model, 404, outage, empty answer — falls over to the
    next one, each attempt logged. An explicit ``model_id`` is tried alone (the caller asked for it)."""
    if model_id is not None:
        rm = await ai_manager.resolve_specific(db, model_id, task)
        rms = [rm] if rm is not None and rm.is_usable else []
    else:
        rms = await ai_manager.candidates(db, task)
        if not rms and task != "general":
            # one fallback: the generic task may have a model when the specific one doesn't
            rms = await ai_manager.candidates(db, "general")
    if not rms:
        return {"ok": False, "error": "no_model", "text": "", "model": None}

    import time as _time

    last: Dict[str, Any] = {}
    for rm in rms:
        _start = _time.perf_counter()
        try:
            if _is_anthropic(rm):
                text = await _anthropic_text(rm, prompt, system, max_tokens, temperature)
            elif _is_gemini(rm):
                text = await _gemini_text(rm, prompt, system, max_tokens, temperature)
            else:
                text = await _openai_text(rm, prompt, system, max_tokens, temperature)
            if not (text or "").strip():
                raise EmptyAnswer("پاسخِ خالی از مدل")
            await _record_usage(
                db, task=task, rm=rm, ok=True, error=None,
                prompt_chars=len(prompt), output_chars=len(text or ""),
                latency_ms=int((_time.perf_counter() - _start) * 1000),
            )
            return {"ok": True, "text": text, "model": rm.display_name, "provider": rm.provider_key}
        except Exception as exc:  # transport / provider error → try the next candidate
            err = safe_error_text(exc)
            await _record_usage(
                db, task=task, rm=rm, ok=False,
                error=err,
                prompt_chars=len(prompt), output_chars=0,
                latency_ms=int((_time.perf_counter() - _start) * 1000),
            )
            last = {"ok": False, "error": err, "text": "", "model": rm.display_name}
    return last


async def _record_usage(
    db: AsyncSession, *, task, rm, ok, error, prompt_chars, output_chars, latency_ms
) -> None:
    """Ledger every gateway call (حسابداری مصرف AI) in its OWN short-lived
    session. 2026-07-20 review: committing on the CALLER's session mid-call
    corrupted batch callers (triage_service commits AFTER its loop; a usage
    commit here flushed half-updated rows and a usage rollback wiped their
    staged changes). An independent session keeps transaction ownership
    with the caller. Fail-open: never break the inference."""
    try:
        from app.database import SessionLocal
        from app.models.ai_usage import AIUsageLog

        async with SessionLocal() as s:
            s.add(AIUsageLog(
                task=str(task or "general")[:64],
                model=(getattr(rm, "display_name", None) or "")[:160] or None,
                provider=(getattr(rm, "provider_key", None) or "")[:64] or None,
                ok=bool(ok),
                error=(error or None) and str(error)[:300],
                prompt_chars=int(prompt_chars or 0),
                output_chars=int(output_chars or 0),
                latency_ms=latency_ms,
            ))
            await s.commit()
    except Exception:
        pass


async def _anthropic_text(rm, prompt, system, max_tokens, temperature) -> str:
    import httpx

    root = (rm.base_url or "https://api.anthropic.com").rstrip("/")
    headers = {"content-type": "application/json", "anthropic-version": "2023-06-01"}
    if rm.auth_scheme == "oauth_bearer":
        headers["authorization"] = f"Bearer {rm.api_key}"
        # A Claude subscription OAuth token is ONLY accepted on /v1/messages with
        # this beta header + a Claude-CLI user-agent (+ the Claude-Code system
        # spoof below). Anthropic rejects the OAuth token with 401 if the
        # user-agent looks like a generic HTTP client (httpx default), which is
        # the exact 401 the owner hit — the fix that worked in ALLIN1.
        headers["anthropic-beta"] = "oauth-2025-04-20"
        headers["user-agent"] = "claude-cli/1.0 (external)"
    else:
        headers["x-api-key"] = rm.api_key
    system_blocks = []
    if rm.auth_scheme == "oauth_bearer":
        system_blocks.append({"type": "text", "text": CLAUDE_CODE_SYSTEM})
    if system:
        system_blocks.append({"type": "text", "text": system})
    payload: Dict[str, Any] = {
        "model": rm.model_key,
        "max_tokens": max_tokens or 1024,
        "messages": [{"role": "user", "content": prompt}],
    }
    if system_blocks:
        payload["system"] = system_blocks
    if temperature is not None:
        payload["temperature"] = temperature
    async with httpx.AsyncClient(timeout=_timeout()) as client:
        data = await _anthropic_post(client, f"{root}/v1/messages", headers, payload)
    parts = data.get("content", [])
    return "".join(p.get("text", "") for p in parts if isinstance(p, dict))


async def _anthropic_post(client, url, headers, payload):
    """POST to Anthropic and return the parsed body, with one self-healing retry:
    the newer models (e.g. Claude Opus 4.x) reject ``temperature`` with
    ``400 invalid_request_error: 'temperature' is deprecated for this model`` —
    drop it and retry once instead of failing the whole call."""
    resp = await client.post(url, headers=headers, json=payload)
    if (
        resp.status_code == 400
        and "temperature" in payload
        and "temperature" in (resp.text or "").lower()
    ):
        payload.pop("temperature", None)
        resp = await client.post(url, headers=headers, json=payload)
    resp.raise_for_status()
    return resp.json()


async def _gemini_text(rm, prompt, system, max_tokens, temperature) -> str:
    return await _gemini_generate(rm, [{"text": prompt}], system, max_tokens, temperature)


GEMINI_STOP_OK = {"STOP", "MAX_TOKENS", None, ""}


async def _gemini_generate(rm, parts, system, max_tokens, temperature) -> str:
    """One generateContent call for every Gemini path. The key travels in the
    ``x-goog-api-key`` header (never the URL). Thinking models (2.5+/3.x) count
    their reasoning against maxOutputTokens: an empty answer cut at MAX_TOKENS
    is retried once with room; a blocked/empty answer raises EmptyAnswer."""
    import httpx

    root = (rm.base_url or "https://generativelanguage.googleapis.com").rstrip("/")
    url = f"{root}/v1beta/models/{rm.model_key}:generateContent"
    headers = {"x-goog-api-key": rm.api_key or ""}
    payload: Dict[str, Any] = {"contents": [{"role": "user", "parts": parts}]}
    if system:
        payload["systemInstruction"] = {"parts": [{"text": system}]}
    gen: Dict[str, Any] = {}
    if max_tokens:
        gen["maxOutputTokens"] = max_tokens
    if temperature is not None:
        gen["temperature"] = temperature
    if gen:
        payload["generationConfig"] = gen
    async with httpx.AsyncClient(timeout=_timeout()) as client:
        resp = await client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        text, finish, block = _gemini_parse(resp.json())
        if not text.strip() and finish == "MAX_TOKENS" and max_tokens:
            payload["generationConfig"]["maxOutputTokens"] = max(int(max_tokens) * 4, 8192)
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            text, finish, block = _gemini_parse(resp.json())
    if not text.strip():
        raise EmptyAnswer(f"Gemini پاسخی نداد (finishReason={finish or '-'}, block={block or '-'})")
    if finish not in GEMINI_STOP_OK:
        raise EmptyAnswer(f"Gemini پاسخ را نیمه‌کاره متوقف کرد (finishReason={finish})")
    return text


def _gemini_parse(data: Dict[str, Any]):
    """(answer text without thought parts, finishReason, promptFeedback.blockReason)."""
    block = (data.get("promptFeedback") or {}).get("blockReason")
    cands = data.get("candidates", [])
    if not cands:
        return "", None, block
    parts = (cands[0].get("content") or {}).get("parts", []) or []
    text = "".join(p.get("text", "") for p in parts if isinstance(p, dict) and not p.get("thought"))
    return text, cands[0].get("finishReason"), block


async def _openai_text(rm, prompt, system, max_tokens, temperature) -> str:
    from app.services.ai.provider_service import call_openai_chat

    full = f"{system}\n\n{prompt}" if system else prompt
    result = await call_openai_chat(
        prompt=full,
        model=rm.model_key,
        max_tokens=max_tokens or 1024,
        temperature=temperature if temperature is not None else 0.3,
        api_key=rm.api_key,
        base_url=rm.base_url,
    )
    return result.get("generated_text", "")


# --- multimodal (documents / images) ----------------------------------------
async def complete_multimodal(
    db: AsyncSession,
    prompt: str,
    files: List[Dict[str, Any]],
    *,
    task: str = "document_extraction",
    system: Optional[str] = None,
    max_tokens: int = 8000,
    model_id: Optional[int] = None,
) -> Dict[str, Any]:
    """Send documents/images (``files=[{filename, mimetype, data: bytes}]``) to a
    documents/vision-capable model. Returns ``{ok, text, model}`` or an error
    dict with ``suggestions`` (other capable models) when the chosen model can't
    read the format."""
    # Capability the files actually need — so resolution picks a model that can
    # really read them (audio/video ⇒ audio, PDF ⇒ documents, else ⇒ vision).
    # This is what keeps routing automatic: ANY enabled model carrying the needed
    # capability is accepted; no provider is hard-coded.
    _mimes = [(f.get("mimetype") or "").lower() for f in files]
    if any(m.endswith("pdf") for m in _mimes):
        need = "documents"
    elif any(m.startswith(("audio/", "video/")) for m in _mimes):
        need = "audio"
    else:
        need = "vision"
    if model_id is not None:
        rm = await ai_manager.resolve_specific(db, model_id, task)
        rms = [rm] if rm is not None and rm.is_usable and need in rm.capabilities else []
        if not rms:
            capable = await ai_manager.capable_models(db, need)
            return {"ok": False, "error": "no_capable_model", "text": "", "model": None,
                    "suggestions": [{"id": m.id, "display_name": m.display_name} for m in capable]}
    else:
        # pin (if it can read these files) ⇒ automatic order among capable models; for a «fast/cheap»
        # task (preferred=fast) the fast capable ones come first — never silently the priciest.
        rms = await ai_manager.candidates(db, task, need=need)
        if not rms:
            capable = await ai_manager.capable_models(db, need)
            if capable:  # capable but its provider unusable (e.g. key missing) — say which ones exist
                return {"ok": False, "error": "no_capable_model", "text": "", "model": None,
                        "suggestions": [{"id": m.id, "display_name": m.display_name} for m in capable]}
            return {"ok": False, "error": "no_capable_model", "text": "", "model": None, "suggestions": []}

    import time as _time
    last: Dict[str, Any] = {}
    for rm in rms:
        _start = _time.perf_counter()
        try:
            if _is_anthropic(rm):
                text = await _anthropic_multimodal(rm, prompt, files, system, max_tokens)
            elif _is_gemini(rm):
                text = await _gemini_multimodal(rm, prompt, files, system, max_tokens)
            else:
                text = await _openai_multimodal(rm, prompt, files, system, max_tokens)
            if not (text or "").strip():
                raise EmptyAnswer("پاسخِ خالی از مدل")
            # حسابداریِ مصرف برای فراخوانی‌های تصویر/سند هم
            await _record_usage(db, task=task, rm=rm, ok=True, error=None, prompt_chars=len(prompt),
                                output_chars=len(text or ""), latency_ms=int((_time.perf_counter() - _start) * 1000))
            return {"ok": True, "text": text, "model": rm.display_name, "provider": rm.provider_key}
        except Exception as exc:
            err = safe_error_text(exc)
            await _record_usage(db, task=task, rm=rm, ok=False, error=err, prompt_chars=len(prompt),
                                output_chars=0, latency_ms=int((_time.perf_counter() - _start) * 1000))
            last = {"ok": False, "error": err, "text": "", "model": rm.display_name}
    return last


def _b64(data: bytes) -> str:
    return base64.standard_b64encode(data).decode()


async def _anthropic_multimodal(rm, prompt, files, system, max_tokens) -> str:
    import httpx

    root = (rm.base_url or "https://api.anthropic.com").rstrip("/")
    headers = {"content-type": "application/json", "anthropic-version": "2023-06-01",
               "anthropic-beta": "pdfs-2024-09-25"}
    if rm.auth_scheme == "oauth_bearer":
        headers["authorization"] = f"Bearer {rm.api_key}"
        # OAuth subscription tokens need the oauth beta flag (combined with the
        # pdfs beta) AND a Claude-CLI user-agent, or /v1/messages returns 401.
        headers["anthropic-beta"] = "oauth-2025-04-20,pdfs-2024-09-25"
        headers["user-agent"] = "claude-cli/1.0 (external)"
    else:
        headers["x-api-key"] = rm.api_key
    content: List[Dict[str, Any]] = []
    for f in files:
        mt = f.get("mimetype") or "application/octet-stream"
        b64 = _b64(f["data"])
        if mt.endswith("pdf"):
            content.append({"type": "document", "source": {"type": "base64", "media_type": "application/pdf", "data": b64}})
        else:
            content.append({"type": "image", "source": {"type": "base64", "media_type": mt, "data": b64}})
    content.append({"type": "text", "text": prompt})
    payload: Dict[str, Any] = {"model": rm.model_key, "max_tokens": max_tokens or 8000,
                               "messages": [{"role": "user", "content": content}]}
    sys_blocks = []
    if rm.auth_scheme == "oauth_bearer":
        sys_blocks.append({"type": "text", "text": CLAUDE_CODE_SYSTEM})
    if system:
        sys_blocks.append({"type": "text", "text": system})
    if sys_blocks:
        payload["system"] = sys_blocks
    async with httpx.AsyncClient(timeout=_timeout()) as client:
        data = await _anthropic_post(client, f"{root}/v1/messages", headers, payload)
    return "".join(p.get("text", "") for p in data.get("content", []) if isinstance(p, dict))


async def _gemini_multimodal(rm, prompt, files, system, max_tokens) -> str:
    parts: List[Dict[str, Any]] = []
    for f in files:
        parts.append({"inline_data": {"mime_type": f.get("mimetype") or "application/octet-stream",
                                       "data": _b64(f["data"])}})
    parts.append({"text": prompt})
    return await _gemini_generate(rm, parts, system, max_tokens, None)


async def _openai_multimodal(rm, prompt, files, system, max_tokens) -> str:
    import httpx

    # OpenAI chat-completions supports images (data URLs), not native PDF.
    root = (rm.base_url or "https://api.openai.com/v1").rstrip("/")
    user_content: List[Dict[str, Any]] = [{"type": "text", "text": prompt}]
    for f in files:
        mt = f.get("mimetype") or "image/png"
        if mt.endswith("pdf"):
            continue  # skip — unsupported on this family
        user_content.append({"type": "image_url",
                             "image_url": {"url": f"data:{mt};base64,{_b64(f['data'])}"}})
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": user_content})
    async with httpx.AsyncClient(timeout=_timeout()) as client:
        resp = await client.post(
            f"{root}/chat/completions",
            headers={"Authorization": f"Bearer {rm.api_key}", "Content-Type": "application/json"},
            json={"model": rm.model_key, "messages": messages, "max_tokens": max_tokens or 8000},
        )
        resp.raise_for_status()
        data = resp.json()
    return data["choices"][0]["message"]["content"]
