"""Inference gateway — dispatch a resolved catalog model to its provider API.

Native support for three provider families (ported from ALLIN1):
  * Anthropic  → POST {base_url}/v1/messages  (x-api-key, or Bearer for OAuth)
  * Gemini     → POST {base_url}/v1beta/models/{model}:generateContent?key=
  * OpenAI-compatible (everything else) → POST {base_url}/chat/completions

``complete`` does text; ``complete_multimodal`` sends PDFs/images for extraction.
Both resolve through :data:`app.services.ai.manager.ai_manager` and return a
uniform ``{ok, text, model, error}`` dict — never raising into the caller, so a
route can always degrade to a placeholder.
"""
from __future__ import annotations

import base64
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
    """Complete a text prompt with the resolved model for ``task``."""
    rm = (
        await ai_manager.resolve_specific(db, model_id, task)
        if model_id is not None
        else await ai_manager.resolve(db, task)
    )
    if rm is None or not rm.is_usable:
        # one fallback: the generic task may have a model when the specific one doesn't
        if model_id is None and task != "general":
            rm = await ai_manager.resolve(db, "general")
    if rm is None or not rm.is_usable:
        return {"ok": False, "error": "no_model", "text": "", "model": None}

    try:
        if _is_anthropic(rm):
            text = await _anthropic_text(rm, prompt, system, max_tokens, temperature)
        elif _is_gemini(rm):
            text = await _gemini_text(rm, prompt, system, max_tokens, temperature)
        else:
            text = await _openai_text(rm, prompt, system, max_tokens, temperature)
        return {"ok": True, "text": text, "model": rm.display_name, "provider": rm.provider_key}
    except Exception as exc:  # transport / provider error → uniform failure
        return {"ok": False, "error": f"{type(exc).__name__}: {exc}", "text": "", "model": rm.display_name}


async def _anthropic_text(rm, prompt, system, max_tokens, temperature) -> str:
    import httpx

    root = (rm.base_url or "https://api.anthropic.com").rstrip("/")
    headers = {"content-type": "application/json", "anthropic-version": "2023-06-01"}
    if rm.auth_scheme == "oauth_bearer":
        headers["authorization"] = f"Bearer {rm.api_key}"
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
        resp = await client.post(f"{root}/v1/messages", headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
    parts = data.get("content", [])
    return "".join(p.get("text", "") for p in parts if isinstance(p, dict))


async def _gemini_text(rm, prompt, system, max_tokens, temperature) -> str:
    import httpx

    root = (rm.base_url or "https://generativelanguage.googleapis.com").rstrip("/")
    url = f"{root}/v1beta/models/{rm.model_key}:generateContent?key={rm.api_key}"
    payload: Dict[str, Any] = {"contents": [{"role": "user", "parts": [{"text": prompt}]}]}
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
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()
    cands = data.get("candidates", [])
    if not cands:
        return ""
    parts = cands[0].get("content", {}).get("parts", [])
    return "".join(p.get("text", "") for p in parts if isinstance(p, dict))


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
    rm = (
        await ai_manager.resolve_specific(db, model_id, task)
        if model_id is not None
        else await ai_manager.resolve(db, task)
    )
    need = "documents" if any((f.get("mimetype") or "").endswith("pdf") for f in files) else "vision"
    if rm is None or not rm.is_usable or need not in rm.capabilities:
        capable = await ai_manager.capable_models(db, need)
        if not capable:
            return {"ok": False, "error": "no_capable_model", "text": "", "model": None,
                    "suggestions": []}
        # pick the best capable model and resolve it
        rm = await ai_manager.resolve_specific(db, capable[0].id, task)
        if rm is None or not rm.is_usable:
            return {"ok": False, "error": "no_capable_model", "text": "", "model": None,
                    "suggestions": [{"id": m.id, "display_name": m.display_name} for m in capable]}

    try:
        if _is_anthropic(rm):
            text = await _anthropic_multimodal(rm, prompt, files, system, max_tokens)
        elif _is_gemini(rm):
            text = await _gemini_multimodal(rm, prompt, files, system, max_tokens)
        else:
            text = await _openai_multimodal(rm, prompt, files, system, max_tokens)
        return {"ok": True, "text": text, "model": rm.display_name, "provider": rm.provider_key}
    except Exception as exc:
        return {"ok": False, "error": f"{type(exc).__name__}: {exc}", "text": "", "model": rm.display_name}


def _b64(data: bytes) -> str:
    return base64.standard_b64encode(data).decode()


async def _anthropic_multimodal(rm, prompt, files, system, max_tokens) -> str:
    import httpx

    root = (rm.base_url or "https://api.anthropic.com").rstrip("/")
    headers = {"content-type": "application/json", "anthropic-version": "2023-06-01",
               "anthropic-beta": "pdfs-2024-09-25"}
    if rm.auth_scheme == "oauth_bearer":
        headers["authorization"] = f"Bearer {rm.api_key}"
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
        resp = await client.post(f"{root}/v1/messages", headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
    return "".join(p.get("text", "") for p in data.get("content", []) if isinstance(p, dict))


async def _gemini_multimodal(rm, prompt, files, system, max_tokens) -> str:
    import httpx

    root = (rm.base_url or "https://generativelanguage.googleapis.com").rstrip("/")
    url = f"{root}/v1beta/models/{rm.model_key}:generateContent?key={rm.api_key}"
    parts: List[Dict[str, Any]] = []
    for f in files:
        parts.append({"inline_data": {"mime_type": f.get("mimetype") or "application/octet-stream",
                                       "data": _b64(f["data"])}})
    parts.append({"text": prompt})
    payload: Dict[str, Any] = {"contents": [{"role": "user", "parts": parts}]}
    if system:
        payload["systemInstruction"] = {"parts": [{"text": system}]}
    if max_tokens:
        payload["generationConfig"] = {"maxOutputTokens": max_tokens}
    async with httpx.AsyncClient(timeout=_timeout()) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()
    cands = data.get("candidates", [])
    if not cands:
        return ""
    return "".join(p.get("text", "") for p in cands[0].get("content", {}).get("parts", []) if isinstance(p, dict))


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
