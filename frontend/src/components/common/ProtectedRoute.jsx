import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { PageLoader } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <PageLoader />;
  if (status === 'anonymous') return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  return <Outlet />;
}
