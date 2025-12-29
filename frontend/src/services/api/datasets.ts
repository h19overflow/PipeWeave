import { get, post, del } from './client';
import type { Dataset, DatasetUploadResponse, PaginatedResponse } from '@/types/api';

export const datasetsApi = {
  list: (page = 1, limit = 10) =>
    get<PaginatedResponse<Dataset>>(`/datasets?page=${page}&limit=${limit}`),

  get: (id: string) =>
    get<Dataset>(`/datasets/${id}`),

  upload: async (file: File, name?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);

    return post<DatasetUploadResponse>('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: (id: string) =>
    del<void>(`/datasets/${id}`),

  getEda: (id: string) =>
    get<Record<string, unknown>>(`/datasets/${id}/eda`),
};
