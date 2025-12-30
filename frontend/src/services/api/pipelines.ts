import { get, post, put, del } from './client';
import type { Pipeline, PipelineConfig } from '@/types/api';

export interface PipelineValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface CreatePipelineRequest {
  name: string;
  dataset_id: string;
  config: PipelineConfig;
}

export const pipelinesApi = {
  validate: (config: PipelineConfig) =>
    post<PipelineValidationResult>('/api/v1/pipelines/validate', { config }),

  create: (request: CreatePipelineRequest) =>
    post<Pipeline>('/api/v1/pipelines', request),

  get: (id: string) =>
    get<Pipeline>(`/api/v1/pipelines/${id}`),

  update: (id: string, config: PipelineConfig) =>
    put<Pipeline>(`/api/v1/pipelines/${id}`, { config }),

  delete: (id: string) =>
    del<void>(`/api/v1/pipelines/${id}`),
};
