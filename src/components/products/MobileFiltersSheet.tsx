"use client";

import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { FilterSidebar } from "./ProductListComponents";

interface MobileFiltersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  categoryOptions: Array<{ value: string; label: string }>;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  sortOptions: Array<{ value: string; label: string }>;
  sortValue: string;
  onSortChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onApply: () => void;
}

export function MobileFiltersSheet({
  isOpen,
  onClose,
  searchValue,
  onSearchChange,
  onSearch,
  categoryOptions,
  selectedCategory,
  onCategoryChange,
  sortOptions,
  sortValue,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
  onApply,
}: MobileFiltersSheetProps) {
  const handleApply = () => {
    onApply();
    onClose();
  };

  const handleClearAndClose = () => {
    onClearFilters();
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Filtros y ordenamiento"
      footer={
        <div className="flex gap-3">
          <Button
            onClick={handleClearAndClose}
            variant="outline"
            className="flex-1"
            disabled={!hasActiveFilters}
          >
            Limpiar
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Aplicar
          </Button>
        </div>
      }
    >
      <FilterSidebar
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onSearch={onSearch}
        categoryOptions={categoryOptions}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        sortOptions={sortOptions}
        sortValue={sortValue}
        onSortChange={onSortChange}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />
    </BottomSheet>
  );
}
