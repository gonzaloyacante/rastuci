"use client";

import { X } from "lucide-react";

import { formatCurrency } from "@/lib/utils";

import type { ActiveFilters, FilterGroup } from "./FilterTypes";

interface ActiveFiltersBadgesProps {
  activeFilters: ActiveFilters;
  filterGroups: FilterGroup[];
  onClearFilter: (groupId: string) => void;
  onClearAll: () => void;
}

export function ActiveFiltersBadges({
  activeFilters,
  filterGroups,
  onClearFilter,
  onClearAll,
}: ActiveFiltersBadgesProps) {
  const activeCount = Object.values(activeFilters).filter((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  ).length;

  if (activeCount === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Filtros activos
        </h3>
        <button
          onClick={onClearAll}
          className="text-sm text-pink-600 hover:text-pink-700"
        >
          Limpiar todo
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(activeFilters).map(([groupId, value]) => {
          const group = filterGroups.find((g) => g.id === groupId);
          if (
            !group ||
            (Array.isArray(value) && value.length === 0) ||
            !value
          ) {
            return null;
          }

          let displayValue = "";
          if (Array.isArray(value)) {
            if (typeof value[0] === "number") {
              displayValue = `${formatCurrency(value[0])} - ${formatCurrency(value[1] as number)}`;
            } else {
              displayValue = value.join(", ");
            }
          } else {
            displayValue = value.toString();
          }

          return (
            <span
              key={groupId}
              className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
            >
              <span>
                {group.label}: {displayValue}
              </span>
              <button
                onClick={() => onClearFilter(groupId)}
                className="text-pink-600 hover:text-pink-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}
