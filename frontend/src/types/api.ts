// Base types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Dataset types
export interface Dataset extends BaseEntity {
  name: string;
  file_path: string;
  file_size: number;
  row_count: number;
  column_count: number;
  status: 'pending' | 'processing' | 'ready' | 'error';
  eda_report?: Record<string, unknown>;
}

export interface DatasetUploadResponse {
  id: string;
  name: string;
  status: string;
}

// Pipeline types
export interface PipelineNode {
  id: string;
  type: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface PipelineEdge {
  source: string;
  target: string;
}

export interface PipelineConfig {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  target_column: string;
  task_type: 'classification' | 'regression';
}

export interface Pipeline extends BaseEntity {
  name: string;
  dataset_id: string;
  config: PipelineConfig;
  status: 'draft' | 'running' | 'completed' | 'failed';
}

// Model types
export interface Model extends BaseEntity {
  name: string;
  pipeline_id: string;
  algorithm: string;
  file_path: string;
  status: 'training' | 'ready' | 'failed';
}

export interface ModelMetrics {
  model_id: string;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  rmse?: number;
  mae?: number;
  r2?: number;
  feature_importance: Record<string, number>;
}

// Training types
export type TrainingStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface HyperparameterConfig {
  learning_rate?: number;
  batch_size?: number;
  epochs?: number;
  custom_params?: Record<string, unknown>;
}

export interface TrainingJobRequest {
  pipeline_id: string;
  model_type: string;
  hyperparameters?: HyperparameterConfig;
  validation_split?: number;
  experiment_name?: string;
}

export interface TrainingMetrics {
  train_accuracy?: number;
  val_accuracy?: number;
  train_loss?: number;
  val_loss?: number;
  custom_metrics?: Record<string, number>;
}

export interface TrainingJobStatus {
  job_id: string;
  pipeline_id: string;
  status: TrainingStatus;
  progress_percentage?: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

export interface TrainingJobMetrics {
  job_id: string;
  metrics: TrainingMetrics;
  model_artifact_url?: string;
  generated_at: string;
}

// EDA types
export interface EDAJobResponse {
  report_id: string;
  job_id: string;
  status: string;
}

export interface EDAStatusResponse {
  status: string;
  progress_pct: number;
  step?: string;
  error?: string;
}

// Dataset upload types
export interface DatasetUploadURLRequest {
  filename: string;
  content_type?: string;
  size_bytes: number;
}

export interface DatasetUploadURLResponse {
  upload_url: string;
  dataset_id: string;
  expires_at: string;
}

export interface DatasetCompleteRequest {
  file_hash: string;
}
