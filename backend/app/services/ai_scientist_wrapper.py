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

from ..models.schema import ResearchIdea, ExperimentRun, ExperimentResult, IdeaStatus, ExperimentStatus
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

logger = logging.getLogger(__name__)

# Create a thread pool for running long-running tasks
thread_pool = ThreadPoolExecutor(max_workers=4)

class AIScientistWrapper:
    """Wrapper class for AI Scientist functionality using Python modules directly."""
    
    def __init__(self):
        self.base_dir = Path("backend/app/services/AI-Scientist-v2")
        self.ideas_dir = self.base_dir / "ai_scientist" / "ideas"
        self.experiments_dir = self.base_dir / "experiments"
        
        # Ensure directories exist
        os.makedirs(self.ideas_dir, exist_ok=True)
        os.makedirs(self.experiments_dir, exist_ok=True)

    async def _update_idea_status(self, db: Session, idea_id: str, status: str, error_message: Optional[str] = None):
        """Update research idea status in database."""
        research_idea = db.query(ResearchIdea).filter(ResearchIdea.id == idea_id).first()
        if research_idea:
            research_idea.status = status
            if error_message:
                research_idea.error_message = error_message
            db.commit()

    async def _update_experiment_status(self, db: Session, experiment_id: str, status: str, error_message: Optional[str] = None):
        """Update experiment status in database."""
        experiment = db.query(ExperimentRun).filter(ExperimentRun.id == experiment_id).first()
        if experiment:
            experiment.status = status
            if error_message:
                experiment.error_message = error_message
            if status == ExperimentStatus.COMPLETED:
                experiment.completed_at = datetime.now()
                experiment.is_successful = True
            elif status == ExperimentStatus.FAILED:
                experiment.completed_at = datetime.now()
                experiment.is_successful = False
            db.commit()

    async def _generate_ideas_task(self, idea_id: str, db: Session):
        """Background task for generating ideas."""
        try:
            # Update status to generating
            await self._update_idea_status(db, idea_id, IdeaStatus.GENERATING)

            # Get the research idea from database
            research_idea = db.query(ResearchIdea).filter(ResearchIdea.id == idea_id).first()
            if not research_idea:
                raise Exception("Research idea not found")

            # Get local path for markdown file
            local_md_path = self.ideas_dir / idea_id / f"{idea_id}.md"
            if not os.path.exists(local_md_path):
                os.makedirs(os.path.dirname(local_md_path), exist_ok=True)
                success = r2_storage.download_file(research_idea.markdown_file_path, str(local_md_path))
                if not success:
                    raise Exception("Failed to download markdown file from R2")

            # Create LLM client
            client, model = create_client("gpt-4o-2024-05-13")

            # Run ideation using Python module
            ideas = generate_temp_free_idea(
                idea_fname=str(local_md_path.with_suffix('.json')),
                client=client,
                model=model,
                workshop_description=research_idea.abstract,
                max_num_generations=2,
                num_reflections=3,
                reload_ideas=True
            )

            # Save results
            output_json_path = local_md_path.with_suffix('.json')
            with open(output_json_path, 'w') as f:
                json.dump(ideas, f, indent=2)

            # Upload results to R2
            json_key = f"ideas/{idea_id}/{idea_id}.json"
            json_url = await r2_storage.upload_file(str(output_json_path), json_key)

            # Update research idea with results
            research_idea.ideas_json_url = json_url
            await self._update_idea_status(db, idea_id, IdeaStatus.GENERATED)

        except Exception as e:
            logger.error(f"Error generating ideas: {str(e)}")
            await self._update_idea_status(db, idea_id, IdeaStatus.FAILED, str(e))

    async def _run_experiment_task(self, experiment_id: str, idea_id: str, db: Session):
        """Background task for running experiments."""
        try:
            # Update status to running
            await self._update_experiment_status(db, experiment_id, ExperimentStatus.RUNNING)

            # Get the research idea from database
            research_idea = db.query(ResearchIdea).filter(ResearchIdea.id == idea_id).first()
            if not research_idea:
                raise Exception("Research idea not found")

            # Get local paths
            local_json_path = self.ideas_dir / idea_id / f"{idea_id}.json"
            local_code_path = self.ideas_dir / idea_id / f"{idea_id}.py"

            # Download required files from R2
            if not os.path.exists(local_json_path):
                os.makedirs(os.path.dirname(local_json_path), exist_ok=True)
                json_key = f"ideas/{idea_id}/{idea_id}.json"
                r2_storage.download_file(json_key, str(local_json_path))

            if research_idea.code_file_path and not os.path.exists(local_code_path):
                r2_storage.download_file(research_idea.code_file_path, str(local_code_path))

            # Create experiment directory
            timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            experiment_dir = self.experiments_dir / f"{timestamp}_{idea_id}"
            os.makedirs(experiment_dir, exist_ok=True)

            # Convert idea to markdown
            idea_path_md = experiment_dir / "idea.md"
            idea_to_markdown(
                json.loads(open(local_json_path).read())[0],  # Get first idea
                str(idea_path_md),
                str(local_code_path) if research_idea.code_file_path else None
            )

            # Edit BFTS config
            config_path = self.base_dir / "bfts_config.yaml"
            idea_config_path = edit_bfts_config_file(
                str(config_path),
                str(experiment_dir),
                str(local_json_path)
            )

            # Run experiments
            perform_experiments_bfts(idea_config_path)

            # Aggregate plots
            aggregate_plots(base_folder=str(experiment_dir), model="o3-mini-2025-01-31")

            # Gather citations
            citations_text = gather_citations(
                str(experiment_dir),
                num_cite_rounds=10,
                small_model="gpt-4o-2024-11-20"
            )

            # Generate writeup
            writeup_success = perform_icbinb_writeup(
                base_folder=str(experiment_dir),
                big_model="o1-preview-2024-09-12",
                page_limit=4,
                citations_text=citations_text
            )

            if not writeup_success:
                raise Exception("Failed to generate writeup")

            # Perform review
            pdf_path = next(experiment_dir.glob("*.pdf"))
            if pdf_path.exists():
                paper_content = load_paper(str(pdf_path))
                client, model = create_client("gpt-4o-2024-11-20")
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
            for file_path in experiment_dir.glob("**/*"):
                if file_path.is_file():
                    relative_path = file_path.relative_to(experiment_dir)
                    r2_key = f"{r2_key_base}/{relative_path}"
                    await r2_storage.upload_file(str(file_path), r2_key)

            # Update experiment status
            await self._update_experiment_status(db, experiment_id, ExperimentStatus.COMPLETED)

        except Exception as e:
            logger.error(f"Error running experiment: {str(e)}")
            await self._update_experiment_status(db, experiment_id, ExperimentStatus.FAILED, str(e))

    async def generate_ideas(self, idea_id: str, db: Session) -> Dict[str, Any]:
        """Start background task for generating research ideas."""
        try:
            # Get the research idea from database
            research_idea = db.query(ResearchIdea).filter(ResearchIdea.id == idea_id).first()
            if not research_idea:
                raise HTTPException(status_code=404, detail="Research idea not found")

            # Start background task
            asyncio.create_task(self._generate_ideas_task(idea_id, db))

            return {
                "idea_id": idea_id,
                "status": IdeaStatus.GENERATING,
                "message": "Idea generation started in background"
            }

        except Exception as e:
            logger.error(f"Error starting idea generation: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    async def run_experiment(self, idea_id: str, db: Session) -> Dict[str, Any]:
        """Start background task for running an experiment."""
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
            asyncio.create_task(self._run_experiment_task(experiment_run.id, idea_id, db))

            return {
                "experiment_id": experiment_run.id,
                "idea_id": idea_id,
                "status": ExperimentStatus.PENDING,
                "message": "Experiment started in background"
            }

        except Exception as e:
            logger.error(f"Error starting experiment: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

# Create singleton instance
ai_scientist = AIScientistWrapper() 