import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button, Modal, Textarea } from '@/components/ui';
import { useApproveOrder, useRejectOrder } from '@/hooks/useOrders';
import { formatCurrency } from '@/utils/format';

const approveSchema = z.object({ text: z.string().trim().max(500).optional() });
const rejectSchema = z.object({
  text: z.string().trim().min(3, 'Please give a reason (at least 3 characters)').max(500),
});

export default function DecisionModal({ order, mode, onClose, onDone }) {
  const isReject = mode === 'reject';
  const approve = useApproveOrder();
  const reject = useRejectOrder();
  const mutation = isReject ? reject : approve;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(isReject ? rejectSchema : approveSchema), defaultValues: { text: '' } });

  useEffect(() => reset({ text: '' }), [order, mode, reset]);

  const onSubmit = ({ text }) => {
    const handlers = {
      onSuccess: (updated) => {
        onClose();
        onDone?.(updated);
      },
    };
    if (isReject) reject.mutate({ id: order.id, reason: text }, handlers);
    else approve.mutate({ id: order.id, comment: text || null }, handlers);
  };

  return (
    <Modal
      open={Boolean(order && mode)}
      onClose={onClose}
      size="sm"
      title={isReject ? 'Reject order' : 'Approve order'}
      description={order && `${order.order_number} · ${order.customer.name} · ${formatCurrency(order.total)}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="decision-form" variant={isReject ? 'danger' : 'success'} loading={mutation.isPending}>
            {isReject ? 'Reject order' : 'Approve order'}
          </Button>
        </>
      }
    >
      <form id="decision-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <p className="text-sm text-content-secondary">
          {isReject
            ? 'Reserved stock will be released and the order creator will be emailed the reason.'
            : 'Reserved stock will be deducted from inventory and the order will be completed.'}
        </p>
        <Textarea
          label={isReject ? 'Reason' : 'Comment (optional)'}
          required={isReject}
          autoFocus
          error={errors.text?.message}
          {...register('text')}
        />
      </form>
    </Modal>
  );
}
