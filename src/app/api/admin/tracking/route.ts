import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ocaService } from '@/lib/oca-service';
import { withAdminAuth } from '@/lib/adminAuth';

const _TrackingStatsSchema = z.object({
  total: z.number(),
  pending: z.number(),
  inTransit: z.number(),
  delivered: z.number(),
  delayed: z.number(),
  avgDeliveryTime: z.number()
});

const _TrackingDataSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  trackingNumber: z.string(),
  status: z.string(),
  ocaStatus: z.string().optional(),
  lastUpdated: z.string(),
  customerEmail: z.string(),
  customerName: z.string(),
  shippingAddress: z.string(),
  estimatedDelivery: z.string().optional(),
  alertLevel: z.enum(['none', 'warning', 'error']),
  alertMessage: z.string().optional()
});

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface OrderWithDates {
  id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  ocaTrackingNumber: string | null;
  customerEmail: string | null;
  customerName: string | null;
  customerAddress: string | null;
}

function calculateAlertLevel(order: OrderWithDates): { alertLevel: 'none' | 'warning' | 'error'; alertMessage?: string } {
  if (!order.createdAt) {
    return { alertLevel: 'none' };
  }

  const daysSinceOrder = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  
  // Reglas de alertas
  if (daysSinceOrder > 10 && order.status !== 'delivered') {
    return { 
      alertLevel: 'error', 
      alertMessage: `Envío retrasado - ${daysSinceOrder} días sin actualización` 
    };
  }
  
  if (daysSinceOrder > 7 && order.status !== 'delivered') {
    return { 
      alertLevel: 'warning', 
      alertMessage: `Posible retraso - ${daysSinceOrder} días desde el pedido` 
    };
  }

  return { alertLevel: 'none' };
}

async function getTrackingStats() {
  const orders = await prisma.order.findMany({
    where: {
      ocaTrackingNumber: { not: null }
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      ocaTrackingNumber: true
    }
  });

  const total = orders.length;
  const pending = orders.filter((o: OrderWithDates) => o.status === 'PENDING').length;
  const inTransit = orders.filter((o: OrderWithDates) => o.status === 'PROCESSED').length;
  const delivered = orders.filter((o: OrderWithDates) => o.status === 'DELIVERED').length;
  
  // Calcular envíos retrasados (más de 10 días sin entregar)
  const delayed = orders.filter((o: OrderWithDates) => {
    if (o.status === 'delivered' || o.status === 'completed') {
      return false;
    }
    const daysSince = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince > 10;
  }).length;

  // Calcular tiempo promedio de entrega para órdenes completadas
  const deliveredOrders = orders.filter((o: OrderWithDates) => o.status === 'DELIVERED');
  const avgDeliveryTime = deliveredOrders.length > 0 
    ? Math.floor(deliveredOrders.reduce((acc: number, order: OrderWithDates) => {
        const days = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        return acc + days;
      }, 0) / deliveredOrders.length)
    : 0;

  return {
    total,
    pending,
    inTransit,
    delivered,
    delayed,
    avgDeliveryTime
  };
}

async function getTrackingData() {
  const orders = await prisma.order.findMany({
    where: {
      ocaTrackingNumber: { not: null }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const trackingData = await Promise.all(
    orders.map(async (order: OrderWithDates) => {
      const alert = calculateAlertLevel(order);
      
      // Intentar obtener estado de OCA si no está disponible localmente
      let ocaStatus = undefined;
      if (order.ocaTrackingNumber) {
        try {
          const ocaData = await ocaService.obtenerTracking(order.ocaTrackingNumber);
          if (ocaData.estadoActual?.estado) {
            ocaStatus = ocaData.estadoActual.estado;
          }
        } catch {
          // Ignorar errores de OCA
        }
      }

      return {
        id: order.id,
        orderId: order.id,
        trackingNumber: order.ocaTrackingNumber || '',
        status: order.status,
        ocaStatus,
        lastUpdated: order.updatedAt.toISOString(),
        customerEmail: order.customerEmail || '',
        customerName: order.customerName || '',
        shippingAddress: order.customerAddress || '',
        estimatedDelivery: undefined, // Se puede calcular basado en fecha de envío + tiempo estimado
        alertLevel: alert.alertLevel,
        alertMessage: alert.alertMessage
      };
    })
  );

  return trackingData;
}

export const GET = withAdminAuth(async (_request: NextRequest): Promise<NextResponse> => {
  try {
    const [stats, trackings] = await Promise.all([
      getTrackingStats(),
      getTrackingData()
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        stats,
        trackings
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    };

    return NextResponse.json(response, { status: 500 });
  }
});

export const POST = withAdminAuth(async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'refresh') {
      // Actualizar todos los tracking codes con OCA
      const orders = await prisma.order.findMany({
        where: {
          ocaTrackingNumber: { not: null }
        }
      });

      let updatedCount = 0;
      
      for (const order of orders) {
        if (order.ocaTrackingNumber) {
          try {
            const ocaData = await ocaService.obtenerTracking(order.ocaTrackingNumber);
            if (ocaData.estadoActual?.estado) {
              // Mapear estado de OCA a estado local
              let newStatus = order.status;
              const ocaEstado = ocaData.estadoActual.estado.toLowerCase();
              
              if (ocaEstado.includes('entregado')) {
                newStatus = 'DELIVERED';
              } else if (ocaEstado.includes('transito') || ocaEstado.includes('distribución')) {
                newStatus = 'PROCESSED';
              }

              if (newStatus !== order.status) {
                await prisma.order.update({
                  where: { id: order.id },
                  data: { status: newStatus }
                });
                updatedCount++;
              }
            }
          } catch {
            // Ignorar errores individuales
            continue;
          }
        }
      }

      const response: ApiResponse = {
        success: true,
        data: { updatedCount }
      };

      return NextResponse.json(response);
    }

    const response: ApiResponse = {
      success: false,
      error: 'Acción no válida'
    };

    return NextResponse.json(response, { status: 400 });
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    };

    return NextResponse.json(response, { status: 500 });
  }
});