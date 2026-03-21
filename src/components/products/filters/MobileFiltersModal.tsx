"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DURATION, SLIDE_IN_LEFT } from "@/lib/animations";

import { FilterGroupSection } from "./FilterGroupSection";
import type { ActiveFilters, FilterGroup } from "./FilterTypes";

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
  const reduceMotion = useReducedMotion();

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
            variants={SLIDE_IN_LEFT}
            initial={reduceMotion ? "animate" : "initial"}
            animate="animate"
            exit={reduceMotion ? "animate" : "exit"}
            transition={{
              type: "tween",
              duration: reduceMotion ? 0 : DURATION.NORMAL,
            }}
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
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
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
