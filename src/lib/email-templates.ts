// Email template utilities and configurations
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  estimatedDelivery?: string;
}

export interface WelcomeEmailData {
  customerName: string;
  customerEmail: string;
}

export interface PasswordResetData {
  customerName: string;
  resetLink: string;
  expiresIn: string;
}

// Order confirmation email template
export function createOrderConfirmationEmail(data: OrderEmailData): EmailTemplate {
  const itemsHtml = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 12px;">` : ''}
            <strong>${item.name}</strong>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            $${item.price.toFixed(2)}
          </td>
        </tr>
      `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Rastuci</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #e91e63; margin: 0;">Rastuci</h1>
        <p style="color: #666; margin: 5px 0;">Thank you for your order!</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <h2 style="margin: 0 0 15px 0; color: #333;">Order Confirmation</h2>
        <p style="margin: 5px 0;"><strong>Order Number:</strong> #${data.orderNumber}</p>
        <p style="margin: 5px 0;"><strong>Customer:</strong> ${data.customerName}</p>
        ${data.estimatedDelivery ? `<p style="margin: 5px 0;"><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>` : ''}
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="margin: 0 0 15px 0; color: #333;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Item</th>
              <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">Quantity</th>
              <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr style="background: #f3f4f6; font-weight: bold;">
              <td style="padding: 12px;" colspan="2">Total</td>
              <td style="padding: 12px; text-align: right;">$${data.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="margin: 0 0 15px 0; color: #333;">Shipping Address</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 4px;">
          <p style="margin: 2px 0;">${data.shippingAddress.street}</p>
          <p style="margin: 2px 0;">${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}</p>
          <p style="margin: 2px 0;">${data.shippingAddress.country}</p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #666; margin: 5px 0;">Questions about your order?</p>
        <p style="color: #666; margin: 5px 0;">Contact us at <a href="mailto:support@rastuci.com" style="color: #e91e63;">support@rastuci.com</a></p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Order Confirmation - Rastuci

    Thank you for your order, ${data.customerName}!

    Order Number: #${data.orderNumber}
    ${data.estimatedDelivery ? `Estimated Delivery: ${data.estimatedDelivery}` : ''}

    Order Items:
    ${data.items.map(item => `- ${item.name} (Qty: ${item.quantity}) - $${item.price.toFixed(2)}`).join('\n')}

    Total: $${data.total.toFixed(2)}

    Shipping Address:
    ${data.shippingAddress.street}
    ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}
    ${data.shippingAddress.country}

    Questions? Contact us at support@rastuci.com
  `;

  return {
    subject: `Order Confirmation #${data.orderNumber} - Rastuci`,
    html,
    text,
  };
}

// Welcome email template
export function createWelcomeEmail(data: WelcomeEmailData): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Rastuci</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #e91e63; margin: 0;">Welcome to Rastuci!</h1>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #333;">Hello ${data.customerName},</h2>
        <p>Welcome to Rastuci! We're excited to have you join our community of fashion enthusiasts.</p>
        
        <p>Here's what you can do with your new account:</p>
        <ul style="padding-left: 20px;">
          <li>Browse our latest collections</li>
          <li>Save items to your wishlist</li>
          <li>Track your orders</li>
          <li>Get exclusive member discounts</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://rastuci.com/productos" style="background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Start Shopping
        </a>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #666; margin: 5px 0;">Need help? We're here for you!</p>
        <p style="color: #666; margin: 5px 0;">Contact us at <a href="mailto:support@rastuci.com" style="color: #e91e63;">support@rastuci.com</a></p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Welcome to Rastuci!

    Hello ${data.customerName},

    Welcome to Rastuci! We're excited to have you join our community.

    Here's what you can do with your new account:
    - Browse our latest collections
    - Save items to your wishlist
    - Track your orders
    - Get exclusive member discounts

    Start shopping: https://rastuci.com/productos

    Need help? Contact us at support@rastuci.com
  `;

  return {
    subject: 'Welcome to Rastuci!',
    html,
    text,
  };
}

// Password reset email template
export function createPasswordResetEmail(data: PasswordResetData): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - Rastuci</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #e91e63; margin: 0;">Rastuci</h1>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${data.customerName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.resetLink}" style="background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </div>

      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; color: #856404;"><strong>Important:</strong> This link will expire in ${data.expiresIn}. If you didn't request this reset, you can safely ignore this email.</p>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #666; margin: 5px 0;">Questions? Contact us at <a href="mailto:support@rastuci.com" style="color: #e91e63;">support@rastuci.com</a></p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Password Reset Request - Rastuci

    Hello ${data.customerName},

    We received a request to reset your password. Use this link to create a new password:
    ${data.resetLink}

    This link will expire in ${data.expiresIn}.

    If you didn't request this reset, you can safely ignore this email.

    Questions? Contact us at support@rastuci.com
  `;

  return {
    subject: 'Reset Your Password - Rastuci',
    html,
    text,
  };
}

// Email service configuration
export interface EmailConfig {
  provider: 'sendgrid' | 'nodemailer' | 'resend';
  apiKey?: string;
  from: {
    email: string;
    name: string;
  };
  replyTo?: string;
}

// Email sending utility
export async function sendEmail(
  to: string,
  template: EmailTemplate,
  config: EmailConfig
): Promise<boolean> {
  try {
    // This would integrate with your chosen email service
    // Example for SendGrid, Resend, or Nodemailer
    console.log('Sending email:', {
      to,
      from: config.from,
      subject: template.subject,
      // html: template.html,
      // text: template.text,
    });

    // Actual implementation would go here
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}
