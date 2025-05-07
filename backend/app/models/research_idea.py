from sqlalchemy import Column, String, Text, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class ResearchIdea(Base):
    __tablename__ = "research_ideas"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    keywords = Column(String, nullable=False)
    tldr = Column(String, nullable=False)
    abstract = Column(Text, nullable=False)
    markdown_file_path = Column(String, nullable=False)
    code_file_path = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class ExperimentRun(Base):
    __tablename__ = "experiment_runs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    research_idea_id = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")
    log_folder_path = Column(String, nullable=True)
    html_file_path = Column(String, nullable=True)
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
    is_successful = Column(Boolean, nullable=True) 