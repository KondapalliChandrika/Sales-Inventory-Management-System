import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { ordersApi } from '@/api/orders.api';

import { queryKeys } from './queryKeys';

export const useOrders = (params) =>
  useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => ordersApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useOrder = (id) =>
  useQuery({ queryKey: queryKeys.orders.detail(id), queryFn: () => ordersApi.get(id), enabled: Boolean(id) });

export const usePendingApprovals = (params, options = {}) =>
  useQuery({
    queryKey: queryKeys.orders.pending(params),
    queryFn: () => ordersApi.pending(params),
    placeholderData: keepPreviousData,
    ...options,
  });

function useOrderMutation(mutationFn, successMessage) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (order) => {
      qc.setQueryData(queryKeys.orders.detail(order.id), order);
      [queryKeys.orders.all, queryKeys.products.all, queryKeys.inventory.all, queryKeys.dashboard.all].forEach(
        (queryKey) => qc.invalidateQueries({ queryKey }),
      );
      toast.success(typeof successMessage === 'function' ? successMessage(order) : successMessage);
    },
  });
}

export const useCreateOrder = () =>
  useOrderMutation(ordersApi.create, (order) =>
    order.status === 'PENDING_APPROVAL'
      ? `${order.order_number} sent for manager approval`
      : `${order.order_number} completed`,
  );

export const useApproveOrder = () => useOrderMutation(({ id, comment }) => ordersApi.approve(id, { comment }), 'Order approved');

export const useRejectOrder = () => useOrderMutation(({ id, reason }) => ordersApi.reject(id, { reason }), 'Order rejected');

export const useCancelOrder = () => useOrderMutation((id) => ordersApi.cancel(id), 'Order cancelled');
