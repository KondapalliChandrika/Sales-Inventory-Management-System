import { ArrowLeft, Check, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, Card, CardBody, CardHeader, ConfirmDialog, EmptyState, PageHeader, PageLoader, StatusBadge, Table } from '@/components/ui';
import { MANAGER_ROLES, ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import DecisionModal from '@/features/approvals/DecisionModal';
import { useCancelOrder, useOrder } from '@/hooks/useOrders';
import { formatCurrency, formatDateTime } from '@/utils/format';

import ApprovalTimeline from './ApprovalTimeline';

const itemColumns = [
  {
    key: 'product',
    header: 'Product',
    render: (i) => (
      <div>
        <p className="font-medium">{i.product.name}</p>
        <p className="text-xs text-content-muted">{i.product.sku}</p>
      </div>
    ),
  },
  { key: 'quantity', header: 'Qty', align: 'right' },
  { key: 'unit_price', header: 'Unit price', align: 'right', render: (i) => formatCurrency(i.unit_price) },
  { key: 'line_total', header: 'Line total', align: 'right', render: (i) => formatCurrency(i.line_total) },
];

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { data: order, isLoading, error } = useOrder(orderId);
  const cancel = useCancelOrder();
  const [decisionMode, setDecisionMode] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (isLoading) return <PageLoader />;
  if (error || !order) return <EmptyState icon={XCircle} title="Order not available" description={error?.message} />;

  const isPending = order.status === 'PENDING_APPROVAL';
  const isOwn = order.creator.id === user.id;
  const canDecide = isPending && hasRole(MANAGER_ROLES) && !isOwn;
  const canCancel = isPending && (isOwn || user.role === ROLES.ADMIN);

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {order.order_number} <StatusBadge status={order.status} />
          </span>
        }
        description={`Created ${formatDateTime(order.created_at)} by ${order.creator.name}`}
        back={
          <Button variant="ghost" size="sm" icon={ArrowLeft} className="mb-2 -ml-3" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
        actions={
          <>
            {canCancel && (
              <Button variant="secondary" onClick={() => setConfirmCancel(true)}>
                Cancel order
              </Button>
            )}
            {canDecide && (
              <>
                <Button variant="danger" icon={X} onClick={() => setDecisionMode('reject')}>
                  Reject
                </Button>
                <Button variant="success" icon={Check} onClick={() => setDecisionMode('approve')}>
                  Approve
                </Button>
              </>
            )}
          </>
        }
      />

      {isPending && isOwn && hasRole(MANAGER_ROLES) && (
        <p className="mb-4 rounded-lg border border-warning-100 bg-warning-50 px-4 py-3 text-sm text-warning-700">
          You created this order, so another manager must approve it.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader title="Items" />
            <Table columns={itemColumns} data={order.items} />
            <div className="space-y-2 border-t border-border-200 px-5 py-4 text-sm">
              <TotalRow label="Subtotal" value={formatCurrency(order.subtotal)} />
              <TotalRow label={`Tax (${order.tax_rate}%)`} value={formatCurrency(order.tax)} />
              <TotalRow label="Total" value={formatCurrency(order.total)} strong />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Customer" />
            <CardBody className="space-y-1 text-sm">
              <p className="font-medium text-content-primary">{order.customer.name}</p>
              {order.customer.email && <p className="text-content-secondary">{order.customer.email}</p>}
              {order.notes && (
                <div className="pt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-content-muted">Notes</p>
                  <p className="mt-1 text-content-primary">{order.notes}</p>
                </div>
              )}
              {order.completed_at && (
                <p className="pt-3 text-xs text-content-muted">Completed {formatDateTime(order.completed_at)}</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Approval history" />
            <CardBody>
              <ApprovalTimeline approvals={order.approvals} />
            </CardBody>
          </Card>
        </div>
      </div>

      <DecisionModal order={decisionMode ? order : null} mode={decisionMode} onClose={() => setDecisionMode(null)} />
      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Cancel order"
        message="The order will be cancelled and its reserved stock released. This cannot be undone."
        confirmLabel="Cancel order"
        loading={cancel.isPending}
        onConfirm={() => cancel.mutate(order.id, { onSuccess: () => setConfirmCancel(false) })}
      />
    </>
  );
}

function TotalRow({ label, value, strong }) {
  return (
    <div className={strong ? 'flex justify-between text-base font-semibold text-content-primary' : 'flex justify-between text-content-secondary'}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
