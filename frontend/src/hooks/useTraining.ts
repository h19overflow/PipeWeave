import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingApi, type TrainingProgressEvent } from '@/services/api/training';
import type { TrainingJobRequest, TrainingJobStatus } from '@/types/api';

export function useTrainingStatus(jobId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['training', 'status', jobId],
    queryFn: () => trainingApi.getStatus(jobId!),
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const isActive = data.status === 'queued' || data.status === 'running';
      return isActive ? 3000 : false;
    },
  });
}

export function useTrainingMetrics(jobId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['training', 'metrics', jobId],
    queryFn: () => trainingApi.getMetrics(jobId!),
    enabled: enabled && !!jobId,
  });
}

export function useSubmitTrainingJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: TrainingJobRequest) =>
      trainingApi.submitJob(request),
    onSuccess: (data) => {
      queryClient.setQueryData(['training', 'status', data.job_id], data);
    },
  });
}

export function useCancelTrainingJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => trainingApi.cancelJob(jobId),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ['training', 'status', jobId] });
    },
  });
}

export function useTrainingStream(jobId: string | null, enabled = true) {
  const [progress, setProgress] = useState<TrainingProgressEvent | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!jobId || !enabled) return;

    setProgress(null);
    setError(null);
    setIsComplete(false);

    const cleanup = trainingApi.streamProgress(
      jobId,
      (event) => {
        setProgress(event);
        if (event.status === 'completed' || event.status === 'failed') {
          setIsComplete(true);
        }
      },
      (err) => {
        setError(err);
        setIsComplete(true);
      },
      () => {
        setIsComplete(true);
      }
    );

    return cleanup;
  }, [jobId, enabled]);

  return {
    progress,
    error,
    isComplete,
    percentage: progress?.progress_percentage ?? 0,
    status: progress?.status ?? 'queued',
    step: progress?.step,
  };
}

export function useTrainingPolling(jobId: string | null, enabled = true) {
  const [status, setStatus] = useState<TrainingJobStatus | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!jobId || !enabled) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const finalStatus = await trainingApi.pollUntilComplete(
          jobId,
          (s) => {
            if (!cancelled) setStatus(s);
          }
        );
        if (!cancelled) setStatus(finalStatus);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Training failed'));
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [jobId, enabled]);

  return {
    status,
    error,
    progress: status?.progress_percentage ?? 0,
    isComplete: status?.status === 'completed' || status?.status === 'failed',
  };
}
