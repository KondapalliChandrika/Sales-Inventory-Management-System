import { CheckCircle2, CircleDot, MinusCircle, XCircle } from 'lucide-react';

import { APPROVAL_ACTION } from '@/constants/orderStatus';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/format';

const ICONS = { REQUESTED: CircleDot, APPROVED: CheckCircle2, REJECTED: XCircle, CANCELLED: MinusCircle };
const ICON_TONES = {
  warning: 'text-warning-600',
  success: 'text-success-600',
  danger: 'text-danger-600',
  neutral: 'text-content-muted',
};

export default function ApprovalTimeline({ approvals }) {
  if (!approvals.length) {
    return <p className="text-sm text-content-secondary">This order was below the approval limit and completed immediately.</p>;
  }
  return (
    <ol className="space-y-5">
      {approvals.map((entry, index) => {
        const config = APPROVAL_ACTION[entry.action];
        const Icon = ICONS[entry.action];
        return (
          <li key={entry.id} className="relative flex gap-3">
            {index < approvals.length - 1 && <span className="absolute left-[9px] top-6 h-full w-px bg-border-200" aria-hidden />}
            <Icon className={cn('relative h-5 w-5 shrink-0', ICON_TONES[config.tone])} aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-medium text-content-primary">{config.label}</p>
              <p className="text-xs text-content-secondary">
                {entry.actor.name} · {formatDateTime(entry.created_at)}
              </p>
              {entry.comment && (
                <p className="mt-1.5 rounded-lg bg-background-200 px-3 py-2 text-sm text-content-primary">{entry.comment}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
