import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Tipos para OrderStatus (directos desde schema)
type OrderStatus = "PENDING" | "PROCESSED" | "DELIVERED";

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
    const customerEmail = searchParams.get("customerEmail");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    if (!customerEmail) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Email del cliente requerido",
          data: null,
        },
        { status: 400 }
      );
    }

    // SECURITY FIX: Verify Session
    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Allow if admin OR if session email matches requested email
    const isAuthorized =
      session && (session.isAdmin || session.email === customerEmail);

    if (!isAuthorized) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "No autorizado para ver estos pedidos",
          data: null,
        },
        { status: 401 }
      );
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
      prisma.orders.findMany({
        where: whereClause,
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true,
          updatedAt: true,
          trackingNumber: true,
          customerAddress: true,
          customerPhone: true,
          order_items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              products: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  price: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.orders.count({
        where: whereClause,
      }),
    ]);

    // Formatear para consumo móvil
    const mobileOrders = orders.map((order) => ({
      id: order.id,
      status: order.status,
      statusLabel: getStatusLabel(order.status),
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      trackingCode: order.trackingNumber,
      hasTracking: !!order.trackingNumber,
      shippingAddress: order.customerAddress,
      paymentMethod: order.customerPhone,
      itemsCount: order.order_items.length,
      firstProductImage: order.order_items[0]?.products?.images || null,
      items: order.order_items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.products.id,
          name: item.products.name,
          image: item.products.images,
          price: item.products.price,
        },
      })),
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json<
      ApiResponse<{
        orders: typeof mobileOrders;
        pagination: {
          page: number;
          limit: number;
          totalCount: number;
          totalPages: number;
          hasNextPage: boolean;
          hasPrevPage: boolean;
        };
      }>
    >({
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
        },
      },
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
    // Estados de tracking específicos
    pending: "Pendiente",
    "in-transit": "En tránsito",
    "out-for-delivery": "En reparto",
    delivered: "Entregado",
    delayed: "Retrasado",
    error: "Error",
  };

  return statusLabels[status] || status;
}
