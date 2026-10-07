import { Package, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { Badge, Button, EmptyState, Pagination, SearchInput, Table } from '@/components/ui';
import { MANAGER_ROLES } from '@/constants/roles';
import { useAuth } from '@/context/AuthContext';
import { useListParams } from '@/hooks/useListParams';
import { useProducts } from '@/hooks/useProducts';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/format';

import StockAdjustModal from './StockAdjustModal';

export default function StockLevelsTab({ onShowHistory }) {
  const { hasRole } = useAuth();
  const { search, setSearch, filters, setFilter, page, setPage, params } = useListParams({ active: true, low_stock: false });
  const { data, isLoading } = useProducts(params);
  const [adjusting, setAdjusting] = useState(null);

  const columns = [
    {
      key: 'name',
      header: 'Product',
      render: (p) => (
        <div>
          <p className="font-medium">{p.name}</p>
          <p className="font-mono text-xs text-content-muted">{p.sku}</p>
        </div>
      ),
    },
    { key: 'stock_on_hand', header: 'On hand', align: 'right' },
    { key: 'reserved_qty', header: 'Reserved', align: 'right' },
    {
      key: 'available_qty',
      header: 'Available',
      align: 'right',
      render: (p) => <span className={cn('font-semibold', p.is_low_stock && 'text-danger-600')}>{p.available_qty}</span>,
    },
    { key: 'reorder_level', header: 'Reorder at', align: 'right' },
    {
      key: 'health',
      header: 'Stock',
      render: (p) =>
        p.available_qty === 0 ? (
          <Badge tone="danger">Out of stock</Badge>
        ) : p.is_low_stock ? (
          <Badge tone="warning">Low</Badge>
        ) : (
          <Badge tone="success">Healthy</Badge>
        ),
    },
    { key: 'value', header: 'Stock value', align: 'right', render: (p) => formatCurrency(p.stock_on_hand * p.unit_price) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => onShowHistory(p)}>
            History
          </Button>
          {hasRole(MANAGER_ROLES) && (
            <Button variant="secondary" size="sm" icon={SlidersHorizontal} onClick={() => setAdjusting(p)}>
              Adjust
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 border-b border-border-200 p-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search name or SKU" />
        <label className="flex items-center gap-2 text-sm text-content-secondary">
          <input
            type="checkbox"
            checked={filters.low_stock}
            onChange={(e) => setFilter('low_stock', e.target.checked)}
            className="h-4 w-4 rounded border-border-300 text-primary-600 focus:ring-primary-500"
          />
          Low stock only
        </label>
      </div>
      <Table
        columns={columns}
        data={data?.items}
        isLoading={isLoading}
        empty={<EmptyState icon={Package} title="No products match" />}
      />
      <Pagination page={page} pageSize={params.page_size} total={data?.total} onPageChange={setPage} />
      <StockAdjustModal product={adjusting} onClose={() => setAdjusting(null)} />
    </>
  );
}
