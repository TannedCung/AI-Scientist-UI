from app.websockets.manager import manager
from app.models.idea import IdeaStatus
from app.models.experiment import ExperimentStatus
from app.database import get_db
from sqlalchemy.orm import Session
import asyncio

async def update_idea_status(db: Session, idea_id: str, status: IdeaStatus, **kwargs):
    # Update the idea status in the database
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if idea:
        idea.status = status
        for key, value in kwargs.items():
            setattr(idea, key, value)
        db.commit()
        
        # Broadcast the update via WebSocket
        await manager.broadcast_idea_update(idea_id, {
            "id": idea.id,
            "status": idea.status,
            **kwargs
        })

async def update_experiment_status(db: Session, experiment_id: str, status: ExperimentStatus, **kwargs):
    # Update the experiment status in the database
    experiment = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if experiment:
        experiment.status = status
        for key, value in kwargs.items():
            setattr(experiment, key, value)
        db.commit()
        
        # Broadcast the update via WebSocket
        await manager.broadcast_experiment_update(experiment_id, {
            "id": experiment.id,
            "status": experiment.status,
            **kwargs
        })

# Example usage in a background task
async def process_idea(idea_id: str):
    db = next(get_db())
    try:
        # Update status to processing
        await update_idea_status(db, idea_id, IdeaStatus.GENERATING)
        
        # Do some processing...
        await asyncio.sleep(5)  # Simulate work
        
        # Update status to completed
        await update_idea_status(db, idea_id, IdeaStatus.GENERATED, 
                               markdown_url="path/to/markdown")
    except Exception as e:
        # Update status to failed
        await update_idea_status(db, idea_id, IdeaStatus.FAILED, 
                               error_message=str(e))
    finally:
        db.close()

async def process_experiment(experiment_id: str):
    db = next(get_db())
    try:
        # Update status to running
        await update_experiment_status(db, experiment_id, ExperimentStatus.RUNNING)
        
        # Do some processing...
        await asyncio.sleep(5)  # Simulate work
        
        # Update status to completed
        await update_experiment_status(db, experiment_id, ExperimentStatus.COMPLETED, 
                                     result_url="path/to/result")
    except Exception as e:
        # Update status to failed
        await update_experiment_status(db, experiment_id, ExperimentStatus.FAILED, 
                                     error_message=str(e))
    finally:
        db.close() 