import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { datasetsApi } from '@/services/api';

export function useDatasets(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['datasets', page, limit],
    queryFn: () => datasetsApi.list(page, limit),
  });
}

export function useDataset(id: string) {
  return useQuery({
    queryKey: ['dataset', id],
    queryFn: () => datasetsApi.get(id),
    enabled: !!id,
  });
}

export function useUploadDataset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, name }: { file: File; name?: string }) =>
      datasetsApi.upload(file, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });
}

export function useDeleteDataset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => datasetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });
}

export function useDatasetEda(id: string) {
  return useQuery({
    queryKey: ['dataset', id, 'eda'],
    queryFn: () => datasetsApi.getEda(id),
    enabled: !!id,
  });
}
