import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { datasetsApi } from '@/services/api/datasets';

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
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      setProgress(0);
      return datasetsApi.upload(file, setProgress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      setProgress(0);
    },
    onError: () => {
      setProgress(0);
    },
  });

  return {
    ...mutation,
    progress,
  };
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
