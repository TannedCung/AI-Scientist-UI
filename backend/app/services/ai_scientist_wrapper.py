import os
import json
import logging
import asyncio
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models.schema import ResearchIdea, ExperimentRun, ExperimentResult, IdeaStatus, ExperimentStatus
from ..db.database import get_db
from .storage import r2_storage
from .background_tasks import task_manager
from .settings_service import settings_service
from ..core.logging import get_logger

# Import AI Scientist modules
from .AI_Scientist_v2.ai_scientist.perform_ideation_temp_free import generate_temp_free_idea
from .AI_Scientist_v2.ai_scientist.llm import create_client
from .AI_Scientist_v2.ai_scientist.treesearch.perform_experiments_bfts_with_agentmanager import perform_experiments_bfts
from .AI_Scientist_v2.ai_scientist.treesearch.bfts_utils import idea_to_markdown, edit_bfts_config_file
from .AI_Scientist_v2.ai_scientist.perform_plotting import aggregate_plots
from .AI_Scientist_v2.ai_scientist.perform_writeup import perform_writeup
from .AI_Scientist_v2.ai_scientist.perform_icbinb_writeup import perform_writeup as perform_icbinb_writeup, gather_citations
from .AI_Scientist_v2.ai_scientist.perform_llm_review import perform_review, load_paper
from .AI_Scientist_v2.ai_scientist.perform_vlm_review import perform_imgs_cap_ref_review
from .AI_Scientist_v2.ai_scientist.utils.token_tracker import token_tracker

from .idea_generator import _generate_temp_free_idea

logger = get_logger("ai_scientist_wrapper")

class AIScientistWrapper:
    """Wrapper class for AI Scientist functionality using Python modules directly."""
    
    def __init__(self):
        self.base_dir = Path("backend/app/services/AI-Scientist-v2")
        self.ideas_dir = Path("ideas")
        self.experiments_dir = Path("experiments")
        
        # Ensure directories exist
        os.makedirs(self.ideas_dir, exist_ok=True)
        os.makedirs(self.experiments_dir, exist_ok=True)

    async def generate_ideas(self, idea_id: str, db: Session) -> Dict[str, Any]:
        """
        Start generating research ideas as a background task.
        Updates the status in the database and returns immediately.
        """
        try:
            # Get the research idea from database
            research_idea = db.query(ResearchIdea).filter(ResearchIdea.id == idea_id).first()
            if not research_idea:
                raise HTTPException(status_code=404, detail="Research idea not found")

            # Update status to generating
            research_idea.status = IdeaStatus.GENERATING
            db.commit()
            
            # Start background task
            task_id = task_manager.create_task(
                self._generate_ideas_task,
                idea_id=idea_id
            )
            
            logger.info(f"Started idea generation task {task_id} for idea {idea_id}")
            
            return {
                "status": "generating",
                "idea_id": idea_id,
                "task_id": task_id,
                "message": "Idea generation started in the background"
            }

        except Exception as e:
            logger.error(f"Error starting idea generation: {str(e)}")
            
            # Update status to failed
            if 'research_idea' in locals() and research_idea:
                research_idea.status = IdeaStatus.FAILED
                research_idea.error_message = str(e)
                db.commit()
                
            raise HTTPException(status_code=500, detail=str(e))

    def _generate_ideas_task(self, idea_id: str) -> Dict[str, Any]:
        """
        Background task to generate research ideas.
        This runs in a separate thread.
        """
        try:
            # Get a new database session for this thread
            db = next(get_db())
            
            # Get the research idea
            research_idea = db.query(ResearchIdea).filter(ResearchIdea.id == idea_id).first()
            if not research_idea:
                raise Exception("Research idea not found")

            logger.info(f"Generating ideas for {idea_id}: {research_idea.title}")
            
            # Create LLM client
            client, model = create_client(settings_service.get_settings().agent.code.model)
            
            # Generate ideas
            ideas = _generate_temp_free_idea(
                client=client,
                model=model,
                workshop_description=research_idea.abstract,
                max_num_generations=1,
                num_reflections=3,
                previous_ideas=research_idea.generated_ideas.get("ideas", [])
            )
            
            # Save results to database
            research_idea.status = IdeaStatus.GENERATED
            research_idea.generated_ideas = {
                "ideas": ideas,
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "num_ideas": len(ideas),
                    "model": model
                }
            }
            db.commit()
            
            logger.info(f"Successfully generated {len(ideas)} ideas for {idea_id}")
            
            return {
                "idea_id": idea_id,
                "status": "completed",
                "generated_ideas": research_idea.generated_ideas
            }
            
        except Exception as e:
            logger.error(f"Error generating ideas: {str(e)}")
            
            # Update status to failed
            try:
                db = next(get_db())
                research_idea = db.query(ResearchIdea).filter(ResearchIdea.id == idea_id).first()
                if research_idea:
                    research_idea.status = IdeaStatus.FAILED
                    research_idea.error_message = str(e)
                    db.commit()
            except Exception as db_error:
                logger.error(f"Failed to update database: {str(db_error)}")
            
            raise

    async def run_experiment(self, idea_id: str, db: Session) -> Dict[str, Any]:
        """
        Start running an experiment as a background task.
        Updates the status in the database and returns immediately.
        """
        try:
            # Get the research idea from database
            research_idea = db.query(ResearchIdea).filter(ResearchIdea.id == idea_id).first()
            if not research_idea:
                raise HTTPException(status_code=404, detail="Research idea not found")

            # Create experiment run record
            experiment_run = ExperimentRun(
                research_idea_id=idea_id,
                status=ExperimentStatus.PENDING
            )
            db.add(experiment_run)
            db.commit()
            db.refresh(experiment_run)
            
            # Start background task
            task_id = task_manager.create_task(
                self._run_experiment_task,
                idea_id=idea_id,
                experiment_id=experiment_run.id
            )
            
            logger.info(f"Started experiment task {task_id} for idea {idea_id}")
            
            return {
                "status": "pending",
                "experiment_id": experiment_run.id,
                "idea_id": idea_id,
                "task_id": task_id,
                "message": "Experiment started in the background",
                "started_at": experiment_run.started_at
            }

        except Exception as e:
            logger.error(f"Error starting experiment: {str(e)}")
            
            # Update status to failed if experiment_run was created
            if 'experiment_run' in locals() and experiment_run:
                experiment_run.status = ExperimentStatus.FAILED
                experiment_run.error_message = str(e)
                db.commit()
                
            raise HTTPException(status_code=500, detail=str(e))

    def _run_experiment_task(self, idea_id: str, experiment_id: str) -> Dict[str, Any]:
        """
        Background task to run an experiment.
        This runs in a separate thread.
        """
        try:
            # Get a new database session for this thread
            db = next(get_db())
            
            # Get the research idea and experiment
            research_idea = db.query(ResearchIdea).filter(ResearchIdea.id == idea_id).first()
            experiment_run = db.query(ExperimentRun).filter(ExperimentRun.id == experiment_id).first()
            
            if not research_idea:
                raise Exception("Research idea not found")
            if not experiment_run:
                raise Exception("Experiment run not found")

            # Update experiment status
            experiment_run.status = ExperimentStatus.RUNNING
            db.commit()
            
            logger.info(f"Running experiment {experiment_id} for idea {idea_id}")
            
            # Get idea JSON file
            idea_dir = self.ideas_dir / idea_id
            os.makedirs(idea_dir, exist_ok=True)
            idea_json_path = idea_dir / f"{idea_id}.json"
            
            # Get code file if available
            code_path = None
            if research_idea.code_file_path:
                code_path = idea_dir / f"{idea_id}.py"
                # TODO: Download code file from R2 if needed
            
            # Create experiment directory
            timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            experiment_dir = self.experiments_dir / f"{timestamp}_{idea_id}"
            os.makedirs(experiment_dir, exist_ok=True)
            
            # Save reference to log folder
            experiment_run.log_folder_path = str(experiment_dir)
            db.commit()
            
            # Convert idea to markdown for the experiment
            ideas = research_idea.generated_ideas.get("ideas", [])
            
            if not ideas:
                raise Exception("No ideas found. Generate ideas first")
            # TODO: Add Function: run_experiment for the idea number
            # Create ideas JSON file from ideas
            with open(idea_json_path, "w") as f:
                json.dump(ideas[0], f, indent=4)
            
            # Get settings
            settings = settings_service.get_settings()
            
            # Create experiment config
            config_path = settings_service.config_path
            idea_config_path = edit_bfts_config_file(
                str(config_path),
                str(experiment_dir),
                str(idea_json_path)
            )
            
            # Run experiments
            perform_experiments_bfts(idea_config_path)
            
            # Aggregate plots
            aggregate_plots(base_folder=str(experiment_dir), model=settings.agent.code.model)
            
            # Gather citations
            citations_text = gather_citations(
                str(experiment_dir),
                num_cite_rounds=10,
                small_model=settings.agent.code.model
            )
            
            # Generate writeup
            writeup_success = perform_icbinb_writeup(
                base_folder=str(experiment_dir),
                big_model=settings.report.model,
                page_limit=4,
                citations_text=citations_text
            )
            
            if not writeup_success:
                logger.warning(f"Failed to generate writeup for experiment {experiment_id}")
            
            # Perform review if we have a PDF
            pdf_path = None
            for pdf_file in experiment_dir.glob("*.pdf"):
                pdf_path = pdf_file
                break
                
            if pdf_path and pdf_path.exists():
                paper_content = load_paper(str(pdf_path))
                client, model = create_client(settings.agent.code.model)
                review_text = perform_review(paper_content, model, client)
                review_img_cap_ref = perform_imgs_cap_ref_review(client, model, str(pdf_path))
                
                # Save reviews
                with open(experiment_dir / "review_text.txt", "w") as f:
                    f.write(json.dumps(review_text, indent=4))
                with open(experiment_dir / "review_img_cap_ref.json", "w") as f:
                    json.dump(review_img_cap_ref, f, indent=4)
            
            # Save token tracker data
            with open(experiment_dir / "token_tracker.json", "w") as f:
                json.dump(token_tracker.get_summary(), f)
            with open(experiment_dir / "token_tracker_interactions.json", "w") as f:
                json.dump(token_tracker.get_interactions(), f)
            
            # Upload results to R2
            r2_key_base = f"experiments/{idea_id}/{experiment_id}"
            results_url = f"{r2_storage.endpoint_url}/{r2_storage.bucket_name}/{r2_key_base}"
            
            # Find HTML file
            html_path = None
            for html_file in experiment_dir.glob("**/unified_tree_viz.html"):
                html_path = html_file
                break
            
            # Update experiment status
            experiment_run.status = ExperimentStatus.COMPLETED
            experiment_run.completed_at = datetime.now()
            experiment_run.is_successful = True
            experiment_run.results_url = results_url
            if html_path:
                experiment_run.html_file_path = f"{r2_key_base}/{html_path.relative_to(experiment_dir)}"
            db.commit()
            
            # TODO: Upload all files to R2 storage
            # This should be done in small batches to avoid overloading the system
            
            logger.info(f"Successfully completed experiment {experiment_id} for idea {idea_id}")
            
            return {
                "experiment_id": experiment_id,
                "idea_id": idea_id,
                "status": "completed",
                "results_url": results_url,
                "html_file_path": experiment_run.html_file_path
            }
            
        except Exception as e:
            logger.error(f"Error running experiment: {str(e)}")
            
            # Update status to failed
            try:
                db = next(get_db())
                experiment_run = db.query(ExperimentRun).filter(ExperimentRun.id == experiment_id).first()
                if experiment_run:
                    experiment_run.status = ExperimentStatus.FAILED
                    experiment_run.error_message = str(e)
                    experiment_run.completed_at = datetime.now()
                    experiment_run.is_successful = False
                    db.commit()
            except Exception as db_error:
                logger.error(f"Failed to update database: {str(db_error)}")
            
            raise

    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get the status of a background task"""
        try:
            return task_manager.get_task_status(task_id)
        except ValueError as e:
            logger.error(f"Error getting task status: {str(e)}")
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            logger.error(f"Error getting task status: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

# Create singleton instance
ai_scientist = AIScientistWrapper() 