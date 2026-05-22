from fastapi import APIRouter, Request, HTTPException
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhook", tags=["webhook"])

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "webhook"}

@router.post("/")
async def receive_webhook(request: Request):
    try:
        payload: Dict[str, Any] = await request.json()
        logger.info(f"Received webhook payload: {payload}")
        # Process webhook payload here
        return {"status": "received", "payload": payload}
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        raise HTTPException(status_code=400, detail=str(e))
