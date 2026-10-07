import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useId, useState } from 'react';

import { cn } from '@/utils/cn';

import FormField, { controlClasses } from './FormField';

const PasswordInput = forwardRef(function PasswordInput({ label, error, hint, required, className, id, ...props }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <FormField label={label} htmlFor={inputId} error={error} hint={hint} required={required} className={className}>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          className={cn(controlClasses(error), 'h-10 pr-10')}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-content-muted hover:text-content-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          <Icon className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </FormField>
  );
});

export default PasswordInput;
