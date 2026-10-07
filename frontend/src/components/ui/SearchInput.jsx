import { Search } from 'lucide-react';

import { cn } from '@/utils/cn';

import { controlClasses } from './FormField';

export default function SearchInput({ value, onChange, placeholder = 'Search…', className }) {
  return (
    <div className={cn('relative w-full sm:w-72', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(controlClasses(), 'h-10 pl-9')}
      />
    </div>
  );
}
