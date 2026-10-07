import { Outlet } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import ForbiddenPage from '@/features/errors/ForbiddenPage';

export default function RoleGuard({ roles }) {
  const { hasRole } = useAuth();
  return hasRole(roles) ? <Outlet /> : <ForbiddenPage />;
}
