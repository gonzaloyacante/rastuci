import { logger } from "@/lib/logger";
import * as OneSignal from "@onesignal/node-onesignal";

const configuration = OneSignal.createConfiguration({
  restApiKey: process.env.ONESIGNAL_REST_API_KEY,
});

const client = new OneSignal.DefaultApi(configuration);

export const sendNotification = async (message: string, heading: string) => {
  try {
    if (!process.env.ONESIGNAL_APP_ID) {
      logger.warn("OneSignal App ID not configured");
      return null;
    }

    const notification = new OneSignal.Notification();
    notification.app_id = process.env.ONESIGNAL_APP_ID;
    notification.included_segments = ["All"];
    notification.contents = { en: message };
    notification.headings = { en: heading };

    const response = await client.createNotification(notification);
    logger.info("Notification sent successfully", { id: response.id });
    return response;
  } catch (error) {
    logger.error("Error sending notification", { error });
    return null;
  }
};

export default client;
