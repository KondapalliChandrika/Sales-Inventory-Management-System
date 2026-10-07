import client from './client';

export const usersApi = {
  list: (params) => client.get('/users', { params }),
  create: (data) => client.post('/users', data),
  update: (id, data) => client.patch(`/users/${id}`, data),
  remove: (id) => client.delete(`/users/${id}`),
};
