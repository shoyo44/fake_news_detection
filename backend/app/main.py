from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import analyze, health

app = FastAPI(
    title="TruthGuard API",
    description="AI-Based Fake News Detection and Misinformation Analysis System",
    version="1.0.0",
)

# CORS — allow all origins (update for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(analyze.router, tags=["Analysis"])


@app.get("/")
async def root():
    return {
        "name": "TruthGuard API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "analyze": "POST /analyze",
    }
