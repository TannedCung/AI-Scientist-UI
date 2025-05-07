import os
import json
import logging
import asyncio
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from concurrent.futures import ThreadPoolExecutor

from fastapi import HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from ..models.schema import (
    ResearchIdea, ExperimentRun, ExperimentResult, 
    IdeaStatus, ExperimentStatus, GenerateIdeasResponse
)
from .storage import r2_storage

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

logger = logging.getLogger(__name__)

# Create a thread pool for running long-running tasks
thread_pool = ThreadPoolExecutor(max_workers=4)

class AIScientistWrapper:
    """Wrapper class for AI Scientist functionality using Python modules directly."""
    def __init__(self):
        self.ideas_dir = Path("backend/app/services/AI-Scientist-v2/ai_scientist/ideas")
        self.experiments_dir = Path("backend/app/services/AI-Scientist-v2/experiments")
        os.makedirs(self.ideas_dir, exist_ok=True)
        os.makedirs(self.experiments_dir, exist_ok=True)

    async def generate_ideas(self, research_idea: ResearchIdea, db: Session) -> GenerateIdeasResponse:
        """Generate research ideas for a given research idea."""
        try:
            # Update status to generating
            research_idea.status = IdeaStatus.GENERATING
            db.commit()

            # Create LLM client
            client, model = create_client("gpt-4o-2024-05-13")

            # Generate ideas using our no-save version
            ideas = _generate_temp_free_idea(
                client=client,
                model=model,
                workshop_description=research_idea.abstract,
                max_num_generations=1,
                num_reflections=3,
                previous_ideas=research_idea.generated_ideas.get("ideas", None) or []
            )

            # Update research idea with generated ideas
            # Convert the list of dictionaries to a format suitable for JSONB
            research_idea.generated_ideas = {
                "ideas": ideas,
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "num_ideas": len(ideas)
                }
            }
            research_idea.status = IdeaStatus.GENERATED
            db.commit()

            return GenerateIdeasResponse(
                status=research_idea.status,
                idea_id=research_idea.id,
                generated_ideas=research_idea.generated_ideas
            )

        except Exception as e:
            logger.error(f"Error generating ideas: {str(e)}")
            research_idea.status = IdeaStatus.FAILED
            research_idea.error_message = str(e)
            db.commit()
            raise HTTPException(status_code=500, detail=str(e))

    async def run_experiment(self, idea_id: str, db: Session) -> ExperimentRun:
        """Run an experiment for a given research idea."""
        try:
            # Get the research idea
            research_idea = db.query(ResearchIdea).filter(ResearchIdea.id == idea_id).first()
            if not research_idea:
                raise HTTPException(status_code=404, detail="Research idea not found")

            # Create experiment run
            experiment_run = ExperimentRun(
                research_idea_id=idea_id,
                status=ExperimentStatus.RUNNING
            )
            db.add(experiment_run)
            db.commit()
            db.refresh(experiment_run)

            # Create experiment directory
            experiment_dir = self.experiments_dir / experiment_run.id
            os.makedirs(experiment_dir, exist_ok=True)

            try:
                # Run experiment using the AI model
                results = await self._run_experiment_task(
                    research_idea=research_idea,
                    experiment_run=experiment_run,
                    experiment_dir=experiment_dir,
                    db=db
                )

                # Update experiment run with results
                experiment_run.status = ExperimentStatus.COMPLETED
                experiment_run.is_successful = True
                experiment_run.completed_at = datetime.now()
                experiment_run.results_url = results.get("results_url")
                db.commit()

                return experiment_run

            except Exception as e:
                logger.error(f"Error running experiment: {str(e)}")
                experiment_run.status = ExperimentStatus.FAILED
                experiment_run.is_successful = False
                experiment_run.error_message = str(e)
                experiment_run.completed_at = datetime.now()
                db.commit()
                raise

        except Exception as e:
            logger.error(f"Error setting up experiment: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    async def _run_experiment_task(
        self,
        research_idea: ResearchIdea,
        experiment_run: ExperimentRun,
        experiment_dir: Path,
        db: Session
    ) -> Dict[str, Any]:
        """Run the actual experiment task."""
        try:
            # Create experiment configuration
            config = {
                "idea_id": research_idea.id,
                "experiment_id": experiment_run.id,
                "title": research_idea.title,
                "abstract": research_idea.abstract,
                "generated_ideas": research_idea.generated_ideas
            }

            # Save experiment configuration
            config_path = experiment_dir / "config.json"
            with open(config_path, "w") as f:
                json.dump(config, f, indent=2)

            # Run experiment using AI Scientist modules
            results = await perform_experiments_bfts(
                config_path=str(config_path),
                output_dir=str(experiment_dir),
                client=None,  # Will be created inside the function
                model="gpt-4o-2024-05-13"
            )

            # Save results
            results_path = experiment_dir / "results.json"
            with open(results_path, "w") as f:
                json.dump(results, f, indent=2)

            # Upload results to storage
            results_key = f"experiments/{research_idea.id}/{experiment_run.id}/results.json"
            results_url = await r2_storage.upload_file(str(results_path), results_key)

            return {
                "results_url": results_url,
                "results": results
            }

        except Exception as e:
            logger.error(f"Error in experiment task: {str(e)}")
            raise

# Create singleton instance
ai_scientist = AIScientistWrapper() 