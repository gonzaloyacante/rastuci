import { withAdminAuth } from "@/lib/adminAuth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface TrackingStats {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  delayed: number;
  avgDeliveryTime: number;
}

interface TrackingData {
  id: string;
  orderId: string;
  trackingCode: string;
  status: string;
  ocaStatus?: string;
  lastUpdated: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: string;
  estimatedDelivery?: string;
  alertLevel: "none" | "warning" | "error";
  alertMessage?: string;
}

// Mapeo de estados de OCA/CA a estados internos
function mapShippingStatus(
  externalStatus: string
): "pending" | "in-transit" | "delivered" | "delayed" | "error" {
  const statusLower = externalStatus.toLowerCase();

  if (
    statusLower.includes("entregado") ||
    statusLower.includes("delivered") ||
    statusLower.includes("finalizado")
  ) {
    return "delivered";
  }

  if (
    statusLower.includes("tránsito") ||
    statusLower.includes("transito") ||
    statusLower.includes("enviado") ||
    statusLower.includes("camino")
  ) {
    return "in-transit";
  }

  if (
    statusLower.includes("demorado") ||
    statusLower.includes("retenido") ||
    statusLower.includes("problema")
  ) {
    return "delayed";
  }

  if (
    statusLower.includes("error") ||
    statusLower.includes("fallido") ||
    statusLower.includes("rechazado")
  ) {
    return "error";
  }

  return "pending";
}

// Determinar nivel de alerta basado en estado y tiempo
function determineAlertLevel(
  status: string,
  createdAt: Date,
  estimatedDelivery?: Date | null
): { level: "none" | "warning" | "error"; message?: string } {
  const now = new Date();
  const daysSinceCreation = Math.floor(
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Si está entregado, sin alerta
  if (status === "delivered") {
    return { level: "none" };
  }

  // Si hay fecha estimada y pasó
  if (estimatedDelivery && now > estimatedDelivery) {
    return {
      level: "error",
      message: `Envío retrasado. Fecha estimada: ${estimatedDelivery.toLocaleDateString("es-AR")}`,
    };
  }

  // Si lleva más de 7 días sin entregar
  if (daysSinceCreation > 7 && status !== "delivered") {
    return {
      level: "warning",
      message: `Envío en tránsito por más de 7 días`,
    };
  }

  // Si tiene error o demora
  if (status === "delayed" || status === "error") {
    return {
      level: "error",
      message: "Revisar estado del envío",
    };
  }

  return { level: "none" };
}

export const GET = withAdminAuth(async () => {
  try {
    // Obtener pedidos con envío (shippingMethod diferente de 'pickup')
    const ordersWithShipping = await prisma.order.findMany({
      where: {
        OR: [
          { caTrackingNumber: { not: null } },
          { trackingNumber: { not: null } },
        ],
      },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        customerAddress: true,
        status: true,
        shippingMethod: true,
        caTrackingNumber: true,
        trackingNumber: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limitar a últimos 100 envíos para performance
    });

    // Transformar datos a formato de tracking
    const trackings: TrackingData[] = ordersWithShipping.map((order) => {
      // Usar código CA si existe, sino el general
      const trackingCode = order.caTrackingNumber || order.trackingNumber || "";
      const mappedStatus = mapShippingStatus(order.status);
      const alertInfo = determineAlertLevel(mappedStatus, order.createdAt);

      return {
        id: order.id,
        orderId: order.id,
        trackingCode,
        status: mappedStatus,
        ocaStatus: undefined, // No disponible
        lastUpdated: order.updatedAt.toISOString(),
        customerEmail: order.customerEmail ?? "",
        customerName: order.customerName,
        shippingAddress: order.customerAddress ?? "",
        estimatedDelivery: undefined, // No tenemos este dato aún
        alertLevel: alertInfo.level,
        alertMessage: alertInfo.message,
      };
    });

    // Calcular estadísticas
    const stats: TrackingStats = {
      total: trackings.length,
      pending: trackings.filter((t) => t.status === "pending").length,
      inTransit: trackings.filter((t) => t.status === "in-transit").length,
      delivered: trackings.filter((t) => t.status === "delivered").length,
      delayed: trackings.filter(
        (t) => t.status === "delayed" || t.status === "error"
      ).length,
      avgDeliveryTime: 0, // TODO: Calcular cuando tengamos datos de entrega
    };

    // Calcular tiempo promedio de entrega si hay pedidos entregados
    const deliveredOrders = await prisma.order.findMany({
      where: {
        status: "DELIVERED",
        shippingMethod: { not: "pickup" },
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });

    if (deliveredOrders.length > 0) {
      const totalDays = deliveredOrders.reduce((sum, order) => {
        const days = Math.ceil(
          (order.updatedAt.getTime() - order.createdAt.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      stats.avgDeliveryTime = Math.round(totalDays / deliveredOrders.length);
    }

    return NextResponse.json({
      success: true,
      trackings,
      stats,
    });
  } catch (error) {
    logger.error("Error fetching tracking data", { error });
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener datos de tracking",
      },
      { status: 500 }
    );
  }
});
