from pydantic_settings import BaseSettings
from typing import List
import json

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Scientist Paper Generator"
    API_V1_STR: str = "/api"
    CORS_ORIGINS: List[str] = ["*"]
    
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_SERVER: str
    POSTGRES_PORT: str
    POSTGRES_DB: str
    
    @property
    def SQLALCHEMY_DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # R2 Storage Settings
    R2_ENDPOINT: str
    R2_ACCESS_KEY_ID: str
    R2_SECRET_ACCESS_KEY: str

    class Config:
        env_file = ".env"

settings = Settings() 