import { LogOut, Menu } from 'lucide-react';

import { Badge, Button } from '@/components/ui';
import { ROLE_LABELS } from '@/constants/roles';
import { useAuth } from '@/context/AuthContext';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border-200 bg-background-50 px-4 sm:px-6">
      <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-content-primary">{user?.name}</p>
          <p className="text-xs text-content-secondary">{user?.email}</p>
        </div>
        <Badge tone="primary">{ROLE_LABELS[user?.role]}</Badge>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
          {initials}
        </span>
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out" title="Log out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
