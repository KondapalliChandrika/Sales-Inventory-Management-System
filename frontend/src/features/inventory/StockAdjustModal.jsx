import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Button, Input, Modal, Select, Textarea } from '@/components/ui';
import { useAdjustStock } from '@/hooks/useInventory';

const schema = z
  .object({
    type: z.enum(['IN', 'ADJUSTMENT']),
    quantity: z.coerce.number({ invalid_type_error: 'Enter a quantity' }).int('Whole numbers only'),
    note: z.string().trim().min(3, 'Add a short note (min 3 characters)').max(255),
  })
  .refine((v) => v.quantity !== 0, { path: ['quantity'], message: 'Quantity cannot be zero' })
  .refine((v) => v.type !== 'IN' || v.quantity > 0, { path: ['quantity'], message: 'Stock in must be positive' });

const TYPE_OPTIONS = [
  { value: 'IN', label: 'Stock in (received goods)' },
  { value: 'ADJUSTMENT', label: 'Adjustment (count correction, damage…)' },
];

export default function StockAdjustModal({ product, onClose }) {
  const adjust = useAdjustStock();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { type: 'IN', quantity: '', note: '' } });
  const type = useWatch({ control, name: 'type' });

  useEffect(() => reset({ type: 'IN', quantity: '', note: '' }), [product, reset]);

  const onSubmit = (values) => adjust.mutate({ ...values, product_id: product.id }, { onSuccess: onClose });

  return (
    <Modal
      open={Boolean(product)}
      onClose={onClose}
      title="Adjust stock"
      description={product && `${product.name} · on hand ${product.stock_on_hand}, reserved ${product.reserved_qty}`}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="adjust-form" loading={adjust.isPending}>
            Save
          </Button>
        </>
      }
    >
      <form id="adjust-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Select label="Type" options={TYPE_OPTIONS} {...register('type')} />
        <Input
          label="Quantity"
          type="number"
          required
          hint={type === 'ADJUSTMENT' ? 'Use a negative number to remove stock' : undefined}
          error={errors.quantity?.message}
          {...register('quantity')}
        />
        <Textarea label="Note" required rows={2} placeholder="e.g. PO-1043 received" error={errors.note?.message} {...register('note')} />
      </form>
    </Modal>
  );
}
