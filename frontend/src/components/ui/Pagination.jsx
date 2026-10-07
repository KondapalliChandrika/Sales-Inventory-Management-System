import { ChevronLeft, ChevronRight } from 'lucide-react';

import { formatNumber } from '@/utils/format';

import Button from './Button';

export default function Pagination({ page, pageSize, total, onPageChange }) {
  if (!total) return null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-200 px-4 py-3">
      <p className="text-xs text-content-secondary">
        Showing <span className="font-medium text-content-primary">{from}</span>–
        <span className="font-medium text-content-primary">{to}</span> of{' '}
        <span className="font-medium text-content-primary">{formatNumber(total)}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Prev
        </Button>
        <span className="text-xs text-content-secondary">
          {page} / {totalPages}
        </span>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
