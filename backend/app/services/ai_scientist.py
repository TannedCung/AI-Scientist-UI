import os
import json
import uuid
import asyncio
import logging
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional

from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from ..models.research_idea import ResearchIdea, ExperimentRun
from .storage import r2_storage

logger = logging.getLogger(__name__)

# Base directory for AI Scientist service
AI_SCIENTIST_DIR = Path("backend/app/services/AI-Scientist-v2")
IDEAS_DIR = AI_SCIENTIST_DIR / "ai_scientist" / "ideas"
EXPERIMENTS_DIR = AI_SCIENTIST_DIR / "experiments"

class AIScientistService:
    @staticmethod
    async def create_research_idea(
        title: str,
        keywords: str,
        tldr: str, 
        abstract: str,
        code_file: Optional[UploadFile],
        db: Session
    ) -> Dict[str, Any]:
        """
        Create a new research idea and store it in the database
        """
        # Generate a unique ID for the research idea
        idea_id = str(uuid.uuid4())
        
        # Create directory structure for the idea
        idea_dir = IDEAS_DIR / idea_id
        os.makedirs(idea_dir, exist_ok=True)
        
        # Create markdown file
        md_content = f"# Title: {title}\n\n"
        md_content += f"## Keywords\n{keywords}\n\n"
        md_content += f"## TL;DR\n{tldr}\n\n"
        md_content += f"## Abstract\n{abstract}\n"
        
        md_file_path = idea_dir / f"{idea_id}.md"
        with open(md_file_path, 'w') as f:
            f.write(md_content)
        
        # Upload markdown file to R2
        md_file_key = f"ideas/{idea_id}/{idea_id}.md"
        md_url = await r2_storage.upload_file(str(md_file_path), md_file_key)
        
        # Handle code file if provided
        code_url = None
        code_file_key = None
        if code_file:
            # Save code file
            code_file_path = idea_dir / f"{idea_id}.py"  # Assuming Python code
            content = await code_file.read()
            with open(code_file_path, 'wb') as f:
                f.write(content)
            
            # Upload code file to R2
            code_file_key = f"ideas/{idea_id}/{idea_id}.py"
            code_url = await r2_storage.upload_file(str(code_file_path), code_file_key)
        
        # Create research idea in database
        research_idea = ResearchIdea(
            id=idea_id,
            title=title,
            keywords=keywords,
            tldr=tldr,
            abstract=abstract,
            markdown_file_path=md_file_key,
            code_file_path=code_file_key
        )
        
        db.add(research_idea)
        db.commit()
        db.refresh(research_idea)
        
        return {
            "id": research_idea.id,
            "title": research_idea.title,
            "markdown_url": md_url,
            "code_url": code_url,
            "created_at": research_idea.created_at
        }
    
    @staticmethod
    async def generate_ideas(idea_id: str, db: Session) -> Dict[str, Any]:
        """
        Generate research ideas using the AI Scientist ideation script
        """
        # Get the research idea from database
        research_idea = db.query(ResearchIdea).filter(ResearchIdea.id == idea_id).first()
        if not research_idea:
            raise HTTPException(status_code=404, detail="Research idea not found")
        
        # Download the markdown file from R2 if not locally available
        local_md_path = IDEAS_DIR / idea_id / f"{idea_id}.md"
        if not os.path.exists(local_md_path):
            os.makedirs(os.path.dirname(local_md_path), exist_ok=True)
            success = r2_storage.download_file(research_idea.markdown_file_path, str(local_md_path))
            if not success:
                raise HTTPException(status_code=500, detail="Failed to download markdown file from R2")
        
        # Run the ideation script
        cmd = [
            "python", 
            f"{AI_SCIENTIST_DIR}/ai_scientist/perform_ideation_temp_free.py",
            "--workshop-file", str(local_md_path),
            "--model", "gpt-4o-2024-05-13",
            "--max-num-generations", "2",
            "--num-reflections", "3"
        ]
        
        try:
            result = subprocess.run(
                cmd, 
                capture_output=True, 
                text=True, 
                check=True, 
                cwd=str(AI_SCIENTIST_DIR)
            )
            
            # Check if the output JSON file was created
            output_json_path = local_md_path.with_suffix('.json')
            if not os.path.exists(output_json_path):
                raise HTTPException(
                    status_code=500, 
                    detail="Failed to generate ideas: output JSON file not found"
                )
            
            # Upload the JSON file to R2
            json_key = f"ideas/{idea_id}/{idea_id}.json"
            json_url = await r2_storage.upload_file(str(output_json_path), json_key)
            
            return {
                "idea_id": idea_id,
                "status": "completed",
                "ideas_json_url": json_url
            }
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Error running ideation script: {e.stdout} {e.stderr}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to generate ideas: {e.stderr}"
            )
    
    @staticmethod
    async def run_experiment(idea_id: str, db: Session) -> Dict[str, Any]:
        """
        Run an AI Scientist experiment for a given idea ID
        """
        # Get the research idea from database
        research_idea = db.query(ResearchIdea).filter(ResearchIdea.id == idea_id).first()
        if not research_idea:
            raise HTTPException(status_code=404, detail="Research idea not found")
        
        # Create an experiment run record
        experiment_run = ExperimentRun(
            research_idea_id=idea_id,
            status="pending"
        )
        db.add(experiment_run)
        db.commit()
        db.refresh(experiment_run)
        
        # Start the experiment as a background task
        asyncio.create_task(
            AIScientistService._run_experiment_task(idea_id, experiment_run.id, db)
        )
        
        return {
            "experiment_id": experiment_run.id,
            "idea_id": idea_id,
            "status": "pending",
            "started_at": experiment_run.started_at
        }
    
    @staticmethod
    async def _run_experiment_task(idea_id: str, experiment_id: str, db: Session):
        """Background task to run the experiment"""
        try:
            # Get local paths to required files
            local_json_path = IDEAS_DIR / idea_id / f"{idea_id}.json"
            local_code_path = IDEAS_DIR / idea_id / f"{idea_id}.py"
            
            # Download files from R2 if not locally available
            if not os.path.exists(local_json_path):
                session = db()  # Create a new session for this background task
                research_idea = session.query(ResearchIdea).filter(ResearchIdea.id == idea_id).first()
                
                # Ensure directory exists
                os.makedirs(os.path.dirname(local_json_path), exist_ok=True)
                
                # Download JSON file - note: we need to adjust this path based on R2 structure
                json_key = f"ideas/{idea_id}/{idea_id}.json"
                r2_storage.download_file(json_key, str(local_json_path))
                
                # Download code file if needed
                if not os.path.exists(local_code_path):
                    r2_storage.download_file(research_idea.code_file_path, str(local_code_path))
                
                session.close()
            
            # Update experiment status to running
            session = db()
            experiment = session.query(ExperimentRun).filter(ExperimentRun.id == experiment_id).first()
            experiment.status = "running"
            session.commit()
            session.close()
            
            # Run the AI Scientist experiment
            cmd = [
                "python",
                f"{AI_SCIENTIST_DIR}/launch_scientist_bfts.py",
                "--load_ideas", str(local_json_path),
                "--load_code",
                "--add_dataset_ref",
                "--model_writeup", "gpt-4o-2024-05-13",
                "--model_citation", "gpt-4o-2024-05-13",
                "--model_review", "gpt-4o-2024-05-13",
                "--model_agg_plots", "gpt-4o-2024-05-13",
                "--num_cite_rounds", "10"
            ]
            
            result = subprocess.run(
                cmd, 
                capture_output=True, 
                text=True, 
                check=True, 
                cwd=str(AI_SCIENTIST_DIR)
            )
            
            # Look for the experiment output directory - it will be named with a timestamp
            # Example: experiments/YYYY-MM-DD_HH-MM-SS_ideaID/logs/0-run/unified_tree_viz.html
            timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            experiment_dir_pattern = f"{timestamp}*_{idea_id}"
            
            experiment_dirs = list(EXPERIMENTS_DIR.glob(experiment_dir_pattern))
            if not experiment_dirs:
                raise Exception("Experiment output directory not found")
            
            experiment_dir = experiment_dirs[0]
            log_dir = experiment_dir / "logs" / "0-run"
            html_file = log_dir / "unified_tree_viz.html"
            
            if not html_file.exists():
                raise Exception("Experiment output HTML file not found")
            
            # Upload experiment results to R2
            r2_key_base = f"experiments/{idea_id}/{experiment_id}"
            uploaded_files = await r2_storage.upload_directory(str(log_dir), r2_key_base)
            
            # Get the URL for the HTML file
            html_key = f"{r2_key_base}/unified_tree_viz.html"
            html_url = f"{r2_storage.endpoint_url}/{r2_storage.bucket_name}/{html_key}"
            
            # Update experiment record
            session = db()
            experiment = session.query(ExperimentRun).filter(ExperimentRun.id == experiment_id).first()
            experiment.status = "completed"
            experiment.log_folder_path = r2_key_base
            experiment.html_file_path = html_key
            experiment.completed_at = datetime.now()
            experiment.is_successful = True
            session.commit()
            session.close()
            
            logger.info(f"Experiment {experiment_id} completed successfully")
            
        except Exception as e:
            logger.error(f"Error running experiment {experiment_id}: {str(e)}")
            
            # Update experiment record with error status
            session = db()
            experiment = session.query(ExperimentRun).filter(ExperimentRun.id == experiment_id).first()
            experiment.status = "failed"
            experiment.completed_at = datetime.now()
            experiment.is_successful = False
            session.commit()
            session.close()
    
    @staticmethod
    def get_experiment_status(experiment_id: str, db: Session) -> Dict[str, Any]:
        """Get the status of an experiment"""
        experiment = db.query(ExperimentRun).filter(ExperimentRun.id == experiment_id).first()
        if not experiment:
            raise HTTPException(status_code=404, detail="Experiment not found")
        
        result = {
            "experiment_id": experiment.id,
            "idea_id": experiment.research_idea_id,
            "status": experiment.status,
            "started_at": experiment.started_at,
            "completed_at": experiment.completed_at,
            "is_successful": experiment.is_successful
        }
        
        # Include HTML file URL if available
        if experiment.html_file_path:
            result["html_url"] = f"{r2_storage.endpoint_url}/{r2_storage.bucket_name}/{experiment.html_file_path}"
        
        return result 