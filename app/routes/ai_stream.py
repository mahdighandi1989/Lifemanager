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

            task_id = data.get("task_id")
            from app.services.ai.task_feedback import generate_task_feedback
            from app.services.ai_service import AIService
            from app.services.task_analysis import analyze_user_tasks

            svc = AIService(db)
            context = await svc.get_task_context(user_id)
            analysis = await analyze_user_tasks(db, user_id=user_id)

            # Deterministic baseline chunks (always streamed so the client has
            # the structured signal), then the model-framed feedback within the
            # editable prompt box (Steps 7-8) — falls back to the baseline offline.
            baseline = (
                f"تسک‌ها: {context['pending']} در انتظار، {context['overdue']} عقب‌افتاده."
            )
            for chunk in [baseline, *analysis.get("patterns", [])]:
                await websocket.send_json({"type": "feedback", "chunk": chunk})

            fb = await generate_task_feedback(
                db, user_id=user_id, context=context, analysis=analysis,
                fallback=baseline, task_id=task_id,
            )
            if fb["model_generated"]:
                await websocket.send_json({"type": "feedback", "chunk": fb["feedback"]})
            await websocket.send_json(
                {"type": "done", "context": context, "model_generated": fb["model_generated"]}
            )
    except WebSocketDisconnect:
        return
