import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging

from .api.api import api_router
from .db.database import engine, Base
from .models.schema import ResearchIdea, ExperimentRun, ExperimentResult
from .core.logging import get_logger
from app.api import ideas, experiments, websockets
from app.core.config import settings

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Configure logging
logger = get_logger("main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for generating workshop-level scientific papers through AI-driven research and experimentation",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api")

# Include routers
app.include_router(ideas.router, prefix="/api", tags=["ideas"])
app.include_router(experiments.router, prefix="/api", tags=["experiments"])
app.include_router(websockets.router, tags=["websockets"])

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up AI Scientist Paper Generator API")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down AI Scientist Paper Generator API")

@app.get("/")
async def root():
    return {"message": "Welcome to AI Scientist API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 