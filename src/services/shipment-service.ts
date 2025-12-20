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

      if (
        !order.customerAddress ||
        !order.customerEmail ||
        !order.customerName
      ) {
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
      let provinceCode: "B" | "C" =
        (order.shippingProvinceCode as "B" | "C") || "B";

      // Fallback: parsear customerAddress
      if (!streetName && order.customerAddress) {
        const addressParts = order.customerAddress
          .split(",")
          .map((s) => s.trim());
        const streetPart = addressParts[0] || "";
        const streetMatch = streetPart.match(/^(.+?)\s+(\d+)/);
        streetName = streetMatch ? streetMatch[1].trim() : streetPart;
        streetNumber = streetMatch ? streetMatch[2] : "S/N";
        city = addressParts[3] || addressParts[1] || "Buenos Aires";

        const postalCodeMatch = order.customerAddress.match(/\b(\d{4})\b/);
        postalCode = postalCodeMatch ? postalCodeMatch[1] : "1611";

        const cpNum = parseInt(postalCode);
        provinceCode = cpNum >= 1000 && cpNum <= 1439 ? "C" : "B";
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

      // Fetch Store Settings for Origin Address
      const storeSettings = await prisma.settings.findUnique({
        where: { key: "store" },
      });

      interface StoreSettingsValue {
        name?: string;
        adminEmail?: string;
        phone?: string;
        address?: {
          street?: string;
          number?: string;
          floor?: string;
          apartment?: string;
          city?: string;
          postalCode?: string;
          province?: string;
        };
      }

      let senderAddress = {
        streetName: "Av. San Martín",
        streetNumber: "1234",
        floor: null as string | null,
        apartment: null as string | null,
        city: "Don Torcuato",
        provinceCode: "B" as "B" | "C",
        postalCode: "1611",
        name: "Rastuci E-commerce",
        email: "ventas@rastuci.com",
        phone: "1123456789",
      };

      if (storeSettings && storeSettings.value) {
        const settings = storeSettings.value as unknown as StoreSettingsValue;
        if (settings.address) {
          const pCode =
            settings.address.province?.toLowerCase().includes("capital") ||
            settings.address.province?.toLowerCase().includes("caba")
              ? ("C" as const)
              : ("B" as const);

          senderAddress = {
            streetName: settings.address.street || senderAddress.streetName,
            streetNumber: settings.address.number || senderAddress.streetNumber,
            floor: settings.address.floor || null,
            apartment: settings.address.apartment || null,
            city: settings.address.city || senderAddress.city,
            provinceCode: pCode,
            postalCode: settings.address.postalCode || senderAddress.postalCode,
            name: settings.name || senderAddress.name,
            email: settings.adminEmail || senderAddress.email,
            phone: settings.phone || senderAddress.phone,
          };
        }
      }

      const shipmentData = {
        customerId: customerId,
        extOrderId: orderId,
        orderNumber: orderId.substring(0, 20),
        sender: {
          name: senderAddress.name,
          phone: senderAddress.phone,
          cellPhone: senderAddress.phone,
          email: senderAddress.email,
          originAddress: {
            streetName: senderAddress.streetName,
            streetNumber: senderAddress.streetNumber,
            floor: senderAddress.floor,
            apartment: senderAddress.apartment,
            city: senderAddress.city,
            provinceCode: senderAddress.provinceCode,
            postalCode: senderAddress.postalCode,
          },
        },
        recipient: {
          name: order.customerName,
          phone: order.customerPhone || "",
          cellPhone: order.customerPhone || "",
          email: order.customerEmail,
        },
        shipping: {
          deliveryType: (order.shippingAgency ? "S" : "D") as "D" | "S",
          productType: order.shippingProductType || "CP",
          agency: order.shippingAgency || null,
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

      const response =
        await correoArgentinoService.importShipment(shipmentData);

      if (!response.success) {
        throw new Error(
          `CA API error: ${response.error?.message || "Unknown error"} (code: ${response.error?.code})`
        );
      }

      const trackingNumber = response.data?.trackingNumber;

      // Define expected shape instead of any
      interface CAImportResponse {
        shipmentId?: string;
        id?: string;
        label?: string;
      }
      const responseData = response.data as CAImportResponse;
      const shipmentId = responseData?.shipmentId || responseData?.id;

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
