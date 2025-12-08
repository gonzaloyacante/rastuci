/**
 * Sistema de notificaciones para cambios en tracking de Correo Argentino
 *
 * Este servicio detecta cambios en el estado de envíos CA y envía notificaciones
 * automáticas a los clientes mediante email y push notifications.
 *
 * Estrategias de implementación:
 * 1. Polling periódico: Job que revisa envíos activos cada X minutos
 * 2. Webhook: Endpoint para recibir notificaciones de CA (si disponible)
 *
 * @author Rastuci E-commerce
 * @version 1.0.0
 */

import { correoArgentinoService } from "@/lib/correo-argentino-service";
import { sendTrackingUpdateEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/types";

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

export interface TrackingNotificationConfig {
  enableEmail: boolean;
  enablePush: boolean;
  pollingIntervalMinutes: number;
  notifiableStatuses: string[]; // Ej: ["ENTREGADO", "DEVUELTO", "EN_TRANSITO"]
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
  enablePush: false, // Disabled - using email only
  pollingIntervalMinutes: 15, // Revisar cada 15 minutos
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
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(config?: Partial<TrackingNotificationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Inicia el servicio de polling periódico
   */
  start(): void {
    if (this.isRunning) {
      logger.warn("[TrackingNotifications] Service already running");
      return;
    }

    logger.info(
      `[TrackingNotifications] Starting service (polling every ${this.config.pollingIntervalMinutes} minutes)`
    );
    this.isRunning = true;

    // Ejecutar inmediatamente
    this.checkAllActiveShipments();

    // Configurar intervalo
    const intervalMs = this.config.pollingIntervalMinutes * 60 * 1000;
    this.intervalId = setInterval(() => {
      this.checkAllActiveShipments();
    }, intervalMs);
  }

  /**
   * Detiene el servicio de polling
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info("[TrackingNotifications] Service stopped");
  }

  /**
   * Revisa todos los envíos activos de CA y detecta cambios
   * Público para permitir ejecución desde cron jobs
   */
  async checkAllActiveShipments(): Promise<void> {
    try {
      logger.info("[TrackingNotifications] Checking active shipments...");

      // Obtener todos los pedidos con tracking CA activo
      const activeOrders = await prisma.orders.findMany({
        where: {
          trackingNumber: { not: null },
          status: { in: ["PENDING", "PROCESSED"] },
        },
        select: {
          id: true,
          trackingNumber: true,
          customerEmail: true,
          customerName: true,
          status: true,
          updatedAt: true,
        },
      });

      logger.info(
        `[TrackingNotifications] Found ${activeOrders.length} active shipments`
      );

      // Procesar cada pedido
      for (const order of activeOrders) {
        await this.checkShipmentStatus({
          ...order,
          status: order.status as OrderStatus,
        });
      }
    } catch (error) {
      logger.error("[TrackingNotifications] Error checking shipments", {
        error,
      });
    }
  }

  /**
   * Verifica el estado de un envío específico
   */
  private async checkShipmentStatus(order: {
    id: string;
    trackingNumber: string | null;
    customerEmail: string | null;
    customerName: string;
    status: OrderStatus;
    updatedAt: Date;
  }): Promise<void> {
    if (!order.trackingNumber) {
      return;
    }

    try {
      // Consultar tracking actual en CA API
      const trackingResponse = await correoArgentinoService.getTracking({
        shippingId: order.trackingNumber,
      });

      if (!trackingResponse.success || !trackingResponse.data) {
        logger.warn(
          `[TrackingNotifications] Failed to get tracking for order ${order.id}`
        );
        return;
      }

      // El response puede ser TrackingInfo | TrackingInfo[] | TrackingErrorResponse
      // Normalizamos a TrackingInfo único
      const trackingData = Array.isArray(trackingResponse.data)
        ? trackingResponse.data[0]
        : "trackingNumber" in trackingResponse.data
          ? trackingResponse.data
          : null;

      if (!trackingData || !("events" in trackingData)) {
        return;
      }

      const currentEvent = trackingData.events[0]; // Evento más reciente
      if (!currentEvent) {
        return;
      }

      const currentStatus = currentEvent.status;
      const previousStatus = order.status;

      // Detectar cambio de estado
      if (currentStatus !== previousStatus) {
        logger.info(
          `[TrackingNotifications] Status change detected for order ${order.id}`,
          {
            previous: previousStatus,
            current: currentStatus,
          }
        );

        // Crear evento de cambio
        const changeEvent: TrackingChangeEvent = {
          orderId: order.id,
          customerEmail: order.customerEmail || "",
          customerName: order.customerName,
          trackingNumber: order.trackingNumber || "",
          previousStatus: previousStatus || null,
          newStatus: currentStatus,
          statusDescription: currentEvent.event || "Actualización de estado",
          timestamp: new Date(currentEvent.date),
        };

        // Enviar notificaciones si el estado es notificable
        if (this.config.notifiableStatuses.includes(currentStatus)) {
          await this.sendNotifications(changeEvent);
        }

        // Actualizar estado en Order
        await prisma.orders.update({
          where: { id: order.id },
          data: {
            status: this.mapCAStatusToOrderStatus(currentStatus),
            updatedAt: new Date(),
          },
        });
      }
    } catch (error) {
      logger.error(`[TrackingNotifications] Error checking order ${order.id}`, {
        error,
      });
    }
  }

  /**
   * Mapea estados de CA a estados de Order
   */
  private mapCAStatusToOrderStatus(
    caStatus: string
  ): "PENDING" | "PROCESSED" | "DELIVERED" {
    const statusMap: Record<string, "PENDING" | "PROCESSED" | "DELIVERED"> = {
      ENTREGADO: "DELIVERED",
      EN_TRANSITO: "PROCESSED",
      EN_SUCURSAL: "PROCESSED",
      EN_DISTRIBUCION: "PROCESSED",
      RETENIDO_ADUANA: "PROCESSED",
      DEVUELTO: "PENDING",
      NO_ENTREGADO: "PENDING",
    };

    return statusMap[caStatus] || "PROCESSED";
  }

  /**
   * Envía notificaciones al cliente sobre cambio de estado
   */
  private async sendNotifications(event: TrackingChangeEvent): Promise<void> {
    const promises: Promise<void>[] = [];

    // Email notification
    if (this.config.enableEmail) {
      promises.push(this.sendEmailNotification(event));
    }

    // Push notification
    if (this.config.enablePush) {
      promises.push(this.sendPushNotificationToCustomer(event));
    }

    await Promise.allSettled(promises);
  }

  /**
   * Envía email de notificación
   */
  private async sendEmailNotification(
    event: TrackingChangeEvent
  ): Promise<void> {
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
    } catch (error) {
      logger.error("[TrackingNotifications] Failed to send email", {
        error,
        event,
      });
    }
  }

  /**
   * Envía push notification al cliente (DESHABILITADO - solo emails)
   */
  private async sendPushNotificationToCustomer(
    event: TrackingChangeEvent
  ): Promise<void> {
    // Push notifications disabled - using email notifications only
    logger.info(
      `[TrackingNotifications] Push disabled, email sent for order ${event.orderId}`
    );
  }

  /**
   * Webhook handler para recibir notificaciones directas de CA (si lo soportan)
   */
  async handleWebhook(payload: unknown): Promise<void> {
    try {
      logger.info("[TrackingNotifications] Processing webhook", { payload });

      // Parsear payload según formato de CA
      // El formato típico de CA incluye: trackingNumber, status, timestamp, event, branch
      const webhookData = payload as {
        trackingNumber?: string;
        status?: string;
        event?: string;
        eventDate?: string;
        branch?: string;
        shipmentId?: string;
      };

      if (!webhookData.trackingNumber) {
        logger.warn("[TrackingNotifications] Webhook missing trackingNumber");
        return;
      }

      // Buscar la orden por tracking number
      const order = await prisma.orders.findFirst({
        where: { caTrackingNumber: webhookData.trackingNumber },
      });

      if (!order) {
        logger.warn("[TrackingNotifications] Order not found for tracking", {
          trackingNumber: webhookData.trackingNumber,
        });
        return;
      }

      // Actualizar estado de la orden
      if (webhookData.status) {
        await prisma.orders.update({
          where: { id: order.id },
          data: {
            // caTrackingStatus no existe en schema - usar campo status o agregar el campo al schema
            updatedAt: new Date(),
          },
        });
      }

      // Las notificaciones se envían automáticamente a través del sistema de eventos
      // cuando se detectan cambios en checkShipmentStatus

      logger.info("[TrackingNotifications] Webhook processed successfully", {
        orderId: order.id,
        event: webhookData.event,
      });
    } catch (error) {
      logger.error("[TrackingNotifications] Webhook processing failed", {
        error,
      });
    }
  }
}

// ============================================================================
// INSTANCIA SINGLETON
// ============================================================================

export const trackingNotificationService = new TrackingNotificationService();
