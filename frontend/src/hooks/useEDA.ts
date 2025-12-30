import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { edaApi } from '@/services/api/eda';
import type { EDAStatusResponse } from '@/types/api';

export function useEDASummary(datasetId: string, enabled = true) {
  return useQuery({
    queryKey: ['eda', 'summary', datasetId],
    queryFn: () => edaApi.getSummary(datasetId),
    enabled: enabled && !!datasetId,
    retry: false,
  });
}

export function useEDAReport(datasetId: string, enabled = true) {
  return useQuery({
    queryKey: ['eda', 'report', datasetId],
    queryFn: () => edaApi.getFullReport(datasetId),
    enabled: enabled && !!datasetId,
    retry: false,
  });
}

export function useGenerateEDA() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<EDAStatusResponse | null>(null);

  const mutation = useMutation({
    mutationFn: async (datasetId: string) => {
      const job = await edaApi.queueGeneration(datasetId);

      // Poll for completion
      const finalStatus = await edaApi.pollUntilComplete(
        job.report_id,
        setStatus
      );

      return { datasetId, reportId: job.report_id, status: finalStatus };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['eda', 'summary', data.datasetId],
      });
      queryClient.invalidateQueries({
        queryKey: ['eda', 'report', data.datasetId],
      });
      setStatus(null);
    },
    onError: () => {
      setStatus(null);
    },
  });

  return {
    ...mutation,
    status,
    progress: status?.progress_pct ?? 0,
    step: status?.step,
  };
}

export function useEDAPolling(reportId: string | null, enabled = true) {
  const [status, setStatus] = useState<EDAStatusResponse | null>(null);

  useEffect(() => {
    if (!reportId || !enabled) return;

    let cancelled = false;

    const poll = async () => {
      try {
        await edaApi.pollUntilComplete(reportId, (s) => {
          if (!cancelled) setStatus(s);
        });
      } catch (error) {
        console.error('EDA polling failed:', error);
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [reportId, enabled]);

  return {
    status,
    progress: status?.progress_pct ?? 0,
    step: status?.step,
    error: status?.error,
  };
}
