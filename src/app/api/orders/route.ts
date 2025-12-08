import { ApiErrorCode, fail, ok } from "@/lib/apiResponse";
import { normalizeApiError } from "@/lib/errors";
import { getRequestId, logger } from "@/lib/logger";
import { mapOrderToDTO } from "@/lib/orders";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { OrderCreateSchema, OrdersQuerySchema } from "@/lib/validation/order";
import { ApiResponse, Order, PaginatedResponse } from "@/types";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// GET /api/orders - Obtener todos los pedidos con paginación
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PaginatedResponse<Order>>>> {
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
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
    });
    if (!parsedQuery.success) {
      return fail("BAD_REQUEST", "Parámetros inválidos", 400, {
        issues: parsedQuery.error.issues,
      });
    }
    const { page, limit, status, search } = parsedQuery.data;

    // Soporte para buscar por mpPaymentId (usado por página de success)
    const mpPaymentId = searchParams.get("mpPaymentId");

    // Construir filtros
    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }
    if (mpPaymentId) {
      // Búsqueda directa por payment ID de MercadoPago
      where.mpPaymentId = mpPaymentId;
    } else if (search) {
      // Buscar por nombre, email o ID exacto
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { id: search },
      ];
    }

    // Calcular offset para paginación
    const offset = (page - 1) * limit;

    // Obtener pedidos y total
    const [prismaOrders, total] = await Promise.all([
      prisma.orders.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip: limit ? offset : undefined,
        take: limit || undefined,
      }),
      prisma.orders.count({ where }),
    ]);

    type OrderType = (typeof prismaOrders)[0];
    const orders: Order[] = prismaOrders.map((order: OrderType) =>
      mapOrderToDTO(order)
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

    // Validar y calcular el total
    let total = 0;
    const validatedItems: {
      id: string;
      productId: string;
      quantity: number;
      price: number;
    }[] = [];

    for (const item of items) {
      const product = await prisma.products.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return fail(
          "BAD_REQUEST",
          `Producto con ID ${item.productId} no encontrado`,
          400
        );
      }

      if (product.stock < item.quantity) {
        return fail(
          "CONFLICT",
          `Stock insuficiente para el producto ${product.name}. Stock disponible: ${product.stock}`,
          400
        );
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      validatedItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price, // Precio al momento de la compra
      });
    }

    // Crear el pedido con transacción
    const order = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Crear el pedido
        const newOrder = await tx.orders.create({
          data: {
            id: `order-${Date.now()}-${Math.random().toString(36).substring(7)}`,
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

        // Actualizar el stock de los productos
        for (const item of validatedItems) {
          await tx.products.update({
            where: { id: item.productId },
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
