import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const notify = (error) => {
  if (error?.status !== 401) toast.error(error?.message ?? 'Something went wrong');
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => (error?.status === 0 || error?.status >= 500) && failureCount < 2,
    },
  },
  queryCache: new QueryCache({ onError: notify }),
  mutationCache: new MutationCache({ onError: notify }),
});
