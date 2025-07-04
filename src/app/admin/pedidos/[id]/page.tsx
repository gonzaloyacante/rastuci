"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, CheckCircle, Printer, Truck, Package } from "lucide-react";
import toast from "react-hot-toast";

// Componente Badge interno para evitar problemas de importación
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Badge = ({ className, children, ...props }: BadgeProps) => {
  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        className || ""
      }`}
      {...props}>
      {children}
    </div>
  );
};

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images?: string | string[];
    description?: string;
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

const statusInfo = {
  PENDING: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800",
  },
  PROCESSED: {
    label: "Procesado",
    color: "bg-blue-100 text-blue-800",
  },
  DELIVERED: {
    label: "Entregado",
    color: "bg-green-100 text-green-800",
  },
};

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const orderId = params.id as string;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${orderId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Pedido no encontrado");
          } else {
            throw new Error("Error al cargar el pedido");
          }
          return;
        }

        const data = await response.json();

        if (data.success) {
          // Formatear imágenes de productos si es necesario
          const formattedOrder = {
            ...data.data,
            items: data.data.items.map((item: OrderItem) => ({
              ...item,
              product: {
                ...item.product,
                images:
                  typeof item.product.images === "string"
                    ? JSON.parse(item.product.images)
                    : item.product.images,
              },
            })),
          };
          setOrder(formattedOrder);
        } else {
          setError(data.error || "No se pudo cargar el pedido");
        }
      } catch (err) {
        console.error(err);
        setError("Ocurrió un error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const updateOrderStatus = async (
    newStatus: "PENDING" | "PROCESSED" | "DELIVERED"
  ) => {
    try {
      setUpdating(true);
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

      const data = await response.json();

      if (data.success) {
        setOrder({
          ...order!,
          status: newStatus,
        });
        toast.success(`Pedido actualizado a ${statusInfo[newStatus].label}`);
      } else {
        throw new Error(data.error || "Error al actualizar el pedido");
      }
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
      toast.error("No se pudo actualizar el estado del pedido");
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("es-CO")}`;
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

  const getProductImage = (item: OrderItem) => {
    if (!item.product.images)
      return "https://placehold.co/100x100/E91E63/FFFFFF?text=No+imagen";

    if (Array.isArray(item.product.images) && item.product.images.length > 0) {
      return item.product.images[0];
    }

    return "https://placehold.co/100x100/E91E63/FFFFFF?text=No+imagen";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E63]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 text-2xl mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          {error}
        </div>
        <Link href="/admin/pedidos/pendientes">
          <Button className="bg-[#E91E63] hover:bg-[#C2185B]">
            Volver a Pedidos Pendientes
          </Button>
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-500 text-2xl mb-4">Pedido no encontrado</div>
        <Link href="/admin/pedidos/pendientes">
          <Button className="bg-[#E91E63] hover:bg-[#C2185B]">
            Volver a Pedidos Pendientes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/admin/pedidos/pendientes"
            className="inline-flex items-center text-gray-600 hover:text-[#E91E63] mb-2">
            <ArrowLeft size={16} className="mr-2" />
            Volver a Pedidos Pendientes
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Detalles del Pedido #{order.id.substring(0, 8)}
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="hidden sm:flex items-center gap-2">
          <Printer size={16} />
          Imprimir
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información general del pedido */}
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Información General</CardTitle>
                <Badge className={statusInfo[order.status].color}>
                  {statusInfo[order.status].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    ID del Pedido
                  </h3>
                  <p className="text-sm font-mono">{order.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Fecha del Pedido
                  </h3>
                  <p className="text-sm">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total</h3>
                  <p className="text-lg font-bold text-[#E91E63]">
                    {formatCurrency(order.total)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Última Actualización
                  </h3>
                  <p className="text-sm">{formatDate(order.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Productos */}
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg">
                Productos ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="p-4 flex items-center gap-4">
                    <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
                      <Image
                        src={getProductImage(item)}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <Link
                        href={`/admin/productos/editar/${item.product.id}`}
                        className="font-medium text-gray-900 hover:text-[#E91E63]">
                        {item.product.name}
                      </Link>
                      <div className="text-sm text-gray-500">
                        Categoría: {item.product.category.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.quantity} x {formatCurrency(item.price)}
                      </div>
                    </div>
                    <div className="text-right font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 flex justify-between items-center border-t">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-[#E91E63]">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Información del cliente */}
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
                  <p className="text-sm">{order.customerName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Teléfono
                  </h3>
                  <p className="text-sm">{order.customerPhone}</p>
                </div>
                {order.customerAddress && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Dirección
                    </h3>
                    <p className="text-sm">{order.customerAddress}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {order.status === "PENDING" && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                    onClick={() => updateOrderStatus("PROCESSED")}
                    disabled={updating}>
                    {updating ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                    ) : (
                      <Package size={16} />
                    )}
                    Marcar como Procesado
                  </Button>
                )}
                {order.status === "PROCESSED" && (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                    onClick={() => updateOrderStatus("DELIVERED")}
                    disabled={updating}>
                    {updating ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                    ) : (
                      <Truck size={16} />
                    )}
                    Marcar como Entregado
                  </Button>
                )}
                {order.status === "DELIVERED" && (
                  <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center justify-center gap-2">
                    <CheckCircle size={16} />
                    Pedido completado
                  </div>
                )}
                {order.status !== "PENDING" && order.status !== "DELIVERED" && (
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => updateOrderStatus("PENDING")}
                    disabled={updating}>
                    Volver a marcar como Pendiente
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
