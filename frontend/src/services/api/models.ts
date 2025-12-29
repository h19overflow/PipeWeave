import { get, del } from './client';
import type { Model, ModelMetrics, PaginatedResponse } from '@/types/api';

export const modelsApi = {
  list: (page = 1, limit = 10) =>
    get<PaginatedResponse<Model>>(`/models?page=${page}&limit=${limit}`),

  get: (id: string) =>
    get<Model>(`/models/${id}`),

  getMetrics: (id: string) =>
    get<ModelMetrics>(`/models/${id}/metrics`),

  delete: (id: string) =>
    del<void>(`/models/${id}`),

  download: (id: string) =>
    get<Blob>(`/models/${id}/download`, { responseType: 'blob' }),
};
