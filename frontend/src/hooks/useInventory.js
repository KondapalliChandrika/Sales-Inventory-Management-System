import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { inventoryApi } from '@/api/inventory.api';

import { queryKeys } from './queryKeys';

export const useMovements = (params) =>
  useQuery({
    queryKey: queryKeys.inventory.movements(params),
    queryFn: () => inventoryApi.movements(params),
    placeholderData: keepPreviousData,
  });

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.adjust,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success('Stock updated');
    },
  });
}
