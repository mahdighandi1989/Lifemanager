from fastapi import FastAPI
from app.routes import auth, tasks, projects

app = FastAPI(title="LifeManager API", version="1.0.0")

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(projects.router)


@app.get("/")
async def root():
    return {"message": "LifeManager API is running"}
