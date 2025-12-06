"use client";

import {
  InventoryFilters,
  InventoryTable,
  ItemDetailsModal,
  StatCard,
  StockAdjustmentModal,
  type InventoryItem,
  type InventoryStats,
  type StockAdjustmentData,
  type StockMovement,
} from "@/components/admin/InventoryComponents";
import type { Product } from "@/types";
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
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products?page=1&limit=1000");
      if (!res.ok) {
        throw new Error("Error fetching products");
      }
      const json = await res.json();
      const products = Array.isArray(json?.data?.data) ? json.data.data : [];

      const mapped: InventoryItem[] = products.map((p: Product) => {
        const images = Array.isArray(p.images)
          ? p.images
          : typeof p.images === "string"
            ? JSON.parse(p.images || "[]")
            : [];
        const img = images?.[0] ?? "https://placehold.co/800x800.png";
        const currentStock = typeof p.stock === "number" ? p.stock : 0;

        return {
          id: p.id,
          productId: p.id,
          productName: p.name,
          productImage: img,
          sku: p.id,
          category: p.categories?.name ?? "Sin categoría",
          currentStock,
          minStock: 5,
          maxStock: Math.max(100, currentStock),
          reservedStock: 0,
          availableStock: currentStock,
          unitCost: typeof p.price === "number" ? p.price : 0,
          unitPrice: typeof p.price === "number" ? p.price : 0,
          supplier: "Desconocido",
          location: "Desconocido",
          lastRestocked: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          status: currentStock > 0 ? "in_stock" : "out_of_stock",
          movements: [],
        } as InventoryItem;
      });

      const computedStats: InventoryStats = {
        totalProducts: mapped.length,
        totalValue: mapped.reduce(
          (sum, it) => sum + it.currentStock * (it.unitPrice ?? 0),
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
      toast.error("Error al cargar el inventario");
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async (data: StockAdjustmentData) => {
    if (!selectedItem) return;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newMovement: StockMovement = {
        id: Date.now().toString(),
        type: "adjustment",
        quantity: data.quantity,
        reason: data.reason,
        reference: data.reference,
        userId: "admin-1",
        userName: "Admin",
        createdAt: new Date(),
      };

      setInventory((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                currentStock: item.currentStock + data.quantity,
                availableStock: item.availableStock + data.quantity,
                movements: [newMovement, ...item.movements],
              }
            : item
        )
      );

      setShowAdjustmentForm(false);
      setSelectedItem(null);
      toast.success("Ajuste de stock realizado correctamente");
    } catch {
      toast.error("Error al realizar el ajuste de stock");
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
            label="Total Productos"
            value={stats.totalProducts}
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            iconColor="text-success"
            label="Valor Total"
            value={`$${stats.totalValue.toFixed(2)}`}
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
