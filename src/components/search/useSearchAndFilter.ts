import { useCallback, useMemo, useState } from "react";

export interface UseSearchAndFilterOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  filterFunctions?: {
    [key: string]: (item: T, filterValue: string | string[] | null) => boolean;
  };
}

export interface UseSearchAndFilterReturn<T> {
  filteredData: T[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: { [key: string]: string | string[] | null };
  setFilter: (key: string, value: string | string[] | null) => void;
  resetFilters: () => void;
  clearAll: () => void;
  resultsCount: number;
  hasActiveFilters: boolean;
}

export function useSearchAndFilter<T extends Record<string, unknown>>({
  data,
  searchFields,
  filterFunctions = {},
}: UseSearchAndFilterOptions<T>): UseSearchAndFilterReturn<T> {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{
    [key: string]: string | string[] | null;
  }>({});

  const setFilter = useCallback(
    (key: string, value: string | string[] | null) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const clearAll = useCallback(() => {
    setSearchQuery("");
    setFilters({});
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) =>
        value !== null &&
        value !== "" &&
        (!Array.isArray(value) || value.length > 0)
    );
  }, [filters]);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const fieldValue = item[field];
          if (fieldValue === null) {
            return false;
          }
          return String(fieldValue).toLowerCase().includes(query);
        })
      );
    }

    // Apply custom filters
    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== null &&
        value !== "" &&
        (!Array.isArray(value) || value.length > 0)
      ) {
        const filterFunction = filterFunctions[key];
        if (filterFunction) {
          result = result.filter((item) => filterFunction(item, value));
        }
      }
    });

    return result;
  }, [data, searchQuery, searchFields, filters, filterFunctions]);

  return {
    filteredData,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    resetFilters,
    clearAll,
    resultsCount: filteredData.length,
    hasActiveFilters,
  };
}
