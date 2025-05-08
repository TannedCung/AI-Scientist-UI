from pydantic import BaseModel, Field, RootModel
from typing import Dict, List, Optional, Any, Union


class ExecSettings(BaseModel):
    """Configuration for code execution"""
    timeout: int = Field(3600, description="Timeout in seconds for code execution")
    agent_file_name: str = Field("runfile.py", description="Name of the agent file")
    format_tb_ipython: bool = Field(False, description="Format traceback for IPython")


class ReportSettings(BaseModel):
    """Configuration for report generation"""
    model: str = Field("gpt-4o-2024-11-20", description="LLM model for report generation")
    temp: float = Field(1.0, description="Temperature for LLM generation")


class ExperimentSettings(BaseModel):
    """Configuration for experiment settings"""
    num_syn_datasets: int = Field(1, description="Number of synthetic datasets to generate")


class DebugSettings(BaseModel):
    """Configuration for debugging settings"""
    stage4: bool = Field(False, description="Enable stage 4 debugging")


class MultiSeedEvalSettings(BaseModel):
    """Configuration for multi-seed evaluation"""
    num_seeds: int = Field(3, description="Number of seeds for evaluation")


class StagesSettings(BaseModel):
    """Configuration for agent stages"""
    stage1_max_iters: int = Field(20, description="Maximum iterations for stage 1")
    stage2_max_iters: int = Field(12, description="Maximum iterations for stage 2")
    stage3_max_iters: int = Field(12, description="Maximum iterations for stage 3")
    stage4_max_iters: int = Field(18, description="Maximum iterations for stage 4")


class LLMSettings(BaseModel):
    """Configuration for LLM settings"""
    model: str = Field("gpt-4o-2024-11-20", description="LLM model")
    temp: float = Field(1.0, description="Temperature for generation")
    max_tokens: Optional[int] = Field(None, description="Maximum tokens for generation")


class SearchSettings(BaseModel):
    """Configuration for search settings"""
    max_debug_depth: int = Field(3, description="Maximum debug depth")
    debug_prob: float = Field(0.5, description="Debug probability")
    num_drafts: int = Field(3, description="Number of drafts")


class AgentSettings(BaseModel):
    """Configuration for agent settings"""
    type: str = Field("parallel", description="Agent type")
    num_workers: int = Field(4, description="Number of workers")
    stages: StagesSettings = Field(default_factory=StagesSettings, description="Stage settings")
    steps: int = Field(5, description="Number of steps")
    k_fold_validation: int = Field(1, description="K-fold validation")
    multi_seed_eval: MultiSeedEvalSettings = Field(default_factory=MultiSeedEvalSettings, description="Multi-seed evaluation settings")
    expose_prediction: bool = Field(False, description="Expose prediction function")
    data_preview: bool = Field(False, description="Provide data preview")
    code: LLMSettings = Field(default_factory=LLMSettings, description="Code LLM settings")
    feedback: LLMSettings = Field(default_factory=lambda: LLMSettings(temp=0.5, max_tokens=8192), description="Feedback LLM settings")
    vlm_feedback: LLMSettings = Field(default_factory=lambda: LLMSettings(temp=0.5, max_tokens=None), description="VLM feedback settings")
    search: SearchSettings = Field(default_factory=SearchSettings, description="Search settings")


class AIScientistSettings(BaseModel):
    """
    System-wide configuration for AI Scientist
    
    This model contains all settings that control the behavior of the AI Scientist platform,
    including data directories, execution parameters, report generation, and agent behavior.
    All settings are applied globally across the system.
    """
    data_dir: str = Field("data", description="Path to the task data directory")
    preprocess_data: bool = Field(False, description="Whether to preprocess data")
    goal: Optional[str] = Field(None, description="Goal description")
    eval: Optional[str] = Field(None, description="Evaluation description")
    log_dir: str = Field("logs", description="Directory for logs")
    workspace_dir: str = Field("workspaces", description="Directory for workspaces")
    copy_data: bool = Field(True, description="Whether to copy data to workspace")
    exp_name: str = Field("run", description="Experiment name")
    exec: ExecSettings = Field(default_factory=ExecSettings, description="Execution settings")
    generate_report: bool = Field(True, description="Whether to generate a report")
    report: ReportSettings = Field(default_factory=ReportSettings, description="Report settings")
    experiment: ExperimentSettings = Field(default_factory=ExperimentSettings, description="Experiment settings")
    debug: DebugSettings = Field(default_factory=DebugSettings, description="Debug settings")
    agent: AgentSettings = Field(default_factory=AgentSettings, description="Agent settings")


"""
Request model for updating system-wide settings

Use this model to update any part of the system settings.
The request body should contain the paths to the settings you want to update.

Example:
{
    "data_dir": "new_data_path",
    "agent": {
        "num_workers": 8,
        "code": {
            "model": "gpt-4o-2024-11-20"
        }
    }
}
"""
class UpdateSettingsRequest(RootModel[Dict[str, Any]]):
    model_config = {
        "title": "Settings Update Request",
        "description": "Dictionary containing the settings to update. Can contain nested paths."
    }
    
    def dict(self):
        return self.root 