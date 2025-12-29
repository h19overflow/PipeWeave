import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pipelinesApi } from '@/services/api';
import type { PipelineConfig } from '@/types/api';

export function usePipelines(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['pipelines', page, limit],
    queryFn: () => pipelinesApi.list(page, limit),
  });
}

export function usePipeline(id: string) {
  return useQuery({
    queryKey: ['pipeline', id],
    queryFn: () => pipelinesApi.get(id),
    enabled: !!id,
  });
}

export function useCreatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ datasetId, config }: { datasetId: string; config: PipelineConfig }) =>
      pipelinesApi.create(datasetId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
  });
}

export function useRunPipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pipelinesApi.run(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
  });
}

export function useDeletePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pipelinesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
  });
}
