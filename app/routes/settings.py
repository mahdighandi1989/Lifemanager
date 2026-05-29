"""/api/settings/* — admin-managed global settings.

Audit task 1a08ded2 (AC 56-59). The global analysis prompt is stored as a
single GlobalSetting row (key='global_analysis_prompt'). Both endpoints are
admin-gated via get_current_admin_user, so a non-admin caller gets 403.
"""
from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import AuthContext, get_current_admin_user
from app.middleware import handle_errors
from app.models.global_setting import GlobalSetting

router = APIRouter()

_GLOBAL_ANALYSIS_PROMPT_KEY = "global_analysis_prompt"


class GlobalPromptBody(BaseModel):
    value: str = ""


@router.get("/api/settings/global-analysis-prompt", tags=["settings"])
@handle_errors
async def get_global_analysis_prompt(
    db: AsyncSession = Depends(get_db),
    _admin: AuthContext = Depends(get_current_admin_user),  # AC 59: non-admin -> 403
) -> dict:
    result = await db.execute(
        select(GlobalSetting).where(GlobalSetting.key == _GLOBAL_ANALYSIS_PROMPT_KEY)
    )
    row = result.scalars().first()
    return {"key": _GLOBAL_ANALYSIS_PROMPT_KEY, "value": row.value if row else ""}


@router.put("/api/settings/global-analysis-prompt", tags=["settings"])
@handle_errors
async def put_global_analysis_prompt(
    payload: GlobalPromptBody = Body(...),
    db: AsyncSession = Depends(get_db),
    _admin: AuthContext = Depends(get_current_admin_user),
) -> dict:
    result = await db.execute(
        select(GlobalSetting).where(GlobalSetting.key == _GLOBAL_ANALYSIS_PROMPT_KEY)
    )
    row = result.scalars().first()
    if row is None:
        row = GlobalSetting(key=_GLOBAL_ANALYSIS_PROMPT_KEY, value=payload.value)
        db.add(row)
    else:
        row.value = payload.value
    await db.commit()
    return {"key": _GLOBAL_ANALYSIS_PROMPT_KEY, "value": payload.value}
