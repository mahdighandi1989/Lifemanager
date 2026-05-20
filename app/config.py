from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "Lifemanager API"
    DEBUG: bool = False
    
    # دیتابیس
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/lifemanager"
    
    # امنیت
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()