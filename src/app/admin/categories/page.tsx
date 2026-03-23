"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  AdminEmpty,
  AdminEmptyIcons,
  AdminError,
  AdminPageHeader,
} from "@/components/admin";
import { CategoriesSkeleton } from "@/components/admin/skeletons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCategories, useDocumentTitle } from "@/hooks";

import { CategoriesContent, CategoryRow } from "./CategoriesSections";
import { useCategoryActions } from "./useCategoryActions";

export default function AdminCategoriasPage() {
  useDocumentTitle({ title: "Categorías" });
  const { categories = [], isLoading, error, mutate } = useCategories();
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();
  const {
    expandedCategories,
    categoryProducts,
    loadingProducts,
    toggleCategory,
    handleDelete,
    ConfirmDialog,
  } = useCategoryActions(mutate);

  const q = searchInput.toLowerCase();
  const filteredCategories = (categories as CategoryRow[]).filter(
    (c) => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
  );

  if (isLoading) return <CategoriesSkeleton />;
  if (error) return <AdminError message={error} />;

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

      <CategoriesContent
        filteredCategories={filteredCategories}
        expandedCategories={expandedCategories}
        categoryProducts={categoryProducts}
        loadingProducts={loadingProducts}
        onToggle={toggleCategory}
        onDelete={handleDelete}
        onEdit={(id) => router.push(`/admin/categorias/${id}/editar`)}
        emptyNode={
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
        }
      />
      {ConfirmDialog}
    </div>
  );
}
