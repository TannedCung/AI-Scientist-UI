import os
import yaml
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Union
from pydantic import ValidationError
from fastapi import HTTPException

from ..models.settings import AIScientistSettings, UpdateSettingsRequest
from ..core.logging import get_logger

logger = get_logger("settings_service")

class SettingsService:
    """Service for managing system-wide AI Scientist settings"""
    
    def __init__(self, config_path: str = "backend/config.yaml"):
        self.config_path = Path(config_path)
        self.default_settings = AIScientistSettings()
        self.current_settings = self._load_settings()
        logger.info(f"Settings service initialized from {self.config_path}")

    def _load_settings(self) -> AIScientistSettings:
        """Load system-wide settings from YAML file"""
        try:
            if not self.config_path.exists():
                logger.warning(f"Config file {self.config_path} does not exist. Using default system settings.")
                return self.default_settings

            with open(self.config_path, 'r') as f:
                config_data = yaml.safe_load(f)
            
            # Handle nested dictionaries properly
            if 'agent' in config_data and isinstance(config_data['agent'], dict):
                # Fix for code settings which is incorrectly formatted in the YAML
                if 'code' in config_data['agent']:
                    if isinstance(config_data['agent']['code'], str):
                        model = config_data['agent']['code']
                        config_data['agent']['code'] = {'model': model, 'temp': 1.0, 'max_tokens': 12000}

            # Validate settings
            return AIScientistSettings(**config_data)
        except ValidationError as e:
            logger.error(f"Error validating system settings: {str(e)}")
            return self.default_settings
        except Exception as e:
            logger.error(f"Error loading system settings: {str(e)}")
            return self.default_settings

    def save_settings(self, settings: AIScientistSettings) -> bool:
        """Save system-wide settings to YAML file"""
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(self.config_path), exist_ok=True)

            # Convert model to dict
            settings_dict = settings.model_dump()
            
            # Save to YAML
            with open(self.config_path, 'w') as f:
                yaml.dump(settings_dict, f, default_flow_style=False)
            
            self.current_settings = settings
            logger.info(f"System settings saved to {self.config_path}")
            return True
        except Exception as e:
            logger.error(f"Error saving system settings: {str(e)}")
            return False

    def get_settings(self) -> AIScientistSettings:
        """Get current system-wide settings"""
        logger.debug("Returning current system settings")
        return self.current_settings
    
    def get_default_settings(self) -> AIScientistSettings:
        """Get default system-wide settings"""
        logger.debug("Returning default system settings")
        return self.default_settings
    
    def update_settings(self, update_data: Dict[str, Any]) -> AIScientistSettings:
        """Update system-wide settings with new values"""
        try:
            # Get current settings as dict
            current_dict = self.current_settings.model_dump()
            
            # Log the keys being updated at the top level
            top_level_keys = list(update_data.keys())
            logger.info(f"Updating system settings for sections: {', '.join(top_level_keys)}")
            
            # Apply updates
            self._deep_update(current_dict, update_data)
            
            # Validate and create new settings object
            new_settings = AIScientistSettings(**current_dict)
            
            # Save to file
            self.save_settings(new_settings)
            
            return new_settings
        except ValidationError as e:
            logger.error(f"Error validating updated system settings: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Invalid system settings: {str(e)}")
        except Exception as e:
            logger.error(f"Error updating system settings: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error updating system settings: {str(e)}")
    
    def reset_settings(self) -> AIScientistSettings:
        """Reset all system-wide settings to defaults"""
        logger.info("Resetting all system settings to default values")
        self.save_settings(self.default_settings)
        return self.default_settings

    def _deep_update(self, original: Dict, updates: Dict) -> None:
        """Recursively update nested dictionaries"""
        for key, value in updates.items():
            if key in original and isinstance(original[key], dict) and isinstance(value, dict):
                self._deep_update(original[key], value)
            else:
                original[key] = value
                logger.debug(f"Updated setting: {key}")


# Create singleton instance
settings_service = SettingsService() 