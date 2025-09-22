import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ApiResponse, Order, OrderStatus } from "@/types";
import { Prisma } from "@prisma/client";
import { checkRateLimit } from "@/lib/rateLimiter";
import { sendOrderStatusEmail } from "@/lib/email";
import { mapOrderToDTO, updateOrderStatus } from "@/lib/orders";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { OrderStatusUpdateSchema } from "@/lib/validation/order";
import { ok, fail, ApiErrorCode } from "@/lib/apiResponse";
import { normalizeApiError } from "@/lib/errors";
import { logger, getRequestId } from "@/lib/logger";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

type _OrderItemWithProduct = {
  id: string;
  productId: string;
  orderId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    images: string | string[];
    categoryId: string;
    createdAt: Date;
    updatedAt: Date;
    category: {
      id: string;
      name: string;
      description: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
  };
};

// GET /api/orders/[id] - Obtener pedido por ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Order>>> {
  try {
    const _requestId = getRequestId(request.headers);
    const rl = checkRateLimit(request, {
      key: makeKey("GET", "/api/orders/[id]"),
      ...getPreset("publicReadHeavy"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429);
    }
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return fail("NOT_FOUND", "Pedido no encontrado", 404);
    }

    const responseOrder: Order = mapOrderToDTO(order);

    return ok(responseOrder);
  } catch (error) {
    const _requestId = getRequestId(request.headers);
    logger.error("Error fetching order", { requestId: _requestId, error: String(error) });
    const e = normalizeApiError(error, "INTERNAL_ERROR", "Error al obtener el pedido", 500);
    return fail(e.code as ApiErrorCode, e.message, e.status, { requestId: _requestId, ...(e.details as Record<string, unknown>) });
  }
}

// PATCH /api/orders/[id] - Actualizar estado del pedido (equivalente a PUT)
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Order>>> {
  try {
    const _requestId = getRequestId(request.headers);
    const rl = checkRateLimit(request, {
      key: makeKey("PATCH", "/api/orders/[id]"),
      ...getPreset("mutatingMedium"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429);
    }
    const { id } = await params;
    const json = await request.json();
    const parsed = OrderStatusUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return fail("BAD_REQUEST", "Estado inválido. Debe ser: PENDING, PROCESSED o DELIVERED", 400, { issues: parsed.error.issues });
    }
    const { status } = parsed.data;

    const order = await updateOrderStatus(id, status as OrderStatus);

    // Fire-and-forget email notification (do not block response)
    void sendOrderStatusEmail({
      to: (order as unknown as Record<string, unknown>).customerEmail as string ?? null,
      orderId: order.id,
      status: order.status,
      customerName: order.customerName ?? null,
    });

    const responseOrder: Order = mapOrderToDTO(order);

    return ok(responseOrder, "Estado del pedido actualizado exitosamente");
  } catch (error) {
    const _requestId = getRequestId(request.headers);
    logger.error("Error updating order status (PATCH)", { requestId: _requestId, error: String(error) });
    const e = normalizeApiError(error, "INTERNAL_ERROR", "Error al actualizar el estado del pedido", 500);
    return fail(e.code as ApiErrorCode, e.message, e.status, { requestId: _requestId, ...(e.details as Record<string, unknown>) });
  }
}

// PUT /api/orders/[id] - Actualizar estado del pedido
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Order>>> {
  try {
    const _requestId = getRequestId(request.headers);
    const rl = checkRateLimit(request, {
      key: makeKey("PUT", "/api/orders/[id]"),
      ...getPreset("mutatingMedium"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429);
    }
    const { id } = await params;
    const json = await request.json();
    const parsed = OrderStatusUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return fail("BAD_REQUEST", "Estado inválido. Debe ser: PENDING, PROCESSED o DELIVERED", 400, { issues: parsed.error.issues });
    }
    const { status } = parsed.data;

    const order = await updateOrderStatus(id, status as OrderStatus);

    // Fire-and-forget email notification (do not block response)
    void sendOrderStatusEmail({
      to: (order as unknown as Record<string, unknown>).customerEmail as string ?? null,
      orderId: order.id,
      status: order.status,
      customerName: order.customerName ?? null,
    });

    const responseOrder: Order = mapOrderToDTO(order);

    return ok(responseOrder, "Estado del pedido actualizado exitosamente");
  } catch (error) {
    const _requestId = getRequestId(request.headers);
    logger.error("Error updating order status (PUT)", { requestId: _requestId, error: String(error) });
    const e = normalizeApiError(error, "INTERNAL_ERROR", "Error al actualizar el estado del pedido", 500);
    return fail(e.code as ApiErrorCode, e.message, e.status, { requestId: _requestId, ...(e.details as Record<string, unknown>) });
  }
}

// DELETE /api/orders/[id] - Cancelar/eliminar pedido
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const _requestId = getRequestId(request.headers);
    const rl = checkRateLimit(request, {
      key: makeKey("DELETE", "/api/orders/[id]"),
      ...getPreset("mutatingLow"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429);
    }
    const { id } = await params;

    // Obtener el pedido con sus items para restaurar el stock si es necesario
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return fail("NOT_FOUND", "Pedido no encontrado", 404);
    }

    // Solo permitir cancelar pedidos pendientes
    if (order.status !== "PENDING") {
      return fail("BAD_REQUEST", "Solo se pueden cancelar pedidos con estado PENDING", 400);
    }

    // Eliminar el pedido y restaurar stock en transacción
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Restaurar el stock de los productos
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Eliminar el pedido (los items se eliminan en cascada)
      await tx.order.delete({
        where: { id },
      });
    });

    return ok(null, "Pedido cancelado exitosamente");
  } catch (error) {
    const _requestId = getRequestId(request.headers);
    logger.error("Error canceling order", { requestId: _requestId, error: String(error) });
    const e = normalizeApiError(error, "INTERNAL_ERROR", "Error al cancelar el pedido", 500);
    return fail(e.code as ApiErrorCode, e.message, e.status, { requestId: _requestId, ...(e.details as Record<string, unknown>) });
  }
}
