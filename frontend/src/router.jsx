import { createBrowserRouter } from 'react-router-dom';

import ProtectedRoute from '@/components/common/ProtectedRoute';
import RoleGuard from '@/components/common/RoleGuard';
import AppLayout from '@/components/layout/AppLayout';
import { MANAGER_ROLES, ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import ApprovalQueuePage from '@/features/approvals/ApprovalQueuePage';
import LoginPage from '@/features/auth/LoginPage';
import CustomerListPage from '@/features/customers/CustomerListPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import NotFoundPage from '@/features/errors/NotFoundPage';
import InventoryPage from '@/features/inventory/InventoryPage';
import CreateOrderPage from '@/features/orders/CreateOrderPage';
import OrderDetailPage from '@/features/orders/OrderDetailPage';
import OrderListPage from '@/features/orders/OrderListPage';
import ProductListPage from '@/features/products/ProductListPage';
import SettingsPage from '@/features/settings/SettingsPage';
import UsersPage from '@/features/settings/UsersPage';

export const router = createBrowserRouter([
  { path: ROUTES.LOGIN, element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
          { path: ROUTES.ORDERS, element: <OrderListPage /> },
          { path: ROUTES.NEW_ORDER, element: <CreateOrderPage /> },
          { path: ROUTES.ORDER_DETAIL(), element: <OrderDetailPage /> },
          { path: ROUTES.PRODUCTS, element: <ProductListPage /> },
          { path: ROUTES.INVENTORY, element: <InventoryPage /> },
          { path: ROUTES.CUSTOMERS, element: <CustomerListPage /> },
          {
            element: <RoleGuard roles={MANAGER_ROLES} />,
            children: [{ path: ROUTES.APPROVALS, element: <ApprovalQueuePage /> }],
          },
          {
            element: <RoleGuard roles={[ROLES.ADMIN]} />,
            children: [
              { path: ROUTES.USERS, element: <UsersPage /> },
              { path: ROUTES.SETTINGS, element: <SettingsPage /> },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
