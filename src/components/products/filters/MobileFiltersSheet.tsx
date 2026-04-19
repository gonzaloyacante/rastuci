"use client";

import { Check, Search, X } from "lucide-react";

import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";

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

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSearch();
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
          <Button onClick={handleApply} variant="hero" className="flex-1">
            Aplicar filtros
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-9 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categories — wrapping pills */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Categoría
          </h3>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => onCategoryChange(cat.value)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                    isActive
                      ? "bg-primary-500 text-white border-primary-500 shadow-sm shadow-primary-200"
                      : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:text-primary-600 active:bg-primary-50"
                  }`}
                >
                  {isActive && <Check className="w-3.5 h-3.5" />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort — clean selectable list */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Ordenar por
          </h3>
          <div className="space-y-1">
            {sortOptions.map((option) => {
              const isActive = sortValue === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-primary-50 text-primary-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 active:bg-gray-100"
                  }`}
                >
                  <span>{option.label}</span>
                  {isActive && (
                    <Check className="w-4 h-4 text-primary-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
