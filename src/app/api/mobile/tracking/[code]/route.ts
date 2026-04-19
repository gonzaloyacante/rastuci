import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limiter";

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
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const rl = await checkRateLimit(request, RATE_LIMITS.api);
    if (!rl.ok) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Demasiadas solicitudes", data: null },
        { status: 429 }
      );
    }

    const { code: trackingCode } = await params;
    // [C-02] Require authentication - endpoint exposes PII (customerAddress)
    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!session) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "No autorizado", data: null },
        { status: 401 }
      );
    }

    if (!trackingCode) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Código de tracking requerido",
          data: null,
        },
        { status: 400 }
      );
    }

    // Buscar la orden en la base de datos
    const order = await prisma.orders.findFirst({
      where: {
        trackingNumber: trackingCode,
      },
      select: {
        id: true,
        status: true,
        trackingNumber: true,
        caTrackingNumber: true,
        customerAddress: true,
        customerEmail: true,
        updatedAt: true,
      },
    });

    if (!order) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Código de tracking no encontrado",
          data: null,
        },
        { status: 404 }
      );
    }

    // [C-02] Verify ownership: only the order owner or an admin can see PII
    const isAuthorized =
      session.isAdmin || session.email === order.customerEmail;
    if (!isAuthorized) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "No autorizado", data: null },
        { status: 403 }
      );
    }

    // Obtener tracking desde API de Correo Argentino
    let events: TrackingEvent[] = [];

    if (order.caTrackingNumber) {
      try {
        const { correoArgentinoService } =
          await import("@/lib/correo-argentino-service");
        await correoArgentinoService.authenticate();

        const trackingData = await correoArgentinoService.getTracking({
          shippingId: order.caTrackingNumber,
        });

        if (
          trackingData.success &&
          trackingData.data &&
          !Array.isArray(trackingData.data) &&
          "events" in trackingData.data
        ) {
          // Transform events to local format
          events = trackingData.data.events.map((event) => ({
            date: new Date(event.eventDate).toLocaleDateString("es-AR"),
            time: new Date(event.eventDate).toLocaleTimeString("es-AR"),
            description: event.eventDescription,
            status: event.eventDescription,
            location: event.branchName,
          }));
        }
      } catch (error) {
        logger.error("Error fetching CA tracking:", { error });
      }
    }

    // Si no hay eventos de CA, usar datos de la orden
    if (events.length === 0) {
      events = [
        {
          date: new Date(order.updatedAt).toLocaleDateString("es-AR"),
          description: `Pedido ${getStatusLabel(order.status)}`,
          status: order.status,
          location: order.customerAddress || undefined,
        },
      ];
    }

    const trackingData: MobileTrackingData = {
      orderId: order.id,
      trackingCode: order.trackingNumber || "",
      currentStatus: order.status,
      currentStatusLabel: getStatusLabel(order.status),
      lastUpdate: order.updatedAt.toISOString(),
      events,
      shippingInfo: {
        carrier: "Correo Argentino",
        service: "Estándar",
        to: order.customerAddress || undefined,
      },
    };

    return NextResponse.json<ApiResponse<MobileTrackingData>>({
      success: true,
      message: "Tracking obtenido exitosamente",
      data: trackingData,
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Error interno del servidor",
        data: null,
      },
      { status: 500 }
    );
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
