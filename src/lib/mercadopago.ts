import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

// Configuración del cliente de MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

// Instancias de los servicios
export const payment = new Payment(client);
export const preference = new Preference(client);

// Tipos para TypeScript
export interface PaymentData {
  token: string;
  installments: number;
  payment_method_id: string;
  payer: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  transaction_amount: number;
  description: string;
  external_reference?: string;
  metadata?: Record<string, unknown>;
}

export interface PreferenceData {
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
  }>;
  payer?: {
    name?: string;
    surname?: string;
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
    identification?: {
      type?: string;
      number?: string;
    };
    address?: {
      street_name?: string;
      street_number?: string;
      zip_code?: string;
    };
  };
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: 'approved' | 'all';
  external_reference?: string;
  notification_url?: string;
  metadata?: Record<string, unknown>;
}

// Función para crear un pago
export async function createPayment(paymentData: PaymentData) {
  try {
    const result = await payment.create({
      body: {
        ...paymentData,
        notification_url: process.env.MP_WEBHOOK_URL,
      }
    });
    return result;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}

// Función para crear una preferencia (Checkout Pro)
export async function createPreference(preferenceData: PreferenceData) {
  try {
    const result = await preference.create({
      body: {
        ...preferenceData,
        notification_url: process.env.MP_WEBHOOK_URL,
      }
    });
    return result;
  } catch (error) {
    console.error('Error creating preference:', error);
    throw error;
  }
}

// Función para obtener información de un pago
export async function getPayment(paymentId: string) {
  try {
    const result = await payment.get({ id: paymentId });
    return result;
  } catch (error) {
    console.error('Error getting payment:', error);
    throw error;
  }
}

// Configuración pública para el frontend
export const mercadoPagoConfig = {
  publicKey: process.env.MP_PUBLIC_KEY!,
  locale: 'es-AR' as const,
  theme: {
    elementsColor: '#e91e63', // Color primario de Rastuci
    headerColor: '#e91e63',
  }
};
