"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

// ==============================================================================
// TYPES
// ==============================================================================
export interface FilterOption {
  id: string;
  label: string;
  count?: number;
  color?: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: "checkbox" | "radio" | "range" | "color" | "size";
  icon: React.ReactNode;
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
}

export interface ActiveFilters {
  [key: string]: string[] | number[] | string;
}

// ==============================================================================
// CONSTANTS
// ==============================================================================
export const SORT_OPTIONS = [
  { id: "relevance", label: "Relevancia" },
  { id: "price-asc", label: "Precio: menor a mayor" },
  { id: "price-desc", label: "Precio: mayor a menor" },
  { id: "createdAt-desc", label: "Más recientes" },
  { id: "rating-desc", label: "Mejor calificados" },
  { id: "name-asc", label: "A-Z" },
  { id: "name-desc", label: "Z-A" },
] as const;

export const COLOR_MAP: Record<string, string> = {
  rosa: "#ec4899",
  pink: "#ec4899",
  azul: "#3b82f6",
  blue: "#3b82f6",
  blanco: "#ffffff",
  white: "#ffffff",
  negro: "#000000",
  black: "#000000",
  amarillo: "#eab308",
  yellow: "#eab308",
  verde: "#22c55e",
  green: "#22c55e",
  rojo: "#ef4444",
  red: "#ef4444",
  morado: "#a855f7",
  purple: "#a855f7",
  naranja: "#f97316",
  orange: "#f97316",
  gris: "#6b7280",
  gray: "#6b7280",
};

export function getColorHex(colorName: string): string {
  return COLOR_MAP[colorName.toLowerCase()] || "#6b7280";
}

// ==============================================================================
// HOOKS
// ==============================================================================
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

// ==============================================================================
// FILTER OPTION COMPONENTS
// ==============================================================================
interface CheckboxOptionProps {
  groupId: string;
  option: FilterOption;
  isChecked: boolean;
  onChange: (groupId: string, value: string, checked: boolean) => void;
}

export function CheckboxOption({
  groupId,
  option,
  isChecked,
  onChange,
}: CheckboxOptionProps) {
  return (
    <label className="flex items-center space-x-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(e) => onChange(groupId, option.id, e.target.checked)}
        className="w-4 h-4 text-gray-900 dark:text-white border-2 border-surface-secondary rounded focus:ring-2 focus:ring-pink-500"
      />
      <span className="flex-1 text-sm text-gray-900 dark:text-white group-hover:text-pink-600 transition-colors">
        {option.label}
      </span>
      {option.count !== undefined && option.count > 0 && (
        <span className="text-xs muted">({option.count})</span>
      )}
    </label>
  );
}

interface ColorOptionProps {
  groupId: string;
  option: FilterOption;
  isChecked: boolean;
  onChange: (groupId: string, value: string, checked: boolean) => void;
}

export function ColorOption({
  groupId,
  option,
  isChecked,
  onChange,
}: ColorOptionProps) {
  return (
    <button
      onClick={() => onChange(groupId, option.id, !isChecked)}
      className={`group relative flex items-center space-x-2 p-2 rounded-lg border-2 transition-all ${
        isChecked
          ? "border-pink-500 bg-pink-50"
          : "border-surface-secondary hover:border-surface"
      }`}
    >
      <div
        className="w-6 h-6 rounded-full border-2 border-surface-secondary"
        style={{ backgroundColor: option.color }}
      />
      <span className="text-sm text-gray-900 dark:text-white">
        {option.label}
      </span>
      {option.count !== undefined && option.count > 0 && (
        <span className="text-xs muted">({option.count})</span>
      )}
      {isChecked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-pink-600 rounded-full" />
        </div>
      )}
    </button>
  );
}

interface RadioOptionProps {
  groupId: string;
  option: FilterOption;
  isChecked: boolean;
  onChange: (groupId: string, value: string) => void;
}

export function RadioOption({
  groupId,
  option,
  isChecked,
  onChange,
}: RadioOptionProps) {
  return (
    <label className="flex items-center space-x-3 cursor-pointer">
      <input
        type="radio"
        name={groupId}
        value={option.id}
        checked={isChecked}
        onChange={() => onChange(groupId, option.id)}
        className="w-4 h-4 text-gray-900 dark:text-white border-2 border-surface-secondary focus:ring-2 focus:ring-pink-500"
      />
      <span className="flex-1 text-sm text-gray-900 dark:text-white">
        {option.label}
      </span>
      {option.count !== undefined && option.count > 0 && (
        <span className="text-xs muted">({option.count})</span>
      )}
    </label>
  );
}

interface PriceRangeInputProps {
  group: FilterGroup;
  currentRange: number[];
  onChange: (groupId: string, value: number[]) => void;
}

export function PriceRangeInput({
  group,
  currentRange,
  onChange,
}: PriceRangeInputProps) {
  const [min, max] = currentRange;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <label className="block text-xs muted mb-1">Mínimo</label>
          <input
            type="number"
            value={min}
            onChange={(e) => onChange(group.id, [Number(e.target.value), max])}
            className="w-full px-3 py-2 border border-surface-secondary rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            min={group.min}
            max={group.max}
            step={group.step}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs muted mb-1">Máximo</label>
          <input
            type="number"
            value={max}
            onChange={(e) => onChange(group.id, [min, Number(e.target.value)])}
            className="w-full px-3 py-2 border border-surface-secondary rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            min={group.min}
            max={group.max}
            step={group.step}
          />
        </div>
      </div>
      <div className="text-center text-sm muted">
        ${min.toLocaleString()} - ${max.toLocaleString()}
      </div>
    </div>
  );
}

// ==============================================================================
// FILTER GROUP COMPONENT
// ==============================================================================
interface FilterGroupSectionProps {
  group: FilterGroup;
  activeFilters: ActiveFilters;
  isExpanded: boolean;
  onToggle: (groupId: string) => void;
  onFilterChange: (
    groupId: string,
    value: string | number[],
    checked?: boolean
  ) => void;
}

export function FilterGroupSection({
  group,
  activeFilters,
  isExpanded,
  onToggle,
  onFilterChange,
}: FilterGroupSectionProps) {
  const currentRange: number[] = (activeFilters[group.id] as number[]) || [
    group.min || 0,
    group.max || 100,
  ];

  return (
    <div className="border-b border-surface-secondary pb-6">
      <button
        onClick={() => onToggle(group.id)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center space-x-2">
          {group.icon}
          <span className="font-medium text-gray-900 dark:text-white">
            {group.label}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 muted" />
        ) : (
          <ChevronDown className="w-4 h-4 muted" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3"
          >
            {group.type === "range" && (
              <PriceRangeInput
                group={group}
                currentRange={currentRange}
                onChange={onFilterChange}
              />
            )}

            {group.type === "checkbox" &&
              group.options?.map((option) => (
                <CheckboxOption
                  key={option.id}
                  groupId={group.id}
                  option={option}
                  isChecked={(
                    (activeFilters[group.id] as string[]) || []
                  ).includes(option.id)}
                  onChange={onFilterChange}
                />
              ))}

            {group.type === "color" && (
              <div className="grid grid-cols-2 gap-2">
                {group.options?.map((option) => (
                  <ColorOption
                    key={option.id}
                    groupId={group.id}
                    option={option}
                    isChecked={(
                      (activeFilters[group.id] as string[]) || []
                    ).includes(option.id)}
                    onChange={onFilterChange}
                  />
                ))}
              </div>
            )}

            {group.type === "radio" &&
              group.options?.map((option) => (
                <RadioOption
                  key={option.id}
                  groupId={group.id}
                  option={option}
                  isChecked={activeFilters[group.id] === option.id}
                  onChange={onFilterChange}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==============================================================================
// ACTIVE FILTERS DISPLAY
// ==============================================================================
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
              displayValue = `$${value[0].toLocaleString()} - $${value[1].toLocaleString()}`;
            } else {
              displayValue = value.join(", ");
            }
          } else {
            displayValue = value.toString();
          }

          return (
            <span
              key={groupId}
              className="inline-flex items-center space-x-2 px-3 py-1 bg-pink-100 text-pink-800 text-sm rounded-full"
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

// ==============================================================================
// MOBILE FILTERS MODAL
// ==============================================================================
interface MobileFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterGroups: FilterGroup[];
  activeFilters: ActiveFilters;
  expandedGroups: Set<string>;
  onToggleGroup: (groupId: string) => void;
  onFilterChange: (
    groupId: string,
    value: string | number[],
    checked?: boolean
  ) => void;
  onClearFilters: () => void;
}

export function MobileFiltersModal({
  isOpen,
  onClose,
  filterGroups,
  activeFilters,
  expandedGroups,
  onToggleGroup,
  onFilterChange,
  onClearFilters,
}: MobileFiltersModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 lg:hidden"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="absolute inset-y-0 left-0 w-80 bg-white shadow-xl overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Filtros
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-surface rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {filterGroups.map((group) => (
                  <FilterGroupSection
                    key={group.id}
                    group={group}
                    activeFilters={activeFilters}
                    isExpanded={expandedGroups.has(group.id)}
                    onToggle={onToggleGroup}
                    onFilterChange={onFilterChange}
                  />
                ))}
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={onClearFilters}
                  className="flex-1 px-4 py-2 border border-surface-secondary text-gray-900 dark:text-white rounded-md hover:bg-surface"
                >
                  Limpiar
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
