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

type ProductVariant = {
  color: string;
  size: string;
  stock: number;
};

type ValidatedProduct = {
  id: string;
  name: string;
  stock: number;
  price: unknown;
  salePrice: unknown;
  onSale: boolean;
  product_variants: ProductVariant[];
};

function validateVariantStock(
  item: OrderItem,
  product: ValidatedProduct
): void {
  if (!item.color || !item.size) {
    throw new Error(
      `El producto ${product.name} requiere seleccionar talle y color`
    );
  }
  const variant = product.product_variants.find(
    (v) => v.color === item.color && v.size === item.size
  );
  if (!variant) {
    throw new Error(
      `La variante ${item.color} - ${item.size} de ${product.name} ya no está disponible.`
    );
  }
  if (variant.stock < item.quantity) {
    throw new Error(
      `Stock insuficiente para ${product.name} (${item.color} ${item.size}). Disponible: ${variant.stock}`
    );
  }
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
    const products = await prisma.products.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
        salePrice: true,
        onSale: true,
        product_variants: true,
      },
    });

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Producto no encontrado: ${item.productId}`);
      }

      const hasVariants = product.product_variants?.length > 0;
      if (hasVariants) {
        validateVariantStock(item, product);
      } else if (product.stock < item.quantity) {
        throw new Error(
          `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`
        );
      }
    }

    return products;
  }
}

export const checkoutService = new CheckoutService();
