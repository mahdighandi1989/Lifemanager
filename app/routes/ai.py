from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.schemas.ai_schema import AIModelConfigCreate, AIModelConfigUpdate, AIModelConfigOut, AIQueryRequest, AIQueryResponse
from app.services.ai_service import AIService
from app.models.user import User
from app.dependencies.auth import get_current_user

router = APIRouter()

@router.get("/configs", response_model=List[AIModelConfigOut])
async def list_ai_configs(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    ai_service = AIService(db)
    configs = await ai_service.get_user_configs(current_user.id)
    return configs

@router.post("/configs", response_model=AIModelConfigOut, status_code=status.HTTP_201_CREATED)
async def create_ai_config(config_data: AIModelConfigCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    ai_service = AIService(db)
    config = await ai_service.create_config(config_data, current_user.id)
    return config

@router.patch("/configs/{config_id}", response_model=AIModelConfigOut)
async def update_ai_config(config_id: int, config_data: AIModelConfigUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    ai_service = AIService(db)
    config = await ai_service.update_config(config_id, config_data, current_user.id)
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="AI config not found")
    return config

@router.delete("/configs/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ai_config(config_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    ai_service = AIService(db)
    success = await ai_service.delete_config(config_id, current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="AI config not found")

@router.post("/query", response_model=AIQueryResponse)
async def query_ai(query_data: AIQueryRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    ai_service = AIService(db)
    response = await ai_service.query(query_data, current_user.id)
    return response
