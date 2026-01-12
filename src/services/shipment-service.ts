import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { correoArgentinoService } from "@/lib/correo-argentino-service";
import { ORDER_STATUS, PROVINCIAS, ProvinceCode } from "@/lib/constants";

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

      // CRITICAL CHECK: Do NOT create CA shipment for Local Store Pickups
      // "pickup" is our internal ID for Tienda.
      if (
        order.shippingMethod === "pickup" ||
        order.shippingAgency === "pickup"
      ) {
        logger.info(
          "[ShipmentService] Skipping CA shipment for Local Store Pickup",
          { orderId }
        );
        return true; // Return true as "success" since no shipment is needed
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

      // Determine Province Code dynamically
      // 1. Try existing code from DB
      let provinceCode = order.shippingProvinceCode as ProvinceCode | null;

      // 2. Try mapping from Name
      if (!provinceCode && order.shippingProvince) {
        const normalizedName = order.shippingProvince
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        const match = PROVINCIAS.find(
          (p) =>
            p.name
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "") === normalizedName
        );
        if (match) provinceCode = match.code;
      }

      // 3. Fallback: Parse CP (Naive but handle major cases better)
      if (!provinceCode) {
        const cpNum = parseInt(postalCode.replace(/\D/g, ""));
        if (cpNum >= 1000 && cpNum <= 1499)
          provinceCode = "C"; // CABA
        else if (cpNum >= 5000 && cpNum <= 5999)
          provinceCode = "X"; // Córdoba
        else if (cpNum >= 2000 && cpNum <= 2999)
          provinceCode = "S"; // Santa Fe
        else provinceCode = "B"; // Default to Buenos Aires (covers GBA and most users)
      }

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
        postalCode = postalCodeMatch ? postalCodeMatch[1] : postalCode;
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

      // Fetch Contact Settings for Phone/Email (Unified Source)
      const contactSettings = await prisma.settings.findUnique({
        where: { key: "contact" },
      });

      interface StoreSettingsValue {
        name?: string;
        adminEmail?: string;
        // phone and email removed from store settings
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

      interface ContactSettingsValue {
        emails?: string[];
        phones?: string[];
      }

      let senderAddress = {
        streetName: "Av. San Martín",
        streetNumber: "1234",
        floor: null as string | null,
        apartment: null as string | null,
        city: "Don Torcuato",
        provinceCode: "B" as ProvinceCode,
        postalCode: "1611",
        name: "Rastuci E-commerce",
        email: "ventas@rastuci.com",
        phone: "1123456789",
      };

      // Override with Contact Settings (Phone/Email)
      if (contactSettings && contactSettings.value) {
        const cSettings =
          contactSettings.value as unknown as ContactSettingsValue;
        if (cSettings.emails && cSettings.emails.length > 0) {
          senderAddress.email = cSettings.emails[0];
        }
        if (cSettings.phones && cSettings.phones.length > 0) {
          senderAddress.phone = cSettings.phones[0];
        }
      }

      // Override with Store Settings (Address & Name)
      if (storeSettings && storeSettings.value) {
        const settings = storeSettings.value as unknown as StoreSettingsValue;
        if (settings.address) {
          let pCode: ProvinceCode = "B";
          const pName = settings.address.province || "";

          const normalizedPName = pName
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          const match = PROVINCIAS.find(
            (p) =>
              p.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") === normalizedPName
          );

          if (match) {
            pCode = match.code;
          } else if (
            normalizedPName.includes("capital") ||
            normalizedPName.includes("caba")
          ) {
            pCode = "C";
          }

          senderAddress = {
            ...senderAddress, // Keep email/phone from contact settings
            streetName: settings.address.street || senderAddress.streetName,
            streetNumber: settings.address.number || senderAddress.streetNumber,
            floor: settings.address.floor || null,
            apartment: settings.address.apartment || null,
            city: settings.address.city || senderAddress.city,
            provinceCode: pCode,
            postalCode: settings.address.postalCode || senderAddress.postalCode,
            name: settings.name || senderAddress.name,
            // Only override email/phone if they were somehow in store settings
          };
        }

        // Ensure name is updated even if address object is missing but value exists
        if (settings.name) {
          senderAddress.name = settings.name;
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
          email: order.customerEmail as string, // Validated above
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
          declaredValue: Number(order.total),
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
