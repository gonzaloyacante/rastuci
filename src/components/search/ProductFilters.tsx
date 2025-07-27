import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Category } from "@/types";

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string;
  searchTerm: string;
  onCategoryChange: (categoryId: string) => void;
  onSearchChange: (search: string) => void;
  onSearchSubmit: () => void;
  onClearFilters: () => void;
  showOnSaleFilter?: boolean;
  onSaleFilter?: boolean;
  onOnSaleChange?: (onSale: boolean) => void;
}

export default function ProductFilters({
  categories,
  selectedCategory,
  searchTerm,
  onCategoryChange,
  onSearchChange,
  onSearchSubmit,
  onClearFilters,
  showOnSaleFilter = false,
  onSaleFilter = false,
  onOnSaleChange,
}: ProductFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters =
    selectedCategory !== "" || searchTerm !== "" || onSaleFilter;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Barra de búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearchSubmit();
            }}
            placeholder="Buscar productos..."
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            variant="outline">
            <Filter size={16} className="mr-2" />
            Filtros
          </Button>

          {hasActiveFilters && (
            <Button onClick={onClearFilters} variant="destructive">
              <X size={16} className="mr-2" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Filtros expandibles */}
      {isFilterOpen && (
        <div className="border-t pt-4 space-y-4">
          {/* Filtro por categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de ofertas */}
          {showOnSaleFilter && onOnSaleChange && (
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={onSaleFilter}
                  onChange={(e) => onOnSaleChange(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Solo productos en oferta
                </span>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
