"use client";

import { Plus, RefreshCw, Search } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFiltersBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  statusOptions?: FilterOption[];
  onRefresh?: () => void;
  onAdd?: () => void;
  addLabel?: string;
  children?: ReactNode;
}

export function SearchFiltersBar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  onRefresh,
  onAdd,
  addLabel = "Agregar",
  children,
}: SearchFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {statusOptions && onStatusFilterChange && (
        <select
          value={statusFilter || "all"}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="input"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {children}

      {onRefresh && (
        <Button variant="outline" onClick={onRefresh} className="gap-2">
          <RefreshCw size={16} />
          Actualizar
        </Button>
      )}

      {onAdd && (
        <Button variant="primary" onClick={onAdd} className="gap-2">
          <Plus size={16} />
          {addLabel}
        </Button>
      )}
    </div>
  );
}
