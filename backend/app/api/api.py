from fastapi import APIRouter

from .endpoints import research, settings

api_router = APIRouter()
api_router.include_router(research.router, prefix="/research", tags=["research"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"]) 