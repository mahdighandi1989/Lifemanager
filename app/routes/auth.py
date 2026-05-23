from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/")
async def root(request: Request):
    # TODO: This endpoint is a placeholder and should be replaced with a proper authentication implementation.
    # It currently exposes a public endpoint without any authentication, rate-limiting, or deprecation notice.
    # See issue #TODO for tracking.
    return JSONResponse(
        content={"message": "Auth endpoint", "status": "placeholder", "deprecated": True},
        headers={"X-Endpoint-Status": "placeholder"}
    )
