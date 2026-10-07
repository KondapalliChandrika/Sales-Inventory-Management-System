import client from './client';

export const inventoryApi = {
  adjust: (data) => client.post('/inventory/adjustments', data),
  movements: (params) => client.get('/inventory/movements', { params }),
};
