import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

interface OCATrackingEvent {
  fecha: string;
  hora?: string;
  descripcion?: string;
  estado?: string;
  sucursal?: string;
  localidad?: string;
}

interface OCATrackingData {
  estado?: string;
  fechaEntregaEstimada?: string;
  ultimaActualizacion?: string;
  tipoServicio?: string;
  origen?: string;
  events?: OCATrackingEvent[];
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

// Simulación de servicio OCA para tracking
async function getOCATracking(_trackingCode: string): Promise<OCATrackingData | null> {
  try {
    // Aquí iría la llamada real a OCA API
    // Por ahora retornamos datos simulados
    return {
      estado: 'EN_TRANSITO',
      fechaEntregaEstimada: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      ultimaActualizacion: new Date().toISOString(),
      tipoServicio: 'Estándar',
      origen: 'Buenos Aires',
      events: [
        {
          fecha: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          hora: '10:30',
          descripcion: 'Paquete ingresado en origen',
          estado: 'INGRESADO',
          sucursal: 'Buenos Aires Centro'
        },
        {
          fecha: new Date().toISOString(),
          hora: '14:20',
          descripcion: 'En tránsito hacia destino',
          estado: 'EN_TRANSITO',
          sucursal: 'Centro de Distribución'
        }
      ]
    };
  } catch {
    return null;
  }
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
        ocaTrackingNumber: trackingCode
      },
      select: {
        id: true,
        status: true,
        ocaTrackingNumber: true,
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

    let trackingData: MobileTrackingData;

    try {
      // Intentar obtener datos de tracking de OCA
      const ocaTracking = await getOCATracking(trackingCode);
      
      if (ocaTracking) {
        // Formatear eventos de tracking para móvil
        const events: TrackingEvent[] = ocaTracking.events?.map((event: OCATrackingEvent) => ({
          date: new Date(event.fecha).toLocaleDateString('es-AR'),
          time: event.hora || undefined,
          description: event.descripcion || 'Evento de tracking',
          location: event.sucursal || event.localidad || undefined,
          status: mapOcaStatusToInternal(event.estado || 'unknown')
        })) || [];

        trackingData = {
          orderId: order.id,
          trackingCode: trackingCode,
          currentStatus: mapOcaStatusToInternal(ocaTracking.estado || order.status),
          currentStatusLabel: getStatusLabel(mapOcaStatusToInternal(ocaTracking.estado || order.status)),
          estimatedDeliveryDate: ocaTracking.fechaEntregaEstimada ? 
            new Date(ocaTracking.fechaEntregaEstimada).toLocaleDateString('es-AR') : undefined,
          lastUpdate: new Date(ocaTracking.ultimaActualizacion || order.updatedAt).toISOString(),
          events,
          shippingInfo: {
            carrier: 'OCA',
            service: ocaTracking.tipoServicio || 'Estándar',
            from: ocaTracking.origen || undefined,
            to: order.customerAddress || undefined,
          }
        };
      } else {
        throw new Error('No tracking data from OCA');
      }

    } catch {
      // Si falla OCA, usar datos locales con eventos básicos
      const events: TrackingEvent[] = [
        {
          date: new Date(order.updatedAt).toLocaleDateString('es-AR'),
          description: `Pedido ${getStatusLabel(order.status)}`,
          status: order.status
        }
      ];

      trackingData = {
        orderId: order.id,
        trackingCode: trackingCode,
        currentStatus: order.status,
        currentStatusLabel: getStatusLabel(order.status),
        lastUpdate: order.updatedAt.toISOString(),
        events,
        shippingInfo: {
          carrier: 'OCA',
          service: 'Estándar',
          to: order.customerAddress || undefined,
        }
      };
    }

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

function mapOcaStatusToInternal(ocaStatus: string): string {
  const statusMap: Record<string, string> = {
    'INGRESADO': 'pending',
    'RECOLECTADO': 'pending',
    'EN_TRANSITO': 'in-transit',
    'EN_DISTRIBUCION': 'out-for-delivery',
    'ENTREGADO': 'delivered',
    'DEMORADO': 'delayed',
    'ERROR': 'error',
  };

  return statusMap[ocaStatus?.toUpperCase()] || 'pending';
}

function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    PROCESSED: "Procesando", 
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
    // Estados de tracking específicos
    'pending': "Pendiente",
    'in-transit': "En tránsito",
    'out-for-delivery': "En reparto",
    'delivered': "Entregado",
    'delayed': "Retrasado",
    'error': "Error",
  };

  return statusLabels[status] || status;
}