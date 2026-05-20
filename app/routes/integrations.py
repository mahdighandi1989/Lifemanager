from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def integrations_root():
    return {"message": "Integrations routes working"}