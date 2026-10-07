import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button, Card, CardBody, CardHeader, Input, PageHeader, PageLoader } from '@/components/ui';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';

const schema = z.object({
  approval_threshold: z.coerce.number({ invalid_type_error: 'Enter an amount' }).positive('Must be greater than 0'),
  tax_rate_percent: z.coerce.number({ invalid_type_error: 'Enter a rate' }).min(0).max(100, 'Max 100%'),
});

export default function SettingsPage() {
  const { data, isLoading } = useSettings();
  const update = useUpdateSettings();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  if (isLoading) return <PageLoader />;

  return (
    <>
      <PageHeader title="Settings" description="Business rules used when orders are created." />
      <Card className="max-w-xl">
        <CardHeader title="Order rules" description="Changes apply to new orders only — pending orders keep their rules." />
        <CardBody>
          <form onSubmit={handleSubmit((values) => update.mutate(values))} className="space-y-4" noValidate>
            <Input
              label="Approval threshold"
              type="number"
              step="0.01"
              hint="Orders with a total (incl. tax) above this need manager approval."
              error={errors.approval_threshold?.message}
              {...register('approval_threshold')}
            />
            <Input
              label="Tax rate (%)"
              type="number"
              step="0.01"
              error={errors.tax_rate_percent?.message}
              {...register('tax_rate_percent')}
            />
            <div className="flex justify-end">
              <Button type="submit" loading={update.isPending} disabled={!isDirty}>
                Save settings
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  );
}
