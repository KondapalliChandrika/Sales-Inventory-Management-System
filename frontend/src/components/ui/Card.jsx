import { cn } from '@/utils/cn';

export default function Card({ className, children }) {
  return <div className={cn('rounded-xl border border-border-200 bg-background-50 shadow-card', className)}>{children}</div>;
}

export function CardHeader({ title, description, actions, className }) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3 border-b border-border-200 px-5 py-4', className)}>
      <div>
        <h2 className="text-base font-semibold text-content-primary">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-content-secondary">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}
