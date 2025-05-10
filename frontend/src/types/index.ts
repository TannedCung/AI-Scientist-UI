export interface ResearchIdea {
  id: string;
  title: string;
  keywords: string;
  tldr: string;
  abstract: string;
  code_file_path: string | null;
  status: string;
  generated_ideas: any | null;
  error_message: string | null;
  created_at: string;
  updated_at: string | null;
  experiments: ExperimentRun[];
}

export interface CreateResearchIdeaResponse {
  id: string;
  title: string;
  markdown_url: string;
  code_url: string;
  created_at: string;
  status: string;
  error_message: string | null;
}

export interface GenerateIdeasResponse {
  idea_id: string;
  status: string;
  error_message: string | null;
  generated_ideas: any | null;
}

export interface ExperimentRun {
  id: string;
  research_idea_id: string;
  status: string;
  log_folder_path: string | null;
  html_file_path: string | null;
  results_url: string | null;
  started_at: string;
  completed_at: string | null;
  is_successful: boolean | null;
  error_message: string | null;
  experiment_config: any | null;
  results: ExperimentResult[];
}

export interface ExperimentResult {
  id: string;
  experiment_id: string;
  metric_name: string;
  metric_value: string;
  metric_type: string;
  created_at: string;
}

export interface CreateExperimentResponse {
  experiment_id: string;
  idea_id: string;
  status: string;
  error_message: string | null;
  started_at: string;
}

export interface ExperimentStatusResponse {
  experiment_id: string;
  idea_id: string;
  status: string;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  is_successful: boolean | null;
  results_url: string | null;
}

export enum IdeaStatus {
  DRAFT = "draft",
  GENERATING = "generating",
  GENERATED = "generated",
  FAILED = "failed"
}

export enum ExperimentStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed"
} 