"use client";

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
import { toast } from "react-hot-toast";

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
  const router = useRouter();

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // UI helpers
  const { confirm: confirmDialog, ConfirmDialog } = useConfirmDialog();

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

  // Handlers
  const handleDelete = async (id: string) => {
    const confirmed = await confirmDialog({
      title: "Eliminar producto",
      message: "¿Estás seguro? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });

      if (response.ok) {
        mutate();
        mutateStats();
        toast.success("Producto eliminado correctamente");
      } else {
        const errorData = await response.json();
        const msg = errorData.message || "Error al eliminar el producto";
        toast.error(msg);
      }
    } catch (err) {
      logger.error("Error deleting product", { error: err });
      toast.error("No se pudo conectar al servidor");
    }
  };

  const handleRefresh = useCallback(() => {
    mutate();
    mutateStats();
  }, [mutate, mutateStats]);

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      // Fetch current product data
      const productResponse = await fetch(`/api/products/${id}`);
      if (!productResponse.ok) {
        toast.error("Error al obtener el producto");
        return;
      }
      const productData = await productResponse.json();
      const product = productData.data;

      if (!product) {
        toast.error("Producto no encontrado");
        return;
      }

      // Prepare minimal update payload with only required fields
      const updatePayload = {
        name: product.name,
        description: product.description || "",
        price: product.price,
        salePrice: product.salePrice || null,
        stock: product.stock,
        categoryId: product.categoryId,
        images: product.images || [],
        onSale: product.onSale || false,
        isActive: isActive,
        sizes: product.sizes || [],
        colors: product.colors || [],
        features: product.features || [],
        weight: product.weight || null,
        height: product.height || null,
        width: product.width || null,
        length: product.length || null,
        variants:
          product.variants?.map(
            (v: {
              color: string;
              size: string;
              stock: number;
              sku?: string;
            }) => ({
              color: v.color,
              size: v.size,
              stock: v.stock,
              sku: v.sku || undefined,
            })
          ) || [],
        colorImages: product.colorImages || null,
      };

      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      if (response.ok) {
        mutate();
        mutateStats();
        toast.success(isActive ? "Producto activado" : "Producto desactivado");
      } else {
        const errorData = await response.json();
        const msg =
          errorData.message ||
          errorData.error ||
          "Error al actualizar el producto";
        logger.error("Toggle active failed", { errorData });
        toast.error(msg);
      }
    } catch (err) {
      logger.error("Error toggling product active status", { error: err });
      toast.error("No se pudo conectar al servidor");
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
                    onDelete={() => handleDelete(product.id)}
                    onToggleActive={handleToggleActive}
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
