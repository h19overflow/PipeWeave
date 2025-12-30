import { get, post } from './client';
import type { EDAJobResponse, EDAStatusResponse } from '@/types/api';
import type { EDASummary, EDAReport } from '@/types/eda';

export const edaApi = {
  queueGeneration: (datasetId: string) =>
    post<EDAJobResponse>(`/api/v1/eda/datasets/${datasetId}/queue`, {}),

  getStatus: (reportId: string) =>
    get<EDAStatusResponse>(`/api/v1/eda/reports/${reportId}/status`),

  getSummary: (datasetId: string) =>
    get<EDASummary>(`/api/v1/eda/datasets/${datasetId}/summary`),

  getFullReport: (datasetId: string) =>
    get<EDAReport>(`/api/v1/eda/datasets/${datasetId}/full`),

  pollUntilComplete: async (
    reportId: string,
    onProgress?: (status: EDAStatusResponse) => void,
    maxAttempts = 60,
    intervalMs = 2000
  ): Promise<EDAStatusResponse> => {
    let attempts = 0;
    let backoffMs = intervalMs;

    while (attempts < maxAttempts) {
      const status = await edaApi.getStatus(reportId);
      onProgress?.(status);

      if (status.status === 'completed') {
        return status;
      }

      if (status.status === 'failed') {
        throw new Error(status.error || 'EDA generation failed');
      }

      await new Promise(resolve => setTimeout(resolve, backoffMs));

      // Exponential backoff with max 10s
      backoffMs = Math.min(backoffMs * 1.5, 10000);
      attempts++;
    }

    throw new Error('EDA generation timed out');
  },
};
