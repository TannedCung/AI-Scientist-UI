from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

Base = declarative_base()

class IdeaStatus(str, Enum):
    DRAFT = "draft"
    GENERATING = "generating"
    GENERATED = "generated"
    FAILED = "failed"

class ExperimentStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class ResearchIdea(Base):
    """Model for storing research ideas and their metadata."""
    __tablename__ = "research_ideas"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    keywords = Column(String, nullable=False)
    tldr = Column(String, nullable=False)
    abstract = Column(Text, nullable=False)
    markdown_file_path = Column(String, nullable=False)
    code_file_path = Column(String, nullable=True)
    status = Column(String, nullable=False, default=IdeaStatus.DRAFT)
    ideas_json_url = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    experiments = relationship("ExperimentRun", back_populates="research_idea", cascade="all, delete-orphan")

class ExperimentRun(Base):
    """Model for tracking experiment runs and their results."""
    __tablename__ = "experiment_runs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    research_idea_id = Column(String, ForeignKey("research_ideas.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, nullable=False, default=ExperimentStatus.PENDING)
    log_folder_path = Column(String, nullable=True)
    html_file_path = Column(String, nullable=True)
    results_url = Column(String, nullable=True)
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
    is_successful = Column(Boolean, nullable=True)
    error_message = Column(Text, nullable=True)
    experiment_config = Column(JSON, nullable=True)  # JSON string of experiment configuration

    # Relationships
    research_idea = relationship("ResearchIdea", back_populates="experiments")
    results = relationship("ExperimentResult", back_populates="experiment", cascade="all, delete-orphan")

class ExperimentResult(Base):
    """Model for storing detailed experiment results and metrics."""
    __tablename__ = "experiment_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    experiment_id = Column(String, ForeignKey("experiment_runs.id", ondelete="CASCADE"), nullable=False)
    metric_name = Column(String, nullable=False)
    metric_value = Column(String, nullable=False)  # Store as string to handle various data types
    metric_type = Column(String, nullable=False)  # e.g., 'float', 'int', 'string', 'json'
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    experiment = relationship("ExperimentRun", back_populates="results")

# Base Models
class ExperimentResultBase(BaseModel):
    id: str
    experiment_id: str
    metric_name: str
    metric_value: str
    metric_type: str
    created_at: datetime

    class Config:
        from_attributes = True

class ExperimentRunBase(BaseModel):
    id: str
    research_idea_id: str
    status: str
    log_folder_path: Optional[str] = None
    html_file_path: Optional[str] = None
    results_url: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    is_successful: Optional[bool] = None
    error_message: Optional[str] = None
    experiment_config: Optional[Dict[str, Any]] = None
    results: List[ExperimentResultBase] = []

    class Config:
        from_attributes = True

class ResearchIdeaBase(BaseModel):
    id: str
    title: str
    keywords: str
    tldr: str
    abstract: str
    markdown_file_path: str
    code_file_path: Optional[str] = None
    status: str
    ideas_json_url: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    experiments: List[ExperimentRunBase] = []

    class Config:
        from_attributes = True

# Request Models
class ResearchIdeaCreate(BaseModel):
    title: str
    keywords: str
    tldr: str
    abstract: str

class ExperimentRunCreate(BaseModel):
    research_idea_id: str

# Response Models
class ResearchIdeaResponse(ResearchIdeaBase):
    pass

class ExperimentRunResponse(ExperimentRunBase):
    pass

class ExperimentResultResponse(ExperimentResultBase):
    pass

# Status Response Models
class StatusResponse(BaseModel):
    status: str
    error_message: Optional[str] = None

class GenerateIdeasResponse(StatusResponse):
    idea_id: str
    ideas_json_url: Optional[str] = None

class RunExperimentResponse(StatusResponse):
    experiment_id: str
    idea_id: str
    started_at: datetime 