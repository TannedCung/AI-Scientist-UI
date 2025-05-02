export interface ResearchIdea {
  id: string;
  title: string;
  keywords: string;
  tldr: string;
  abstract: string;
  markdown_file_path: string;
  code_file_path: string;
  created_at: string;
  updated_at: string;
}

export interface CreateResearchIdeaResponse {
  id: string;
  title: string;
  markdown_url: string;
  code_url: string;
  created_at: string;
}

export interface GenerateIdeasResponse {
  idea_id: string;
  status: string;
  ideas_json_url: string;
}

export interface ExperimentRun {
  id: string;
  research_idea_id: string;
  status: string;
  log_folder_path: string | null;
  html_file_path: string | null;
  started_at: string;
  completed_at: string | null;
  is_successful: boolean | null;
  html_url?: string;
}

export interface CreateExperimentResponse {
  experiment_id: string;
  idea_id: string;
  status: string;
  started_at: string;
}

export interface ExperimentStatusResponse {
  experiment_id: string;
  idea_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  is_successful: boolean | null;
  html_url?: string;
} 