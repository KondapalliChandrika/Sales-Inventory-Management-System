export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  PRODUCTS: '/products',
  CUSTOMERS: '/customers',
  ORDERS: '/orders',
  NEW_ORDER: '/orders/new',
  ORDER_DETAIL: (id = ':orderId') => `/orders/${id}`,
  APPROVALS: '/approvals',
  INVENTORY: '/inventory',
  USERS: '/users',
  SETTINGS: '/settings',
};
