"use client";

import type { FilterGroup } from "./FilterTypes";

interface CheckboxOptionProps {
  groupId: string;
  option: { id: string; label: string; count?: number; color?: string };
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
  option: { id: string; label: string; count?: number; color?: string };
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
  option: { id: string; label: string; count?: number };
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
