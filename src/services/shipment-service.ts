import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { correoArgentinoService } from "@/lib/correo-argentino-service";
import { ORDER_STATUS } from "@/lib/constants";

export class ShipmentService {

    /**
     * Crea el envío en Correo Argentino automáticamente para una orden existente.
     * Si tiene éxito, actualiza la orden con el tracking number y estado PROCESSED.
     */
    async createCAShipment(orderId: string): Promise<boolean> {
        try {
            logger.info("[ShipmentService] Starting automatic CA shipment creation", {
                orderId,
            });

            const order = await prisma.orders.findUnique({
                where: { id: orderId },
                include: {
                    order_items: {
                        include: {
                            products: true,
                        },
                    },
                },
            });

            if (!order) {
                throw new Error(`Order not found: ${orderId}`);
            }

            if (!order.customerAddress || !order.customerEmail || !order.customerName) {
                throw new Error(
                    `Order ${orderId} missing required shipping data (address, email, or name)`
                );
            }

            const customerId =
                process.env.CORREO_ARGENTINO_CUSTOMER_ID ||
                correoArgentinoService.getCustomerId();

            if (!customerId) {
                throw new Error(
                    "CORREO_ARGENTINO_CUSTOMER_ID not configured - cannot create shipment"
                );
            }

            // Usar campos estructurados si existen, sino parsear dirección
            let streetName = order.shippingStreet || "";
            let streetNumber = order.shippingNumber || "S/N";
            let city = order.shippingCity || "";
            let postalCode = order.shippingPostalCode || "1611";
            let provinceCode: "B" | "C" = order.shippingProvinceCode as "B" | "C" || "B";

            // Fallback: parsear customerAddress
            if (!streetName && order.customerAddress) {
                const addressParts = order.customerAddress.split(",").map((s) => s.trim());
                const streetPart = addressParts[0] || "";
                const streetMatch = streetPart.match(/^(.+?)\s+(\d+)/);
                streetName = streetMatch ? streetMatch[1].trim() : streetPart;
                streetNumber = streetMatch ? streetMatch[2] : "S/N";
                city = addressParts[3] || addressParts[1] || "Buenos Aires";

                const postalCodeMatch = order.customerAddress.match(/\b(\d{4})\b/);
                postalCode = postalCodeMatch ? postalCodeMatch[1] : "1611";

                const cpNum = parseInt(postalCode);
                provinceCode = (cpNum >= 1000 && cpNum <= 1439) ? "C" : "B";
            }

            const totalItems = order.order_items.reduce(
                (sum, item) => sum + item.quantity,
                0
            );
            const estimatedWeight = Math.max(500, totalItems * 300);
            const estimatedDimensions = {
                weight: estimatedWeight,
                height: 10,
                width: 20,
                length: 30,
            };

            const shipmentData = {
                customerId: customerId,
                extOrderId: orderId,
                orderNumber: orderId.substring(0, 20),
                sender: {
                    name: "Rastuci E-commerce",
                    phone: "1123456789",
                    cellPhone: "1123456789",
                    email: "ventas@rastuci.com",
                    originAddress: {
                        streetName: "Av. San Martín",
                        streetNumber: "1234",
                        floor: null,
                        apartment: null,
                        city: "Don Torcuato",
                        provinceCode: "B" as const,
                        postalCode: "1611",
                    },
                },
                recipient: {
                    name: order.customerName,
                    phone: order.customerPhone || "",
                    cellPhone: order.customerPhone || "",
                    email: order.customerEmail,
                },
                shipping: {
                    deliveryType: "D" as const,
                    productType: "CP",
                    agency: null,
                    address: {
                        streetName: streetName || "Dirección",
                        streetNumber: streetNumber,
                        floor: order.shippingFloor || "",
                        apartment: order.shippingApartment || "",
                        city: city || "Buenos Aires",
                        provinceCode: provinceCode,
                        postalCode: postalCode,
                    },
                    weight: estimatedDimensions.weight,
                    declaredValue: order.total,
                    height: estimatedDimensions.height,
                    length: estimatedDimensions.length,
                    width: estimatedDimensions.width,
                },
            };

            logger.info("[ShipmentService] Sending shipment data to CA", {
                orderId,
                shipmentData: JSON.stringify(shipmentData),
            });

            const response = await correoArgentinoService.importShipment(shipmentData);

            if (!response.success) {
                throw new Error(
                    `CA API error: ${response.error?.message || "Unknown error"} (code: ${response.error?.code})`
                );
            }

            const trackingNumber = response.data?.trackingNumber;
            const shipmentId = response.data?.shipmentId;

            await prisma.orders.update({
                where: { id: orderId },
                data: {
                    trackingNumber: trackingNumber || shipmentId || null,
                    shippingMethod: "correo-argentino",
                    status: ORDER_STATUS.PROCESSED,
                    updatedAt: new Date(),
                },
            });

            logger.info("[ShipmentService] Shipment created successfully", {
                orderId,
                trackingNumber,
                shipmentId,
            });

            return true;

        } catch (error) {
            logger.error("[ShipmentService] Failed to create shipment", {
                orderId,
                error: error instanceof Error ? error.message : String(error),
            });
            // Return false instead of throwing to avoid breaking the webhook flow completely if specific error logic needed
            // But caller can handle throw if preferred. For now we log and return false.
            return false;
        }
    }
}

export const shipmentService = new ShipmentService();
