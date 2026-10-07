import { useState } from 'react';

import { DEFAULT_PAGE_SIZE } from '@/constants/app';

import { useDebounce } from './useDebounce';

export function useListParams(initialFilters = {}) {
  const [search, setSearchValue] = useState('');
  const [filters, setFiltersState] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const setSearch = (value) => {
    setSearchValue(value);
    setPage(1);
  };
  const setFilter = (key, value) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return {
    search,
    setSearch,
    filters,
    setFilter,
    page,
    setPage,
    params: { ...filters, search: debouncedSearch, page, page_size: DEFAULT_PAGE_SIZE },
  };
}
