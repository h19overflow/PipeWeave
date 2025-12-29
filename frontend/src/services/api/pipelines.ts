import { get, post, put, del } from './client';
import type { Pipeline, PipelineConfig, PaginatedResponse } from '@/types/api';

export const pipelinesApi = {
  list: (page = 1, limit = 10) =>
    get<PaginatedResponse<Pipeline>>(`/pipelines?page=${page}&limit=${limit}`),

  get: (id: string) =>
    get<Pipeline>(`/pipelines/${id}`),

  create: (datasetId: string, config: PipelineConfig) =>
    post<Pipeline>('/pipelines', { dataset_id: datasetId, config }),

  update: (id: string, config: Partial<PipelineConfig>) =>
    put<Pipeline>(`/pipelines/${id}`, { config }),

  delete: (id: string) =>
    del<void>(`/pipelines/${id}`),

  run: (id: string) =>
    post<{ job_id: string }>(`/pipelines/${id}/run`),
};
