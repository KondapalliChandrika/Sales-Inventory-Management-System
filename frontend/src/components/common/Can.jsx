import { useAuth } from '@/context/AuthContext';

export default function Can({ roles, children, fallback = null }) {
  const { hasRole } = useAuth();
  return hasRole(roles) ? children : fallback;
}
