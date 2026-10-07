import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { usersApi } from '@/api/users.api';

import { queryKeys } from './queryKeys';

export const useUsers = (params) =>
  useQuery({ queryKey: queryKeys.users.list(params), queryFn: () => usersApi.list(params), placeholderData: keepPreviousData });

export function useSaveUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => (id ? usersApi.update(id, data) : usersApi.create(data)),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(id ? 'User updated' : 'User created');
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => usersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success('User deleted');
    },
  });
}
