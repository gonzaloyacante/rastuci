import { logger } from "@/lib/logger";
import * as OneSignal from "@onesignal/node-onesignal";

const configuration = OneSignal.createConfiguration({
  restApiKey: process.env.ONESIGNAL_REST_API_KEY,
});

const client = new OneSignal.DefaultApi(configuration);

interface PushNotificationParams {
  heading: string;
  message: string;
  url?: string;
  data?: Record<string, unknown>;
  segments?: string[];
  playerIds?: string[];
}

/**
 * Envía notificación push a todos los usuarios o segmentos específicos
 */
export const sendNotification = async (
  message: string,
  heading: string
): Promise<OneSignal.CreateNotificationSuccessResponse | null> => {
  try {
    if (!process.env.ONESIGNAL_APP_ID) {
      logger.warn("[OneSignal] App ID not configured, skipping notification");
      return null;
    }

    const notification = new OneSignal.Notification();
    notification.app_id = process.env.ONESIGNAL_APP_ID;
    notification.included_segments = ["All"];
    notification.contents = { es: message };
    notification.headings = { es: heading };

    const response = await client.createNotification(notification);
    logger.info("[OneSignal] Notification sent successfully", {
      id: response.id,
    });
    return response;
  } catch (error) {
    logger.error("[OneSignal] Error sending notification", { error });
    return null;
  }
};

/**
 * Envía notificación push personalizada con más opciones
 */
export const sendPushNotification = async (
  params: PushNotificationParams
): Promise<OneSignal.CreateNotificationSuccessResponse | null> => {
  try {
    if (!process.env.ONESIGNAL_APP_ID) {
      logger.warn(
        "[OneSignal] App ID not configured, skipping push notification"
      );
      return null;
    }

    const notification = new OneSignal.Notification();
    notification.app_id = process.env.ONESIGNAL_APP_ID;

    // Segmentos o usuarios específicos
    if (params.playerIds && params.playerIds.length > 0) {
      // @ts-ignore - OneSignal API property
      notification.include_player_ids = params.playerIds;
    } else if (params.segments && params.segments.length > 0) {
      notification.included_segments = params.segments;
    } else {
      notification.included_segments = ["All"];
    }

    notification.contents = { es: params.message };
    notification.headings = { es: params.heading };

    // URL para abrir cuando se hace clic
    if (params.url) {
      notification.url = params.url;
    }

    // Data adicional
    if (params.data) {
      notification.data = params.data;
    }

    const response = await client.createNotification(notification);
    logger.info("[OneSignal] Push notification sent", {
      id: response.id,
      heading: params.heading,
    });
    return response;
  } catch (error) {
    logger.error("[OneSignal] Error sending push notification", { error });
    return null;
  }
};

/**
 * Notificación de nuevo pedido para admins
 */
export const notifyNewOrder = async (
  orderId: string,
  customerName: string,
  total: number
): Promise<void> => {
  await sendPushNotification({
    heading: "🛒 Nuevo Pedido",
    message: `${customerName} realizó un pedido de $${total.toFixed(2)}`,
    url: `https://rastuci.com/admin/pedidos/${orderId}`,
    data: {
      type: "new_order",
      orderId,
    },
    segments: ["Admins"], // Debes crear este segmento en OneSignal
  });
};

/**
 * Notificación de pago confirmado para cliente
 */
export const notifyPaymentConfirmed = async (
  orderId: string,
  customerName: string
): Promise<void> => {
  await sendPushNotification({
    heading: "✅ Pago Confirmado",
    message: `${customerName}, tu pago fue confirmado. Prepararemos tu pedido pronto.`,
    url: `https://rastuci.com/orders/${orderId}`,
    data: {
      type: "payment_confirmed",
      orderId,
    },
  });
};

/**
 * Notificación de pedido enviado
 */
export const notifyOrderShipped = async (
  orderId: string,
  trackingNumber: string
): Promise<void> => {
  await sendPushNotification({
    heading: "📦 Tu pedido está en camino",
    message: `Número de tracking: ${trackingNumber}`,
    url: `https://rastuci.com/tracking?code=${trackingNumber}`,
    data: {
      type: "order_shipped",
      orderId,
      trackingNumber,
    },
  });
};

/**
 * Notificación de pedido entregado
 */
export const notifyOrderDelivered = async (orderId: string): Promise<void> => {
  await sendPushNotification({
    heading: "✨ Pedido Entregado",
    message: "Tu pedido fue entregado exitosamente. ¡Gracias por tu compra!",
    url: `https://rastuci.com/orders/${orderId}`,
    data: {
      type: "order_delivered",
      orderId,
    },
  });
};

export default client;
