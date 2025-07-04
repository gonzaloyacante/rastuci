"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, DownloadIcon } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import toast from "react-hot-toast";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
    };
  };
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  total: number;
  status: "PENDING" | "PROCESSED" | "DELIVERED";
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<
    "ALL" | "PENDING" | "PROCESSED" | "DELIVERED"
  >("ALL");
  const [isSearching, setIsSearching] = useState(false);

  const fetchOrders = async (
    page = 1,
    statusFilter?: string,
    search?: string
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10"); // 10 pedidos por página

      if (statusFilter && statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }

      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`/api/orders?${params}`);

      if (!response.ok) {
        throw new Error("Error al cargar los pedidos");
      }

      const data = await response.json();

      if (data.success) {
        setOrders(data.data.data);
        setTotalPages(data.data.totalPages);
        setCurrentPage(data.data.page);
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error(err);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, []);

  const handleStatusChange = (
    newStatus: "ALL" | "PENDING" | "PROCESSED" | "DELIVERED"
  ) => {
    setStatus(newStatus);
    setCurrentPage(1);
    fetchOrders(1, newStatus, searchTerm);
  };

  const handleSearch = () => {
    setIsSearching(true);
    setCurrentPage(1);
    fetchOrders(1, status, searchTerm);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchOrders(page, status, searchTerm);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("es-CO")}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            Pendiente
          </span>
        );
      case "PROCESSED":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            Procesado
          </span>
        );
      case "DELIVERED":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            Entregado
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
            Desconocido
          </span>
        );
    }
  };

  const exportToCSV = () => {
    try {
      if (orders.length === 0) {
        toast.error("No hay pedidos para exportar");
        return;
      }

      // Cabecera del CSV
      let csvContent =
        "ID,Cliente,Teléfono,Dirección,Total,Estado,Fecha,Productos\n";

      // Datos
      orders.forEach((order) => {
        const products = order.items
          .map((item) => `${item.quantity}x ${item.product.name}`)
          .join("; ");
        const row = [
          order.id,
          order.customerName,
          order.customerPhone,
          order.customerAddress || "No especificada",
          order.total,
          order.status === "PENDING"
            ? "Pendiente"
            : order.status === "PROCESSED"
            ? "Procesado"
            : "Entregado",
          formatDate(order.createdAt),
          products,
        ]
          .map((value) => `"${value}"`)
          .join(",");

        csvContent += row + "\n";
      });

      // Crear un blob y descargar
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `pedidos_rastuci_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Pedidos exportados correctamente");
    } catch (error) {
      console.error("Error al exportar pedidos:", error);
      toast.error("Error al exportar pedidos");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="flex items-center gap-2">
            <DownloadIcon size={16} />
            Exportar
          </Button>
          <Link href="/admin/pedidos/pendientes">
            <Button className="bg-[#E91E63] hover:bg-[#C2185B]">
              Ver Pendientes
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar por nombre de cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
              </div>
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-[#E91E63] hover:bg-[#C2185B]">
              {isSearching ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Buscando...
                </span>
              ) : (
                "Buscar"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="ALL" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger
            value="ALL"
            onClick={() => handleStatusChange("ALL")}
            className={status === "ALL" ? "bg-[#E91E63] text-white" : ""}>
            Todos
          </TabsTrigger>
          <TabsTrigger
            value="PENDING"
            onClick={() => handleStatusChange("PENDING")}
            className={status === "PENDING" ? "bg-[#E91E63] text-white" : ""}>
            Pendientes
          </TabsTrigger>
          <TabsTrigger
            value="PROCESSED"
            onClick={() => handleStatusChange("PROCESSED")}
            className={status === "PROCESSED" ? "bg-[#E91E63] text-white" : ""}>
            Procesados
          </TabsTrigger>
          <TabsTrigger
            value="DELIVERED"
            onClick={() => handleStatusChange("DELIVERED")}
            className={status === "DELIVERED" ? "bg-[#E91E63] text-white" : ""}>
            Entregados
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E63]"></div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-red-500 text-xl mb-4">{error}</div>
              <Button
                onClick={() => fetchOrders(1, status, searchTerm)}
                className="bg-[#E91E63] hover:bg-[#C2185B]">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {order.customerName}
                    </CardTitle>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatDate(order.createdAt)}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Información de contacto
                      </h3>
                      <p className="text-sm">{order.customerPhone}</p>
                      {order.customerAddress && (
                        <p className="text-sm">{order.customerAddress}</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Productos
                      </h3>
                      <div className="mt-2 text-sm text-gray-700">
                        {order.items.length} producto(s) - Total:{" "}
                        <span className="font-bold text-[#E91E63]">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-3">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="flex-1">
                        <Button className="w-full bg-[#E91E63] hover:bg-[#C2185B]">
                          Ver Detalles
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              <h2 className="text-xl font-medium text-gray-900 mb-2">
                No hay pedidos
              </h2>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                {searchTerm
                  ? "No se encontraron pedidos con ese criterio de búsqueda."
                  : status !== "ALL"
                  ? `No hay pedidos con estado ${
                      status === "PENDING"
                        ? "pendiente"
                        : status === "PROCESSED"
                        ? "procesado"
                        : "entregado"
                    }.`
                  : "Aún no hay pedidos registrados en el sistema."}
              </p>
              {(searchTerm || status !== "ALL") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatus("ALL");
                    fetchOrders(1);
                  }}>
                  Ver todos los pedidos
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {orders.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}>
                Anterior
              </Button>
              <div className="text-sm text-gray-500">
                Página {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}>
                Siguiente
              </Button>
            </nav>
          </div>
        )}
      </Tabs>
    </div>
  );
}
