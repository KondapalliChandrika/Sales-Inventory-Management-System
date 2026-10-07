import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 rounded-full bg-background-200 p-3 text-content-muted">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <p className="font-medium text-content-primary">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-content-secondary">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
