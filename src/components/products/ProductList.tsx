"use client";

import { useToast } from "@/components/ui/Toast";
import {
  AdminEmpty,
  AdminEmptyIcons,
  AdminError,
  AdminPageHeader,
} from "@/components/admin";
import { StatCardData, StatsGrid } from "@/components/admin/AdminCards";
import { ProductsAdminSkeleton } from "@/components/admin/skeletons";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import {
  useCategories,
  useInfiniteProducts,
  useInfiniteScroll,
  useProductStats,
} from "@/hooks";
import { logger } from "@/lib/logger";
import { Product } from "@/types";
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Grid,
  List,
  Package,
  RotateCcw,
  Search,
  SortAsc,
  SortDesc,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

type ViewMode = "grid" | "list";
type SortField = "name" | "price" | "stock" | "createdAt";
type SortOrder = "asc" | "desc";
type StockFilter = "all" | "inStock" | "lowStock" | "outOfStock";

// Configuración de opciones de filtros (evita recrear arrays)
const STOCK_FILTER_OPTIONS = [
  { value: "all", label: "Todo el stock" },
  { value: "inStock", label: "En stock" },
  { value: "lowStock", label: "Stock bajo (≤5)" },
  { value: "outOfStock", label: "Sin stock" },
];

const SORT_FIELD_OPTIONS = [
  { value: "createdAt", label: "Fecha" },
  { value: "name", label: "Nombre" },
  { value: "price", label: "Precio" },
  { value: "stock", label: "Stock" },
];

export default function ProductList() {
  const { show } = useToast();
  const router = useRouter();

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // UI helpers
  const { ConfirmDialog } = useConfirmDialog();

  // Datos con scroll infinito
  const {
    products,
    total,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    mutate,
  } = useInfiniteProducts({
    category: selectedCategory,
    search: searchTerm,
    sortBy: sortField,
    sortOrder,
    stockFilter,
    limit: 24,
  });

  const { categories } = useCategories();
  const { inventory, mutate: mutateStats } = useProductStats();

  // Scroll infinito
  const handleLoadMore = useCallback(async () => {
    await loadMore();
  }, [loadMore]);

  const { lastElementRef, isFetching } = useInfiniteScroll(
    handleLoadMore,
    hasMore,
    { enabled: !isLoading && !isLoadingMore }
  );

  const handleRefresh = async () => {
    mutate();
  };

  // Handlers
  const handleToggleActive = async (
    id: string,
    currentStatus: boolean | undefined
  ) => {
    // Optimistic Update is not supported with current hook structure easily,
    // and mutate() refreshes the list from server.
    // For now we just call API and then refresh.

    // Calculate new status
    const newStatus = !(currentStatus !== false); // Toggle

    try {
      // Use the new fast PATCH endpoint
      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Success
      show({
        type: "success",
        message: newStatus ? "Producto activado" : "Producto desactivado",
      });

      mutate();
      mutateStats();
    } catch (err) {
      logger.error("Error toggling product active status", { error: err });
      show({ type: "error", message: "No se pudo actualizar el estado." });
    }
  };

  const handleExportCSV = useCallback(() => {
    const csvContent = [
      ["Nombre", "Categoría", "Precio", "Stock", "En Oferta"],
      ...products.map((p: Product) => [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.categories?.name || "Sin categoría"}"`,
        p.price.toString(),
        p.stock.toString(),
        p.onSale ? "Sí" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `productos_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [products]);

  // Loading state
  if (isLoading && products.length === 0) {
    return <ProductsAdminSkeleton />;
  }

  if (error && products.length === 0) {
    return <AdminError message={error} />;
  }

  // Preparar estadísticas para StatsGrid
  const inventoryStats: StatCardData[] = [
    { icon: Package, label: "Total", value: inventory.total, color: "blue" },
    {
      icon: CheckCircle,
      label: "En Stock",
      value: inventory.inStock,
      color: "emerald",
    },
    {
      icon: AlertTriangle,
      label: "Stock Bajo",
      value: inventory.lowStock,
      color: "amber",
    },
    {
      icon: XCircle,
      label: "Sin Stock",
      value: inventory.outOfStock,
      color: "red",
    },
  ];

  const categoryOptions = [
    { value: "all", label: "Todas las categorías" },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gestión de Productos"
        subtitle={`${total} productos en el catálogo`}
        actions={[
          {
            label: "Crear Producto",
            onClick: () => router.push("/admin/productos/nuevo"),
            variant: "primary",
          },
        ]}
      />

      {/* Estadísticas de inventario */}
      <StatsGrid stats={inventoryStats} columns={4} />

      {/* Controles */}
      <div className="bg-surface p-4 rounded-lg border space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            <Button
              onClick={() => setViewMode("grid")}
              variant={viewMode === "grid" ? "primary" : "ghost"}
              size="sm"
              aria-label="Vista de cuadrícula"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setViewMode("list")}
              variant={viewMode === "list" ? "primary" : "ghost"}
              size="sm"
              aria-label="Vista de lista"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary w-4 h-4" />
          </div>

          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categoryOptions}
          />

          <Select
            value={stockFilter}
            onChange={(v) => setStockFilter(v as StockFilter)}
            options={STOCK_FILTER_OPTIONS}
          />

          <div className="flex gap-2">
            <Select
              value={sortField}
              onChange={(v) => setSortField(v as SortField)}
              options={SORT_FIELD_OPTIONS}
              className="flex-1"
            />
            <Button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              variant="outline"
              size="sm"
              className="shrink-0"
              title={sortOrder === "asc" ? "Descendente" : "Ascendente"}
            >
              {sortOrder === "asc" ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      {products.length === 0 ? (
        <AdminEmpty
          icon={AdminEmptyIcons.products}
          title="No hay productos"
          description={
            searchTerm || selectedCategory !== "all" || stockFilter !== "all"
              ? "No se encontraron productos con los filtros aplicados"
              : "No hay productos registrados. ¡Crea tu primer producto!"
          }
          action={{
            label: "Crear Producto",
            onClick: () => router.push("/admin/productos/nuevo"),
            variant: "primary",
          }}
        />
      ) : (
        <>
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6"
                : "space-y-4"
            }
          >
            {products.map((product: Product, index: number) => {
              const isLast = index === products.length - 1;
              return (
                <div
                  key={product.id}
                  ref={isLast ? lastElementRef : undefined}
                  className="h-full"
                >
                  <ProductCard
                    product={product}
                    variant="admin"
                    priority={index < 6}
                    onEdit={() =>
                      router.push(`/admin/productos/${product.id}/editar`)
                    }
                    // deleteDisabled={true} // Deprecated
                    // onDelete={() => {}} // Removed
                    onToggleActive={() =>
                      handleToggleActive(product.id, product.isActive)
                    }
                  />
                </div>
              );
            })}
          </div>

          {/* Loading more indicator */}
          {(isLoadingMore || isFetching) && (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          )}

          {/* End of list message */}
          {!hasMore && products.length > 0 && (
            <div className="text-center py-8 text-content-secondary">
              <p>Has visto todos los {total} productos</p>
            </div>
          )}
        </>
      )}

      {ConfirmDialog}
    </div>
  );
}
