"use client";

import { Check, Search, Star, X } from "lucide-react";
import { useState } from "react";

import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { getColorHex, isLightColor } from "@/utils/colors";

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
  // New filter props
  minPrice?: string;
  maxPrice?: string;
  onPriceChange: (minPrice: string, maxPrice: string) => void;
  selectedSizes: string[];
  onSizeToggle: (size: string) => void;
  availableSizes: string[];
  selectedColors: string[];
  onColorToggle: (color: string) => void;
  availableColors: string[];
  minRating: number;
  onRatingChange: (rating: number) => void;
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
  minPrice,
  maxPrice,
  onPriceChange,
  selectedSizes,
  onSizeToggle,
  availableSizes,
  selectedColors,
  onColorToggle,
  availableColors,
  minRating,
  onRatingChange,
}: MobileFiltersSheetProps) {
  const [localMin, setLocalMin] = useState(minPrice ?? "");
  const [localMax, setLocalMax] = useState(maxPrice ?? "");

  const handleApply = () => {
    onPriceChange(localMin, localMax);
    onApply();
    onClose();
  };

  const handleClearAndClose = () => {
    setLocalMin("");
    setLocalMax("");
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

        {/* Categories */}
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

        {/* Price Range */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Precio
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              placeholder="Mín $"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
            />
            <span className="text-gray-400 text-sm shrink-0">—</span>
            <input
              type="number"
              min={0}
              placeholder="Máx $"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
            />
          </div>
        </div>

        {/* Sizes */}
        {availableSizes.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Talle
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const isActive = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => onSizeToggle(size)}
                    className={`px-3.5 py-2 text-sm font-semibold rounded-xl border transition-all duration-150 ${
                      isActive
                        ? "bg-primary-500 text-white border-primary-500 shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 active:bg-primary-50"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Colors */}
        {availableColors.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Color
            </h3>
            <div className="flex flex-wrap gap-3">
              {availableColors.map((color) => {
                const hex = getColorHex(color);
                const light = isLightColor(hex);
                const isActive = selectedColors.includes(color);
                return (
                  <button
                    key={color}
                    onClick={() => onColorToggle(color)}
                    title={color.charAt(0).toUpperCase() + color.slice(1)}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-150 ${
                      isActive
                        ? "ring-2 ring-primary-500 ring-offset-2 border-transparent"
                        : light
                          ? "border-gray-300 hover:border-primary-400"
                          : "border-transparent hover:border-primary-400"
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Rating */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Calificación mínima
          </h3>
          <div className="flex gap-2">
            {[2, 3, 4, 5].map((stars) => {
              const isActive = minRating === stars;
              return (
                <button
                  key={stars}
                  onClick={() => onRatingChange(stars)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-sm font-semibold rounded-xl border transition-all duration-150 ${
                    isActive
                      ? "bg-primary-500 text-white border-primary-500 shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 active:bg-primary-50"
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {stars}+
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort */}
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
