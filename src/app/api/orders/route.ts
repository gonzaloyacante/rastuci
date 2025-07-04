import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendNotification } from "@/lib/onesignal";
import { ApiResponse, Order, PaginatedResponse, OrderStatus } from "@/types";

// GET /api/orders - Obtener todos los pedidos con paginación
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PaginatedResponse<Order>>>> {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const status = searchParams.get("status") || undefined;

    // Construir filtros
    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    // Calcular offset para paginación
    const offset = (page - 1) * limit;

    // Obtener pedidos y total
    const [prismaOrders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const orders: Order[] = prismaOrders.map((order) => ({
      ...order,
      status: order.status as OrderStatus,
      customerAddress: order.customerAddress ?? undefined,
      items: order.items.map((item) => ({
        ...item,
        product: {
          ...item.product,
          description: item.product.description ?? undefined,
          category: {
            ...item.product.category,
            description: item.product.category.description ?? undefined,
          },
        },
      })),
    }));

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<Order> = {
      data: orders,
      total,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener los pedidos",
      },
      { status: 500 }
    );
  }
}

// POST /api/orders - Crear nuevo pedido
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Order>>> {
  try {
    const body = await request.json();
    const { customerName, customerPhone, customerAddress, items } = body;

    // Validaciones
    if (!customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Nombre del cliente, teléfono e items son requeridos",
        },
        { status: 400 }
      );
    }

    // Validar y calcular el total
    let total = 0;
    const validatedItems: {
      productId: string;
      quantity: number;
      price: number;
    }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            error: `Producto con ID ${item.productId} no encontrado`,
          },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Stock insuficiente para el producto ${product.name}. Stock disponible: ${product.stock}`,
          },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price, // Precio al momento de la compra
      });
    }

    // Crear el pedido con transacción
    const order = await prisma.$transaction(async (tx) => {
      // Crear el pedido
      const newOrder = await tx.order.create({
        data: {
          customerName,
          customerPhone,
          customerAddress,
          total,
          items: {
            create: validatedItems,
          },
        },
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

      // Actualizar el stock de los productos
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    const responseOrder: Order = {
      ...order,
      status: order.status as OrderStatus,
      customerAddress: order.customerAddress ?? undefined,
      items: order.items.map((item) => ({
        ...item,
        product: {
          ...item.product,
          description: item.product.description ?? undefined,
          category: {
            ...item.product.category,
            description: item.product.category.description ?? undefined,
          },
        },
      })),
    };

    // Enviar notificación push para nuevos pedidos
    try {
      await sendNotification(
        `Nuevo pedido de ${customerName} por $${total.toFixed(2)}`,
        "Nuevo Pedido Recibido"
      );
    } catch (notificationError) {
      console.error("Error sending notification:", notificationError);
      // No fallar el pedido si la notificación falla
    }

    return NextResponse.json({
      success: true,
      data: responseOrder,
      message: "Pedido creado exitosamente",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear el pedido",
      },
      { status: 500 }
    );
  }
}
