import client from './client';

export const productsApi = {
  list: (params) => client.get('/products', { params }),
  get: (id) => client.get(`/products/${id}`),
  create: (data) => client.post('/products', data),
  update: (id, data) => client.patch(`/products/${id}`, data),
  deactivate: (id) => client.delete(`/products/${id}`),
  categories: () => client.get('/categories'),
  createCategory: (data) => client.post('/categories', data),
};
