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
        const products = await prisma.products.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, stock: true, price: true },
        });

        for (const item of items) {
            const product = products.find((p) => p.id === item.productId);

            if (!product) {
                throw new Error(`Producto no encontrado: ${item.productId}`);
            }

            if (product.stock < item.quantity) {
                throw new Error(
                    `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`
                );
            }
        }

        return products;
    }

    /**
     * Prepara los items para Mercado Pago
     */
    prepareMPItems(items: OrderItem[], shippingMethod?: { name: string; price: number }, discountAmount: number = 0) {
        const mpItems = items.map((item) => ({
            id: item.productId,
            title: item.name || "Producto",
            quantity: item.quantity,
            unit_price: item.price,
            currency_id: "ARS",
        }));

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
