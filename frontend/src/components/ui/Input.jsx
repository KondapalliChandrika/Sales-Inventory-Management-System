import { forwardRef, useId } from 'react';

import { cn } from '@/utils/cn';

import FormField, { controlClasses } from './FormField';

const Input = forwardRef(function Input({ label, error, hint, required, className, id, ...props }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FormField label={label} htmlFor={inputId} error={error} hint={hint} required={required} className={className}>
      <input ref={ref} id={inputId} aria-invalid={Boolean(error)} className={cn(controlClasses(error), 'h-10')} {...props} />
    </FormField>
  );
});

export default Input;
