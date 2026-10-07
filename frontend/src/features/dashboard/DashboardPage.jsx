import { AlertTriangle, ClipboardCheck, IndianRupee, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge, Card, CardBody, CardHeader, EmptyState, PageHeader, PageLoader, Select, StatusBadge, Table } from '@/components/ui';
import { MANAGER_ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { useDashboardSummary, useSalesTrend } from '@/hooks/useDashboard';
import { formatCurrency, formatDate, formatNumber } from '@/utils/format';

import KpiCard from './KpiCard';
import OrderStatusBreakdown from './OrderStatusBreakdown';
import SalesTrendChart from './SalesTrendChart';

const TREND_OPTIONS = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [days, setDays] = useState(30);
  const { data: summary, isLoading } = useDashboardSummary();
  const { data: trend } = useSalesTrend(days);

  if (isLoading || !summary) return <PageLoader />;

  const recentColumns = [
    { key: 'order_number', header: 'Order', render: (o) => <span className="font-medium">{o.order_number}</span> },
    { key: 'customer', header: 'Customer', render: (o) => o.customer.name },
    { key: 'total', header: 'Total', align: 'right', render: (o) => formatCurrency(o.total) },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
    { key: 'created_at', header: 'Date', render: (o) => formatDate(o.created_at) },
  ];

  return (
    <>
      <PageHeader title={`Welcome back, ${user.name.split(' ')[0]}`} description="Here's what's happening with sales and stock." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Sales today"
          value={formatCurrency(summary.sales_today)}
          hint={`${formatCurrency(summary.sales_this_month)} this month`}
          icon={IndianRupee}
          tone="success"
        />
        <KpiCard
          label="Orders this month"
          value={formatNumber(summary.orders_this_month)}
          hint={`Avg. order ${formatCurrency(summary.average_order_value)}`}
          icon={ShoppingCart}
          tone="primary"
        />
        <KpiCard
          label="Pending approvals"
          value={formatNumber(summary.approvals.pending)}
          hint={`${summary.approvals.approved_this_month} approved · ${summary.approvals.rejected_this_month} rejected this month`}
          icon={ClipboardCheck}
          tone="warning"
          onClick={hasRole(MANAGER_ROLES) ? () => navigate(ROUTES.APPROVALS) : undefined}
        />
        <KpiCard
          label="Low stock items"
          value={formatNumber(summary.low_stock_count)}
          hint={`${summary.active_products} active products · stock value ${formatCurrency(summary.inventory_value)}`}
          icon={AlertTriangle}
          tone="danger"
          onClick={() => navigate(ROUTES.INVENTORY)}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Sales trend"
            description="Completed orders"
            actions={
              <Select
                aria-label="Trend period"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                options={TREND_OPTIONS}
                className="w-40"
              />
            }
          />
          <CardBody>
            <SalesTrendChart data={trend} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Orders by status" description={`${formatNumber(summary.total_orders)} orders in total`} />
          <CardBody>
            <OrderStatusBreakdown data={summary.orders_by_status} />
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader title="Recent orders" />
          <Table
            columns={recentColumns}
            data={summary.recent_orders}
            onRowClick={(o) => navigate(ROUTES.ORDER_DETAIL(o.id))}
            empty={<EmptyState icon={TrendingUp} title="No orders yet" />}
          />
        </Card>

        <Card>
          <CardHeader title="Low stock" description="Available ≤ reorder level" />
          <CardBody className="p-0">
            {summary.low_stock_items.length === 0 ? (
              <EmptyState icon={Package} title="All stocked up" />
            ) : (
              <ul className="divide-y divide-border-100">
                {summary.low_stock_items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-content-primary">{item.name}</p>
                      <p className="text-xs text-content-muted">{item.sku}</p>
                    </div>
                    <Badge tone={item.available_qty === 0 ? 'danger' : 'warning'}>
                      {item.available_qty} / {item.reorder_level}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
