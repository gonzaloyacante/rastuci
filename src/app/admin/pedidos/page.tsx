"use client";

import { useState, useEffect } from "react";
import { DownloadIcon } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  AdminPageHeader,
  AdminEmpty,
  AdminEmptyIcons,
  AdminLoading,
  AdminError,
} from "@/components/admin";
import { SearchBar, FilterBar } from "@/components/search";
import { useOrders } from "@/hooks/useOrders";
import type { Order } from "@/hooks/useOrders";

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "PROCESSED" | "DELIVERED"
  >("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const { orders, loading, error, totalPages, fetchOrders } = useOrders();

  useEffect(() => {
    fetchOrders({
      page: currentPage,
      limit: 10,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      search: searchTerm || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchTerm, currentPage]);

  const filterFields = [
    {
      key: "status",
      label: "Estado",
      type: "select" as const,
      options: [
        { value: "ALL", label: "Todos los estados" },
        { value: "PENDING", label: "Pendientes" },
        { value: "PROCESSED", label: "Procesados" },
        { value: "DELIVERED", label: "Entregados" },
      ],
    },
  ];

  const handleStatusChange = (
    newStatus: "ALL" | "PENDING" | "PROCESSED" | "DELIVERED"
  ) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
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
          <span className="px-2 py-1 badge-secondary text-xs font-medium rounded-full">
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
      orders.forEach((order: Order) => {
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
            : order.status === "DELIVERED"
            ? "Entregado"
            : "Desconocido",
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
    <div className="space-y-6">
      <AdminPageHeader
        title="Pedidos"
        subtitle="Gestiona todos los pedidos de la tienda"
        actions={[
          {
            label: "Exportar",
            onClick: exportToCSV,
            variant: "outline",
            icon: <DownloadIcon size={16} />,
          },
          {
            label: "Ver Pendientes",
            onClick: () => (window.location.href = "/admin/pedidos/pendientes"),
            variant: "primary",
          },
        ]}
      />

      {/* Barra de búsqueda y filtros */}
      <div className="space-y-4">
        <SearchBar
          value={searchTerm}
          onChange={(value: string) => {
            setSearchTerm(value);
            if (value.trim() === "") {
              setCurrentPage(1);
            }
          }}
          onSearch={() => handleSearch()}
          placeholder="Buscar pedidos por nombre de cliente..."
        />
        <FilterBar
          fields={filterFields}
          values={{ status: statusFilter }}
          onChange={(key: string, value: string | string[] | null) => {
            if (key === "status" && typeof value === "string") {
              handleStatusChange(
                value as "ALL" | "PENDING" | "PROCESSED" | "DELIVERED"
              );
            }
          }}
          onReset={() => {
            setStatusFilter("ALL");
            setSearchTerm("");
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Contenido principal */}
      {loading ? (
        <AdminLoading />
      ) : error ? (
        <AdminError
          message={error}
          actions={[
            {
              label: "Reintentar",
              onClick: () => {
                // Solo reinicia la página, el useEffect hará el fetch
                setCurrentPage(1);
              },
              variant: "primary",
            },
          ]}
        />
      ) : orders.length === 0 ? (
        <AdminEmpty
          icon={AdminEmptyIcons.orders}
          title="No hay pedidos"
          description={
            searchTerm
              ? "No se encontraron pedidos con ese criterio de búsqueda."
              : statusFilter !== "ALL"
              ? `No hay pedidos con estado ${
                  statusFilter === "PENDING"
                    ? "pendiente"
                    : statusFilter === "PROCESSED"
                    ? "procesado"
                    : "entregado"
                }.`
              : "Aún no hay pedidos registrados en el sistema."
          }
          action={
            searchTerm || statusFilter !== "ALL"
              ? {
                  label: "Ver todos los pedidos",
                  onClick: () => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                    setCurrentPage(1);
                  },
                  variant: "outline",
                }
              : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {orders.map((order) => (
              <div key={order.id} className="card">
                <div className="bg-surface-secondary border-b -m-6 mb-6 p-4 rounded-t-lg">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-content-primary truncate">
                        {order.customerName}
                      </h3>
                      <p className="text-sm text-content-secondary">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-content-secondary mb-2">
                      Información de contacto
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm text-content-primary">
                        📞 {order.customerPhone}
                      </p>
                      {order.customerAddress && (
                        <p className="text-sm text-content-primary">
                          📍 {order.customerAddress}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-content-secondary mb-2">
                      Resumen del pedido
                    </h4>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-content-primary">
                        {order.items.length} producto(s)
                      </span>
                      <span className="font-bold text-primary text-lg">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Link href={`/admin/pedidos/${order.id}`}>
                      <button className="btn-primary w-full cursor-pointer">
                        Ver Detalles
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="btn-secondary disabled:opacity-50">
                Anterior
              </button>
              <span className="text-sm text-content-secondary">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="btn-secondary disabled:opacity-50">
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
