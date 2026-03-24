import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { ApiErrorCode, fail, ok } from "@/lib/apiResponse";
import { normalizeApiError } from "@/lib/errors";
import { getRequestId, logger } from "@/lib/logger";
import { mapOrderToDTO } from "@/lib/orders";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { OrderCreateSchema, OrdersQuerySchema } from "@/lib/validation/order";
import { ApiResponse, Order, PaginatedResponse } from "@/types";

function buildOrdersFilter(params: {
  status?: string;
  shippingMethod?: string;
  mpPaymentId?: string | null;
  search?: string;
}): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;
  if (params.shippingMethod) where.shippingMethod = params.shippingMethod;
  if (params.mpPaymentId) {
    where.mpPaymentId = params.mpPaymentId;
  } else if (params.search) {
    where.OR = [
      { customerName: { contains: params.search, mode: "insensitive" } },
      { customerEmail: { contains: params.search, mode: "insensitive" } },
      { id: params.search },
    ];
  }
  return where;
}

// GET /api/orders - Obtener todos los pedidos con paginación (ADMIN ONLY)
export const GET = withAdminAuth(
  async (
    request: NextRequest
  ): Promise<NextResponse<ApiResponse<PaginatedResponse<Order>>>> => {
    try {
      const _requestId = getRequestId(request.headers);
      // Rate limit per IP
      const rl = await checkRateLimit(request, {
        key: makeKey("GET", "/api/orders"),
        ...getPreset("publicRead"),
      });
      if (!rl.ok) {
        return fail("RATE_LIMITED", "Too many requests", 429);
      }
      const { searchParams } = new URL(request.url);
      const parsedQuery = OrdersQuerySchema.safeParse({
        page: searchParams.get("page") || "1",
        limit: searchParams.get("limit") || "10",
        status: searchParams.get("status") || undefined,
        search: searchParams.get("search") || undefined,
      });
      if (!parsedQuery.success) {
        return fail("BAD_REQUEST", "Parámetros inválidos", 400, {
          issues: parsedQuery.error.issues,
        });
      }
      const { page, limit, status, search } = parsedQuery.data;

      const mpPaymentId = searchParams.get("mpPaymentId");
      const shippingMethod = searchParams.get("shippingMethod");

      const where = buildOrdersFilter({
        status,
        shippingMethod,
        mpPaymentId,
        search,
      });

      // Calcular offset para paginación
      const offset = (page - 1) * limit;

      // Obtener pedidos y total
      const [prismaOrders, total] = await Promise.all([
        prisma.orders.findMany({
          where,
          select: {
            id: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            customerAddress: true,
            total: true,
            shippingCost: true, // Needed for breakdown
            status: true,
            createdAt: true,
            updatedAt: true,
            mpPaymentId: true,
            mpStatus: true,
            // Critical Shipping Data
            shippingMethod: true,
            shippingAgency: true,
            shippingStreet: true,
            shippingCity: true,
            shippingProvince: true,
            shippingPostalCode: true,
            caTrackingNumber: true,
            order_items: {
              select: {
                id: true,
                orderId: true, // Required by mapOrderToDTO
                quantity: true,
                price: true,
                productId: true,
                color: true,
                size: true,
                products: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                    categories: {
                      select: {
                        id: true,
                        name: true,
                        description: true, // Required by type
                        imageUrl: true, // Required by type
                        icon: true, // Required by type
                        createdAt: true, // Required by type
                        updatedAt: true, // Required by type
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: limit ? offset : undefined,
          take: limit || undefined,
        }),
        prisma.orders.count({ where }),
      ]);

      type OrderType = (typeof prismaOrders)[0];
      // Cast to any because we are purposefully selecting a subset of fields
      // that satisfies the public Order DTO but not the full strict Prisma type
      const orders: Order[] = prismaOrders.map((order: OrderType) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mapOrderToDTO(order as unknown as any)
      );

      const totalPages = Math.ceil(total / limit);

      const response: PaginatedResponse<Order> = {
        data: orders,
        total,
        page,
        limit,
        totalPages,
      };

      return ok(response);
    } catch (error) {
      const _requestId = getRequestId(request.headers);
      logger.error("Error fetching orders", {
        requestId: _requestId,
        error: String(error),
      });
      const e = normalizeApiError(
        error,
        "INTERNAL_ERROR",
        "Error al obtener los pedidos",
        500
      );
      return fail(e.code as ApiErrorCode, e.message, e.status, {
        requestId: _requestId,
        ...(e.details as Record<string, unknown>),
      });
    }
  }
);

type ValidatedOrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
};
type OrderItemInput = {
  productId: string;
  quantity: number;
  color?: string;
  size?: string;
};

async function validateAndPriceItems(
  items: OrderItemInput[]
): Promise<
  | { validatedItems: ValidatedOrderItem[]; total: number }
  | { error: string; status: number; code: string }
> {
  let total = 0;
  const validatedItems: ValidatedOrderItem[] = [];

  for (const item of items) {
    const product = await prisma.products.findUnique({
      where: { id: item.productId },
      include: { product_variants: true },
    });
    if (!product) {
      return {
        error: `Producto con ID ${item.productId} no encontrado`,
        status: 400,
        code: "BAD_REQUEST",
      };
    }
    const variant =
      item.color && item.size
        ? product.product_variants.find(
            (v) => v.color === item.color && v.size === item.size
          )
        : undefined;
    const availableStock = variant?.stock ?? product.stock;
    if (availableStock < item.quantity) {
      return {
        error: `Stock insuficiente para el producto ${product.name}. Stock disponible: ${availableStock}`,
        status: 400,
        code: "CONFLICT",
      };
    }
    total += Number(product.price) * item.quantity;
    validatedItems.push({
      id: `item-${nanoid()}`,
      productId: item.productId,
      quantity: item.quantity,
      price: Number(product.price),
    });
  }
  return { validatedItems, total };
}

// POST /api/orders - Crear nuevo pedido
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Order>>> {
  try {
    const _requestId = getRequestId(request.headers);
    // Rate limit per IP for creating orders
    const rl = await checkRateLimit(request, {
      key: makeKey("POST", "/api/orders"),
      ...getPreset("mutatingLow"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429);
    }
    const json = await request.json();
    const parsed = OrderCreateSchema.safeParse(json);
    if (!parsed.success) {
      return fail("BAD_REQUEST", "Body inválido", 400, {
        issues: parsed.error.issues,
      });
    }
    const { customerName, customerPhone, customerAddress, items } = parsed.data;

    const itemsResult = await validateAndPriceItems(items);
    if ("error" in itemsResult) {
      return fail(
        itemsResult.code as ApiErrorCode,
        itemsResult.error,
        itemsResult.status
      );
    }
    const { validatedItems, total } = itemsResult;

    // Crear el pedido con transacción
    const order = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Crear el pedido
        // Crear el pedido
        const newOrder = await tx.orders.create({
          data: {
            id: `ord_${nanoid(10)}`,
            customerName,
            customerPhone,
            customerAddress,
            total,
            updatedAt: new Date(),
            order_items: {
              create: validatedItems,
            },
          },
          include: {
            order_items: {
              include: {
                products: {
                  include: {
                    categories: true,
                  },
                },
              },
            },
          },
        });

        // Actualizar el stock de los productos (with gte guard to prevent race condition)
        for (const item of validatedItems) {
          await tx.products.update({
            where: {
              id: item.productId,
              stock: { gte: item.quantity },
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        return newOrder;
      }
    );

    const responseOrder: Order = mapOrderToDTO(order);

    // Push notifications disabled - admin gets email notifications instead
    logger.info("Order created", {
      orderId: order.id,
      customerName,
      total,
    });

    return ok(responseOrder, "Pedido creado exitosamente");
  } catch (error) {
    const _requestId = getRequestId(request.headers);
    logger.error("Error creating order", {
      requestId: _requestId,
      error: String(error),
    });
    const e = normalizeApiError(
      error,
      "INTERNAL_ERROR",
      "Error al crear el pedido",
      500
    );
    return fail(e.code as ApiErrorCode, e.message, e.status, {
      requestId: _requestId,
      ...(e.details as Record<string, unknown>),
    });
  }
}
