from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import uuid
import os
import logging
from datetime import datetime

from ...db.database import get_db
from ...models.schema import (
    GenerateIdeasResponse, ResearchIdea, ExperimentRun, ExperimentResult,
    ResearchIdeaResponse, ExperimentRunResponse, ResearchIdeaCreate,
    IdeaStatus, ExperimentStatus, StatusResponse, RunExperimentResponse
)
from ...services.storage import r2_storage
from ...services.ai_scientist_wrapper import ai_scientist, AIScientistWrapper
from ...services.background_tasks import task_manager
from ...core.logging import get_logger

# Configure logging
logger = get_logger("research_api")

router = APIRouter()

def get_ai_scientist() -> AIScientistWrapper:
    return ai_scientist

@router.post("/ideas", response_model=ResearchIdeaResponse)
async def create_research_idea(
    title: str = Form(...),
    keywords: str = Form(...),
    tldr: str = Form(...),
    abstract: str = Form(...),
    code_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """Create a new research idea."""
    try:
        logger.info(f"Creating new research idea: {title}")
        
        # Generate unique ID for the research idea
        idea_id = str(uuid.uuid4())
        
        # Create directory structure
        idea_dir = f"ideas/{idea_id}"
        os.makedirs(idea_dir, exist_ok=True)
        
        # Handle code file if provided
        code_file_path = None
        if code_file:
            logger.info(f"Processing code file: {code_file.filename}")
            code_path = f"{idea_dir}/{idea_id}.py"
            with open(code_path, "wb") as f:
                content = await code_file.read()
                f.write(content)
            
            code_key = f"{idea_dir}/{idea_id}.py"
            code_url = await r2_storage.upload_file(code_path, code_key)
            code_file_path = code_key
            logger.info(f"Uploaded code file to R2: {code_key}")
        
        # Create research idea in database
        research_idea = ResearchIdea(
            id=idea_id,
            title=title,
            keywords=keywords,
            tldr=tldr,
            abstract=abstract,
            code_file_path=code_file_path,
            status=IdeaStatus.DRAFT,
            created_at=datetime.now()
        )
        db.add(research_idea)
        db.commit()
        db.refresh(research_idea)
        logger.info(f"Created research idea in database: {idea_id}")
        
        return research_idea
        
    except Exception as e:
        logger.error(f"Error creating research idea: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ideas", response_model=List[ResearchIdeaResponse])
async def get_all_research_ideas(db: Session = Depends(get_db)):
    """Get all research ideas."""
    try:
        logger.info("Fetching all research ideas")
        ideas = db.query(ResearchIdea).all()
        logger.info(f"Found {len(ideas)} research ideas")
        return ideas
    except Exception as e:
        logger.error(f"Error fetching research ideas: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ideas/{idea_id}", response_model=ResearchIdeaResponse)
async def get_research_idea(idea_id: str, db: Session = Depends(get_db)):
    """Get a specific research idea."""
    try:
        logger.info(f"Fetching research idea: {idea_id}")
        research_idea = db.query(ResearchIdea).filter(ResearchIdea.id == idea_id).first()
        if not research_idea:
            logger.warning(f"Research idea not found: {idea_id}")
            raise HTTPException(status_code=404, detail="Research idea not found")
        return research_idea
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching research idea {idea_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ideas/{idea_id}/generate", response_model=GenerateIdeasResponse)
async def generate_research_hypotheses(idea_id: str, db: Session = Depends(get_db)):
    """Generate research hypotheses for a specific idea as a background task."""
    try:
        logger.info(f"Starting hypothesis generation for idea: {idea_id}")
        result = await ai_scientist.generate_ideas(idea_id, db)
        logger.info(f"Successfully queued hypothesis generation for idea: {idea_id}")
        return GenerateIdeasResponse(
            status="generating",
            idea_id=idea_id,
            task_id=result.get("task_id")
        )
    except Exception as e:
        logger.error(f"Error generating hypotheses for idea {idea_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ideas/{idea_id}/experiments", response_model=RunExperimentResponse)
async def run_experiment(idea_id: str, db: Session = Depends(get_db)):
    """Run an experiment for a specific research idea as a background task."""
    try:
        logger.info(f"Starting experiment for idea: {idea_id}")
        result = await ai_scientist.run_experiment(idea_id, db)
        logger.info(f"Successfully queued experiment for idea: {idea_id}")
        return RunExperimentResponse(
            status="pending",
            experiment_id=result.get("experiment_id"),
            idea_id=idea_id,
            task_id=result.get("task_id"),
            started_at=result.get("started_at")
        )
    except Exception as e:
        logger.error(f"Error running experiment for idea {idea_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/experiments", response_model=List[ExperimentRunResponse])
async def get_all_experiments(db: Session = Depends(get_db)):
    """Get all experiment runs."""
    try:
        logger.info("Fetching all experiments")
        experiments = db.query(ExperimentRun).all()
        logger.info(f"Found {len(experiments)} experiments")
        return experiments
    except Exception as e:
        logger.error(f"Error fetching experiments: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/experiments/{experiment_id}", response_model=ExperimentRunResponse)
async def get_experiment_status(experiment_id: str, db: Session = Depends(get_db)):
    """Get the status of a specific experiment."""
    try:
        logger.info(f"Fetching experiment status: {experiment_id}")
        experiment = db.query(ExperimentRun).filter(ExperimentRun.id == experiment_id).first()
        if not experiment:
            logger.warning(f"Experiment not found: {experiment_id}")
            raise HTTPException(status_code=404, detail="Experiment not found")
        return experiment
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching experiment {experiment_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks/{task_id}", response_model=Dict[str, Any])
async def get_task_status(task_id: str):
    """Get the status of a background task."""
    try:
        logger.info(f"Fetching task status: {task_id}")
        status = await ai_scientist.get_task_status(task_id)
        logger.info(f"Task {task_id} status: {status.get('status')}")
        return status
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching task {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tasks/{task_id}/cancel", response_model=StatusResponse)
async def cancel_task(task_id: str):
    """Cancel a background task if it's still pending."""
    try:
        logger.info(f"Cancelling task: {task_id}")
        result = task_manager.cancel_task(task_id)
        if result:
            logger.info(f"Successfully cancelled task: {task_id}")
            return StatusResponse(status="cancelled")
        else:
            logger.warning(f"Task {task_id} could not be cancelled (already running or completed)")
            return StatusResponse(status="not_cancelled", error_message="Task already running or completed")
    except ValueError as e:
        logger.error(f"Error cancelling task {task_id}: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error cancelling task {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 