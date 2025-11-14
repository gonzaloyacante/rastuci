import * as OneSignal from "@onesignal/node-onesignal";

const configuration = OneSignal.createConfiguration({
  restApiKey: process.env.ONESIGNAL_REST_API_KEY,
});

const client = new OneSignal.DefaultApi(configuration);

export const sendNotification = async (message: string, heading: string) => {
  try {
    if (!process.env.ONESIGNAL_APP_ID) {
      console.warn("OneSignal App ID not configured");
      return null;
    }

    const notification = new OneSignal.Notification();
    notification.app_id = process.env.ONESIGNAL_APP_ID;
    notification.included_segments = ["All"];
    notification.contents = { en: message };
    notification.headings = { en: heading };

    const response = await client.createNotification(notification);
    console.log("Notification sent successfully:", response.id);
    return response;
  } catch (error) {
    console.error("Error sending notification:", error);
    return null;
  }
};

export default client;
