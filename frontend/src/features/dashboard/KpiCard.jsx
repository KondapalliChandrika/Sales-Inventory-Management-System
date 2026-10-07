import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';

const TONES = {
  primary: 'bg-primary-50 text-primary-600',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  danger: 'bg-danger-50 text-danger-600',
  info: 'bg-info-50 text-info-600',
};

export default function KpiCard({ label, value, hint, icon: Icon, tone = 'primary', onClick }) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Card className={cn(onClick && 'transition-shadow hover:shadow-modal')}>
      <Wrapper
        {...(onClick && { type: 'button', onClick })}
        className="flex w-full items-start justify-between gap-3 rounded-xl p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <div className="min-w-0">
          <p className="text-sm text-content-secondary">{label}</p>
          <p className="mt-1 truncate text-2xl font-semibold text-content-primary">{value}</p>
          {hint && <p className="mt-1 text-xs text-content-muted">{hint}</p>}
        </div>
        {Icon && (
          <span className={cn('rounded-lg p-2.5', TONES[tone])}>
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        )}
      </Wrapper>
    </Card>
  );
}
