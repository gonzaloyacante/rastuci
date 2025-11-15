"use client";

import {
  AdminEmpty,
  AdminEmptyIcons,
  AdminError,
  AdminLoading,
  AdminPageHeader,
} from "@/components/admin";
import { useCategories } from "@/hooks";
// import { SearchBar, FilterBar, useSearchAndFilter } from "@/components/admin/SearchAndFilter"; // TODO: Implement when needed
import { Button } from "@/components/ui/Button";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { logger } from "@/lib/logger";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Extiendo el tipo Category para incluir imageUrl
interface CategoryWithImage {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
}

export default function AdminCategoriasPage() {
  const { categories, isLoading, error, mutate } = useCategories();
  const categoriesWithImage = categories as CategoryWithImage[];
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();
  const { show } = useToast();
  const { confirm: confirmDialog, ConfirmDialog } = useConfirmDialog();

  // Búsqueda local
  const filteredCategories = categoriesWithImage.filter(
    (category) =>
      category.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchInput.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDialog({
      title: "Eliminar categoría",
      message:
        "¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        show({
          type: "success",
          title: "Categorías",
          message: "Categoría eliminada",
        });
        mutate(); // Revalidar datos
      } else {
        // Extraer mensaje específico de error del API
        const errorData = await response.json();
        const errorMessage =
          errorData.message || "Error al eliminar la categoría";
        show({ type: "error", title: "Categorías", message: errorMessage });
      }
    } catch (error) {
      logger.error("Error deleting category", { error });
      show({
        type: "error",
        title: "Categorías",
        message: "Error al eliminar la categoría",
      });
    }
  };

  if (isLoading) {
    return <AdminLoading />;
  }
  if (error) {
    return <AdminError message={error} />;
  }

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
        <div className="w-full sm:w-96">
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar categorías por nombre o descripción..."
            aria-label="Buscar categorías"
          />
        </div>
        <Button
          variant="primary"
          onClick={() => {
            /* no-op: búsqueda local */
          }}
        >
          Buscar
        </Button>
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
                className="surface border rounded-lg p-4 space-y-3 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    {category.imageUrl && (
                      <div className="relative w-14 h-14">
                        <Image
                          src={category.imageUrl}
                          alt={category.name}
                          fill
                          className="object-cover rounded-lg border border-muted shadow"
                          sizes="56px"
                        />
                      </div>
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
                  <Button
                    onClick={() =>
                      router.push(`/admin/categorias/${category.id}/editar`)
                    }
                    variant="secondary"
                    className="flex-1 text-sm"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(category.id)}
                    variant="destructive"
                    className="flex-1 text-sm"
                  >
                    Eliminar
                  </Button>
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
              <tbody className="surface divide-y divide-border">
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.imageUrl && (
                        <div className="relative w-14 h-14">
                          <Image
                            src={category.imageUrl}
                            alt={category.name}
                            fill
                            className="object-cover rounded-lg border border-muted shadow"
                            sizes="56px"
                          />
                        </div>
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
                      <Button
                        onClick={() =>
                          router.push(`/admin/categorias/${category.id}/editar`)
                        }
                        variant="ghost"
                        className="mr-4 px-2 py-1"
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDelete(category.id)}
                        variant="destructive"
                        className="px-2 py-1"
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {ConfirmDialog}
    </div>
  );
}
