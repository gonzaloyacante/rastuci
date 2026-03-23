"use client";

import Image from "next/image";
import React from "react";

import { AdminTable } from "@/components/admin/AdminTable";
import { TableSkeleton } from "@/components/admin/skeletons";
import { COMMON_COLORS } from "@/components/products/ProductFormComponents";
import { Button } from "@/components/ui/Button";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { Product } from "@/types";
import { Edit3, Trash2 } from "lucide-react";

// ============================================================================
// Shared Types
// ============================================================================

export type CategoryRow = {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  productCount?: number;
};

// ============================================================================
// Image Placeholder SVG
// ============================================================================

function ImagePlaceholder({ size }: { size: "sm" | "md" }) {
  if (size === "sm") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 text-muted"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ============================================================================
// Product column renderers (for AdminTable inside expanded rows)
// ============================================================================

function renderProductImage(_: unknown, row: Product) {
  return (
    <div className="flex justify-center">
      <div className="relative w-10 h-10 rounded overflow-hidden bg-muted/5 border border-border shrink-0">
        {row.images?.[0] ? (
          <Image
            src={row.images[0]}
            alt={row.name}
            fill
            className="object-cover"
            sizes="40px"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted">
            <ImagePlaceholder size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}

function renderProductName(_: unknown, row: Product) {
  return (
    <div className="flex flex-col min-w-[200px]">
      <div className="text-sm font-medium text-base-primary truncate">
        {row.name}
      </div>
      {row.description && (
        <div className="text-xs muted line-clamp-1">{row.description}</div>
      )}
    </div>
  );
}

function renderProductColors(_: unknown, row: Product) {
  if (!row.colors || row.colors.length === 0) {
    return <span className="text-xs muted">-</span>;
  }
  return (
    <div className="flex justify-center gap-1">
      {row.colors.slice(0, 3).map((color: string, idx: number) => {
        const matched = COMMON_COLORS.find(
          (c) =>
            c.name.toLowerCase() === color.toLowerCase() ||
            color.toLowerCase().includes(c.name.toLowerCase())
        );
        return (
          <div
            key={idx}
            className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
            style={{ backgroundColor: matched ? matched.hex : color }}
            title={color}
          />
        );
      })}
      {row.colors.length > 3 && (
        <span className="text-xs muted ml-1">+{row.colors.length - 3}</span>
      )}
    </div>
  );
}

function renderProductSizes(_: unknown, row: Product) {
  return (
    <span className="text-xs text-base-secondary">
      {row.sizes && row.sizes.length > 0
        ? `${row.sizes.length} ${row.sizes.length === 1 ? "talle" : "talles"}`
        : "-"}
    </span>
  );
}

function renderProductStock(_: unknown, row: Product) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium bg-surface/60 border border-border">
      <strong className="mr-1">{row.stock}</strong>
    </span>
  );
}

function renderProductPrice(_: unknown, row: Product) {
  return (
    <span className="text-sm font-bold text-base-primary">
      ${row.price.toLocaleString("es-AR")}
    </span>
  );
}

const PRODUCT_COLUMNS = [
  { key: "image", label: "Imagen", align: "center" as const, render: renderProductImage },
  { key: "name", label: "Producto", render: renderProductName },
  { key: "colors", label: "Colores", align: "center" as const, render: renderProductColors },
  { key: "sizes", label: "Talles", align: "center" as const, render: renderProductSizes },
  { key: "stock", label: "Stock", align: "center" as const, render: renderProductStock },
  { key: "price", label: "Precio", align: "right" as const, render: renderProductPrice },
];

// ============================================================================
// CategoryProductsTable — expanded subtable
// ============================================================================

interface CategoryProductsTableProps {
  products: Product[];
  isLoading: boolean;
}

export function CategoryProductsTable({
  products,
  isLoading,
}: CategoryProductsTableProps) {
  if (isLoading) {
    return (
      <div className="py-2">
        <TableSkeleton columns={5} rows={3} showHeader showActions={false} />
      </div>
    );
  }
  if (products.length === 0) {
    return (
      <div className="text-center py-8 muted text-sm">
        No hay productos en esta categoría
      </div>
    );
  }
  return (
    <AdminTable<Product & Record<string, unknown>>
      columns={PRODUCT_COLUMNS}
      data={products as unknown as (Product & Record<string, unknown>)[]}
    />
  );
}

// ============================================================================
// CategoryTableRow — single row + expandable products panel
// ============================================================================

interface CategoryTableRowProps {
  category: CategoryRow;
  isExpanded: boolean;
  isLoadingProducts: boolean;
  products: Product[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export function CategoryTableRow({
  category,
  isExpanded,
  isLoadingProducts,
  products,
  onToggle,
  onDelete,
  onEdit,
}: CategoryTableRowProps) {
  return (
    <React.Fragment>
      <tr className="border-b border-muted hover:surface transition-colors">
        {/* Expand toggle */}
        <td className="text-center p-2 sm:p-4 align-middle text-xs sm:text-sm">
          <Button
            onClick={() => onToggle(category.id)}
            variant="ghost"
            className="p-1 hover:bg-surface-secondary rounded transition-colors h-auto w-auto min-h-0"
            aria-label={isExpanded ? "Contraer" : "Expandir"}
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </td>

        {/* Image */}
        <td className="text-center p-2 sm:p-4 align-middle text-xs sm:text-sm">
          <div className="flex items-center justify-center">
            {category.image ? (
              <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted/5 ring-2 ring-primary/30">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                  onError={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      e.currentTarget.style.display = "none";
                      parent.classList.add("fallback-active");
                    }
                  }}
                />
              </div>
            ) : (
              <div className="relative w-12 h-12 flex items-center justify-center surface-secondary rounded-md ring-2 ring-muted/30">
                <ImagePlaceholder size="md" />
              </div>
            )}
          </div>
        </td>

        {/* Icon */}
        <td className="text-center p-2 sm:p-4 align-middle text-xs sm:text-sm">
          <div className="flex items-center justify-center">
            <CategoryIcon categoryName={category.name} className="w-6 h-6 text-muted" />
          </div>
        </td>

        {/* Name / Description */}
        <td className="text-left p-2 sm:p-4 align-middle text-xs sm:text-sm">
          <div className="min-w-0">
            <div className="font-semibold truncate">{category.name}</div>
            <div className="text-xs muted line-clamp-2">
              {category.description ?? "Sin descripción"}
            </div>
          </div>
        </td>

        {/* Product count */}
        <td className="text-center p-2 sm:p-4 align-middle text-xs sm:text-sm">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium bg-surface/60 border border-border">
            <strong className="mr-1">{category.productCount ?? 0}</strong> productos
          </span>
        </td>

        {/* Actions */}
        <td className="p-2 sm:p-4 align-middle">
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1 justify-center"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(category.id);
              }}
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="text-xs flex items-center gap-1 justify-center"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(category.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Eliminar</span>
            </Button>
          </div>
        </td>
      </tr>

      {/* Expanded products row */}
      <tr className={`transition-all duration-300 ease-in-out ${isExpanded ? "opacity-100" : "opacity-0"}`}>
        <td colSpan={6} className="p-0 overflow-hidden">
          <div
            className="transition-all duration-300 ease-in-out bg-surface-secondary/30"
            style={{ maxHeight: isExpanded ? "2000px" : "0px", opacity: isExpanded ? 1 : 0 }}
          >
            <div className="p-4">
              <CategoryProductsTable products={products} isLoading={isLoadingProducts} />
            </div>
          </div>
        </td>
      </tr>
    </React.Fragment>
  );
}

// ============================================================================
// CategoriesContent — table or empty state
// ============================================================================

interface CategoriesContentProps extends CategoriesTableProps {
  emptyNode: React.ReactNode;
}

export function CategoriesContent({
  filteredCategories,
  emptyNode,
  ...tableProps
}: CategoriesContentProps) {
  if (filteredCategories.length === 0) return <>{emptyNode}</>;
  return (
    <CategoriesTable filteredCategories={filteredCategories} {...tableProps} />
  );
}

interface CategoriesTableProps {
  filteredCategories: CategoryRow[];
  expandedCategories: Set<string>;
  categoryProducts: Record<string, Product[]>;
  loadingProducts: Set<string>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export function CategoriesTable({
  filteredCategories,
  expandedCategories,
  categoryProducts,
  loadingProducts,
  onToggle,
  onDelete,
  onEdit,
}: CategoriesTableProps) {
  return (
    <div className="card">
      <div className="max-w-7xl mx-auto px-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-muted surface">
                <th className="text-center p-2 sm:p-4 font-semibold muted tracking-wide text-xs sm:text-sm" style={{ width: "60px" }} />
                <th className="text-center p-2 sm:p-4 font-semibold muted tracking-wide text-xs sm:text-sm" style={{ width: "120px" }}>
                  Imagen
                </th>
                <th className="text-center p-2 sm:p-4 font-semibold muted tracking-wide text-xs sm:text-sm" style={{ width: "96px" }}>
                  Icono
                </th>
                <th className="text-left p-2 sm:p-4 font-semibold muted tracking-wide text-xs sm:text-sm">
                  Nombre / Descripción
                </th>
                <th className="text-center p-2 sm:p-4 font-semibold muted tracking-wide text-xs sm:text-sm">
                  Productos
                </th>
                <th className="text-left p-2 sm:p-4 font-semibold muted text-xs sm:text-sm">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <CategoryTableRow
                  key={category.id}
                  category={category}
                  isExpanded={expandedCategories.has(category.id)}
                  isLoadingProducts={loadingProducts.has(category.id)}
                  products={categoryProducts[category.id] ?? []}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
