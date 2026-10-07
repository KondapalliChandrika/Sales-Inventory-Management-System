import { Badge } from '@/components/ui';
import { ORDER_STATUS } from '@/constants/orderStatus';
import { cn } from '@/utils/cn';

const BAR_TONES = {
  warning: 'bg-warning-500',
  success: 'bg-success-500',
  danger: 'bg-danger-500',
  neutral: 'bg-content-muted',
};

export default function OrderStatusBreakdown({ data = [] }) {
  const total = data.reduce((sum, row) => sum + row.count, 0);

  return (
    <ul className="space-y-4">
      {data.map(({ status, count }) => {
        const config = ORDER_STATUS[status];
        const pct = total ? Math.round((count / total) * 100) : 0;
        return (
          <li key={status}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <Badge tone={config.tone}>{config.label}</Badge>
              <span className="text-content-secondary">
                <span className="font-semibold text-content-primary">{count}</span> · {pct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-background-200">
              <div className={cn('h-2 rounded-full', BAR_TONES[config.tone])} style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
