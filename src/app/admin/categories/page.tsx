"use client";

import {
  AdminEmpty,
  AdminEmptyIcons,
  AdminError,
  AdminPageHeader,
} from "@/components/admin";
import { AdminTable } from "@/components/admin/AdminTable";
import {
  CategoriesSkeleton,
  TableSkeleton,
} from "@/components/admin/skeletons";
import { Button } from "@/components/ui/Button";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
// import { useToast } from "@/components/ui/Toast";
import toast from "react-hot-toast";
import { COMMON_COLORS } from "@/components/products/ProductFormComponents";
import { useCategories, useDocumentTitle } from "@/hooks";
import { logger } from "@/lib/logger";
import { Edit3, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [categoryProducts, setCategoryProducts] = useState<
    Record<string, any[]>
  >({});
  const [loadingProducts, setLoadingProducts] = useState<Set<string>>(
    new Set()
  );
  const router = useRouter();
  // const { show } = useToast();
  const { confirm: confirmDialog, ConfirmDialog } = useConfirmDialog();

  const filteredCategories = (categories || []).filter(
    (category) =>
      category.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchInput.toLowerCase()))
  );

  const toggleCategory = async (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);

    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
      setExpandedCategories(newExpanded);
    } else {
      newExpanded.add(categoryId);
      setExpandedCategories(newExpanded);

      // Fetch products if not already loaded
      if (!categoryProducts[categoryId]) {
        setLoadingProducts(new Set(loadingProducts).add(categoryId));
        try {
          const response = await fetch(
            `/api/products?categoryId=${categoryId}&limit=50`
          );
          if (response.ok) {
            const data = await response.json();
            setCategoryProducts((prev) => ({
              ...prev,
              [categoryId]: data.data?.data || [],
            }));
          }
        } catch (err) {
          logger.error("Error fetching category products", { error: err });
        } finally {
          const newLoading = new Set(loadingProducts);
          newLoading.delete(categoryId);
          setLoadingProducts(newLoading);
        }
      }
    }
  };

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
        toast.success("Categoría eliminada");
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
        toast.error(errorMessage);
      }
    } catch (err) {
      logger.error("Error deleting category", { error: err });
      toast.error("Error al eliminar la categoría");
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

      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="w-full sm:flex-1 sm:max-w-md">
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar categorías..."
            aria-label="Buscar categorías"
            className="w-full"
          />
        </div>
        <Button variant="primary" className="w-full sm:w-auto">
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
            onClick: () => (window.location.href = "/admin/categorias/nueva"),
            variant: "primary",
          }}
        />
      ) : (
        <div className="card">
          <div className="max-w-7xl mx-auto px-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-muted surface">
                    <th
                      className="text-center p-2 sm:p-4 font-semibold muted tracking-wide text-xs sm:text-sm"
                      style={{ width: "60px" }}
                    ></th>
                    <th
                      className="text-center p-2 sm:p-4 font-semibold muted tracking-wide text-xs sm:text-sm"
                      style={{ width: "120px" }}
                    >
                      Imagen
                    </th>
                    <th
                      className="text-center p-2 sm:p-4 font-semibold muted tracking-wide text-xs sm:text-sm"
                      style={{ width: "96px" }}
                    >
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
                  {filteredCategories.map(
                    (
                      category: CategoryRow & { productCount?: number },
                      index
                    ) => {
                      const isExpanded = expandedCategories.has(category.id);
                      const products = categoryProducts[category.id] || [];
                      const isLoadingProducts = loadingProducts.has(
                        category.id
                      );

                      return (
                        <React.Fragment key={category.id}>
                          <tr className="border-b border-muted hover:surface transition-colors">
                            <td className="text-center p-2 sm:p-4 align-middle text-xs sm:text-sm">
                              <button
                                onClick={() => toggleCategory(category.id)}
                                className="p-1 hover:bg-surface-secondary rounded transition-colors"
                                aria-label={
                                  isExpanded ? "Contraer" : "Expandir"
                                }
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
                              </button>
                            </td>
                            <td className="text-center p-2 sm:p-4 align-middle text-xs sm:text-sm">
                              <div className="flex items-center justify-center">
                                {category.image ? (
                                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted/5 ring-2 ring-emerald-500/30">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={category.image}
                                      alt={category.name}
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
                            </td>
                            <td className="text-center p-2 sm:p-4 align-middle text-xs sm:text-sm">
                              <div className="flex items-center justify-center">
                                <CategoryIcon
                                  categoryName={category.name}
                                  className="w-6 h-6 text-muted"
                                />
                              </div>
                            </td>
                            <td className="text-left p-2 sm:p-4 align-middle text-xs sm:text-sm">
                              <div className="min-w-0">
                                <div className="font-semibold truncate">
                                  {category.name}
                                </div>
                                <div className="text-xs muted line-clamp-2">
                                  {category.description || "Sin descripción"}
                                </div>
                              </div>
                            </td>
                            <td className="text-center p-2 sm:p-4 align-middle text-xs sm:text-sm">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium bg-surface/60 border border-border">
                                <strong className="mr-1">
                                  {category.productCount ?? 0}
                                </strong>{" "}
                                productos
                              </span>
                            </td>
                            <td className="p-2 sm:p-4 align-middle">
                              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs flex items-center gap-1 justify-center"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                      `/admin/categorias/${category.id}/editar`
                                    );
                                  }}
                                >
                                  <Edit3 className="w-4 h-4" />
                                  <span className="hidden sm:inline">
                                    Editar
                                  </span>
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="text-xs flex items-center gap-1 justify-center"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(category.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="hidden sm:inline">
                                    Eliminar
                                  </span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                          <tr
                            className={`transition-all duration-300 ease-in-out ${isExpanded ? "opacity-100" : "opacity-0"}`}
                          >
                            <td colSpan={6} className="p-0 overflow-hidden">
                              <div
                                className="transition-all duration-300 ease-in-out bg-surface-secondary/30"
                                style={{
                                  maxHeight: isExpanded ? "2000px" : "0px",
                                  opacity: isExpanded ? 1 : 0,
                                }}
                              >
                                <div className="p-4">
                                  {isLoadingProducts ? (
                                    <div className="py-2">
                                      <TableSkeleton
                                        columns={5}
                                        rows={3}
                                        showHeader={true}
                                        showActions={false}
                                      />
                                    </div>
                                  ) : products.length === 0 ? (
                                    <div className="text-center py-8 muted text-sm">
                                      No hay productos en esta categoría
                                    </div>
                                  ) : (
                                    <AdminTable
                                      columns={[
                                        {
                                          key: "image",
                                          label: "Imagen",
                                          align: "center",
                                          render: (_: unknown, row: any) => (
                                            <div className="flex justify-center">
                                              <div className="relative w-10 h-10 rounded overflow-hidden bg-muted/5 border border-border shrink-0">
                                                {row.images && row.images[0] ? (
                                                  <img
                                                    src={row.images[0]}
                                                    alt={row.name}
                                                    className="w-full h-full object-cover"
                                                  />
                                                ) : (
                                                  <div className="flex items-center justify-center w-full h-full text-muted">
                                                    <svg
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      className="w-5 h-5"
                                                      viewBox="0 0 24 24"
                                                      fill="none"
                                                      stroke="currentColor"
                                                      strokeWidth={1.5}
                                                    >
                                                      <rect
                                                        x="3"
                                                        y="3"
                                                        width="18"
                                                        height="18"
                                                        rx="2"
                                                        ry="2"
                                                      />
                                                      <circle
                                                        cx="8.5"
                                                        cy="8.5"
                                                        r="1.5"
                                                      />
                                                      <polyline points="21 15 16 10 5 21" />
                                                    </svg>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          ),
                                        },
                                        {
                                          key: "name",
                                          label: "Producto",
                                          render: (_: unknown, row: any) => (
                                            <div className="flex flex-col min-w-[200px]">
                                              <div className="text-sm font-medium text-base-primary truncate">
                                                {row.name}
                                              </div>
                                              {row.description && (
                                                <div className="text-xs muted line-clamp-1">
                                                  {row.description}
                                                </div>
                                              )}
                                            </div>
                                          ),
                                        },
                                        {
                                          key: "colors",
                                          label: "Colores",
                                          align: "center",
                                          render: (_: unknown, row: any) => (
                                            <div className="flex justify-center gap-1">
                                              {row.colors &&
                                                row.colors.length > 0 ? (
                                                row.colors
                                                  .slice(0, 3)
                                                  .map(
                                                    (
                                                      color: string,
                                                      idx: number
                                                    ) => {
                                                      const matchedColor =
                                                        COMMON_COLORS.find(
                                                          (c) =>
                                                            c.name.toLowerCase() ===
                                                            color.toLowerCase() ||
                                                            color
                                                              .toLowerCase()
                                                              .includes(
                                                                c.name.toLowerCase()
                                                              )
                                                        );
                                                      const bgColor =
                                                        matchedColor
                                                          ? matchedColor.hex
                                                          : color;

                                                      return (
                                                        <div
                                                          key={idx}
                                                          className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
                                                          style={{
                                                            backgroundColor:
                                                              bgColor,
                                                          }}
                                                          title={color}
                                                        />
                                                      );
                                                    }
                                                  )
                                              ) : (
                                                <span className="text-xs muted">
                                                  -
                                                </span>
                                              )}
                                              {row.colors &&
                                                row.colors.length > 3 && (
                                                  <span className="text-xs muted ml-1">
                                                    +{row.colors.length - 3}
                                                  </span>
                                                )}
                                            </div>
                                          ),
                                        },
                                        {
                                          key: "sizes",
                                          label: "Talles",
                                          align: "center",
                                          render: (_: unknown, row: any) => (
                                            <span className="text-xs text-base-secondary">
                                              {row.sizes && row.sizes.length > 0
                                                ? `${row.sizes.length} ${row.sizes.length === 1 ? "talle" : "talles"}`
                                                : "-"}
                                            </span>
                                          ),
                                        },
                                        {
                                          key: "stock",
                                          label: "Stock",
                                          align: "center",
                                          render: (_: unknown, row: any) => (
                                            <span
                                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium bg-surface/60 border border-border`}
                                            >
                                              <strong className="mr-1">
                                                {row.stock}
                                              </strong>
                                            </span>
                                          ),
                                        },
                                        {
                                          key: "price",
                                          label: "Precio",
                                          align: "right",
                                          render: (_: unknown, row: any) => (
                                            <span className="text-sm font-bold text-base-primary">
                                              $
                                              {row.price.toLocaleString(
                                                "es-AR"
                                              )}
                                            </span>
                                          ),
                                        },
                                      ]}
                                      data={products}
                                    />
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {ConfirmDialog}
    </div>
  );
}
