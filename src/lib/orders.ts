import type { Order as PrismaOrder } from "@prisma/client";
import type { Order, OrderStatus } from "@/types";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

// Map a Prisma order (with nested items->product->category) to the API Order DTO
export function mapOrderToDTO(order: any): Order {
  return {
    ...order,
    customerAddress: order.customerAddress ?? undefined,
    status: order.status as OrderStatus,
    items: order.items.map((item: any) => ({
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
}

// Update order status and return fully-hydrated order including items->product->category
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
) {
  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      items: {
        include: {
          product: { include: { category: true } },
        },
      },
    },
  });
  return order;
}
