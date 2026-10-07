import { forwardRef, useId } from 'react';

import { cn } from '@/utils/cn';

import FormField, { controlClasses } from './FormField';

const Textarea = forwardRef(function Textarea({ label, error, hint, required, className, id, rows = 3, ...props }, ref) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  return (
    <FormField label={label} htmlFor={textareaId} error={error} hint={hint} required={required} className={className}>
      <textarea ref={ref} id={textareaId} rows={rows} aria-invalid={Boolean(error)} className={cn(controlClasses(error), 'py-2')} {...props} />
    </FormField>
  );
});

export default Textarea;
