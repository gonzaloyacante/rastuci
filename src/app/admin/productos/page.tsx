"use client";

import Image from "next/image";
import { useProducts, Product, useCategories, Category } from "@/hooks";
import { formatCurrency } from "@/utils/formatters";
import {
  AdminPageHeader,
  AdminEmpty,
  AdminEmptyIcons,
  AdminLoading,
  AdminError,
} from "@/components/admin";
import { SearchBar, FilterBar, useSearchAndFilter } from "@/components/search";
import { useState } from "react";

export default function AdminProductsPage() {
  const {
    products,
    loading,
    error,
    deleteProduct,
    totalPages,
    currentPage,
    fetchProducts,
  } = useProducts({ limit: 20 });
  const { categories } = useCategories();
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Búsqueda
  const handleSearch = () => {
    fetchProducts({
      page: 1,
      limit: 20,
      search: searchInput,
      category: selectedCategory,
    });
  };

  // Filtro de categoría
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    fetchProducts({ page: 1, limit: 20, search: searchInput, category: catId });
  };

  // Paginación
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchProducts({
      page,
      limit: 20,
      search: searchInput,
      category: selectedCategory,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      return;
    }
    await deleteProduct(id);
  };

  if (loading) return <AdminLoading />;
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
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Buscar productos por nombre, descripción o categoría..."
          className="w-full sm:w-96 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <button
          onClick={handleSearch}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          Buscar
        </button>
      </div>

      {/* Filtro de categoría */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryChange("")}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            selectedCategory === ""
              ? "bg-[#E91E63] text-white border-[#E91E63]"
              : "bg-white text-[#666666] border-[#E0E0E0] hover:bg-[#FCE4EC]"
          }`}>
          Todas las categorías
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              selectedCategory === cat.id
                ? "bg-[#E91E63] text-white border-[#E91E63]"
                : "bg-white text-[#666666] border-[#E0E0E0] hover:bg-[#FCE4EC]"
            }`}>
            {cat.name}
          </button>
        ))}
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
                className="border rounded-lg p-4 space-y-3 bg-white shadow-sm">
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
                        <h3 className="font-medium text-content-primary truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-content-secondary">
                          {product.category.name}
                        </p>
                      </div>
                      <span
                        className={`badge-${
                          product.stock === 0
                            ? "error"
                            : product.stock < 10
                            ? "warning"
                            : "success"
                        } text-xs ml-2`}>
                        {product.stock === 0
                          ? "Sin stock"
                          : `${product.stock} en stock`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        ${" "}
                        {product.price.toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                          minimumFractionDigits: 2,
                        })}
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
              <tbody className="bg-white divide-y divide-border">
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
                          <div className="text-sm font-medium text-content-primary">
                            {product.name}
                          </div>
                          <div className="text-sm text-content-secondary">
                            {product.description
                              ? product.description.substring(0, 50) + "..."
                              : "Sin descripción"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-content-primary">
                        {product.category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-content-primary">
                        ${" "}
                        {product.price.toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`badge-${
                          product.stock === 0
                            ? "error"
                            : product.stock < 10
                            ? "warning"
                            : "success"
                        } text-xs`}>
                        {product.stock === 0
                          ? "Sin stock"
                          : `${product.stock} en stock`}
                      </span>
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
            {/* Controles de paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="btn-secondary disabled:opacity-50">
                  Anterior
                </button>
                <span className="text-sm text-content-secondary">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="btn-secondary disabled:opacity-50">
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
