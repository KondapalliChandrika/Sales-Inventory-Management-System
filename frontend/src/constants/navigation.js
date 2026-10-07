import { Boxes, ClipboardCheck, LayoutDashboard, Package, Settings, ShoppingCart, Users, UsersRound } from 'lucide-react';

import { MANAGER_ROLES, ROLES } from './roles';
import { ROUTES } from './routes';

export const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard, end: true },
  { label: 'Orders', path: ROUTES.ORDERS, icon: ShoppingCart },
  { label: 'Approvals', path: ROUTES.APPROVALS, icon: ClipboardCheck, roles: MANAGER_ROLES, badge: 'pendingApprovals' },
  { label: 'Products', path: ROUTES.PRODUCTS, icon: Package },
  { label: 'Inventory', path: ROUTES.INVENTORY, icon: Boxes },
  { label: 'Customers', path: ROUTES.CUSTOMERS, icon: UsersRound },
  { label: 'Users', path: ROUTES.USERS, icon: Users, roles: [ROLES.ADMIN] },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: Settings, roles: [ROLES.ADMIN] },
];
