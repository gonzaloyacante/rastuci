"use client";

import {
  AlertTriangle,
  Download,
  Edit,
  Eye,
  Package,
  Search,
  TrendingDown,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  InventoryFilters,
  type InventoryItem,
  type InventoryStats,
  InventoryTable,
  ItemDetailsModal,
  StatCard,
  type StockAdjustmentData,
  StockAdjustmentModal,
} from "@/components/admin/InventoryComponents";
import { useToast } from "@/components/ui/Toast";
import useDebounce from "@/hooks/useDebounce";
import type { Product } from "@/types";
import { formatCurrency } from "@/utils/formatters";

const PLACEHOLDER = "https://placehold.co/800x800.png";

function productToInventoryItems(p: Product): InventoryItem[] {
  const images = Array.isArray(p.images)
    ? p.images
    : typeof p.images === "string"
      ? JSON.parse(p.images || "[]")
      : [];
  const img: string = (images[0] as string | undefined) ?? PLACEHOLDER;
  const unitCost = typeof p.price === "number" ? p.price : 0;
  const base = {
    productId: p.id,
    productName: p.name,
    productImage: img,
    category: p.categories?.name ?? "Sin categoría",
    minStock: 5,
    reservedStock: 0,
    unitCost,
    unitPrice: unitCost,
    supplier: "—",
    location: "—",
    lastRestocked: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    movements: [],
  };

  if (p.variants && p.variants.length > 0) {
    return p.variants.map((v) => ({
      ...base,
      id: v.id,
      variantId: v.id,
      color: v.color,
      size: v.size,
      sku: v.sku ?? `${p.id}-${v.color}-${v.size}`,
      currentStock: v.stock,
      maxStock: Math.max(100, v.stock),
      availableStock: v.stock,
      status: (v.stock > 0
        ? "in_stock"
        : "out_of_stock") as InventoryItem["status"],
    }));
  }

  const currentStock = typeof p.stock === "number" ? p.stock : 0;
  return [
    {
      ...base,
      id: p.id,
      sku: p.id,
      currentStock,
      maxStock: Math.max(100, currentStock),
      availableStock: currentStock,
      status: (currentStock > 0
        ? "in_stock"
        : "out_of_stock") as InventoryItem["status"],
    },
  ];
}

export function InventoryManagement() {
  const { show } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const loadInventoryData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/products?page=1&limit=50&search=${encodeURIComponent(debouncedSearch)}`
      );
      if (!res.ok) throw new Error("Error fetching products");
      const json = await res.json();
      const products: Product[] = Array.isArray(json?.data?.data)
        ? json.data.data
        : [];

      const mapped = products.flatMap(productToInventoryItems);

      const computedStats: InventoryStats = {
        totalProducts: mapped.length,
        totalValue: mapped.reduce(
          (sum, it) => sum + it.currentStock * it.unitPrice,
          0
        ),
        lowStockItems: mapped.filter(
          (item) => item.currentStock > 0 && item.currentStock <= item.minStock
        ).length,
        outOfStockItems: mapped.filter((item) => item.currentStock === 0)
          .length,
        topMovingProducts: mapped.slice(0, 5),
        slowMovingProducts: mapped.slice(-5),
      };

      setInventory(mapped);
      setStats(computedStats);
    } catch {
      show({ type: "error", message: "Error al cargar el inventario" });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, show]);

  useEffect(() => {
    void loadInventoryData();
  }, [loadInventoryData]);

  const handleStockAdjustment = async (data: StockAdjustmentData) => {
    if (!selectedItem) return;

    try {
      let resp: Response;
      if (selectedItem.variantId) {
        // Product with variants → update variant stock via dedicated endpoint
        resp = await fetch(
          `/api/products/${selectedItem.productId}/variants/${selectedItem.variantId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantityChange: data.quantity }),
          }
        );
      } else {
        // Product without variants → update product stock directly
        const newStock = Math.max(0, selectedItem.currentStock + data.quantity);
        resp = await fetch(`/api/products/${selectedItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: newStock }),
        });
      }

      if (!resp.ok) throw new Error("Error HTTP al actualizar inventario");

      await loadInventoryData();
      setShowAdjustmentForm(false);
      setSelectedItem(null);
      show({
        type: "success",
        message: "Ajuste de stock realizado correctamente",
      });
    } catch {
      show({ type: "error", message: "Error al realizar el ajuste de stock" });
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(inventory.map((item) => item.category))];

  if (loading) {
    return <div className="p-6">Cargando inventario...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Package className="w-8 h-8" />}
            iconColor="text-primary"
            label="Total Variantes"
            value={stats.totalProducts}
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            iconColor="text-success"
            label="Valor Total"
            value={formatCurrency(stats.totalValue)}
          />
          <StatCard
            icon={<AlertTriangle className="w-8 h-8" />}
            iconColor="text-warning"
            label="Stock Bajo"
            value={stats.lowStockItems}
          />
          <StatCard
            icon={<TrendingDown className="w-8 h-8" />}
            iconColor="text-error"
            label="Agotados"
            value={stats.outOfStockItems}
          />
        </div>
      )}

      {/* Filters */}
      <InventoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
        searchIcon={<Search className="w-4 h-4" />}
        exportIcon={<Download className="w-4 h-4" />}
        importIcon={<Upload className="w-4 h-4" />}
      />

      {/* Table */}
      <InventoryTable
        items={filteredInventory}
        onViewItem={setSelectedItem}
        onEditItem={(item) => {
          setSelectedItem(item);
          setShowAdjustmentForm(true);
        }}
        viewIcon={<Eye className="w-4 h-4" />}
        editIcon={<Edit className="w-4 h-4" />}
      />

      {/* Modals */}
      {showAdjustmentForm && selectedItem && (
        <StockAdjustmentModal
          item={selectedItem}
          onSubmit={handleStockAdjustment}
          onClose={() => {
            setShowAdjustmentForm(false);
            setSelectedItem(null);
          }}
        />
      )}

      {selectedItem && !showAdjustmentForm && (
        <ItemDetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdjustStock={() => setShowAdjustmentForm(true)}
        />
      )}
    </div>
  );
}
