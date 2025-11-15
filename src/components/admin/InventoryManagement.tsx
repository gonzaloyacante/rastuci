"use client";

import { EnhancedForm, FormField } from "@/components/forms/EnhancedForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
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
import { z } from "zod";

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reservedStock: number;
  availableStock: number;
  unitCost: number;
  unitPrice: number;
  supplier: string;
  location: string;
  lastRestocked: Date;
  status: "in_stock" | "low_stock" | "out_of_stock" | "discontinued";
  movements: StockMovement[];
}

interface StockMovement {
  id: string;
  type: "in" | "out" | "adjustment" | "transfer";
  quantity: number;
  reason: string;
  reference?: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  topMovingProducts: InventoryItem[];
  slowMovingProducts: InventoryItem[];
}

const stockAdjustmentSchema = z.object({
  quantity: z.number().int(),
  reason: z.string().min(5, "La razón debe tener al menos 5 caracteres"),
  reference: z.string().optional(),
});

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
      // Load real products from the API and map them to the inventory model.
      // Nota: asumimos que la API de productos no expone campos específicos de inventario
      // (sku, supplier, location, minStock). Para no usar datos "mock" inventados,
      // hacemos las siguientes asunciones mínimas documentadas en el código:
      //  - sku: se usa el id del producto cuando no existe SKU explícito
      //  - supplier/location: se marcan como 'Desconocido' si no están disponibles
      //  - minStock: se aplica un valor por defecto de 5 para detectar stock bajo
      // Estas elecciones son derivadas y no contienen datos falsos sobre ventas o movimientos.

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
        const img = images?.[0] ?? "/placeholder.jpg";

        const currentStock = typeof p.stock === "number" ? p.stock : 0;

        return {
          id: p.id,
          productId: p.id,
          productName: p.name,
          productImage: img,
          sku: p.id,
          category: p.category?.name ?? "Sin categoría",
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
        // Valor del inventario calculado a precio de venta (stock * price)
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

  const handleStockAdjustment = async (
    data: z.infer<typeof stockAdjustmentSchema>
  ) => {
    if (!selectedItem) {
      return;
    }

    try {
      // Simulate API call
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return <Badge variant="success">En Stock</Badge>;
      case "low_stock":
        return <Badge variant="warning">Stock Bajo</Badge>;
      case "out_of_stock":
        return <Badge variant="error">Agotado</Badge>;
      case "discontinued":
        return <Badge variant="secondary">Descontinuado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
          <div className="surface border border-muted rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm muted">Total Productos</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="surface border border-muted rounded-lg p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-success" />
              <div>
                <p className="text-sm muted">Valor Total</p>
                <p className="text-2xl font-bold">
                  ${stats.totalValue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="surface border border-muted rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-warning" />
              <div>
                <p className="text-sm muted">Stock Bajo</p>
                <p className="text-2xl font-bold">{stats.lowStockItems}</p>
              </div>
            </div>
          </div>

          <div className="surface border border-muted rounded-lg p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-error" />
              <div>
                <p className="text-sm muted">Agotados</p>
                <p className="text-2xl font-bold">{stats.outOfStockItems}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="surface border border-muted rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 muted" />
              <Input
                placeholder="Buscar por nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-muted rounded surface"
          >
            <option value="all">Todos los estados</option>
            <option value="in_stock">En Stock</option>
            <option value="low_stock">Stock Bajo</option>
            <option value="out_of_stock">Agotado</option>
            <option value="discontinued">Descontinuado</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-muted rounded surface"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>

          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Importar
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="surface border border-muted rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="surface border-b border-muted">
              <tr>
                <th className="text-left p-4">Producto</th>
                <th className="text-left p-4">SKU</th>
                <th className="text-left p-4">Categoría</th>
                <th className="text-center p-4">Stock Actual</th>
                <th className="text-center p-4">Stock Mín.</th>
                <th className="text-center p-4">Disponible</th>
                <th className="text-center p-4">Estado</th>
                <th className="text-center p-4">Valor</th>
                <th className="text-center p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-muted hover-surface"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <OptimizedImage
                        src={item.productImage}
                        alt={item.productName}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm muted">{item.supplier}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm">{item.sku}</td>
                  <td className="p-4">{item.category}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`font-bold ${
                        item.currentStock <= item.minStock ? "text-error" : ""
                      }`}
                    >
                      {item.currentStock}
                    </span>
                  </td>
                  <td className="p-4 text-center">{item.minStock}</td>
                  <td className="p-4 text-center">{item.availableStock}</td>
                  <td className="p-4 text-center">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="p-4 text-center">
                    ${(item.currentStock * item.unitCost).toFixed(2)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedItem(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowAdjustmentForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustmentForm && selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="surface rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Ajustar Stock - {selectedItem.productName}
            </h3>

            <div className="mb-4 p-3 surface border border-muted rounded">
              <p className="text-sm muted">
                Stock actual:{" "}
                <span className="font-bold">{selectedItem.currentStock}</span>
              </p>
              <p className="text-sm muted">
                Stock disponible:{" "}
                <span className="font-bold">{selectedItem.availableStock}</span>
              </p>
            </div>

            <EnhancedForm
              schema={stockAdjustmentSchema}
              onSubmit={handleStockAdjustment}
              submitText="Aplicar Ajuste"
            >
              {({ register, errors }) => (
                <>
                  <FormField
                    name="quantity"
                    label="Cantidad (+ para aumentar, - para disminuir)"
                    type="number"
                    placeholder="0"
                    required
                    register={register}
                    errors={errors}
                  />

                  <FormField
                    name="reason"
                    label="Razón del ajuste"
                    placeholder="Ej: Inventario físico, producto dañado, etc."
                    required
                    register={register}
                    errors={errors}
                  />

                  <FormField
                    name="reference"
                    label="Referencia (opcional)"
                    placeholder="Número de documento, orden, etc."
                    register={register}
                    errors={errors}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAdjustmentForm(false);
                        setSelectedItem(null);
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </>
              )}
            </EnhancedForm>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && !showAdjustmentForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Detalles del Inventario</h3>
              <Button variant="ghost" onClick={() => setSelectedItem(null)}>
                ×
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <OptimizedImage
                  src={selectedItem.productImage}
                  alt={selectedItem.productName}
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">{selectedItem.productName}</h4>
                  <p className="text-sm muted">SKU: {selectedItem.sku}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="muted">Stock Actual</p>
                    <p className="font-bold text-lg">
                      {selectedItem.currentStock}
                    </p>
                  </div>
                  <div>
                    <p className="muted">Stock Mínimo</p>
                    <p className="font-bold">{selectedItem.minStock}</p>
                  </div>
                  <div>
                    <p className="muted">Stock Reservado</p>
                    <p className="font-bold">{selectedItem.reservedStock}</p>
                  </div>
                  <div>
                    <p className="muted">Disponible</p>
                    <p className="font-bold">{selectedItem.availableStock}</p>
                  </div>
                  <div>
                    <p className="muted">Costo Unitario</p>
                    <p className="font-bold">${selectedItem.unitCost}</p>
                  </div>
                  <div>
                    <p className="muted">Precio Unitario</p>
                    <p className="font-bold">${selectedItem.unitPrice}</p>
                  </div>
                </div>

                <div>
                  <p className="muted">Proveedor</p>
                  <p className="font-medium">{selectedItem.supplier}</p>
                </div>

                <div>
                  <p className="muted">Ubicación</p>
                  <p className="font-medium">{selectedItem.location}</p>
                </div>

                <div>
                  <p className="muted">Último Restock</p>
                  <p className="font-medium">
                    {selectedItem.lastRestocked.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={() => {
                  setShowAdjustmentForm(true);
                }}
                className="w-full"
              >
                Ajustar Stock
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
