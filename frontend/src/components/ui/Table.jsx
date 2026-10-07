import { cn } from '@/utils/cn';

import EmptyState from './EmptyState';
import Spinner from './Spinner';

const ALIGN = { left: 'text-left', right: 'text-right', center: 'text-center' };

export default function Table({ columns, data = [], isLoading, rowKey = 'id', onRowClick, empty }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border-200">
        <thead className="bg-background-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-content-secondary',
                  ALIGN[col.align ?? 'left'],
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-100 bg-background-50">
          {isLoading && data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-primary-600">
                <Spinner />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>{empty ?? <EmptyState />}</td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row[rowKey]}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn('transition-colors', onRowClick && 'cursor-pointer hover:bg-background-100')}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn('whitespace-nowrap px-4 py-3 text-sm text-content-primary', ALIGN[col.align ?? 'left'], col.className)}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
