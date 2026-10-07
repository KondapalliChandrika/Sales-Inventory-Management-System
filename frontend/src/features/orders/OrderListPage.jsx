import { Plus, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button, Card, EmptyState, Input, PageHeader, Pagination, SearchInput, Select, StatusBadge, Table } from '@/components/ui';
import { ORDER_STATUS_OPTIONS } from '@/constants/orderStatus';
import { MANAGER_ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { useListParams } from '@/hooks/useListParams';
import { useOrders } from '@/hooks/useOrders';
import { formatCurrency, formatDateTime } from '@/utils/format';

export default function OrderListPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { search, setSearch, filters, setFilter, page, setPage, params } = useListParams({
    status: '',
    date_from: '',
    date_to: '',
  });
  const { data, isLoading } = useOrders(params);

  const columns = [
    { key: 'order_number', header: 'Order', render: (o) => <span className="font-medium">{o.order_number}</span> },
    { key: 'customer', header: 'Customer', render: (o) => o.customer.name },
    { key: 'creator', header: 'Created by', render: (o) => o.creator.name },
    { key: 'total', header: 'Total', align: 'right', render: (o) => formatCurrency(o.total) },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
    { key: 'created_at', header: 'Created', render: (o) => formatDateTime(o.created_at) },
  ];

  return (
    <>
      <PageHeader
        title="Sales orders"
        description={hasRole(MANAGER_ROLES) ? 'All orders across the team.' : 'Orders you have created.'}
        actions={
          <Button icon={Plus} onClick={() => navigate(ROUTES.NEW_ORDER)}>
            New order
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-end gap-3 border-b border-border-200 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Order number or customer" />
          <Select
            aria-label="Status"
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
            placeholder="All statuses"
            options={ORDER_STATUS_OPTIONS}
            className="w-44"
          />
          <Input
            type="date"
            aria-label="From date"
            value={filters.date_from}
            onChange={(e) => setFilter('date_from', e.target.value)}
            className="w-40"
          />
          <Input
            type="date"
            aria-label="To date"
            value={filters.date_to}
            onChange={(e) => setFilter('date_to', e.target.value)}
            className="w-40"
          />
        </div>
        <Table
          columns={columns}
          data={data?.items}
          isLoading={isLoading}
          onRowClick={(o) => navigate(ROUTES.ORDER_DETAIL(o.id))}
          empty={
            <EmptyState
              icon={ShoppingCart}
              title="No orders found"
              action={
                <Button variant="secondary" onClick={() => navigate(ROUTES.NEW_ORDER)}>
                  Create an order
                </Button>
              }
            />
          }
        />
        <Pagination page={page} pageSize={params.page_size} total={data?.total} onPageChange={setPage} />
      </Card>
    </>
  );
}
