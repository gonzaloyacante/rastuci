"use client";

import {
  AdminEmpty,
  AdminEmptyIcons,
  AdminError,
  AdminPageHeader,
} from "@/components/admin";
import { AdminTable } from "@/components/admin/AdminTable";
import { CategoriesSkeleton } from "@/components/admin/skeletons";
import { Button } from "@/components/ui/Button";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useCategories, useDocumentTitle } from "@/hooks";
import { logger } from "@/lib/logger";
import { Edit3, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CategoryRow = {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
};

export default function AdminCategoriasPage() {
  useDocumentTitle({ title: "Categorías" });
  const { categories = [], isLoading, error, mutate } = useCategories();
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();
  const { show } = useToast();
  const { confirm: confirmDialog, ConfirmDialog } = useConfirmDialog();

  const filteredCategories = (categories || []).filter(
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
        mutate?.();
      } else {
        const errorData = await response.json().catch(() => ({}) as unknown);
        let errorMessage = "Error al eliminar la categoría";
        if (
          typeof errorData === "object" &&
          errorData !== null &&
          "message" in errorData
        ) {
          const possible = (errorData as { message?: unknown }).message;
          if (typeof possible === "string") {
            errorMessage = possible;
          }
        }
        show({ type: "error", title: "Categorías", message: errorMessage });
      }
    } catch (err) {
      logger.error("Error deleting category", { error: err });
      show({
        type: "error",
        title: "Categorías",
        message: "Error al eliminar la categoría",
      });
    }
  };

  if (isLoading) {
    return <CategoriesSkeleton />;
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
            onClick: () => (window.location.href = "/admin/categorias/nueva"),
            variant: "primary",
          },
        ]}
      />

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
        <Button variant="primary">Buscar</Button>
      </div>

      {filteredCategories.length === 0 ? (
        <AdminEmpty
          icon={AdminEmptyIcons.categories}
          title="No hay categorías"
          description="No hay categorías registradas. ¡Crea tu primera categoría!"
          action={{
            label: "Crear Primera Categoría",
            onClick: () => (window.location.href = "/admin/categorias/nueva"),
            variant: "primary",
          }}
        />
      ) : (
        <div className="card">
          <div className="max-w-7xl mx-auto px-4">
            <AdminTable
              columns={[
                {
                  key: "image",
                  label: "Imagen",
                  width: "120px",
                  align: "center",
                  render: (_: unknown, row: CategoryRow) => (
                    <div className="flex items-center justify-center">
                      {row.image ? (
                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted/5 ring-2 ring-emerald-500/30">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={row.image}
                            alt={row.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-12 h-12 flex items-center justify-center surface-secondary rounded-md ring-2 ring-amber-500/30">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 muted"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            aria-hidden="true"
                          >
                            <rect
                              x="3"
                              y="5"
                              width="18"
                              height="14"
                              rx="2"
                              ry="2"
                            />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path
                              d="M21 15l-5-5-7 7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">
                              !
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: "icon",
                  label: "Icono",
                  width: "96px",
                  align: "center",
                  render: (_: unknown, row: CategoryRow) => (
                    <div className="flex items-center justify-center">
                      <CategoryIcon
                        categoryName={row.name}
                        className="w-6 h-6 text-muted"
                      />
                    </div>
                  ),
                },
                {
                  key: "name",
                  label: "Nombre / Descripción",
                  render: (_: unknown, row: CategoryRow) => (
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{row.name}</div>
                      <div className="text-xs muted line-clamp-2">
                        {row.description || "Sin descripción"}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "products",
                  label: "Productos",
                  align: "center",
                  render: () => (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium bg-surface/60 border border-border">
                      <strong className="mr-1">0</strong> productos
                    </span>
                  ),
                },
              ]}
              data={filteredCategories}
              actions={[
                {
                  label: "Editar",
                  onClick: (row: CategoryRow) =>
                    router.push(`/admin/categorias/${row.id}/editar`),
                  variant: "ghost",
                  icon: <Edit3 className="w-4 h-4" />,
                },
                {
                  label: "Eliminar",
                  onClick: (row: CategoryRow) => handleDelete(row.id),
                  variant: "destructive",
                  icon: <Trash2 className="w-4 h-4" />,
                },
              ]}
            />
          </div>
        </div>
      )}
      {ConfirmDialog}
    </div>
  );
}
