import { forwardRef, useId } from 'react';

import { cn } from '@/utils/cn';

import FormField, { controlClasses } from './FormField';

const Select = forwardRef(function Select(
  { label, error, hint, required, options = [], placeholder, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <FormField label={label} htmlFor={selectId} error={error} hint={hint} required={required} className={className}>
      <select ref={ref} id={selectId} aria-invalid={Boolean(error)} className={cn(controlClasses(error), 'h-10 pr-8')} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
});

export default Select;
