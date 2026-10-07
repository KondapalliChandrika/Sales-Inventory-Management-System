import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button, Input, Modal, Select, Textarea } from '@/components/ui';
import { useCategories, useSaveProduct } from '@/hooks/useProducts';

import { productSchema } from './productSchema';

const EMPTY = { sku: '', name: '', category_id: '', description: '', unit_price: '', reorder_level: 10, opening_stock: 0, is_active: true };

export default function ProductFormModal({ open, onClose, product }) {
  const isEdit = Boolean(product);
  const { data: categories = [] } = useCategories();
  const save = useSaveProduct();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(productSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    reset(
      product
        ? { ...product, category_id: product.category?.id ?? '', description: product.description ?? '', opening_stock: 0 }
        : EMPTY,
    );
  }, [open, product, reset]);

  const onSubmit = (values) => {
    const { sku, opening_stock, is_active, ...rest } = values;
    const data = isEdit ? { ...rest, is_active } : { ...rest, sku, opening_stock };
    save.mutate({ id: product?.id, data }, { onSuccess: onClose });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit product' : 'New product'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="product-form" loading={save.isPending}>
            {isEdit ? 'Save changes' : 'Create product'}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        <Input label="SKU" required readOnly={isEdit} hint={isEdit ? 'SKU cannot be changed' : undefined} error={errors.sku?.message} {...register('sku')} />
        <Input label="Name" required error={errors.name?.message} {...register('name')} />
        <Select
          label="Category"
          placeholder="No category"
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          error={errors.category_id?.message}
          {...register('category_id')}
        />
        <Input label="Unit price" type="number" step="0.01" min="0" required error={errors.unit_price?.message} {...register('unit_price')} />
        <Input
          label="Reorder level"
          type="number"
          min="0"
          hint="Shown as low stock at or below this"
          error={errors.reorder_level?.message}
          {...register('reorder_level')}
        />
        {isEdit ? (
          <Select
            label="Status"
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
            {...register('is_active', { setValueAs: (v) => v === true || v === 'true' })}
          />
        ) : (
          <Input label="Opening stock" type="number" min="0" error={errors.opening_stock?.message} {...register('opening_stock')} />
        )}
        <Textarea label="Description" className="sm:col-span-2" error={errors.description?.message} {...register('description')} />
      </form>
    </Modal>
  );
}
