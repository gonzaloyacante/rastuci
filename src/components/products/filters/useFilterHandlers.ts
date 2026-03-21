"use client";

import { useCallback, useMemo, useState } from "react";

import type { ActiveFilters, FilterGroup } from "./FilterTypes";

interface UseFiltersParams {
  filterGroups: FilterGroup[];
  onFiltersChange: (filters: ActiveFilters) => void;
  onUpdateURL: (filters: ActiveFilters, sort: string) => void;
  sortBy: string;
}

export function useFilterHandlers({
  filterGroups,
  onFiltersChange,
  onUpdateURL,
  sortBy,
}: UseFiltersParams) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["category", "price"])
  );

  const handleFilterChange = useCallback(
    (groupId: string, value: string | number[], checked?: boolean) => {
      const group = filterGroups.find((g) => g.id === groupId);
      if (!group) return;

      const newFilters = { ...activeFilters };

      if (group.type === "checkbox" || group.type === "color") {
        const currentValues = (newFilters[groupId] as string[]) || [];
        if (checked) {
          newFilters[groupId] = [...currentValues, value as string];
        } else {
          newFilters[groupId] = currentValues.filter((v) => v !== value);
        }
      } else if (group.type === "radio") {
        newFilters[groupId] = value as string;
      } else if (group.type === "range") {
        newFilters[groupId] = value as number[];
      }

      setActiveFilters(newFilters);
      onFiltersChange(newFilters);
      onUpdateURL(newFilters, sortBy);
    },
    [activeFilters, filterGroups, onFiltersChange, onUpdateURL, sortBy]
  );

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    onFiltersChange({});
    onUpdateURL({}, sortBy);
  }, [onFiltersChange, onUpdateURL, sortBy]);

  const clearFilter = useCallback(
    (groupId: string) => {
      const newFilters = { ...activeFilters };
      delete newFilters[groupId];
      setActiveFilters(newFilters);
      onFiltersChange(newFilters);
      onUpdateURL(newFilters, sortBy);
    },
    [activeFilters, onFiltersChange, onUpdateURL, sortBy]
  );

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  const activeFilterCount = useMemo(
    () =>
      Object.values(activeFilters).filter((value) =>
        Array.isArray(value) ? value.length > 0 : Boolean(value)
      ).length,
    [activeFilters]
  );

  return {
    activeFilters,
    setActiveFilters,
    expandedGroups,
    handleFilterChange,
    clearFilters,
    clearFilter,
    toggleGroup,
    activeFilterCount,
  };
}
