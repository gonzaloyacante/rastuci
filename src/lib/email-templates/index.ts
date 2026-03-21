// Re-exports — mantiene compatibilidad con todos los importadores existentes
export { getWelcomeEmail } from "./auth";
export type { EmailTemplateProps } from "./base";
export {
  EMAIL_STYLES,
  escapeHtml,
  generateEmailHtml,
  STATUS_COLORS,
  STATUS_MESSAGES,
} from "./base";
export {
  getContactNotificationEmail,
  getVacationReopeningEmail,
} from "./notifications";
export {
  getBankTransferEmail,
  getLowStockAlertEmail,
  getNewOrderAdminEmail,
  getOrderCancelledEmail,
  getOrderConfirmationEmail,
  getOrderDeliveredEmail,
  getOrderShippedEmail,
  getPaymentReminderEmail,
  getTrackingUpdateEmail,
} from "./order";
