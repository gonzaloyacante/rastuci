import type { Order, OrderStatus } from "@/types";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

// Define the type for the order with nested relations
type OrderWithItems = Prisma.ordersGetPayload<{
  include: {
    order_items: {
      include: {
        products: {
          include: {
            categories: true;
          };
        };
      };
    };
  };
}>;

type OrderItem = OrderWithItems["order_items"][0];

// Map a Prisma order (with nested items->product->category) to the API Order DTO
export function mapOrderToDTO(order: OrderWithItems): Order {
  return {
    ...order,
    // Convert Decimal to number for API compatibility
    total: Number(order.total),
    shippingCost: order.shippingCost ? Number(order.shippingCost) : undefined,
    customerAddress: order.customerAddress ?? undefined,
    customerEmail: order.customerEmail ?? undefined,
    // Map shipping location to customer fields for Admin UI display
    customerCity: order.shippingCity ?? undefined,
    customerProvince: order.shippingProvince ?? undefined,
    customerPostalCode: order.shippingPostalCode ?? undefined,
    status: order.status as OrderStatus,
    paymentMethod: order.mpPaymentId ? "mercadopago" : "cash",
    items: order.order_items.map((item: OrderItem) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price), // Convert Decimal to number
      orderId: item.orderId,
      productId: item.productId,
      // CRITICAL: Include color and size from order_items
      color: item.color ?? undefined,
      size: item.size ?? undefined,
      product: {
        id: item.products.id,
        name: item.products.name,
        description: item.products.description ?? undefined,
        price: Number(item.products.price), // Convert Decimal to number
        stock: item.products.stock,
        images:
          typeof item.products.images === "string"
            ? JSON.parse(item.products.images)
            : item.products.images,
        categoryId: item.products.categoryId,
        createdAt: item.products.createdAt,
        updatedAt: item.products.updatedAt,
        categories: {
          id: item.products.categories.id,
          name: item.products.categories.name,
          description: item.products.categories.description ?? undefined,
          createdAt: item.products.categories.createdAt,
          updatedAt: item.products.categories.updatedAt,
        },
      },
    })),
  };
}

// Update order status and return fully-hydrated order including items->product->category
export async function updateOrderStatus(id: string, status: OrderStatus) {
  const order = await prisma.orders.update({
    where: { id },
    data: { status },
    include: {
      order_items: {
        include: {
          products: { include: { categories: true } },
        },
      },
    },
  });
  return order;
}
