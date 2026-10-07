import { Package2, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { APP_NAME } from '@/constants/app';
import { NAV_ITEMS } from '@/constants/navigation';
import { MANAGER_ROLES } from '@/constants/roles';
import { useAuth } from '@/context/AuthContext';
import { usePendingApprovals } from '@/hooks/useOrders';
import { cn } from '@/utils/cn';

export default function Sidebar({ open, onClose }) {
  const { hasRole } = useAuth();
  const isManager = hasRole(MANAGER_ROLES);
  const { data: pending } = usePendingApprovals({ page: 1, page_size: 1 }, { enabled: isManager, refetchInterval: 60_000 });
  const badges = { pendingApprovals: pending?.total };

  const items = NAV_ITEMS.filter((item) => !item.roles || hasRole(item.roles));

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-overlay lg:hidden" onClick={onClose} aria-hidden />}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-text transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2 font-semibold text-content-inverse">
            <span className="rounded-lg bg-primary-600 p-1.5">
              <Package2 className="h-5 w-5" aria-hidden />
            </span>
            {APP_NAME}
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 hover:bg-sidebar-hover lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map(({ label, path, icon: Icon, end, badge }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-sidebar-active text-content-inverse' : 'hover:bg-sidebar-hover hover:text-content-inverse',
                )
              }
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden />
              <span className="flex-1">{label}</span>
              {badge && badges[badge] > 0 && (
                <span className="rounded-full bg-warning-500 px-2 py-0.5 text-xs font-semibold text-content-primary">
                  {badges[badge]}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <p className="px-5 py-4 text-xs text-sidebar-muted">v1.0.0</p>
      </aside>
    </>
  );
}
