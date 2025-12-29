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
