from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def notifications_root():
    return {"message": "Notifications routes working"}