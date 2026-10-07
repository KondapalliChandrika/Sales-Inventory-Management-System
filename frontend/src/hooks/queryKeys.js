export const queryKeys = {
  customers: { all: ['customers'], list: (params) => ['customers', 'list', params] },
  products: { all: ['products'], list: (params) => ['products', 'list', params], categories: ['categories'] },
  inventory: { all: ['inventory'], movements: (params) => ['inventory', 'movements', params] },
  orders: {
    all: ['orders'],
    list: (params) => ['orders', 'list', params],
    detail: (id) => ['orders', 'detail', Number(id)],
    pending: (params) => ['orders', 'pending', params],
  },
  dashboard: { all: ['dashboard'], summary: ['dashboard', 'summary'], trend: (days) => ['dashboard', 'trend', days] },
  users: { all: ['users'], list: (params) => ['users', 'list', params] },
  settings: ['settings'],
};
