import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .api.api import api_router
from .db.database import engine, Base
from .models.research_idea import ResearchIdea, ExperimentRun

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Scientist API",
    description="API for generating scientific papers using AI Scientist",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to AI Scientist API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 