import axios from 'axios';
import { get, post, del } from './client';
import type {
  Dataset,
  PaginatedResponse,
  DatasetUploadURLRequest,
  DatasetUploadURLResponse,
  DatasetCompleteRequest,
} from '@/types/api';

async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const datasetsApi = {
  list: (page = 1, limit = 10) =>
    get<PaginatedResponse<Dataset>>(`/api/v1/datasets?page=${page}&limit=${limit}`),

  get: (id: string) =>
    get<Dataset>(`/api/v1/datasets/${id}`),

  requestUploadUrl: (request: DatasetUploadURLRequest) =>
    post<DatasetUploadURLResponse>('/api/v1/datasets/upload-url', request),

  uploadToS3: async (uploadUrl: string, file: File) => {
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type || 'text/csv',
      },
    });
  },

  completeUpload: async (datasetId: string, fileHash: string) =>
    post<Dataset>(`/api/v1/datasets/${datasetId}/complete`, {
      file_hash: fileHash,
    } as DatasetCompleteRequest),

  upload: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Dataset> => {
    onProgress?.(0);

    const uploadUrlResponse = await datasetsApi.requestUploadUrl({
      filename: file.name,
      content_type: file.type || 'text/csv',
      size_bytes: file.size,
    });
    onProgress?.(20);

    await datasetsApi.uploadToS3(uploadUrlResponse.upload_url, file);
    onProgress?.(80);

    const fileHash = await calculateFileHash(file);
    onProgress?.(90);

    const dataset = await datasetsApi.completeUpload(
      uploadUrlResponse.dataset_id,
      fileHash
    );
    onProgress?.(100);

    return dataset;
  },

  delete: (id: string) =>
    del<void>(`/api/v1/datasets/${id}`),
};
