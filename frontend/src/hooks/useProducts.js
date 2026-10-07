import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { productsApi } from '@/api/products.api';

import { queryKeys } from './queryKeys';

export const useProducts = (params) =>
  useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productsApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useCategories = () =>
  useQuery({ queryKey: queryKeys.products.categories, queryFn: productsApi.categories, staleTime: 5 * 60_000 });

export function useSaveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => (id ? productsApi.update(id, data) : productsApi.create(data)),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success(id ? 'Product updated' : 'Product created');
    },
  });
}

export function useDeactivateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => productsApi.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success('Product deactivated');
    },
  });
}
