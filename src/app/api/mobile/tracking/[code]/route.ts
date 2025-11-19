import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface TrackingEvent {
  date: string;
  time?: string;
  description: string;
  location?: string;
  status: string;
}

interface MobileTrackingData {
  orderId: string;
  trackingCode: string;
  currentStatus: string;
  currentStatusLabel: string;
  estimatedDeliveryDate?: string;
  lastUpdate: string;
  events: TrackingEvent[];
  shippingInfo: {
    carrier: string;
    service: string;
    from?: string;
    to?: string;
  };
}

// GET /api/mobile/tracking/[code] - Obtener tracking para móvil
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const trackingCode = params.code;

    if (!trackingCode) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: "Código de tracking requerido",
        data: null
      }, { status: 400 });
    }

    // Buscar la orden en la base de datos
    const order = await prisma.order.findFirst({
      where: {
        trackingNumber: trackingCode
      },
      select: {
        id: true,
        status: true,
        trackingNumber: true,
        customerAddress: true,
        updatedAt: true,
      }
    });

    if (!order) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: "Código de tracking no encontrado",
        data: null
      }, { status: 404 });
    }

    // TODO: Obtener tracking desde API de Correo Argentino
    const events: TrackingEvent[] = [
      {
        date: new Date(order.updatedAt).toLocaleDateString('es-AR'),
        description: `Pedido ${getStatusLabel(order.status)}`,
        status: order.status,
        location: order.customerAddress || undefined,
      }
    ];

    const trackingData: MobileTrackingData = {
      orderId: order.id,
      trackingCode: order.trackingNumber || '',
      currentStatus: order.status,
      currentStatusLabel: getStatusLabel(order.status),
      lastUpdate: order.updatedAt.toISOString(),
      events,
      shippingInfo: {
        carrier: 'Correo Argentino',
        service: 'Estándar',
        to: order.customerAddress || undefined,
      }
    };

    return NextResponse.json<ApiResponse<MobileTrackingData>>({
      success: true,
      message: "Tracking obtenido exitosamente",
      data: trackingData
    });

  } catch {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}

function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    PROCESSED: "Procesando",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
  };

  return statusLabels[status] || status;
}
