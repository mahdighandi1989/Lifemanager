"""/api/ai/chat — the cross-domain conversational assistant (phase 4).

The audit's #4 gap: every backend piece existed (gateway + data context)
but no chat surface was wired to them. This is that surface for the web;
Telegram's /ask shares the same service.
"""
from typing import List, Optional

from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.services.assistant_chat_service import answer_question

router = APIRouter()


class ChatTurn(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(max_length=4000)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    history: Optional[List[ChatTurn]] = None


@router.post("/api/ai/chat", tags=["ai"])
@handle_errors
async def assistant_chat(
    payload: ChatRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    result = await answer_question(
        db,
        user_id=user_id,
        question=payload.message,
        history=[t.model_dump() for t in (payload.history or [])],
    )
    return {**result, "success": result.get("ok", False)}
