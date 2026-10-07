import { ShieldAlert } from 'lucide-react';

import { EmptyState } from '@/components/ui';

export default function ForbiddenPage() {
  return <EmptyState icon={ShieldAlert} title="Access denied" description="You don't have permission to view this page." />;
}
