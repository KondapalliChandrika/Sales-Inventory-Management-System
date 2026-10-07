import { Pencil, Plus, RotateCcw, Trash2, UsersRound } from 'lucide-react';
import { useState } from 'react';

import { Badge, Button, Card, ConfirmDialog, EmptyState, PageHeader, Pagination, SearchInput, Select, Table } from '@/components/ui';
import { MANAGER_ROLES } from '@/constants/roles';
import { useAuth } from '@/context/AuthContext';
import { useCustomers, useDeactivateCustomer, useReactivateCustomer } from '@/hooks/useCustomers';
import { useListParams } from '@/hooks/useListParams';
import { formatDate } from '@/utils/format';

import CustomerFormModal from './CustomerFormModal';

export default function CustomerListPage() {
  const { hasRole } = useAuth();
  const { search, setSearch, filters, setFilter, page, setPage, params } = useListParams({ active: 'true' });
  const { data, isLoading } = useCustomers(params);
  const deactivate = useDeactivateCustomer();
  const reactivate = useReactivateCustomer();
  const [editing, setEditing] = useState(null);
  const [toDeactivate, setToDeactivate] = useState(null);

  const columns = [
    { key: 'name', header: 'Name', render: (c) => <span className="font-medium">{c.name}</span> },
    { key: 'email', header: 'Email', render: (c) => c.email ?? '—' },
    { key: 'phone', header: 'Phone', render: (c) => c.phone ?? '—' },
    { key: 'gstin', header: 'GSTIN', render: (c) => c.gstin ?? '—' },
    {
      key: 'is_active',
      header: 'Status',
      render: (c) => <Badge tone={c.is_active ? 'success' : 'neutral'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
    { key: 'created_at', header: 'Since', render: (c) => formatDate(c.created_at) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}>
            <Pencil className="h-4 w-4" />
          </Button>
          {hasRole(MANAGER_ROLES) &&
            (c.is_active ? (
              <Button variant="ghost" size="icon" onClick={() => setToDeactivate(c)} aria-label={`Deactivate ${c.name}`} title="Deactivate">
                <Trash2 className="h-4 w-4 text-danger-600" />
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                icon={RotateCcw}
                loading={reactivate.isPending && reactivate.variables === c.id}
                onClick={() => reactivate.mutate(c.id)}
              >
                Reactivate
              </Button>
            ))}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Customers"
        description="People and companies you sell to."
        actions={
          <Button icon={Plus} onClick={() => setEditing({})}>
            New customer
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-3 border-b border-border-200 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, email or phone" />
          <Select
            aria-label="Status"
            value={filters.active}
            onChange={(e) => setFilter('active', e.target.value)}
            placeholder="All statuses"
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
            className="w-40"
          />
        </div>
        <Table
          columns={columns}
          data={data?.items}
          isLoading={isLoading}
          empty={<EmptyState icon={UsersRound} title="No customers found" />}
        />
        <Pagination page={page} pageSize={params.page_size} total={data?.total} onPageChange={setPage} />
      </Card>

      <CustomerFormModal open={editing !== null} onClose={() => setEditing(null)} customer={editing?.id ? editing : null} />
      <ConfirmDialog
        open={Boolean(toDeactivate)}
        onClose={() => setToDeactivate(null)}
        title="Deactivate customer"
        message={`${toDeactivate?.name} will no longer be selectable for new orders.`}
        confirmLabel="Deactivate"
        loading={deactivate.isPending}
        onConfirm={() => deactivate.mutate(toDeactivate.id, { onSuccess: () => setToDeactivate(null) })}
      />
    </>
  );
}
