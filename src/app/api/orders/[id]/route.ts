import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ApiResponse, Order, OrderStatus } from "@/types";
import { Prisma } from "@prisma/client";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

type OrderItemWithProduct = {
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
      return NextResponse.json(
        {
          success: false,
          error: "Pedido no encontrado",
        },
        { status: 404 }
      );
    }

    const responseOrder: Order = {
      ...order,
      customerAddress: order.customerAddress ?? undefined,
      status: order.status as OrderStatus,
      items: order.items.map((item: OrderItemWithProduct) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        orderId: item.orderId,
        productId: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description ?? undefined,
          price: item.product.price,
          stock: item.product.stock,
          images:
            typeof item.product.images === "string"
              ? JSON.parse(item.product.images)
              : item.product.images,
          categoryId: item.product.categoryId,
          createdAt: item.product.createdAt,
          updatedAt: item.product.updatedAt,
          category: {
            id: item.product.category.id,
            name: item.product.category.name,
            description: item.product.category.description ?? undefined,
            createdAt: item.product.category.createdAt,
            updatedAt: item.product.category.updatedAt,
          },
        },
      })),
    };

    return NextResponse.json({
      success: true,
      data: responseOrder,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener el pedido",
      },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Actualizar estado del pedido
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Order>>> {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Validar estado
    const validStatuses = ["PENDING", "PROCESSED", "DELIVERED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Estado inválido. Debe ser: PENDING, PROCESSED o DELIVERED",
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
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

    const responseOrder: Order = {
      ...order,
      customerAddress: order.customerAddress ?? undefined,
      status: order.status as OrderStatus,
      items: order.items.map((item: OrderItemWithProduct) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        orderId: item.orderId,
        productId: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description ?? undefined,
          price: item.product.price,
          stock: item.product.stock,
          images:
            typeof item.product.images === "string"
              ? JSON.parse(item.product.images)
              : item.product.images,
          categoryId: item.product.categoryId,
          createdAt: item.product.createdAt,
          updatedAt: item.product.updatedAt,
          category: {
            id: item.product.category.id,
            name: item.product.category.name,
            description: item.product.category.description ?? undefined,
            createdAt: item.product.category.createdAt,
            updatedAt: item.product.category.updatedAt,
          },
        },
      })),
    };

    return NextResponse.json({
      success: true,
      data: responseOrder,
      message: "Estado del pedido actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar el estado del pedido",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - Cancelar/eliminar pedido
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { id } = await params;

    // Obtener el pedido con sus items para restaurar el stock si es necesario
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Pedido no encontrado",
        },
        { status: 404 }
      );
    }

    // Solo permitir cancelar pedidos pendientes
    if (order.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          error: "Solo se pueden cancelar pedidos con estado PENDING",
        },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      message: "Pedido cancelado exitosamente",
    });
  } catch (error) {
    console.error("Error canceling order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al cancelar el pedido",
      },
      { status: 500 }
    );
  }
}
