import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button, Input, Modal, Textarea } from '@/components/ui';
import { PHONE_HINT } from '@/constants/validation';
import { useSaveCustomer } from '@/hooks/useCustomers';

import { customerSchema } from './customerSchema';

const EMPTY = { name: '', email: '', phone: '', address: '', gstin: '' };

export default function CustomerFormModal({ open, onClose, customer }) {
  const isEdit = Boolean(customer);
  const save = useSaveCustomer();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(customerSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    reset(customer ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, customer[k] ?? ''])) : EMPTY);
  }, [open, customer, reset]);

  const onSubmit = (data) => save.mutate({ id: customer?.id, data }, { onSuccess: onClose });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit customer' : 'New customer'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="customer-form" loading={save.isPending}>
            {isEdit ? 'Save changes' : 'Create customer'}
          </Button>
        </>
      }
    >
      <form id="customer-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        <Input label="Name" required className="sm:col-span-2" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Phone" type="tel" inputMode="tel" hint={PHONE_HINT} error={errors.phone?.message} {...register('phone')} />
        <Input label="GSTIN" className="sm:col-span-2" error={errors.gstin?.message} {...register('gstin')} />
        <Textarea label="Address" className="sm:col-span-2" error={errors.address?.message} {...register('address')} />
      </form>
    </Modal>
  );
}
