from fastapi import FastAPI, HTTPException
from sqlalchemy import text

from app.database import engine

app = FastAPI(title="Lifemanager")


@app.get("/")
def root():
    return {"status": "ok", "service": "lifemanager"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/health/db")
def health_db():
    if engine is None:
        raise HTTPException(status_code=503, detail="database not configured")
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"database unreachable: {exc}") from exc
    return {"status": "healthy", "database": "reachable"}
