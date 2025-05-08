from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any

from ...models.settings import AIScientistSettings, UpdateSettingsRequest
from ...services.settings_service import settings_service
from ...core.logging import get_logger

logger = get_logger("settings_api")

router = APIRouter()

@router.get("/", response_model=AIScientistSettings)
async def get_settings():
    """Get system-wide AI Scientist settings"""
    logger.info("Getting current system settings")
    return settings_service.get_settings()

@router.put("/", response_model=AIScientistSettings)
async def update_settings(update_data: UpdateSettingsRequest):
    """
    Update system-wide AI Scientist settings
    
    Example:
    ```json
    {
        "agent": {
            "num_workers": 8,
            "code": {
                "model": "gpt-4o-2024-11-20"
            }
        }
    }
    ```
    """
    logger.info(f"Updating system settings")
    return settings_service.update_settings(update_data.dict())

@router.post("/reset", response_model=AIScientistSettings)
async def reset_settings():
    """Reset system-wide AI Scientist settings to defaults"""
    logger.info("Resetting system settings to defaults")
    return settings_service.reset_settings() 