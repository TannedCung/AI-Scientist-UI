from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ...db.database import get_db
from ...models.research_idea import ResearchIdea, ExperimentRun
from ...services.ai_scientist import AIScientistService

router = APIRouter()

@router.post("/ideas", summary="Create a new research idea")
async def create_research_idea(
    title: str = Form(...),
    keywords: str = Form(...),
    tldr: str = Form(...),
    abstract: str = Form(...),
    code_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Create a new research idea with the provided details and upload code file.
    
    - **title**: Title of the research idea
    - **keywords**: Keywords related to the research idea (comma-separated)
    - **tldr**: Short summary of the research idea
    - **abstract**: Detailed abstract of the research idea
    - **code_file**: Code file to be used for experimentation
    """
    return await AIScientistService.create_research_idea(
        title=title,
        keywords=keywords,
        tldr=tldr,
        abstract=abstract,
        code_file=code_file,
        db=db
    )

@router.get("/ideas", summary="Get all research ideas")
async def get_research_ideas(db: Session = Depends(get_db)):
    """
    Retrieve all research ideas from the database.
    """
    ideas = db.query(ResearchIdea).all()
    return ideas

@router.get("/ideas/{idea_id}", summary="Get a specific research idea")
async def get_research_idea(idea_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a specific research idea by its ID.
    """
    idea = db.query(ResearchIdea).filter(ResearchIdea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Research idea not found")
    return idea

@router.post("/ideas/{idea_id}/generate", summary="Generate research hypotheses")
async def generate_ideas(idea_id: str, db: Session = Depends(get_db)):
    """
    Generate research hypotheses for a given research idea.
    
    The AI Scientist will analyze the provided idea and generate potential
    research directions based on the title, keywords, TL;DR, and abstract.
    """
    return await AIScientistService.generate_ideas(idea_id=idea_id, db=db)

@router.post("/ideas/{idea_id}/experiments", summary="Run an experiment")
async def run_experiment(idea_id: str, db: Session = Depends(get_db)):
    """
    Start a new experiment run for the given research idea.
    
    The AI Scientist will execute experiments based on the generated ideas,
    analyze results, and produce a scientific paper.
    """
    return await AIScientistService.run_experiment(idea_id=idea_id, db=db)

@router.get("/experiments", summary="Get all experiments")
async def get_experiments(db: Session = Depends(get_db)):
    """
    Retrieve all experiment runs from the database.
    """
    experiments = db.query(ExperimentRun).all()
    return experiments

@router.get("/experiments/{experiment_id}", summary="Get experiment status")
async def get_experiment_status(experiment_id: str, db: Session = Depends(get_db)):
    """
    Get the status of a specific experiment run.
    
    This endpoint can be polled to check if an experiment has been completed
    and to retrieve the URL of the resulting HTML visualization.
    """
    return AIScientistService.get_experiment_status(experiment_id=experiment_id, db=db) 