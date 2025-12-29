import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelsApi } from '@/services/api';

export function useModels(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['models', page, limit],
    queryFn: () => modelsApi.list(page, limit),
  });
}

export function useModel(id: string) {
  return useQuery({
    queryKey: ['model', id],
    queryFn: () => modelsApi.get(id),
    enabled: !!id,
  });
}

export function useModelMetrics(id: string) {
  return useQuery({
    queryKey: ['model', id, 'metrics'],
    queryFn: () => modelsApi.getMetrics(id),
    enabled: !!id,
  });
}

export function useDeleteModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => modelsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
}
