// Servicio de notificaciones push para móvil

interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: string;
  badge?: number;
}

interface NotificationTarget {
  customerEmail?: string;
  deviceId?: string;
  token?: string;
}

export class MobilePushService {
  private readonly apiUrl = `/api/mobile/notifications`;

  // Enviar notificación de tracking actualizado
  async sendTrackingUpdate(
    target: NotificationTarget,
    orderId: string,
    trackingCode: string,
    status: string,
    statusMessage?: string
  ): Promise<boolean> {
    try {
      const statusEmojis: Record<string, string> = {
        'pending': '📦',
        'in-transit': '🚚',
        'out-for-delivery': '🚛',
        'delivered': '✅',
        'delayed': '⏰',
        'error': '❌',
      };

      const emoji = statusEmojis[status] || '📦';
      const title = `${emoji} Actualización de envío`;
      const body = statusMessage || `Tu pedido #${orderId} está ${this.getStatusLabel(status)}`;

      const payload: PushNotificationPayload = {
        title,
        body,
        data: {
          type: 'tracking_update',
          orderId,
          trackingCode,
          status,
        },
        sound: 'default',
        badge: 1,
      };

      const response = await fetch(`${this.apiUrl}/register`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...target,
          title: payload.title,
          message: payload.body,
          data: payload.data,
          priority: 'high',
        }),
      });

      const result = await response.json();
      return result.success && result.data?.sent;

    } catch {
      return false;
    }
  }

  // Enviar notificación de pedido creado
  async sendOrderCreated(
    target: NotificationTarget,
    orderId: string,
    total: number
  ): Promise<boolean> {
    try {
      const payload: PushNotificationPayload = {
        title: '🎉 ¡Pedido confirmado!',
        body: `Tu pedido #${orderId} por $${total.toFixed(2)} ha sido confirmado`,
        data: {
          type: 'order_created',
          orderId,
          total: total.toString(),
        },
        sound: 'default',
        badge: 1,
      };

      const response = await fetch(`${this.apiUrl}/register`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...target,
          title: payload.title,
          message: payload.body,
          data: payload.data,
          priority: 'high',
        }),
      });

      const result = await response.json();
      return result.success && result.data?.sent;

    } catch {
      return false;
    }
  }

  // Enviar notificación de oferta/promoción
  async sendPromotionNotification(
    target: NotificationTarget,
    title: string,
    message: string,
    promotionId?: string
  ): Promise<boolean> {
    try {
      const payload: PushNotificationPayload = {
        title: `🔥 ${title}`,
        body: message,
        data: {
          type: 'promotion',
          promotionId: promotionId || '',
        },
        sound: 'default',
        badge: 1,
      };

      const response = await fetch(`${this.apiUrl}/register`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...target,
          title: payload.title,
          message: payload.body,
          data: payload.data,
          priority: 'normal',
        }),
      });

      const result = await response.json();
      return result.success && result.data?.sent;

    } catch {
      return false;
    }
  }

  // Registrar token de dispositivo
  async registerDevice(
    token: string,
    platform: 'ios' | 'android' | 'web',
    customerEmail?: string,
    deviceId?: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          platform,
          customerEmail,
          deviceId,
        }),
      });

      const result = await response.json();
      return result.success && result.data?.registered;

    } catch {
      return false;
    }
  }

  // Desregistrar token de dispositivo
  async unregisterDevice(
    customerEmail?: string,
    deviceId?: string,
    token?: string
  ): Promise<boolean> {
    try {
      const params = new URLSearchParams();
      if (customerEmail) {
        params.append('customerEmail', customerEmail);
      }
      if (deviceId) {
        params.append('deviceId', deviceId);
      }
      if (token) {
        params.append('token', token);
      }

      const response = await fetch(`${this.apiUrl}/register?${params}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      return result.success && result.data?.unregistered;

    } catch {
      return false;
    }
  }

  // Verificar estado de registro
  async checkRegistrationStatus(
    customerEmail?: string,
    deviceId?: string
  ): Promise<{ registered: boolean; platform?: string; enabled?: boolean }> {
    try {
      const params = new URLSearchParams();
      if (customerEmail) {
        params.append('customerEmail', customerEmail);
      }
      if (deviceId) {
        params.append('deviceId', deviceId);
      }

      const response = await fetch(`${this.apiUrl}/register?${params}`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      }

      return { registered: false };

    } catch {
      return { registered: false };
    }
  }

  private getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      'pending': 'siendo preparado',
      'in-transit': 'en tránsito',
      'out-for-delivery': 'en reparto',
      'delivered': 'entregado',
      'delayed': 'retrasado',
      'error': 'con problemas',
    };

    return statusLabels[status] || status;
  }
}

// Instancia singleton
export const mobilePushService = new MobilePushService();

// Hook para uso en componentes React
export function useMobilePush() {
  const registerDevice = async (
    token: string,
    platform: 'ios' | 'android' | 'web',
    customerEmail?: string,
    deviceId?: string
  ) => {
    return mobilePushService.registerDevice(token, platform, customerEmail, deviceId);
  };

  const unregisterDevice = async (
    customerEmail?: string,
    deviceId?: string,
    token?: string
  ) => {
    return mobilePushService.unregisterDevice(customerEmail, deviceId, token);
  };

  const checkStatus = async (customerEmail?: string, deviceId?: string) => {
    return mobilePushService.checkRegistrationStatus(customerEmail, deviceId);
  };

  return {
    registerDevice,
    unregisterDevice,
    checkStatus,
  };
}