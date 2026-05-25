from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost:5432/lifemanager"
    DEBUG: bool = False

    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 80
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 3600

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
