import { History, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge, Button, EmptyState, Pagination, Table } from '@/components/ui';
import { DEFAULT_PAGE_SIZE } from '@/constants/app';
import { MOVEMENT_TYPE } from '@/constants/orderStatus';
import { ROUTES } from '@/constants/routes';
import { useMovements } from '@/hooks/useInventory';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/format';

export default function MovementsTab({ product, onClearProduct }) {
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [product]);
  const { data, isLoading } = useMovements({ product_id: product?.id, page, page_size: DEFAULT_PAGE_SIZE });

  const columns = [
    { key: 'created_at', header: 'When', render: (m) => formatDateTime(m.created_at) },
    {
      key: 'product',
      header: 'Product',
      render: (m) => (
        <div>
          <p className="font-medium">{m.product.name}</p>
          <p className="font-mono text-xs text-content-muted">{m.product.sku}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (m) => <Badge tone={MOVEMENT_TYPE[m.type]?.tone}>{MOVEMENT_TYPE[m.type]?.label ?? m.type}</Badge>,
    },
    {
      key: 'quantity',
      header: 'Qty',
      align: 'right',
      render: (m) => (
        <span className={cn('font-semibold', m.quantity > 0 ? 'text-success-700' : 'text-danger-700')}>
          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
        </span>
      ),
    },
    { key: 'stock_after', header: 'On hand after', align: 'right' },
    { key: 'reserved_after', header: 'Reserved after', align: 'right' },
    {
      key: 'reference',
      header: 'Reference',
      render: (m) =>
        m.reference_id ? (
          <Link to={ROUTES.ORDER_DETAIL(m.reference_id)} className="text-primary-600 hover:underline">
            Order #{m.reference_id}
          </Link>
        ) : (
          <span className="text-content-secondary">{m.note ?? '—'}</span>
        ),
    },
    { key: 'user', header: 'By', render: (m) => m.user.name },
  ];

  return (
    <>
      {product && (
        <div className="flex items-center gap-2 border-b border-border-200 p-4 text-sm">
          <span className="text-content-secondary">Showing history for</span>
          <Badge tone="primary">{product.name}</Badge>
          <Button variant="ghost" size="sm" icon={X} onClick={onClearProduct}>
            Clear
          </Button>
        </div>
      )}
      <Table columns={columns} data={data?.items} isLoading={isLoading} empty={<EmptyState icon={History} title="No stock movements yet" />} />
      <Pagination page={page} pageSize={DEFAULT_PAGE_SIZE} total={data?.total} onPageChange={setPage} />
    </>
  );
}
