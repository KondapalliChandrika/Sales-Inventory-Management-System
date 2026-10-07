import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ArrowLeft, Info, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Button, Card, CardBody, CardHeader, Input, PageHeader, PageLoader, Select, Textarea } from '@/components/ui';
import { LOOKUP_PAGE_SIZE } from '@/constants/app';
import { ROUTES } from '@/constants/routes';
import { useCustomers } from '@/hooks/useCustomers';
import { useCreateOrder } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/format';

import { orderSchema } from './orderSchema';
import { useOrderTotals } from './useOrderTotals';

const EMPTY_LINE = { product_id: '', quantity: 1 };
const LOOKUP = { active: true, page: 1, page_size: LOOKUP_PAGE_SIZE };

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const { data: customers, isLoading: loadingCustomers } = useCustomers(LOOKUP);
  const { data: products, isLoading: loadingProducts } = useProducts(LOOKUP);
  const { data: settings } = useSettings();
  const createOrder = useCreateOrder();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: { customer_id: '', items: [EMPTY_LINE], notes: '' },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = useWatch({ control, name: 'items' });

  const productsById = useMemo(
    () => Object.fromEntries((products?.items ?? []).map((p) => [p.id, p])),
    [products],
  );
  const totals = useOrderTotals(items, productsById, settings);

  if (loadingCustomers || loadingProducts) return <PageLoader />;

  const productOptions = (products?.items ?? []).map((p) => ({
    value: p.id,
    label: `${p.name} (${p.sku}) — ${p.available_qty} available`,
    disabled: p.available_qty === 0,
  }));

  const onSubmit = (values) =>
    createOrder.mutate(values, { onSuccess: (order) => navigate(ROUTES.ORDER_DETAIL(order.id), { replace: true }) });

  return (
    <>
      <PageHeader
        title="New sales order"
        description="Stock is checked when you submit. Large orders go to a manager for approval."
        back={
          <Button variant="ghost" size="sm" icon={ArrowLeft} className="mb-2 -ml-3" onClick={() => navigate(ROUTES.ORDERS)}>
            Orders
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader title="Customer" />
            <CardBody className="space-y-4">
              <Select
                label="Customer"
                required
                placeholder="Select a customer"
                options={(customers?.items ?? []).map((c) => ({ value: c.id, label: c.name }))}
                error={errors.customer_id?.message}
                {...register('customer_id')}
              />
              <Textarea label="Notes" rows={2} placeholder="Delivery instructions, PO number…" {...register('notes')} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Items"
              actions={
                <Button variant="secondary" size="sm" icon={Plus} onClick={() => append(EMPTY_LINE)}>
                  Add item
                </Button>
              }
            />
            <CardBody className="space-y-4">
              {errors.items?.root?.message && <p className="text-sm text-danger-600">{errors.items.root.message}</p>}
              {fields.map((field, index) => {
                const line = totals.lines[index];
                return (
                  <div
                    key={field.id}
                    className={cn(
                      'grid grid-cols-12 items-start gap-3 rounded-lg border p-3',
                      line?.exceedsStock ? 'border-danger-500 bg-danger-50' : 'border-border-200',
                    )}
                  >
                    <Select
                      label="Product"
                      placeholder="Select a product"
                      options={productOptions}
                      className="col-span-12 md:col-span-6"
                      error={errors.items?.[index]?.product_id?.message}
                      {...register(`items.${index}.product_id`)}
                    />
                    <Input
                      label="Qty"
                      type="number"
                      min="1"
                      className="col-span-4 md:col-span-2"
                      error={errors.items?.[index]?.quantity?.message}
                      {...register(`items.${index}.quantity`)}
                    />
                    <div className="col-span-6 md:col-span-3">
                      <p className="mb-1.5 text-sm font-medium text-content-primary">Line total</p>
                      <p className="flex h-10 items-center font-semibold">{formatCurrency(line?.lineTotal)}</p>
                      {line?.product && (
                        <p className="text-xs text-content-muted">@ {formatCurrency(line.product.unit_price)}</p>
                      )}
                    </div>
                    <div className="col-span-2 flex justify-end md:col-span-1 md:pt-7">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4 text-danger-600" />
                      </Button>
                    </div>
                    {line?.exceedsStock && (
                      <p className="col-span-12 text-xs font-medium text-danger-700">
                        Only {line.product.available_qty} unit(s) available for this product.
                      </p>
                    )}
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>

        <div className="xl:sticky xl:top-4 xl:self-start">
          <Card>
            <CardHeader title="Summary" />
            <CardBody className="space-y-3">
              <SummaryRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
              <SummaryRow label={`Tax (${totals.taxRate}%)`} value={formatCurrency(totals.tax)} />
              <div className="border-t border-border-200 pt-3">
                <SummaryRow label="Total" value={formatCurrency(totals.total)} strong />
              </div>

              {totals.requiresApproval ? (
                <Notice tone="warning" icon={AlertTriangle}>
                  Total is above {formatCurrency(totals.threshold)}. This order will need <strong>manager approval</strong>;
                  stock will be reserved until then.
                </Notice>
              ) : (
                totals.threshold !== undefined && (
                  <Notice tone="info" icon={Info}>
                    Orders up to {formatCurrency(totals.threshold)} are completed immediately.
                  </Notice>
                )
              )}

              <Button
                type="submit"
                className="w-full"
                loading={createOrder.isPending}
                disabled={totals.hasStockIssue || totals.total <= 0}
              >
                {totals.requiresApproval ? 'Submit for approval' : 'Place order'}
              </Button>
            </CardBody>
          </Card>
        </div>
      </form>
    </>
  );
}

function SummaryRow({ label, value, strong }) {
  return (
    <div className={cn('flex justify-between', strong ? 'text-base font-semibold' : 'text-sm text-content-secondary')}>
      <span>{label}</span>
      <span className={strong ? 'text-content-primary' : undefined}>{value}</span>
    </div>
  );
}

const NOTICE_TONES = {
  warning: 'border-warning-100 bg-warning-50 text-warning-700',
  info: 'border-info-100 bg-info-50 text-info-700',
};

function Notice({ tone, icon: Icon, children }) {
  return (
    <div className={cn('flex gap-2 rounded-lg border p-3 text-xs', NOTICE_TONES[tone])}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>{children}</p>
    </div>
  );
}
