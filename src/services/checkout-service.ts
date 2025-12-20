import prisma from "@/lib/prisma";
import { ORDER_STATUS, PAYMENT_METHODS } from "@/lib/constants";
import { logger } from "@/lib/logger";

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  name?: string;
}

export class CheckoutService {
  /**
   * Valida que los productos existan y tengan stock suficiente
   */
  async validateStock(items: OrderItem[]) {
    if (!items || items.length === 0) {
      throw new Error("No hay productos en el carrito");
    }

    const productIds = items.map((item) => item.productId);
    // Optimización: Traer variantes también
    const products = await prisma.products.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
        salePrice: true,
        onSale: true,
        variants: true, // Incluimos variantes en la consulta
      },
    });

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        throw new Error(`Producto no encontrado: ${item.productId}`);
      }

      // Lógica de Stock:
      // 1. Si el producto tiene variantes y el item especifica Color+Size -> Chequear stock de variante
      // 2. Si no tiene variantes (legacy) -> Chequear stock global

      const hasVariants = product.variants && product.variants.length > 0;

      if (hasVariants && item.color && item.size) {
        const variant = product.variants.find(
          (v) => v.color === item.color && v.size === item.size
        );

        if (!variant) {
          // Caso raro: El usuario tiene en carrito una combinación que ya no existe
          throw new Error(
            `La variante ${item.color} - ${item.size} de ${product.name} ya no está disponible.`
          );
        }

        if (variant.stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para ${product.name} (${item.color} ${item.size}). Disponible: ${variant.stock}`
          );
        }
      } else {
        // Fallback Legacy o producto simple
        if (product.stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`
          );
        }
      }
    }

    return products;
  }

  /**
   * Prepara los items para Mercado Pago
   */
  prepareMPItems(
    items: OrderItem[],
    shippingMethod?: { name: string; price: number },
    discountAmount: number = 0,
    validatedProducts?: {
      id: string;
      price: unknown;
      salePrice: unknown;
      onSale: boolean;
    }[] // Better typing than any[]
  ) {
    const mpItems = items.map((item) => {
      let unitPrice = item.price;

      // If we have validated products from DB, prefer DB price logic
      if (validatedProducts) {
        const product = validatedProducts.find((p) => p.id === item.productId);
        if (product) {
          // Check for sale price
          if (product.onSale && product.salePrice) {
            unitPrice = Number(product.salePrice);
          } else {
            unitPrice = Number(product.price);
          }
        }
      }

      return {
        id: item.productId,
        title: item.name || "Producto",
        quantity: item.quantity,
        unit_price: unitPrice,
        currency_id: "ARS",
      };
    });

    if (shippingMethod && shippingMethod.price > 0) {
      mpItems.push({
        id: "shipping",
        title: `Envío - ${shippingMethod.name}`,
        quantity: 1,
        unit_price: shippingMethod.price,
        currency_id: "ARS",
      });
    }

    if (discountAmount > 0) {
      mpItems.push({
        id: "discount",
        title: "Descuento",
        quantity: 1,
        unit_price: -discountAmount,
        currency_id: "ARS",
      });
    }

    return mpItems;
  }
}

export const checkoutService = new CheckoutService();
