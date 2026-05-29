"""WebSocket AI feedback stream (audit task e606cca6 AC7).

The client connects to ``/ws/ai-stream`` and sends ``{"user_id": <int>,
"task_id": <optional>}``; the server streams dynamic feedback chunks (task
context + detected work patterns) and a final ``done`` frame. Uses Depends(get_db)
so tests can override the session.
"""
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter()


@router.websocket("/ws/ai-stream")
async def ai_stream(websocket: WebSocket, db: AsyncSession = Depends(get_db)):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            user_id = int(data.get("user_id", 0) or 0)

            from app.services.ai_service import AIService
            from app.services.task_analysis import analyze_user_tasks

            svc = AIService(db)
            context = await svc.get_task_context(user_id)
            analysis = await analyze_user_tasks(db, user_id=user_id)

            chunks = [
                f"تسک‌ها: {context['pending']} در انتظار، "
                f"{context['overdue']} عقب‌افتاده.",
                *analysis.get("patterns", []),
            ]
            for chunk in chunks:
                await websocket.send_json({"type": "feedback", "chunk": chunk})
            await websocket.send_json({"type": "done", "context": context})
    except WebSocketDisconnect:
        return
