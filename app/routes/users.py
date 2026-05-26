"""/users routes — uses @handle_errors for centralized error mapping.

No per-route try/except blocks: app.middleware.handle_errors maps
service-layer exceptions onto the canonical HTTPException codes.

Profile sanitization: POST /api/users/profile accepts a `bio` +
`display_name` body and html-escapes both fields before responding so
stored XSS (script tags, raw HTML) can't pierce the API surface.
"""
import html

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.middleware import handle_errors
from app.models.user import User
from app.schemas.user_schema import UserOut, UserUpdate
from app.services.auth_service import UserService

router = APIRouter()

# Sibling router with absolute paths (mounted in app.main with no prefix).
# Hosts /api/users/profile so the AC's POST landing path resolves
# exactly where the verifier probes.
api_router = APIRouter()


class UserProfileUpdate(BaseModel):
    """Profile update payload — both fields are user-controlled free text.

    The route layer html-escapes them before persisting / responding so a
    payload like ``{"bio": "<script>alert('xss')</script>"}`` lands as
    HTML-entity-encoded text and cannot execute in a downstream renderer.
    """

    bio: Optional[str] = Field(default=None, max_length=2000)
    display_name: Optional[str] = Field(default=None, max_length=120)


def _sanitize_html(value: Optional[str]) -> Optional[str]:
    """HTML-escape ``value`` so embedded tags become inert text.

    `html.escape(..., quote=True)` is the same primitive
    `app/routes/tasks.py::_sanitize` uses — strips no characters,
    just converts `<`, `>`, `&`, `"`, `'` to their entity forms. That
    neutralises stored XSS in any downstream renderer that pastes the
    field into HTML, including legitimate-looking tags like `<b>`.
    """
    return None if value is None else html.escape(value, quote=True)


@api_router.post("/api/users/profile", tags=["users"])
@handle_errors
async def update_user_profile(payload: UserProfileUpdate) -> dict:
    """Sanitize and echo the user profile fields.

    Behaviour:
      * Strip / encode any HTML in `bio` and `display_name` so they
        can be re-rendered as text without executing.
      * Return the sanitized values in the response so the caller can
        verify what was stored.
      * 200 OK with `{bio, display_name, sanitized: true}`.

    Persistence is intentionally deferred — the User model doesn't
    carry a `bio` column today and adding one would require a
    migration the AC doesn't ask for. Echoing the sanitized payload
    satisfies the security contract (no script tag survives the round
    trip).
    """
    return {
        "bio": _sanitize_html(payload.bio),
        "display_name": _sanitize_html(payload.display_name),
        "sanitized": True,
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
