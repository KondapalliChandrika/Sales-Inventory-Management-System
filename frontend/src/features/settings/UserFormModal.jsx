import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button, Input, Modal, PasswordInput, Select } from '@/components/ui';
import { ROLE_LABELS } from '@/constants/roles';
import { useSaveUser } from '@/hooks/useUsers';

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));
const password = z.string().min(8, 'At least 8 characters').max(72);

const createSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.string().trim().email('Enter a valid email'),
  role: z.enum(Object.keys(ROLE_LABELS)),
  password,
});

const editSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  role: z.enum(Object.keys(ROLE_LABELS)),
  is_active: z.boolean(),
  password: z.union([z.literal(''), password]).transform((v) => v || undefined),
});

export default function UserFormModal({ open, onClose, user }) {
  const isEdit = Boolean(user);
  const save = useSaveUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(isEdit ? editSchema : createSchema) });

  useEffect(() => {
    if (!open) return;
    reset(
      user
        ? { name: user.name, role: user.role, is_active: user.is_active, password: '' }
        : { name: '', email: '', role: 'SALES', password: '' },
    );
  }, [open, user, reset]);

  const onSubmit = (data) => save.mutate({ id: user?.id, data }, { onSuccess: onClose });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${user.name}` : 'New user'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="user-form" loading={save.isPending}>
            {isEdit ? 'Save changes' : 'Create user'}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Name" required error={errors.name?.message} {...register('name')} />
        {!isEdit && <Input label="Email" type="email" required error={errors.email?.message} {...register('email')} />}
        <Select label="Role" options={ROLE_OPTIONS} error={errors.role?.message} {...register('role')} />
        {isEdit && (
          <Select
            label="Status"
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Disabled' },
            ]}
            {...register('is_active', { setValueAs: (v) => v === true || v === 'true' })}
          />
        )}
        <PasswordInput
          label={isEdit ? 'New password' : 'Password'}
          autoComplete="new-password"
          required={!isEdit}
          hint={isEdit ? 'Leave blank to keep the current password' : undefined}
          error={errors.password?.message}
          {...register('password')}
        />
      </form>
    </Modal>
  );
}
