import { Check, ClipboardCheck, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Card, EmptyState, PageHeader, Pagination, SearchInput, Table } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { useListParams } from '@/hooks/useListParams';
import { usePendingApprovals } from '@/hooks/useOrders';
import { formatCurrency, formatDateTime } from '@/utils/format';

import DecisionModal from './DecisionModal';

export default function ApprovalQueuePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { search, setSearch, page, setPage, params } = useListParams();
  const { data, isLoading } = usePendingApprovals(params);
  const [decision, setDecision] = useState({ order: null, mode: null });

  const columns = [
    { key: 'order_number', header: 'Order', render: (o) => <span className="font-medium">{o.order_number}</span> },
    { key: 'customer', header: 'Customer', render: (o) => o.customer.name },
    { key: 'creator', header: 'Requested by', render: (o) => o.creator.name },
    { key: 'total', header: 'Total', align: 'right', render: (o) => <span className="font-semibold">{formatCurrency(o.total)}</span> },
    { key: 'created_at', header: 'Requested', render: (o) => formatDateTime(o.created_at) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (o) =>
        o.creator.id === user.id ? (
          <span className="text-xs text-content-muted">Your order</span>
        ) : (
          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            <Button size="sm" variant="success" icon={Check} onClick={() => setDecision({ order: o, mode: 'approve' })}>
              Approve
            </Button>
            <Button size="sm" variant="secondary" icon={X} onClick={() => setDecision({ order: o, mode: 'reject' })}>
              Reject
            </Button>
          </div>
        ),
    },
  ];

  return (
    <>
      <PageHeader title="Approvals" description="Orders above the approval limit waiting for a decision." />

      <Card className="overflow-hidden">
        <div className="border-b border-border-200 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Order number or customer" />
        </div>
        <Table
          columns={columns}
          data={data?.items}
          isLoading={isLoading}
          onRowClick={(o) => navigate(ROUTES.ORDER_DETAIL(o.id))}
          empty={<EmptyState icon={ClipboardCheck} title="All caught up" description="No orders are waiting for approval." />}
        />
        <Pagination page={page} pageSize={params.page_size} total={data?.total} onPageChange={setPage} />
      </Card>

      <DecisionModal order={decision.order} mode={decision.mode} onClose={() => setDecision({ order: null, mode: null })} />
    </>
  );
}
