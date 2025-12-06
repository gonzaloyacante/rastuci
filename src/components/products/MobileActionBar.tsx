"use client";

import { Filter, Grid, List, ArrowUpDown } from "lucide-react";

interface MobileActionBarProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onFiltersClick: () => void;
  onSortClick: () => void;
  activeFiltersCount: number;
  sortButtonRef?: React.RefObject<HTMLButtonElement>;
}

export function MobileActionBar({
  viewMode,
  onViewModeChange,
  onFiltersClick,
  onSortClick,
  activeFiltersCount,
  sortButtonRef,
}: MobileActionBarProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 gap-2">
        {/* View Mode Toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded transition-colors ${
              viewMode === "grid"
                ? "bg-white shadow-sm text-primary"
                : "text-gray-600 hover:text-gray-900"
            }`}
            aria-label="Vista en cuadrícula"
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 rounded transition-colors ${
              viewMode === "list"
                ? "bg-white shadow-sm text-primary"
                : "text-gray-600 hover:text-gray-900"
            }`}
            aria-label="Vista en lista"
          >
            <List size={20} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-1 justify-end">
          {/* Filters Button with Badge */}
          <button
            onClick={onFiltersClick}
            className="relative flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium"
          >
            <Filter size={18} />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Button */}
          <button
            ref={sortButtonRef}
            onClick={onSortClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium"
            aria-label="Ordenar"
          >
            <ArrowUpDown size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
