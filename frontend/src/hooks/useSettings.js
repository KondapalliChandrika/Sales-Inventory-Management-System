import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { settingsApi } from '@/api/settings.api';

import { queryKeys } from './queryKeys';

export const useSettings = () => useQuery({ queryKey: queryKeys.settings, queryFn: settingsApi.get });

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.update,
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.settings, data);
      toast.success('Settings saved');
    },
  });
}
