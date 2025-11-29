"use client";

import { DollarSign, Filter, Palette, Ruler, Star, Tag } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import {
  ActiveFilters,
  ActiveFiltersBadges,
  FilterGroup,
  FilterGroupSection,
  getColorHex,
  MobileFiltersModal,
  SORT_OPTIONS,
  useFilterHandlers,
} from "./FilterComponents";

// ==============================================================================
// TYPES
// ==============================================================================
interface Category {
  id: string;
  name: string;
  count?: number;
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: ActiveFilters) => void;
  onSortChange: (sort: string) => void;
  totalResults: number;
  isLoading?: boolean;
}

// ==============================================================================
// FETCHER
// ==============================================================================
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

// ==============================================================================
// MAIN COMPONENT
// ==============================================================================
export default function AdvancedFilters({
  onFiltersChange,
  onSortChange,
  totalResults,
  isLoading = false,
}: AdvancedFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sortBy, setSortBy] = useState("relevance");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch data
  const { data: categoriesData } = useSWR("/api/categories", fetcher);
  const { data: statsData } = useSWR("/api/products/stats", fetcher);

  const categories = useMemo(
    () => categoriesData?.data?.data || [],
    [categoriesData]
  );
  const stats = useMemo(() => statsData?.data || {}, [statsData]);

  // Build dynamic filter groups
  const filterGroups = useMemo((): FilterGroup[] => {
    const groups: FilterGroup[] = [
      {
        id: "price",
        label: "Precio",
        type: "range",
        icon: <DollarSign className="w-4 h-4" />,
        min: stats.minPrice || 0,
        max: stats.maxPrice || 100000,
        step: 1000,
      },
    ];

    if (categories.length > 0) {
      groups.push({
        id: "category",
        label: "Categoría",
        type: "checkbox",
        icon: <Tag className="w-4 h-4" />,
        options: categories.map((cat: Category) => ({
          id: cat.id,
          label: cat.name,
          count: cat.count || stats.categoryCounts?.[cat.id] || 0,
        })),
      });
    }

    if (stats.availableSizes?.length > 0) {
      groups.push({
        id: "size",
        label: "Talla",
        type: "checkbox",
        icon: <Ruler className="w-4 h-4" />,
        options: stats.availableSizes.map((size: string) => ({
          id: size,
          label: size,
          count: stats.sizeCounts?.[size] || 0,
        })),
      });
    }

    if (stats.availableColors?.length > 0) {
      groups.push({
        id: "color",
        label: "Color",
        type: "color",
        icon: <Palette className="w-4 h-4" />,
        options: stats.availableColors.map((color: string) => ({
          id: color.toLowerCase(),
          label: color,
          count: stats.colorCounts?.[color] || 0,
          color: getColorHex(color),
        })),
      });
    }

    if (stats.hasRatings) {
      groups.push({
        id: "rating",
        label: "Calificación",
        type: "radio",
        icon: <Star className="w-4 h-4" />,
        options: [
          {
            id: "5",
            label: "5 estrellas",
            count: stats.ratingCounts?.["5"] || 0,
          },
          {
            id: "4",
            label: "4+ estrellas",
            count: stats.ratingCounts?.["4+"] || 0,
          },
          {
            id: "3",
            label: "3+ estrellas",
            count: stats.ratingCounts?.["3+"] || 0,
          },
          {
            id: "2",
            label: "2+ estrellas",
            count: stats.ratingCounts?.["2+"] || 0,
          },
        ],
      });
    }

    return groups;
  }, [categories, stats]);

  // URL update handler
  const updateURL = useCallback(
    (newFilters: ActiveFilters, newSort: string) => {
      const params = new URLSearchParams(searchParams.toString());

      filterGroups.forEach((group) => params.delete(group.id));
      params.delete("sort");

      Object.entries(newFilters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          if (typeof value[0] === "number") {
            params.set(key, value.join("-"));
          } else {
            params.set(key, value.join(","));
          }
        } else if (typeof value === "string" && value) {
          params.set(key, value);
        }
      });

      if (newSort !== "relevance") {
        params.set("sort", newSort);
      }

      const query = searchParams.get("q");
      if (query) {
        params.set("q", query);
      }

      router.push(`/productos?${params.toString()}`);
    },
    [router, searchParams, filterGroups]
  );

  // Filter handlers
  const {
    activeFilters,
    setActiveFilters,
    expandedGroups,
    handleFilterChange,
    clearFilters,
    clearFilter,
    toggleGroup,
    activeFilterCount,
  } = useFilterHandlers({
    filterGroups,
    onFiltersChange,
    onUpdateURL: updateURL,
    sortBy,
  });

  // Initialize filters from URL
  useEffect(() => {
    const filters: ActiveFilters = {};

    filterGroups.forEach((group) => {
      const param = searchParams.get(group.id);
      if (param) {
        if (group.type === "range") {
          const [min, max] = param.split("-").map(Number);
          filters[group.id] = [min || group.min || 0, max || group.max || 100];
        } else if (group.type === "radio") {
          filters[group.id] = param;
        } else {
          filters[group.id] = param.split(",");
        }
      }
    });

    const sort = searchParams.get("sort") || "relevance";
    setSortBy(sort);
    setActiveFilters(filters);
  }, [searchParams, filterGroups, setActiveFilters]);

  // Sort change handler
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    onSortChange(newSort);
    updateURL(activeFilters, newSort);
  };

  return (
    <>
      {/* Header with results and sorting */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-secondary">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-surface-secondary rounded-md text-sm hover:bg-surface"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="text-sm muted">
            {isLoading ? (
              <span>Buscando...</span>
            ) : (
              <span>{totalResults.toLocaleString()} productos encontrados</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-sm muted">Ordenar por:</label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border border-surface-secondary rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filters badges */}
      <ActiveFiltersBadges
        activeFilters={activeFilters}
        filterGroups={filterGroups}
        onClearFilter={clearFilter}
        onClearAll={clearFilters}
      />

      {/* Desktop filters sidebar */}
      <div className="hidden lg:block">
        <div className="space-y-6">
          {filterGroups.map((group) => (
            <FilterGroupSection
              key={group.id}
              group={group}
              activeFilters={activeFilters}
              isExpanded={expandedGroups.has(group.id)}
              onToggle={toggleGroup}
              onFilterChange={handleFilterChange}
            />
          ))}
        </div>
      </div>

      {/* Mobile filters modal */}
      <MobileFiltersModal
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        filterGroups={filterGroups}
        activeFilters={activeFilters}
        expandedGroups={expandedGroups}
        onToggleGroup={toggleGroup}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />
    </>
  );
}
