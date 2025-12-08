import { correoArgentinoService } from "@/lib/correo-argentino-service";
import { fail, ok } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import type { ProvinceCode } from "@/lib/correo-argentino-service";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/orders/[id]/retry-ca-import
 *
 * Reintenta la importación de un envío a Correo Argentino
 * Útil cuando el import automático falló por algún motivo
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    try {
        const orderId = params.id;

        // 1. Obtener la orden
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
            return fail("NOT_FOUND", "Pedido no encontrado", 404);
        }

        // 2. Verificar que no tenga ya un envío importado
        if (order.caShipmentId || order.caTrackingNumber) {
            return fail(
                "BAD_REQUEST",
                `El pedido ya tiene un envío importado: ${order.caTrackingNumber || order.caShipmentId}`,
                400
            );
        }

        // 3. Verificar credenciales de CA
        const customerId =
            process.env.CORREO_ARGENTINO_CUSTOMER_ID ||
            correoArgentinoService.getCustomerId();

        if (!customerId) {
            return fail(
                "BAD_REQUEST",
                "CORREO_ARGENTINO_CUSTOMER_ID no configurado",
                500
            );
        }

        // 4. Preparar datos del envío usando campos estructurados
        let streetName = order.shippingStreet || "";
        let streetNumber = order.shippingNumber || "S/N";
        let city = order.shippingCity || "";
        let postalCode = order.shippingPostalCode || "";
        let provinceCode: ProvinceCode = (order.shippingProvinceCode as ProvinceCode) || "B";

        // Fallback: parsear de customerAddress si no hay campos estructurados
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

        if (!streetName || !city || !postalCode) {
            return fail(
                "BAD_REQUEST",
                "El pedido no tiene datos de dirección suficientes para importar",
                400
            );
        }

        // 5. Calcular peso estimado
        const totalItems = order.order_items.reduce(
            (sum, item) => sum + item.quantity,
            0
        );
        const estimatedWeight = Math.max(500, totalItems * 300);

        // 6. Determinar tipo de envío
        const deliveryType = order.shippingAgency ? "S" : "D";

        // 7. Preparar datos y enviar a CA
        const shipmentData = {
            customerId: customerId,
            extOrderId: orderId,
            orderNumber: orderId.substring(0, 20),
            sender: {
                name: process.env.STORE_NAME || "Rastuci E-commerce",
                phone: process.env.STORE_PHONE || "1123456789",
                cellPhone: process.env.STORE_PHONE || "1123456789",
                email: process.env.STORE_EMAIL || "ventas@rastuci.com",
                originAddress: {
                    streetName: process.env.STORE_ADDRESS || "Av. San Martín",
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
                email: order.customerEmail || "",
            },
            shipping: {
                deliveryType: deliveryType as "D" | "S",
                productType: "CP",
                agency: deliveryType === "S" ? order.shippingAgency : null,
                address: {
                    streetName: streetName || "Dirección",
                    streetNumber: streetNumber,
                    floor: order.shippingFloor || "",
                    apartment: order.shippingApartment || "",
                    city: city || "Buenos Aires",
                    provinceCode: provinceCode,
                    postalCode: postalCode,
                },
                weight: estimatedWeight,
                declaredValue: order.total,
                height: 10,
                length: 30,
                width: 20,
            },
        };

        logger.info("[Admin] Retry CA import - sending request", {
            orderId,
            shipmentData: JSON.stringify(shipmentData),
        });

        // 8. Llamar a CA
        const response = await correoArgentinoService.importShipment(shipmentData);

        if (!response.success) {
            logger.error("[Admin] Retry CA import failed", {
                orderId,
                error: response.error,
            });
            return fail(
                "BAD_REQUEST",
                `Error de Correo Argentino: ${response.error?.message || "Error desconocido"}`,
                400
            );
        }

        // 9. Actualizar orden con datos del envío
        const trackingNumber = response.data?.trackingNumber;
        const shipmentId = response.data?.shipmentId;

        const updatedOrder = await prisma.orders.update({
            where: { id: orderId },
            data: {
                caTrackingNumber: trackingNumber || null,
                caShipmentId: shipmentId || null,
                caExtOrderId: orderId,
                shippingMethod: "correo-argentino",
                status: "PROCESSED",
                updatedAt: new Date(),
            },
        });

        logger.info("[Admin] Retry CA import success", {
            orderId,
            trackingNumber,
            shipmentId,
        });

        return ok({
            order: updatedOrder,
            trackingNumber,
            shipmentId,
            message: "Envío importado exitosamente en Correo Argentino",
        });
    } catch (err) {
        logger.error("[Admin] Error retrying CA import", { error: err });
        return fail(
            "INTERNAL_ERROR",
            err instanceof Error ? err.message : "Error al reintentar import CA",
            500
        );
    }
}
