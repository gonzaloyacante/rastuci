"use client";

import { useState } from "react";

import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { logger } from "@/lib/logger";
import { Product } from "@/types";
import React from "react";

interface UseCategoryActionsReturn {
  expandedCategories: Set<string>;
  categoryProducts: Record<string, Product[]>;
  loadingProducts: Set<string>;
  toggleCategory: (categoryId: string) => void;
  handleDelete: (id: string) => void;
  ConfirmDialog: React.ReactNode;
}

export function useCategoryActions(
  mutate?: (() => Promise<unknown>) | null
): UseCategoryActionsReturn {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});
  const [loadingProducts, setLoadingProducts] = useState<Set<string>>(new Set());
  const { show } = useToast();
  const { confirm: confirmDialog, ConfirmDialog } = useConfirmDialog();

  const toggleCategory = async (categoryId: string) => {
    const next = new Set(expandedCategories);
    if (next.has(categoryId)) {
      next.delete(categoryId);
      setExpandedCategories(next);
      return;
    }
    next.add(categoryId);
    setExpandedCategories(next);

    setLoadingProducts((prev) => new Set(prev).add(categoryId));
    try {
      const res = await fetch(`/api/products?categoryId=${categoryId}&limit=50`);
      const data = (await res.json()) as { data?: { data?: Product[] } };
      setCategoryProducts((prev) => ({ ...prev, [categoryId]: data.data?.data ?? [] }));
    } catch (err) {
      logger.error("Error fetching category products", { error: err });
    } finally {
      setLoadingProducts((prev) => {
        const s = new Set(prev);
        s.delete(categoryId);
        return s;
      });
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
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        show({ type: "success", message: "Categoría eliminada" });
        void mutate?.();
      } else {
        const errorData = await res.json().catch(() => null);
        const msg =
          (errorData as { message?: string } | null)?.message ??
          "Error al eliminar la categoría";
        show({ type: "error", message: msg });
      }
    } catch (err) {
      logger.error("Error deleting category", { error: err });
      show({ type: "error", message: "Error al eliminar la categoría" });
    }
  };

  return {
    expandedCategories,
    categoryProducts,
    loadingProducts,
    toggleCategory: (id) => void toggleCategory(id),
    handleDelete: (id) => void handleDelete(id),
    ConfirmDialog,
  };
}
