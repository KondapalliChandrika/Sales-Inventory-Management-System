import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '@/api/dashboard.api';

import { queryKeys } from './queryKeys';

export const useDashboardSummary = () =>
  useQuery({ queryKey: queryKeys.dashboard.summary, queryFn: dashboardApi.summary });

export const useSalesTrend = (days) =>
  useQuery({ queryKey: queryKeys.dashboard.trend(days), queryFn: () => dashboardApi.salesTrend(days) });
