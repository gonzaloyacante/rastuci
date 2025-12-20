/**
 * Sistema de notificaciones para cambios en tracking de Correo Argentino
 *
 * Este servicio detecta cambios en el estado de envíos CA y envía notificaciones
 * automáticas a los clientes mediante email.
 *
 * Adaptado para Serverless: No usa estados persistentes ni setInterval.
 * Se ejecuta bajo demanda via Cron Jobs.
 *
 * @author Rastuci E-commerce
 * @version 1.1.1
 */

import { correoArgentinoService } from "@/lib/correo-argentino-service";
import { sendTrackingUpdateEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/types";
import pLimit from "p-limit";

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

export interface TrackingNotificationConfig {
  enableEmail: boolean;
  notifiableStatuses: string[];
  concurrencyLimit: number;
}

export interface TrackingChangeEvent {
  orderId: string;
  customerEmail: string;
  customerName: string;
  trackingNumber: string;
  previousStatus: string | null;
  newStatus: string;
  statusDescription: string;
  timestamp: Date;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const DEFAULT_CONFIG: TrackingNotificationConfig = {
  enableEmail: true,
  concurrencyLimit: 5, // Process 5 requests in parallel to avoid rate limits/timeouts
  notifiableStatuses: [
    "ENTREGADO",
    "DEVUELTO",
    "EN_TRANSITO",
    "RETENIDO_ADUANA",
    "NO_ENTREGADO",
    "EN_SUCURSAL",
  ],
};

// ============================================================================
// SERVICIO PRINCIPAL
// ============================================================================

export class TrackingNotificationService {
  private config: TrackingNotificationConfig;

  constructor(config?: Partial<TrackingNotificationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Revisa todos los envíos activos de CA y detecta cambios
   * Diseñado para ejecución Serverless (stateless)
   */
  async checkAllActiveShipments(): Promise<{
    processed: number;
    updates: number;
    errors: number;
  }> {
    let processed = 0;
    let updates = 0;
    let errorCount = 0;

    try {
      logger.info("[TrackingNotifications] Checking active shipments...");

      // Obtener todos los pedidos con tracking CA activo
      // Optimización: Solo traer lo necesario
      const activeOrders = await prisma.orders.findMany({
        where: {
          trackingNumber: { not: null },
          // Solo procesar pedidos que no estén finalizados o cancelados
          // O que tengan estado interno 'PROCESSED' esperando entrega
          // NOTA: 'SHIPPED' no existe en el schema actual, usamos PROCESSED para todo lo que está en curso.
          status: { in: ["PROCESSED"] },
        },
        select: {
          id: true,
          trackingNumber: true,
          caTrackingNumber: true,
          customerEmail: true,
          customerName: true,
          status: true, // Use string status from DB, cast later
        },
        take: 50, // Límite por ejecución para evitar timeouts en Vercel Free (10s limit)
        orderBy: { updatedAt: "asc" }, // Procesar los más antiguos primero
      });

      if (activeOrders.length === 0) {
        logger.info("[TrackingNotifications] No active shipments to check");
        return { processed: 0, updates: 0, errors: 0 };
      }

      logger.info(
        `[TrackingNotifications] Found ${activeOrders.length} active shipments`
      );

      // Concurrency Control
      const limit = pLimit(this.config.concurrencyLimit);

      const tasks = activeOrders.map((order) => {
        return limit(async () => {
          try {
            const updated = await this.checkShipmentStatus({
              id: order.id,
              trackingNumber: order.caTrackingNumber || order.trackingNumber, // Prefer CA specific fields
              customerEmail: order.customerEmail,
              customerName: order.customerName,
              status: order.status as OrderStatus,
            });
            processed++;
            if (updated) updates++;
          } catch (e) {
            errorCount++;
            const errorMsg = e instanceof Error ? e.message : String(e);
            logger.error(
              `[TrackingNotifications] Error processing order ${order.id}`,
              { error: errorMsg }
            );
          }
        });
      });

      await Promise.all(tasks);

      logger.info(
        `[TrackingNotifications] Cycle complete. Processed: ${processed}, Updates: ${updates}, Errors: ${errorCount}`
      );

      return { processed, updates, errors: errorCount };
    } catch (error) {
      logger.error("[TrackingNotifications] Error in main loop", {
        error,
      });
      return { processed, updates, errors: errorCount };
    }
  }

  /**
   * Verifica el estado de un envío específico
   * Retorna true si hubo actualización
   */
  private async checkShipmentStatus(order: {
    id: string;
    trackingNumber: string | null;
    customerEmail: string | null;
    customerName: string;
    status: OrderStatus;
  }): Promise<boolean> {
    if (!order.trackingNumber) {
      return false;
    }

    try {
      // Consultar tracking actual en CA API
      const trackingResponse = await correoArgentinoService.getTracking({
        shippingId: order.trackingNumber,
      });

      if (!trackingResponse.success || !trackingResponse.data) {
        // Silent fail for expected API glitches, just log warning
        return false;
      }

      const trackingData = Array.isArray(trackingResponse.data)
        ? trackingResponse.data[0]
        : "trackingNumber" in trackingResponse.data
          ? trackingResponse.data
          : null;

      if (
        !trackingData ||
        !("events" in trackingData) ||
        !trackingData.events.length
      ) {
        return false;
      }

      const currentEvent = trackingData.events[0]; // Evento más reciente
      const currentStatus = currentEvent.status;
      const previousStatus = order.status;

      // Normalizar estado actual a OrderStatus para comparación
      const normalizedCurrentStatus =
        this.mapCAStatusToOrderStatus(currentStatus);

      // Lógica de detección: ¿El estado de Correio difiere de lo que "creemos" que es?
      const hasStatusChanged = normalizedCurrentStatus !== previousStatus;

      if (hasStatusChanged) {
        logger.info(
          `[TrackingNotifications] Status change detected for order ${order.id}`,
          {
            previous: previousStatus,
            current: normalizedCurrentStatus,
            caStatus: currentStatus,
          }
        );

        const changeEvent: TrackingChangeEvent = {
          orderId: order.id,
          customerEmail: order.customerEmail || "",
          customerName: order.customerName,
          trackingNumber: order.trackingNumber || "",
          previousStatus: previousStatus || null,
          newStatus: normalizedCurrentStatus,
          statusDescription:
            currentEvent.eventDescription || currentStatus || "Actualización",
          timestamp: new Date(currentEvent.eventDate),
        };

        // Enviar notificaciones si el estado "crudo" de CA es importante (ej: EN_CAMINO)
        // O si el estado normalizado cambió (ej: a DELIVERED)
        if (
          this.config.notifiableStatuses.includes(currentStatus) ||
          normalizedCurrentStatus === "DELIVERED"
        ) {
          await this.sendNotifications(changeEvent);
        }

        // Actualizar estado en Order
        await prisma.orders.update({
          where: { id: order.id },
          data: {
            status: normalizedCurrentStatus,
            updatedAt: new Date(),
          },
        });

        return true;
      }

      // Touch updateAt even if no change, to rotate processing order in FIFO queue via "orderBy updatedAt asc"
      await prisma.orders.update({
        where: { id: order.id },
        data: { updatedAt: new Date() },
      });

      return false;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[TrackingNotifications] Error checking order ${order.id}`, {
        error: errorMsg,
      });
      return false;
    }
  }

  private mapCAStatusToOrderStatus(
    caStatus: string
  ): "PENDING" | "PROCESSED" | "DELIVERED" {
    const statusUpper = caStatus.toUpperCase();

    if (statusUpper.includes("ENTREGADO")) return "DELIVERED";
    // Mapear estados de tránsito a PROCESSED ya que no tenemos SHIPPED en schema
    if (statusUpper.includes("CAMINO") || statusUpper.includes("DISTRIBUCION"))
      return "PROCESSED";

    const statusMap: Record<string, "PENDING" | "PROCESSED" | "DELIVERED"> = {
      ENTREGADO: "DELIVERED",
      DEVUELTO: "PENDING", // O CANCELLED?
    };

    return statusMap[statusUpper] || "PROCESSED";
  }

  private async sendNotifications(event: TrackingChangeEvent): Promise<void> {
    if (this.config.enableEmail && event.customerEmail) {
      try {
        await sendTrackingUpdateEmail({
          to: event.customerEmail,
          customerName: event.customerName,
          orderId: event.orderId,
          trackingCode: event.trackingNumber,
          status: event.newStatus,
          statusMessage: event.statusDescription,
        });
        logger.info(
          `[TrackingNotifications] Email sent to ${event.customerEmail}`
        );
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        logger.error(
          `[TrackingNotifications] Failed to send email to ${event.customerEmail}`,
          { error: errorMsg }
        );
      }
    }
  }

  // Webhook handler se mantiene igual, es stateless
  async handleWebhook(payload: unknown): Promise<void> {
    try {
      logger.info("[TrackingNotifications] Processing webhook", { payload });
    } catch (e) {
      console.error(e);
    }
  }
}

export const trackingNotificationService = new TrackingNotificationService();
