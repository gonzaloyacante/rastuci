"use client";

import { useCallback } from "react";

import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { logger } from "@/lib/logger";
import { Product } from "@/types";
import { escapeCsvCell } from "@/utils/formatters";

interface ActionDeps {
  show: ReturnType<typeof useToast>["show"];
  products: Product[];
  mutate: () => void;
  mutateStats: () => void;
  confirm: ReturnType<typeof useConfirmDialog>["confirm"];
}

export function useProductActions(deps: ActionDeps) {
  const { show, products, mutate, mutateStats, confirm } = deps;

  const handleToggleActive = async (
    id: string,
    currentStatus: boolean | undefined
  ) => {
    const newStatus = !currentStatus;
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      show({
        type: "success",
        message: newStatus ? "Producto activado" : "Producto desactivado",
      });
      void mutate();
      void mutateStats();
    } catch (err) {
      logger.error("Error toggling product active status", { error: err });
      show({ type: "error", message: "No se pudo actualizar el estado." });
    }
  };

  const handleUpdateStock = async (id: string, stock: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock }),
      });
      if (!response.ok) throw new Error("Failed to update stock");
      show({ type: "success", message: `Stock actualizado a ${stock}` });
      void mutate();
      void mutateStats();
    } catch (err) {
      logger.error("Error updating product stock", { error: err });
      show({ type: "error", message: "No se pudo actualizar el stock." });
    }
  };

  const handleDelete = async (id: string) => {
    const product = products.find((p: Product) => p.id === id);
    const confirmed = await confirm({
      title: "Eliminar producto",
      message: `¿Estás seguro de que querés eliminar "${product?.name || "este producto"}"? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data?.error || "Failed to delete product");
      }
      show({ type: "success", message: "Producto eliminado correctamente" });
      void mutate();
      void mutateStats();
    } catch (err) {
      logger.error("Error deleting product", { error: err });
      show({ type: "error", message: "No se pudo eliminar el producto." });
    }
  };

  const handleExportCSV = useCallback(() => {
    const headers = ["Nombre", "Categoría", "Precio", "Stock", "En Oferta"].map(
      escapeCsvCell
    );
    const rows = products.map((p: Product) => [
      escapeCsvCell(p.name),
      escapeCsvCell(p.categories?.name || "Sin categoría"),
      escapeCsvCell(p.price.toString()),
      escapeCsvCell(p.stock.toString()),
      escapeCsvCell(p.onSale ? "Sí" : "No"),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `productos_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [products]);

  return {
    handleToggleActive,
    handleUpdateStock,
    handleDelete,
    handleExportCSV,
  };
}
