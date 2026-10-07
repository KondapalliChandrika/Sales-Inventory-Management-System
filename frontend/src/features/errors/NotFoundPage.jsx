import { SearchX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button, EmptyState } from '@/components/ui';
import { ROUTES } from '@/constants/routes';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <EmptyState
      icon={SearchX}
      title="Page not found"
      description="The page you are looking for doesn't exist."
      action={
        <Button variant="secondary" onClick={() => navigate(ROUTES.DASHBOARD)}>
          Back to dashboard
        </Button>
      }
    />
  );
}
