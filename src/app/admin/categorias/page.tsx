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
  const { categories, isLoading, error, mutate } = useCategories();
  const categoriesWithImage = categories as CategoryWithImage[];
  const [searchInput, setSearchInput] = useState("");

  // Búsqueda local
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchInput.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        mutate(); // Revalidar datos
      } else {
        alert("Error al eliminar la categoría");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Error al eliminar la categoría");
    }
  };

  if (isLoading) return <AdminLoading />;
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
          placeholder="Buscar categorías por nombre o descripción..."
          className="w-full sm:w-96 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          Buscar
        </button>
      </div>

      {filteredCategories.length === 0 ? (
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
            {filteredCategories.map((category) => (
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
                  <span className="badge-info text-xs">0 productos</span>
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
                    className="btn-destructive flex-1 text-sm">
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
                {filteredCategories.map((category) => (
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
                      <span className="badge-info text-xs">0 productos</span>
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
                        className="text-error hover:text-error/80">
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
