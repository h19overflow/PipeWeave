import { get, post, del, apiClient } from './client';
import type {
  TrainingJobRequest,
  TrainingJobStatus,
  TrainingJobMetrics,
} from '@/types/api';

export interface TrainingProgressEvent {
  progress_percentage: number;
  status: string;
  step?: string;
  error?: string;
}

export const trainingApi = {
  submitJob: (request: TrainingJobRequest) =>
    post<TrainingJobStatus>('/api/v1/training', request),

  getStatus: (jobId: string) =>
    get<TrainingJobStatus>(`/api/v1/training/${jobId}/status`),

  getMetrics: (jobId: string) =>
    get<TrainingJobMetrics>(`/api/v1/training/${jobId}/metrics`),

  cancelJob: (jobId: string) =>
    del<void>(`/api/v1/training/${jobId}`),

  streamProgress: (
    jobId: string,
    onProgress: (event: TrainingProgressEvent) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): (() => void) => {
    const baseUrl = apiClient.defaults.baseURL || '';
    const eventSource = new EventSource(
      `${baseUrl}/api/v1/training/${jobId}/stream`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as TrainingProgressEvent;
        onProgress(data);

        if (data.status === 'completed' || data.status === 'failed') {
          eventSource.close();
          onComplete?.();
        }
      } catch (err) {
        onError?.(
          err instanceof Error ? err : new Error('Failed to parse SSE event')
        );
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      onError?.(new Error('SSE connection failed'));
    };

    return () => eventSource.close();
  },

  pollUntilComplete: async (
    jobId: string,
    onProgress?: (status: TrainingJobStatus) => void,
    maxAttempts = 120,
    intervalMs = 3000
  ): Promise<TrainingJobStatus> => {
    let attempts = 0;
    let backoffMs = intervalMs;

    while (attempts < maxAttempts) {
      const status = await trainingApi.getStatus(jobId);
      onProgress?.(status);

      if (status.status === 'completed') {
        return status;
      }

      if (status.status === 'failed' || status.status === 'cancelled') {
        throw new Error(
          status.error_message || `Training ${status.status}`
        );
      }

      await new Promise(resolve => setTimeout(resolve, backoffMs));

      // Exponential backoff with max 15s
      backoffMs = Math.min(backoffMs * 1.5, 15000);
      attempts++;
    }

    throw new Error('Training job timed out');
  },
};
