"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DURATION } from "@/lib/animations";

import { CheckboxOption, ColorOption, PriceRangeInput, RadioOption } from "./FilterOptions";
import type { ActiveFilters, FilterGroup } from "./FilterTypes";

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

  const reduceMotion = useReducedMotion();

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
            initial={
              reduceMotion
                ? { opacity: 1, height: "auto" }
                : { opacity: 0, height: 0 }
            }
            animate={{ opacity: 1, height: "auto" }}
            exit={
              reduceMotion
                ? { opacity: 1, height: "auto" }
                : { opacity: 0, height: 0 }
            }
            transition={{ duration: reduceMotion ? 0 : DURATION.FAST }}
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
