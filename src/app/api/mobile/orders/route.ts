import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Tipos para OrderStatus (directos desde schema)
type OrderStatus = 'PENDING' | 'PROCESSED' | 'DELIVERED';

// Tipos para la consulta optimizada móvil
type OrderWithItems = {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  ocaTrackingNumber: string | null;
  customerAddress: string | null;
  customerPhone: string | null;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      images: string;
      price: number;
    };
  }[];
};

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface OrderWhereClause {
  customerEmail: string;
  status?: OrderStatus;
}




// GET /api/mobile/orders - Obtener pedidos para móvil
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerEmail = searchParams.get('customerEmail');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    
    if (!customerEmail) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: "Email del cliente requerido",
        data: null
      }, { status: 400 });
    }

    const skip = (page - 1) * limit;
    
    const whereClause: OrderWhereClause = {
        customerEmail,
    };
    
    if (status) {
      whereClause.status = status as OrderStatus;
    }

    // Obtener pedidos con información optimizada para móvil
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true,
          updatedAt: true,
          ocaTrackingNumber: true,
          customerAddress: true,
          customerPhone: true,
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  price: true,
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.order.count({
        where: whereClause,
      })
    ]);

    // Formatear para consumo móvil
    const mobileOrders = orders.map((order: OrderWithItems) => ({
      id: order.id,
      status: order.status,
      statusLabel: getStatusLabel(order.status),
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      trackingCode: order.ocaTrackingNumber,
      hasTracking: !!order.ocaTrackingNumber,
      shippingAddress: order.customerAddress,
      paymentMethod: order.customerPhone,
      itemsCount: order.items.length,
      firstProductImage: order.items[0]?.product?.images || null,
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.product.id,
          name: item.product.name,
          image: item.product.images,
          price: item.product.price,
        }
      }))
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json<ApiResponse<{
      orders: typeof mobileOrders;
      pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>>({
      success: true,
      message: "Pedidos obtenidos exitosamente",
      data: {
        orders: mobileOrders,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage,
        }
      }
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