import client from './client';

export const dashboardApi = {
  summary: () => client.get('/dashboard/summary'),
  salesTrend: (days) => client.get('/dashboard/sales-trend', { params: { days } }),
};
