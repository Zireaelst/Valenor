from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn
import os
from dotenv import load_dotenv

from app.api.routes import analysis, health
from app.core.config import settings
from app.core.logging import setup_logging

# Load environment variables
load_dotenv()

# Setup logging
setup_logging()

# Create FastAPI app
app = FastAPI(
    title="Valenor AI Service",
    description="AI-powered proposal analysis and scoring for Valenor Social Fund",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Include routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(analysis.router, prefix="/analyze", tags=["analysis"])

@app.get("/")
async def root():
    return {
        "message": "Valenor AI Service",
        "version": "1.0.0",
        "status": "running",
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development",
        log_level="info"
    )
