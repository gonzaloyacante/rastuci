"use client";

import { DetailViewSkeleton } from "@/components/admin/skeletons";
import { Button } from "@/components/ui/Button";
import { CustomerInfoCard } from "@/components/admin/orders/CustomerInfoCard";
import { OrderActionsCard } from "@/components/admin/orders/OrderActionsCard";
import { OrderSummaryCard } from "@/components/admin/orders/OrderSummaryCard";
import { ShipmentControlCard } from "@/components/admin/orders/ShipmentControlCard";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// Types (should ideally be shared)
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images?: string | string[];
    description?: string;
    categories: {
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
  customerEmail?: string;
  total: number;
  status: "PENDING" | "PENDING_PAYMENT" | "PROCESSED" | "DELIVERED";
  paymentStatus?: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  // Campos Correo Argentino
  caTrackingNumber?: string;
  caShipmentId?: string;
  caExtOrderId?: string;
  shippingMethod?: string;
  shippingStreet?: string;
  shippingNumber?: string;
  shippingFloor?: string;
  shippingApartment?: string;
  shippingCity?: string;
  shippingProvince?: string;
  shippingPostalCode?: string;
  shippingAgency?: string;
  caImportStatus?: string | null;
  caImportError?: string | null;
}

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      } catch {
        setError("Ocurrió un error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleOrderUpdate = (updates: Partial<Order>) => {
    if (order) {
      setOrder({ ...order, ...updates });
    }
  };

  if (loading) {
    return <DetailViewSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-error text-2xl mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
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
          <Button className="btn-hero">Volver a Pedidos Pendientes</Button>
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="muted text-2xl mb-4">Pedido no encontrado</div>
        <Link href="/admin/pedidos/pendientes">
          <Button className="btn-hero">Volver a Pedidos Pendientes</Button>
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
            className="inline-flex items-center muted hover:text-primary mb-2"
          >
            <ArrowLeft size={16} className="mr-2" />
            Volver a Pedidos Pendientes
          </Link>
          <h1 className="text-2xl font-bold text-primary">
            Detalles del Pedido #{order.id.substring(0, 8)}
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="hidden sm:flex items-center gap-2"
        >
          <Printer size={16} />
          Imprimir
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          <OrderSummaryCard order={order} />
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          <CustomerInfoCard order={order} />
          <ShipmentControlCard
            order={order}
            onOrderUpdate={handleOrderUpdate}
          />
          <OrderActionsCard order={order} onOrderUpdate={handleOrderUpdate} />
        </div>
      </div>
    </div>
  );
}
