import { Prisma } from "@prisma/client";

import { ORDER_STATUS } from "@/lib/constants";
import prisma from "@/lib/prisma";
import type { Order, OrderStatus } from "@/types";

/**
 * Shared Prisma include for orders with full relations.
 * Use via `prisma.orders.findUnique({ include: ORDER_INCLUDE })`.
 * Centralizes the pattern to avoid duplication across routes (#66).
 */
export const ORDER_INCLUDE = {
  order_items: {
    include: {
      products: {
        include: {
          categories: true,
        },
      },
    },
  },
} as const satisfies Prisma.ordersInclude;

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
    subtotal: order.subtotal ? Number(order.subtotal) : undefined,
    discount: order.discount ? Number(order.discount) : undefined,
    shippingCost: order.shippingCost ? Number(order.shippingCost) : undefined,
    customerAddress: order.customerAddress ?? undefined,
    customerEmail: order.customerEmail ?? undefined,
    // Map shipping location to customer fields for Admin UI display
    customerCity: order.shippingCity ?? undefined,
    customerProvince: order.shippingProvince ?? undefined,
    customerPostalCode: order.shippingPostalCode ?? undefined,
    status: order.status as OrderStatus,
    paymentMethod: order.mpPaymentId
      ? "mercadopago"
      : (order.paymentMethod ?? "cash"),
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
            ? [item.products.images]
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

// Allowed status transitions for admin PATCH/PUT.
// Keys = current status; values = statuses the admin can manually set.
// This prevents obviously invalid jumps (e.g. PENDING → DELIVERED) while
// still giving admins flexibility to correct edge cases.
const VALID_TRANSITIONS: Record<string, string[]> = {
  [ORDER_STATUS.PENDING]: [
    ORDER_STATUS.PENDING_PAYMENT,
    ORDER_STATUS.RESERVED,
    ORDER_STATUS.WAITING_TRANSFER_PROOF,
    ORDER_STATUS.PAYMENT_REVIEW,
    ORDER_STATUS.PROCESSED,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.PENDING_PAYMENT]: [
    ORDER_STATUS.PROCESSED,
    ORDER_STATUS.PAYMENT_REVIEW,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.RESERVED]: [
    ORDER_STATUS.PROCESSED,
    ORDER_STATUS.PAYMENT_REVIEW,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.WAITING_TRANSFER_PROOF]: [
    ORDER_STATUS.PAYMENT_REVIEW,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.PAYMENT_REVIEW]: [
    ORDER_STATUS.PROCESSED,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.PROCESSED]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

// Update order status and return fully-hydrated order including items->product->category
export async function updateOrderStatus(id: string, status: OrderStatus) {
  const current = await prisma.orders.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!current) {
    throw new Error("Pedido no encontrado");
  }

  const allowed = VALID_TRANSITIONS[current.status] ?? [];
  if (!allowed.includes(status)) {
    throw new Error(
      `Transición inválida: ${current.status} → ${status}. Transiciones permitidas: ${allowed.join(", ") || "ninguna"}`
    );
  }

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
