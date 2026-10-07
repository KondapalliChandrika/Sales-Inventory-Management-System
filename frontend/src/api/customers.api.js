import client from './client';

export const customersApi = {
  list: (params) => client.get('/customers', { params }),
  get: (id) => client.get(`/customers/${id}`),
  create: (data) => client.post('/customers', data),
  update: (id, data) => client.patch(`/customers/${id}`, data),
  deactivate: (id) => client.delete(`/customers/${id}`),
};
