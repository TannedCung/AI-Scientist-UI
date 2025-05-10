export enum IdeaStatus {
  DRAFT = "draft",
  GENERATING = "generating",
  GENERATED = "generated",
  FAILED = "failed",
}

export enum ExperimentStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface ResearchIdea {
  id: string;
  title: string;
  keywords: string;
  tldr: string;
  abstract: string;
  markdown_file_path: string;
  markdown_url?: string;
  code_file_path?: string;
  status: IdeaStatus;
  ideas_json_url?: string;
  error_message?: string;
  created_at: string;
  updated_at?: string;
  experiments?: ExperimentRun[];
}

export interface ExperimentRun {
  id: string;
  research_idea_id: string;
  status: ExperimentStatus;
  log_folder_path?: string;
  html_file_path?: string;
  results_url?: string;
  result_id?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  is_successful?: boolean;
  error_message?: string;
  experiment_config?: Record<string, any>;
  results?: ExperimentResult[];
}

export interface ExperimentResult {
  id: string;
  experiment_id: string;
  metric_name?: string;
  metric_value?: string;
  metric_type?: string;
  output?: string;
  code?: string;
  conclusion?: string;
  figures?: string[];
}

export interface TaskStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  created_at: number;
  started_at?: number;
  completed_at?: number;
  result?: any;
  error?: string;
}

// Settings interfaces
export interface LLMSettings {
  model: string;
  temp: number;
  max_tokens?: number;
}

export interface ExecSettings {
  timeout: number;
  agent_file_name: string;
  format_tb_ipython: boolean;
}

export interface StagesSettings {
  stage1_max_iters: number;
  stage2_max_iters: number;
  stage3_max_iters: number;
  stage4_max_iters: number;
}

export interface MultiSeedEvalSettings {
  num_seeds: number;
}

export interface SearchSettings {
  max_debug_depth: number;
  debug_prob: number;
  num_drafts: number;
}

export interface AgentSettings {
  type: string;
  num_workers: number;
  stages: StagesSettings;
  steps: number;
  k_fold_validation: number;
  multi_seed_eval: MultiSeedEvalSettings;
  expose_prediction: boolean;
  data_preview: boolean;
  code: LLMSettings;
  feedback: LLMSettings;
  vlm_feedback: LLMSettings;
  search: SearchSettings;
}

export interface ReportSettings {
  model: string;
  temp: number;
}

export interface ExperimentSettings {
  num_syn_datasets: number;
}

export interface DebugSettings {
  stage4: boolean;
}

export interface AIScientistSettings {
  data_dir: string;
  preprocess_data: boolean;
  goal?: string;
  eval?: string;
  log_dir: string;
  workspace_dir: string;
  copy_data: boolean;
  exp_name: string;
  exec: ExecSettings;
  generate_report: boolean;
  report: ReportSettings;
  experiment: ExperimentSettings;
  debug: DebugSettings;
  agent: AgentSettings;
} 