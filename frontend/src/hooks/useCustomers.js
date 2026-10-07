import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { customersApi } from '@/api/customers.api';

import { queryKeys } from './queryKeys';

export const useCustomers = (params) =>
  useQuery({
    queryKey: queryKeys.customers.list(params),
    queryFn: () => customersApi.list(params),
    placeholderData: keepPreviousData,
  });

export function useSaveCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => (id ? customersApi.update(id, data) : customersApi.create(data)),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.customers.all });
      toast.success(id ? 'Customer updated' : 'Customer created');
    },
  });
}

export function useDeactivateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => customersApi.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.customers.all });
      toast.success('Customer deactivated');
    },
  });
}

export function useReactivateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => customersApi.update(id, { is_active: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.customers.all });
      toast.success('Customer reactivated');
    },
  });
}
