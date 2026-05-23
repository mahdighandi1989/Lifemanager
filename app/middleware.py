from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

def setup_middleware(app: FastAPI):
    """
    Set up CORS middleware for the FastAPI application.
    
    This function is called from app/main.py during application startup.
    It configures CORS to allow all origins, methods, and headers.
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
