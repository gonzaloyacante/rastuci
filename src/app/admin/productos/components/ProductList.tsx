"use client";

import {
  AdminEmpty,
  AdminEmptyIcons,
  AdminError,
  AdminLoading,
  AdminPageHeader,
} from "@/components/admin";
import { useAlert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useCategories, useProducts } from "@/hooks";
import { logger } from "@/lib/logger";
import { Product } from "@/types";
import {
  Download,
  Filter,
  Grid,
  List,
  Package,
  RotateCcw,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProductCard from "./ProductCard";

type ViewMode = "grid" | "list";
type SortField = "name" | "price" | "stock";
type SortOrder = "asc" | "desc";

export default function ProductList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const { showAlert, Alert: AlertComponent } = useAlert();

  // Usar hooks para obtener datos
  const { products, isLoading, error, mutate } = useProducts();
  const { categories } = useCategories();

  const { confirm: confirmDialog, ConfirmDialog } = useConfirmDialog();

  // Función para eliminar producto
  const handleDelete = async (id: string) => {
    const confirmed = await confirmDialog({
      title: "Eliminar producto",
      message:
        "¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        mutate(); // Revalidar datos
      } else {
        // Extraer mensaje específico del API
        const errorData = await response.json();
        const errorMessage =
          errorData.message || "Error al eliminar el producto";
        showAlert({
          title: "Error",
          message: errorMessage,
          variant: "error",
        });
      }
    } catch (error) {
      logger.error("Error deleting product", { error });
      showAlert({
        title: "Error de conexión",
        message: "No se pudo conectar al servidor para eliminar el producto",
        variant: "error",
      });
    }
  };

  // Función para exportar a CSV
  const handleExportCSV = () => {
    const csvContent = [
      ["Nombre", "Categoría", "Precio", "Stock", "En Oferta"],
      ...filteredProducts.map((product: Product) => [
        `"${product.name.replace(/"/g, '""')}"`,
        `"${product.category?.name || "Sin categoría"}"`,
        product.price.toString(),
        product.stock.toString(),
        product.onSale ? "Sí" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    // UTF-8 BOM para compatibilidad con Excel
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
  };

  if (isLoading) {
    return <AdminLoading />;
  }
  if (error) {
    return <AdminError message={error} />;
  }

  // Filtros y búsqueda
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || product.categoryId === selectedCategory;

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && product.stock <= 5) ||
      (stockFilter === "medium" && product.stock > 5 && product.stock <= 20) ||
      (stockFilter === "high" && product.stock > 20) ||
      (stockFilter === "out" && product.stock === 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Ordenamiento
  const sortedProducts = [...filteredProducts].sort(
    (a: Product, b: Product) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "stock":
          comparison = a.stock - b.stock;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    }
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gestión de Productos"
        subtitle="Administra el catálogo de productos de la tienda"
        actions={[
          {
            label: "Crear Producto",
            onClick: () => router.push("/admin/productos/nuevo"),
            variant: "primary",
          },
        ]}
      />

      {/* Dashboard de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Package className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-content-secondary">
                Productos en Stock
              </p>
              <p className="text-2xl font-bold text-content-primary">
                {products.filter((p: Product) => p.stock > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Filter className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-content-secondary">Stock Bajo</p>
              <p className="text-2xl font-bold text-content-primary">
                {
                  products.filter((p: Product) => p.stock > 0 && p.stock <= 5)
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-error/10 rounded-lg">
              <Package className="w-5 h-5 text-error" />
            </div>
            <div>
              <p className="text-sm text-content-secondary">Sin Stock</p>
              <p className="text-2xl font-bold text-content-primary">
                {products.filter((p: Product) => p.stock === 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de filtros y vista */}
      <div className="bg-surface p-4 rounded-lg border space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            <Button
              onClick={() => setViewMode("grid")}
              variant={viewMode === "grid" ? "primary" : "ghost"}
              size="sm"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setViewMode("list")}
              variant={viewMode === "list" ? "primary" : "ghost"}
              size="sm"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => mutate()} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2">
              Filtrar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-content-tertiary w-4 h-4 pointer-events-none" />
              </div>

              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={[
                  { value: "all", label: "Todas las categorías" },
                  ...categories.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  })),
                ]}
              />

              <Select
                value={stockFilter}
                onChange={setStockFilter}
                options={[
                  { value: "all", label: "Todo el stock" },
                  { value: "high", label: "Stock alto (>20)" },
                  { value: "medium", label: "Stock medio (5-20)" },
                  { value: "low", label: "Stock bajo (1-5)" },
                  { value: "out", label: "Sin stock" },
                ]}
              />
            </div>
          </div>

          {/* Ordenamiento */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2">
              Ordenar
            </h3>
            <div className="flex gap-2 max-w-xs">
              <Select
                value={sortField}
                onChange={(value) => setSortField(value as SortField)}
                options={[
                  { value: "name", label: "Nombre" },
                  { value: "price", label: "Precio" },
                  { value: "stock", label: "Stock" },
                ]}
              />
              <Button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                variant="outline"
                size="sm"
                className="shrink-0"
                title={
                  sortOrder === "asc"
                    ? "Ordenar descendente (mayor a menor)"
                    : "Ordenar ascendente (menor a mayor)"
                }
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
      </div>

      {/* Lista de productos */}
      {sortedProducts.length === 0 ? (
        <AdminEmpty
          icon={AdminEmptyIcons.products}
          title="No hay productos"
          description={
            searchTerm || selectedCategory !== "all" || stockFilter !== "all"
              ? "No se encontraron productos con los filtros aplicados"
              : "No hay productos registrados. ¡Crea tu primer producto!"
          }
          action={{
            label: "Crear Primer Producto",
            onClick: () => router.push("/admin/productos/nuevo"),
            variant: "primary",
          }}
        />
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {sortedProducts.map((product: Product) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
              onEdit={() =>
                router.push(`/admin/productos/edit?id=${product.id}`)
              }
              onDelete={() => handleDelete(product.id)}
            />
          ))}
        </div>
      )}
      {AlertComponent}
      {ConfirmDialog}
    </div>
  );
}
