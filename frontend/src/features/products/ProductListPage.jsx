import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import Can from '@/components/common/Can';
import { Badge, Button, Card, ConfirmDialog, EmptyState, PageHeader, Pagination, SearchInput, Select, Table } from '@/components/ui';
import { MANAGER_ROLES } from '@/constants/roles';
import { useAuth } from '@/context/AuthContext';
import { useListParams } from '@/hooks/useListParams';
import { useCategories, useDeactivateProduct, useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/utils/format';

import ProductFormModal from './ProductFormModal';

const STATUS_FILTER = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export default function ProductListPage() {
  const { hasRole } = useAuth();
  const { search, setSearch, filters, setFilter, page, setPage, params } = useListParams({ active: 'true', category_id: '' });
  const { data, isLoading } = useProducts(params);
  const { data: categories = [] } = useCategories();
  const deactivate = useDeactivateProduct();
  const [editing, setEditing] = useState(null);
  const [toDeactivate, setToDeactivate] = useState(null);

  const columns = [
    { key: 'sku', header: 'SKU', render: (p) => <span className="font-mono text-xs">{p.sku}</span> },
    {
      key: 'name',
      header: 'Product',
      render: (p) => (
        <div>
          <p className="font-medium">{p.name}</p>
          <p className="text-xs text-content-muted">{p.category?.name ?? 'Uncategorised'}</p>
        </div>
      ),
    },
    { key: 'unit_price', header: 'Price', align: 'right', render: (p) => formatCurrency(p.unit_price) },
    { key: 'stock_on_hand', header: 'On hand', align: 'right' },
    { key: 'reserved_qty', header: 'Reserved', align: 'right' },
    {
      key: 'available_qty',
      header: 'Available',
      align: 'right',
      render: (p) => (p.is_low_stock ? <Badge tone="warning">{p.available_qty} · low</Badge> : p.available_qty),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (p) => <Badge tone={p.is_active ? 'success' : 'neutral'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
  ];

  if (hasRole(MANAGER_ROLES)) {
    columns.push({
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}>
            <Pencil className="h-4 w-4" />
          </Button>
          {p.is_active && (
            <Button variant="ghost" size="icon" onClick={() => setToDeactivate(p)} aria-label={`Deactivate ${p.name}`}>
              <Trash2 className="h-4 w-4 text-danger-600" />
            </Button>
          )}
        </div>
      ),
    });
  }

  return (
    <>
      <PageHeader
        title="Products"
        description="Product catalogue with live stock levels."
        actions={
          <Can roles={MANAGER_ROLES}>
            <Button icon={Plus} onClick={() => setEditing({})}>
              New product
            </Button>
          </Can>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-3 border-b border-border-200 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search name or SKU" />
          <Select
            aria-label="Category"
            value={filters.category_id}
            onChange={(e) => setFilter('category_id', e.target.value)}
            placeholder="All categories"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            className="w-44"
          />
          <Select
            aria-label="Status"
            value={filters.active}
            onChange={(e) => setFilter('active', e.target.value)}
            placeholder="All statuses"
            options={STATUS_FILTER}
            className="w-40"
          />
        </div>
        <Table
          columns={columns}
          data={data?.items}
          isLoading={isLoading}
          empty={<EmptyState icon={Package} title="No products found" description="Try changing the filters." />}
        />
        <Pagination page={page} pageSize={params.page_size} total={data?.total} onPageChange={setPage} />
      </Card>

      <ProductFormModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        product={editing?.id ? editing : null}
      />
      <ConfirmDialog
        open={Boolean(toDeactivate)}
        onClose={() => setToDeactivate(null)}
        title="Deactivate product"
        message={`${toDeactivate?.name} will no longer be available for new orders. Existing orders are not affected.`}
        confirmLabel="Deactivate"
        loading={deactivate.isPending}
        onConfirm={() => deactivate.mutate(toDeactivate.id, { onSuccess: () => setToDeactivate(null) })}
      />
    </>
  );
}
