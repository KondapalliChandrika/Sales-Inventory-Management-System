import { cn } from '@/utils/cn';

export const controlClasses = (error) =>
  cn(
    'block w-full rounded-lg border bg-background-50 px-3 text-sm text-content-primary placeholder:text-content-muted',
    'focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-background-200',
    error
      ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100'
      : 'border-border-300 focus:border-primary-500 focus:ring-primary-100',
  );

export default function FormField({ label, htmlFor, error, hint, required, className, children }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-content-primary">
          {label}
          {required && <span className="ml-0.5 text-danger-600">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger-600" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-content-muted">{hint}</p>
      )}
    </div>
  );
}
