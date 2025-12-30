import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pipelinesApi, type CreatePipelineRequest } from '@/services/api/pipelines';
import type { PipelineConfig } from '@/types/api';

export function usePipeline(id: string) {
  return useQuery({
    queryKey: ['pipeline', id],
    queryFn: () => pipelinesApi.get(id),
    enabled: !!id,
  });
}

export function useValidatePipeline() {
  return useMutation({
    mutationFn: (config: PipelineConfig) => pipelinesApi.validate(config),
  });
}

export function useCreatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreatePipelineRequest) => pipelinesApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
  });
}

export function useUpdatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, config }: { id: string; config: PipelineConfig }) =>
      pipelinesApi.update(id, config),
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
