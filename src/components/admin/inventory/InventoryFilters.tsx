"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface InventoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  searchIcon: ReactNode;
  exportIcon: ReactNode;
  importIcon: ReactNode;
}

export function InventoryFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  categories,
  searchIcon,
  exportIcon,
  importIcon,
}: InventoryFiltersProps) {
  return (
    <div className="surface border border-muted rounded-lg p-4">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 muted">
              {searchIcon}
            </span>
            <Input
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 border border-muted rounded surface"
        >
          <option value="all">Todos los estados</option>
          <option value="in_stock">En Stock</option>
          <option value="low_stock">Stock Bajo</option>
          <option value="out_of_stock">Agotado</option>
          <option value="discontinued">Descontinuado</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2 border border-muted rounded surface"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <Button variant="outline" className="flex items-center gap-2">
          {exportIcon}
          Exportar
        </Button>

        <Button variant="outline" className="flex items-center gap-2">
          {importIcon}
          Importar
        </Button>
      </div>
    </div>
  );
}
