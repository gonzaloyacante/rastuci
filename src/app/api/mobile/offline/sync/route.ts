/**
 * Mobile Offline Sync API
 *
 * Sincroniza datos para modo offline usando Prisma.
 */

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// GET /api/mobile/offline/sync - Sincronizar datos para modo offline
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerEmail = searchParams.get("customerEmail");

    if (!customerEmail) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Email del cliente requerido", data: null },
        { status: 400 }
      );
    }

    // SECURITY: Auth Check
    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const isAuthorized =
      session && (session.isAdmin || session.email === customerEmail);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    // Buscar pedidos del cliente desde la base de datos
    const orders = await prisma.orders.findMany({
      where: {
        customerEmail: customerEmail,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        order_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    });

    // Formatear datos para offline
    const offlineData = {
      orders: orders.map((order) => ({
        id: order.id,
        status: order.status,
        total: Number(order.total),
        createdAt: order.createdAt.toISOString(),
        trackingCode:
          order.caTrackingNumber || order.trackingNumber || undefined,
        items: order.order_items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          product: {
            id: item.products.id,
            name: item.products.name,
            price: Number(item.products.price),
            image: item.products.images?.[0] || undefined,
          },
        })),
      })),
      trackingCodes: orders
        .filter((o) => o.caTrackingNumber || o.trackingNumber)
        .map((o) => ({
          code: o.caTrackingNumber || o.trackingNumber!,
          orderId: o.id,
          lastKnownStatus: o.status || "PENDING",
          lastUpdate: o.updatedAt.toISOString(),
        })),
      cachedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json<ApiResponse<typeof offlineData>>({
      success: true,
      message: "Datos offline obtenidos exitosamente",
      data: offlineData,
    });
  } catch (error) {
    console.error("Error en offline sync:", error);
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

// POST /api/mobile/offline/sync - Enviar datos offline al servidor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerEmail } = body;

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

    // Por ahora solo confirmamos la sincronización
    // Las acciones pendientes como favoritos/carrito
    // se pueden implementar cuando existan esas tablas

    return NextResponse.json<
      ApiResponse<{
        processed: number;
        failed: number;
        errors: string[];
      }>
    >({
      success: true,
      message: "Sincronización completada",
      data: {
        processed: 0,
        failed: 0,
        errors: [],
      },
    });
  } catch (error) {
    console.error("Error en offline sync POST:", error);
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
