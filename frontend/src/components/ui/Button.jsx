import { forwardRef } from 'react';

import { cn } from '@/utils/cn';

import Spinner from './Spinner';

const VARIANTS = {
  primary: 'bg-primary-600 text-content-inverse hover:bg-primary-700',
  secondary: 'border border-border-300 bg-background-50 text-content-primary hover:bg-background-200',
  success: 'bg-success-600 text-content-inverse hover:bg-success-700',
  danger: 'bg-danger-600 text-content-inverse hover:bg-danger-700',
  ghost: 'text-content-secondary hover:bg-background-200 hover:text-content-primary',
};

const SIZES = {
  sm: 'h-8 gap-1.5 px-3 text-xs',
  md: 'h-10 gap-2 px-4 text-sm',
  icon: 'h-9 w-9',
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, icon: Icon, className, children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : Icon && <Icon className="h-4 w-4" aria-hidden />}
      {children}
    </button>
  );
});

export default Button;
