"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
  };
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  total: number;
  status: "PENDING" | "PROCESSED" | "DELIVERED";
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/orders?status=PENDING");

        if (!response.ok) {
          throw new Error("Error al cargar pedidos");
        }

        const data = await response.json();
        setOrders(data.data?.data || []);
      } catch (error) {
        console.error("Error al cargar pedidos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar pedido");
      }

      // Actualizar la lista local de pedidos
      setOrders(orders.filter((order) => order.id !== orderId));
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
    }
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("es-CO")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Pedidos Pendientes</h1>
        <p className="muted">
          Gestiona los pedidos que necesitan ser procesados
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="surface-secondary border-b border-muted">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {order.customerName}
                  </CardTitle>
                  <span className="badge-warning text-xs">Pendiente</span>
                </div>
                <div className="text-sm muted mt-1">
                  {formatDate(order.createdAt)}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium muted">
                      Información de contacto
                    </h3>
                    <p className="text-sm">{order.customerPhone}</p>
                    {order.customerAddress && (
                      <p className="text-sm">{order.customerAddress}</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium muted">
                      Productos
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {order.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex justify-between text-sm">
                          <span>
                            {item.quantity} x {item.product.name}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-muted">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-primary">
                      {formatCurrency(order.total)}
                    </span>
                  </div>

                  <div className="flex space-x-3 pt-3">
                    <Button
                      className="flex-1"
                      onClick={() => updateOrderStatus(order.id, "PROCESSED")}>
                      Marcar como Procesado
                    </Button>
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="flex-1">
                      <Button variant="outline" className="w-full">
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
              className="h-12 w-12 muted mb-4"
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
            <h2 className="text-xl font-medium text-primary mb-2">
              No hay pedidos pendientes
            </h2>
            <p className="muted mb-6 text-center max-w-md">
              Todos los pedidos han sido procesados. ¡Buen trabajo!
            </p>
            <Link href="/admin/pedidos">
              <Button variant="outline">Ver todos los pedidos</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
