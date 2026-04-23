// =============================================================================
// Base utilities
// =============================================================================
export type { EmailTemplateProps } from "./base";
export {
  EMAIL_STYLES,
  escapeHtml,
  formatCurrency,
  generateEmailHtml,
  STATUS_COLORS,
  STATUS_MESSAGES,
} from "./base";

// =============================================================================
// Auth emails
// =============================================================================
export { getLoyaltyPointsEmail } from "./auth/loyalty-points";
export { getNewLoginAlertEmail } from "./auth/new-login-alert";
export { getPasswordResetEmail } from "./auth/password-reset";
export { getVacationReopeningEmail } from "./auth/vacation-reopening";
export { getWelcomeEmail } from "./auth/welcome";

// =============================================================================
// Customer — order lifecycle
// =============================================================================
export { getOrderCancelledEmail } from "./customer/order-cancelled";
export { getOrderConfirmationEmail } from "./customer/order-confirmation";
export { getOrderOnHoldEmail } from "./customer/order-on-hold";
export { getOrderPickupReadyEmail } from "./customer/order-pickup-ready";
export { getOrderProcessedEmail } from "./customer/order-processed";
export {
  getOrderDeliveredEmail,
  getOrderShippedEmail,
} from "./customer/order-shipped-delivered";

// =============================================================================
// Customer — payments & transfers
// =============================================================================
export { getPaymentReminderEmail } from "./customer/payment-reminder";
export {
  getBankTransferEmail,
  getTransferApprovedEmail,
  getTransferProofReceivedEmail,
} from "./customer/transfer";

// =============================================================================
// Customer — tracking & logistics
// =============================================================================
export { getTrackingUpdateEmail } from "./customer/tracking-update";

// =============================================================================
// Customer — post-purchase & engagement
// =============================================================================
export { getCartAbandonedEmail } from "./customer/cart-abandoned";
export { getOrderReturnedEmail, getRefundIssuedEmail } from "./customer/refund";
export { getReviewThankYouEmail } from "./customer/review-thank-you";
export {
  getSupportTicketOpenedEmail,
  getSupportTicketResolvedEmail,
} from "./customer/support-ticket";
export {
  getWishlistBackInStockEmail,
  getWishlistPriceDropEmail,
  getWishlistSharedEmail,
} from "./customer/wishlist";

// =============================================================================
// Admin emails
// =============================================================================
export { getContactNotificationEmail } from "./admin/contact-message";
export { getLowStockAlertEmail } from "./admin/low-stock-alert";
export { getNewOrderAdminEmail } from "./admin/new-order-alert";
export {
  getOrderCancelledAdminEmail,
  getSupportTicketAdminEmail,
} from "./admin/support-and-alerts";
export { getTransferProofSubmittedEmail } from "./admin/transfer-proof-submitted";
export { getRefundAdminNotificationEmail } from "./customer/refund";

// =============================================================================
// Legacy re-exports for backward compatibility (old files kept until cleanup)
// These come from the new locations above — no need to import from old files
// =============================================================================
