"use client";

import Image from "next/image";
import { useProducts, useCategories } from "@/hooks";
import { Product } from "@/types";
import { formatCurrency } from "@/utils/formatters";
import {
  AdminPageHeader,
  AdminEmpty,
  AdminEmptyIcons,
  AdminLoading,
  AdminError,
} from "@/components/admin";
// import { SearchBar, FilterBar, useSearchAndFilter } from "@/components/admin/SearchAndFilter"; // TODO: Implement when needed
import { useState } from "react";
// import { Button } from "@/components/ui/Button"; // TODO: Implement when needed
import { Badge } from "@/components/ui/Badge";
import { ColorChip } from "@/components/ui/ColorChip";

export default function AdminProductsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const { products, isLoading, error, mutate } = useProducts({
    category: selectedCategory || undefined,
    search: searchInput || undefined,
    page: currentPage,
  });

  const { categories } = useCategories();

  // Búsqueda local
  const _filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchInput.toLowerCase()))
  );

  const handleSearch = () => {
    // La búsqueda es local, no necesitamos hacer nada aquí
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const _handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        mutate(); // Revalidar datos
      } else {
        alert("Error al eliminar el producto");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error al eliminar el producto");
    }
  };

  if (isLoading) return <AdminLoading />;
  if (error) return <AdminError message={error} />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gestión de Productos"
        subtitle="Administra el catálogo de productos de la tienda"
        actions={[
          {
            label: "Crear Producto",
            onClick: () => {
              window.location.href = "/admin/productos/nuevo";
            },
            variant: "primary",
          },
        ]}
      />

      {/* Barra de búsqueda */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full sm:max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder="Buscar productos por nombre, descripción o categoría..."
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          />
        </div>
        <button
          onClick={handleSearch}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium">
          Buscar
        </button>
      </div>

      {/* Filtro de categoría */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-content-primary mb-3">Filtrar por categoría</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange("")}
            className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
              selectedCategory === ""
                ? "bg-primary text-white border-primary"
                : "surface muted border-muted hover:surface-secondary"
            }`}>
            Todas las categorías
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                selectedCategory === cat.id
                  ? "bg-primary text-white border-primary"
                  : "surface muted border-muted hover:surface-secondary"
              }`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <AdminEmpty
          icon={AdminEmptyIcons.products}
          title="No hay productos"
          description="No hay productos registrados. ¡Crea tu primer producto!"
          action={{
            label: "Crear Primer Producto",
            onClick: () => {
              window.location.href = "/admin/productos/nuevo";
            },
            variant: "primary",
          }}
        />
      ) : (
        <div className="card">
          {/* Vista de cards para mobile/tablet */}
          <div className="block xl:hidden space-y-4">
            {products.map((product: Product) => (
              <div
                key={product.id}
                className="border rounded-lg p-4 space-y-3 surface shadow-sm">
                <div className="flex gap-4">
                  {/* Imagen del producto */}
                  <div className="flex-shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-surface-secondary rounded-lg flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-content-tertiary"
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-content-primary truncate flex items-center gap-2">
                          {product.name}
                          {product.onSale && (
                            <Badge variant="success">Oferta</Badge>
                          )}
                        </h3>
                        <p className="text-sm text-content-secondary">
                          {product.category?.name || "Sin categoría"}
                        </p>
                        {Array.isArray(product.colors) && product.colors.length > 0 && (
                          <div className="mt-1 flex items-center gap-1">
                            {product.colors.slice(0, 6).map((c: string, idx: number) => (
                              <ColorChip key={idx} color={c} size="xs" />
                            ))}
                            {product.colors.length > 6 && (
                              <span className="text-xs text-content-secondary">+{product.colors.length - 6}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <Badge
                        variant={
                          product.stock === 0
                            ? "error"
                            : product.stock < 10
                            ? "warning"
                            : "success"
                        }>
                        {product.stock === 0
                          ? "Sin stock"
                          : `${product.stock} en stock`}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(product.price)}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            window.location.href = `/admin/productos/edit?id=${product.id}`;
                          }}
                          className="btn-secondary text-xs px-3 py-1 cursor-pointer">
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="btn-destructive text-xs px-3 py-1 cursor-pointer">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Vista de tabla para desktop */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="surface divide-y divide-border">
                {products.map((product: Product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              className="h-12 w-12 rounded-lg object-cover"
                              src={product.images[0]}
                              alt={product.name}
                              width={48}
                              height={48}
                            />
                          ) : (
                            <div className="h-12 w-12 bg-surface-secondary rounded-lg flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-content-tertiary"
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-content-primary flex items-center gap-2">
                            {product.name}
                            {product.onSale && (
                              <Badge variant="success">Oferta</Badge>
                            )}
                          </div>
                          <div className="text-sm text-content-secondary">
                            {product.description
                              ? product.description.substring(0, 50) + "..."
                              : "Sin descripción"}
                          </div>
                          {Array.isArray(product.colors) && product.colors.length > 0 && (
                            <div className="mt-1 flex items-center gap-1">
                              {product.colors.slice(0, 8).map((c: string, idx: number) => (
                                <ColorChip key={idx} color={c} size="xs" />
                              ))}
                              {product.colors.length > 8 && (
                                <span className="text-xs text-content-secondary">+{product.colors.length - 8}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-content-primary">
                        {product.category?.name || "Sin categoría"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-content-primary">
                        {formatCurrency(product.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          product.stock === 0
                            ? "error"
                            : product.stock < 10
                            ? "warning"
                            : "success"
                        }>
                        {product.stock === 0
                          ? "Sin stock"
                          : `${product.stock} en stock`}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          window.location.href = `/admin/productos/edit?id=${product.id}`;
                        }}
                        className="text-primary hover:text-primary/80 mr-4 cursor-pointer">
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-error hover:text-error/80 cursor-pointer">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
