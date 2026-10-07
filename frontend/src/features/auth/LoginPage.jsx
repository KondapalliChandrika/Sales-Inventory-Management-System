import { zodResolver } from '@hookform/resolvers/zod';
import { Package2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { Button, Card, Input, PasswordInput } from '@/components/ui';
import { APP_NAME } from '@/constants/app';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';

import { loginSchema } from './loginSchema';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@example.com', password: 'Admin@123' },
  { role: 'Manager', email: 'manager@example.com', password: 'Manager@123' },
  { role: 'Sales', email: 'sales@example.com', password: 'Sales@123' },
];

export default function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  if (status === 'authenticated') return <Navigate to={ROUTES.DASHBOARD} replace />;

  const onSubmit = async (values) => {
    setFormError('');
    try {
      await login(values);
      navigate(location.state?.from?.pathname ?? ROUTES.DASHBOARD, { replace: true });
    } catch (error) {
      setFormError(error.message);
    }
  };

  const fillDemo = (account) => {
    setValue('email', account.email, { shouldValidate: true });
    setValue('password', account.password, { shouldValidate: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 rounded-xl bg-primary-600 p-2.5 text-content-inverse">
            <Package2 className="h-7 w-7" aria-hidden />
          </span>
          <h1 className="text-2xl font-semibold text-content-primary">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-content-secondary">Sign in to manage orders and inventory</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {formError && (
              <div className="rounded-lg border border-danger-100 bg-danger-50 px-3 py-2 text-sm text-danger-700" role="alert">
                {formError}
              </div>
            )}
            <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
            <PasswordInput
              label="Password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Sign in
            </Button>
          </form>

          <div className="mt-6 border-t border-border-200 pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-content-muted">Demo accounts</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <Button key={account.role} variant="secondary" size="sm" onClick={() => fillDemo(account)}>
                  {account.role}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
