import { mobilePushService } from '@/lib/mobile-push';
import { handleOrderStatusChange } from '@/lib/email-service';

interface OrderStatusChangeInput {
  orderId: string;
  newStatus: string;
  oldStatus: string;
  customerEmail?: string;
  trackingCode?: string;
  deviceId?: string;
}

// Servicio integrado que maneja tanto email como push notifications
export class IntegratedNotificationService {
  
  // Manejar cambio de estado de orden con notificaciones integradas
  async handleOrderStatusChange(input: OrderStatusChangeInput): Promise<{
    emailSent: boolean;
    pushSent: boolean;
  }> {
    const results = {
      emailSent: false,
      pushSent: false,
    };

    try {
      // Enviar notificación por email (usando servicio existente)
      await handleOrderStatusChange({
        orderId: input.orderId,
        newStatus: input.newStatus,
        oldStatus: input.oldStatus,
      });
      results.emailSent = true;
    } catch {
      // Email silencioso fail
    }

    // Enviar push notification si tenemos datos de dispositivo
    if (input.trackingCode && (input.customerEmail || input.deviceId)) {
      try {
        const pushSent = await mobilePushService.sendTrackingUpdate(
          {
            customerEmail: input.customerEmail,
            deviceId: input.deviceId,
          },
          input.orderId,
          input.trackingCode,
          input.newStatus,
          this.getStatusMessage(input.newStatus)
        );
        results.pushSent = pushSent;
      } catch {
        // Push silencioso fail
      }
    }

    return results;
  }

  // Notificación de nuevo pedido
  async notifyNewOrder(
    orderId: string,
    total: number,
    customerEmail?: string,
    deviceId?: string
  ): Promise<{
    emailSent: boolean;
    pushSent: boolean;
  }> {
    const results = {
      emailSent: false,
      pushSent: false,
    };

    // Push notification para nuevo pedido
    if (customerEmail || deviceId) {
      try {
        const pushSent = await mobilePushService.sendOrderCreated(
          {
            customerEmail,
            deviceId,
          },
          orderId,
          total
        );
        results.pushSent = pushSent;
      } catch {
        // Push silencioso fail
      }
    }

    return results;
  }

  // Notificación de promoción/oferta
  async notifyPromotion(
    title: string,
    message: string,
    customerEmail?: string,
    deviceId?: string,
    promotionId?: string
  ): Promise<boolean> {
    if (!customerEmail && !deviceId) {
      return false;
    }

    try {
      return await mobilePushService.sendPromotionNotification(
        {
          customerEmail,
          deviceId,
        },
        title,
        message,
        promotionId
      );
    } catch {
      return false;
    }
  }

  // Verificar configuración de notificaciones del usuario
  async getUserNotificationSettings(
    customerEmail?: string,
    deviceId?: string
  ): Promise<{
    pushEnabled: boolean;
    emailEnabled: boolean;
    platform?: string;
  }> {
    const settings = {
      pushEnabled: false,
      emailEnabled: !!customerEmail, // Si tiene email, asumimos que email está habilitado
      platform: undefined as string | undefined,
    };

    if (customerEmail || deviceId) {
      try {
        const status = await mobilePushService.checkRegistrationStatus(
          customerEmail,
          deviceId
        );
        settings.pushEnabled = status.registered && (status.enabled ?? false);
        settings.platform = status.platform;
      } catch {
        // Error silencioso
      }
    }

    return settings;
  }

  private getStatusMessage(status: string): string {
    const statusMessages: Record<string, string> = {
      'pending': 'Tu pedido está siendo preparado',
      'in-transit': 'Tu pedido está en camino',
      'out-for-delivery': 'Tu pedido está siendo entregado hoy',
      'delivered': 'Tu pedido ha sido entregado exitosamente',
      'delayed': 'Hay un retraso en tu envío',
      'error': 'Ha ocurrido un problema con tu envío',
    };

    return statusMessages[status] || 'Actualización en tu pedido';
  }
}

// Instancia singleton del servicio integrado
export const notificationService = new IntegratedNotificationService();

// Función helper para usar en API routes
export async function notifyOrderStatusChange(
  orderId: string,
  newStatus: string,
  oldStatus: string,
  customerEmail?: string,
  trackingCode?: string,
  deviceId?: string
): Promise<void> {
  try {
    await notificationService.handleOrderStatusChange({
      orderId,
      newStatus,
      oldStatus,
      customerEmail,
      trackingCode,
      deviceId,
    });
  } catch {
    // Error silencioso para no afectar el flujo principal
  }
}