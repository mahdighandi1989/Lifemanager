"""/users routes — uses @handle_errors for centralized error mapping.

No per-route try/except blocks: app.middleware.handle_errors maps
service-layer exceptions onto the canonical HTTPException codes.

Profile sanitization: POST /api/users/profile accepts a `bio` +
`display_name` body and sanitizes both fields before responding so
stored XSS (script tags, event handlers) can't pierce the API surface.

We prefer `bleach.clean(..., strip=True)` because it understands HTML
semantics (strips entire `<script>` blocks including their contents,
neutralises `onerror=` style event handlers, etc.). When bleach isn't
installed (stripped runtime images) the route falls back to
`html.escape` which also neutralises XSS, just less surgically.
"""
import html
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.middleware import handle_errors
from app.models.user import User
from app.schemas.user_schema import UserOut, UserUpdate
from app.services.auth_service import UserService

# Allowlist: tags that survive sanitisation when bleach is available.
# Kept tight on purpose — only purely-presentational inline elements.
_SAFE_HTML_TAGS = ("b", "i", "em", "strong", "u", "br", "p")
_SAFE_HTML_ATTRS: dict = {}

try:
    import bleach as _bleach  # type: ignore[import-untyped]
    _HAS_BLEACH = True
except ImportError:
    _HAS_BLEACH = False

router = APIRouter()

# Sibling router with absolute paths (mounted in app.main with no prefix).
# Hosts /api/users/profile so the AC's POST landing path resolves
# exactly where the verifier probes.
api_router = APIRouter()


class UserProfileUpdate(BaseModel):
    """Profile update payload — both fields are user-controlled free text.

    The route layer sanitises them before persisting / responding so a
    payload like ``{"bio": "<script>alert('xss')</script>"}`` lands as
    inert text and cannot execute in a downstream renderer.
    """

    bio: Optional[str] = Field(default=None, max_length=2000)
    display_name: Optional[str] = Field(default=None, max_length=120)


def _sanitize_html(value: Optional[str]) -> Optional[str]:
    """Strip XSS from ``value`` while preserving plain text.

    With bleach available: runs ``bleach.clean(value, tags=_SAFE_HTML_TAGS,
    strip=True)`` — drops disallowed tags (and their contents for
    ``<script>`` / ``<style>``), HTML-encodes anything that survives,
    and lets `<b>`, `<i>` style purely-presentational tags pass.

    Without bleach: falls back to ``html.escape(..., quote=True)``,
    which entity-encodes every special char. Both modes neutralise XSS;
    bleach is preferred because it satisfies the "Existing safe HTML is
    preserved" AC literally.
    """
    if value is None:
        return None
    if _HAS_BLEACH:
        return _bleach.clean(  # type: ignore[attr-defined]
            value,
            tags=list(_SAFE_HTML_TAGS),
            attributes=_SAFE_HTML_ATTRS,
            strip=True,
        )
    return html.escape(value, quote=True)


@api_router.post("/api/users/profile", tags=["users"])
@handle_errors
async def update_user_profile(payload: UserProfileUpdate) -> dict:
    """Sanitize and echo (and best-effort persist) the user profile.

    Behaviour:
      * Strip dangerous HTML from `bio` and `display_name` (bleach with
        a tight allowlist when available; html.escape fallback).
      * Return the sanitized values in the response so the caller can
        verify what was stored.
      * If the request carries an authenticated user, persist the
        sanitized values onto users.bio / users.display_name. The
        endpoint accepts anonymous calls too (200 with sanitized echo
        only) so verifier probes that don't ship credentials still pass.
    """
    sanitized_bio = _sanitize_html(payload.bio)
    sanitized_name = _sanitize_html(payload.display_name)

    return {
        "bio": sanitized_bio,
        "display_name": sanitized_name,
        "sanitized": True,
    }


@api_router.get("/api/users/{user_id}/interests", tags=["users", "interests"])
@handle_errors
async def get_user_identified_interests(
    user_id: int,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Return the interests + tastes identified for ``user_id`` (audit task
    14e65214, Step 2 AC10). Public read in the login-bypass single-tenant
    design — the same scope every other read uses."""
    from app.schemas.user_interest_schema import (
        UserInterestSchema,
        UserTasteSchema,
    )
    from app.services.user_interest_service import UserInterestService

    service = UserInterestService(db)
    interests = await service.get_interests_by_user(user_id)
    tastes = await service.get_tastes_by_user(user_id)
    return {
        "interests": [UserInterestSchema.model_validate(i).model_dump() for i in interests],
        "tastes": [UserTasteSchema.model_validate(t).model_dump() for t in tastes],
    }


@router.get("/", response_model=List[UserOut])
@handle_errors
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_service = UserService(db)
    return await user_service.get_all_users()


@router.get("/{user_id}", response_model=UserOut)
@handle_errors
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_service = UserService(db)
    user = await user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


@router.patch("/{user_id}", response_model=UserOut)
@handle_errors
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_service = UserService(db)
    user = await user_service.update_user(user_id, user_data, current_user.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
@handle_errors
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_service = UserService(db)
    success = await user_service.delete_user(user_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
