import prisma from "@/lib/prisma";
// import { ORDER_STATUS, PAYMENT_METHODS } from "@/lib/constants";
// import { logger } from "@/lib/logger";

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
    // Calculate total amount for a single summary item (requested by user to hide individual names)
    let totalAmount = 0;

    items.forEach((item) => {
      let unitPrice = item.price;
      if (validatedProducts) {
        const product = validatedProducts.find((p) => p.id === item.productId);
        if (product) {
          if (product.onSale && product.salePrice) {
            unitPrice = Number(product.salePrice);
          } else {
            unitPrice = Number(product.price);
          }
        }
      }
      totalAmount += unitPrice * item.quantity;
    });

    if (shippingMethod && shippingMethod.price > 0) {
      totalAmount += shippingMethod.price;
    }

    if (discountAmount > 0) {
      totalAmount -= discountAmount;
    }

    // Ensure strictly positive total (sanity check)
    if (totalAmount < 0) totalAmount = 0;

    return [
      {
        id: "purchase_summary",
        title: "Compra en Rastuci",
        quantity: 1,
        unit_price: Number(totalAmount.toFixed(2)),
        currency_id: "ARS",
      },
    ];
  }
}

export const checkoutService = new CheckoutService();
