import client from './client';

export const ordersApi = {
  list: (params) => client.get('/orders', { params }),
  get: (id) => client.get(`/orders/${id}`),
  create: (data) => client.post('/orders', data),
  approve: (id, data) => client.post(`/orders/${id}/approve`, data),
  reject: (id, data) => client.post(`/orders/${id}/reject`, data),
  cancel: (id) => client.post(`/orders/${id}/cancel`),
  pending: (params) => client.get('/approvals/pending', { params }),
};
