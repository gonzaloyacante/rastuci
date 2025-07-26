"use client";

import { useCategories } from "@/hooks";
import {
  AdminPageHeader,
  AdminEmpty,
  AdminEmptyIcons,
  AdminLoading,
  AdminError,
} from "@/components/admin";
import { SearchBar, FilterBar, useSearchAndFilter } from "@/components/search";
import { useState } from "react";

// Extiendo el tipo Category para incluir image
interface CategoryWithImage {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
}

export default function AdminCategoriasPage() {
  const {
    categories,
    loading,
    error,
    categoryProductCounts,
    deleteCategory,
    fetchCategories,
    totalPages,
    currentPage,
  } = useCategories({ includeProductCount: true });
  const categoriesWithImage = categories as CategoryWithImage[];
  const [searchInput, setSearchInput] = useState("");

  // Búsqueda
  const handleSearch = async () => {
    await fetchCategories({ page: 1, search: searchInput });
  };

  // Paginación
  const handlePageChange = async (page: number) => {
    if (page < 1 || page > totalPages) return;
    await fetchCategories({ page, search: searchInput });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      return;
    }
    await deleteCategory(id);
  };

  if (loading) return <AdminLoading />;
  if (error) return <AdminError message={error} />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gestión de Categorías"
        subtitle="Administra las categorías de productos"
        actions={[
          {
            label: "Crear Categoría",
            onClick: () => {
              window.location.href = "/admin/categorias/nueva";
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
          placeholder="Buscar categorías por nombre o descripción..."
          className="w-full sm:w-96 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <button
          onClick={handleSearch}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          Buscar
        </button>
      </div>

      {categoriesWithImage.length === 0 ? (
        <AdminEmpty
          icon={AdminEmptyIcons.categories}
          title="No hay categorías"
          description="No hay categorías registradas. ¡Crea tu primera categoría!"
          action={{
            label: "Crear Primera Categoría",
            onClick: () => {
              window.location.href = "/admin/categorias/nueva";
            },
            variant: "primary",
          }}
        />
      ) : (
        <div className="card">
          {/* Vista de cards para mobile/tablet */}
          <div className="block xl:hidden space-y-4">
            {categoriesWithImage.map((category) => (
              <div
                key={category.id}
                className="border rounded-lg p-4 space-y-3 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    {category.image && (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-14 h-14 object-cover rounded-lg border border-gray-200 shadow"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-content-primary truncate">
                        {category.name}
                      </h3>
                      <p className="text-sm text-content-secondary mt-1">
                        {category.description || "Sin descripción"}
                      </p>
                    </div>
                  </div>
                  <span className="badge-info text-xs">
                    {categoryProductCounts[category.id] || 0} productos
                  </span>
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => {
                      window.location.href = `/admin/categorias/${category.id}/editar`;
                    }}
                    className="btn-secondary flex-1 text-sm">
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={(categoryProductCounts[category.id] || 0) > 0}
                    className="btn-destructive flex-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    Eliminar
                  </button>
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
                    Imagen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">
                    Productos
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {categoriesWithImage.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.image && (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-14 h-14 object-cover rounded-lg border border-gray-200 shadow"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-content-primary">
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-content-primary">
                        {category.description || "Sin descripción"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge-info text-xs">
                        {categoryProductCounts[category.id] || 0} productos
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          window.location.href = `/admin/categorias/${category.id}/editar`;
                        }}
                        className="text-primary hover:text-primary/80 mr-4">
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        disabled={(categoryProductCounts[category.id] || 0) > 0}
                        className="text-error hover:text-error/80 disabled:opacity-50 disabled:cursor-not-allowed">
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
