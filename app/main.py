from fastapi import FastAPI

app = FastAPI(title="Lifemanager")


@app.get("/")
def root():
    return {"status": "ok", "service": "lifemanager"}


@app.get("/health")
def health():
    return {"status": "healthy"}
