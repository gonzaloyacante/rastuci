// SDK simulado de MercadoPago para mostrar tarjetas guardadas
// En producción, esto sería reemplazado por el SDK real de MercadoPago

export interface SavedCard {
  id: string;
  last_four_digits: string;
  payment_method: {
    id: string;
    name: string;
    payment_type_id: string;
    thumbnail: string;
  };
  issuer: {
    id: string;
    name: string;
  };
  cardholder: {
    name: string;
  };
  date_created: string;
  expiration_month: number;
  expiration_year: number;
}

export interface MercadoPagoUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  identification: {
    type: string;
    number: string;
  };
}

// Simulación de tarjetas guardadas del usuario
const mockSavedCards: SavedCard[] = [
  {
    id: "card_1",
    last_four_digits: "1234",
    payment_method: {
      id: "visa",
      name: "Visa",
      payment_type_id: "credit_card",
      thumbnail:
        "https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg",
    },
    issuer: {
      id: "banco_nacion",
      name: "Banco Nación",
    },
    cardholder: {
      name: "JUAN PEREZ",
    },
    date_created: "2024-01-15T10:30:00.000Z",
    expiration_month: 12,
    expiration_year: 2027,
  },
  {
    id: "card_2",
    last_four_digits: "5678",
    payment_method: {
      id: "master",
      name: "Mastercard",
      payment_type_id: "credit_card",
      thumbnail:
        "https://http2.mlstatic.com/storage/logos-api-admin/aa2b8f70-5c85-11ec-ae75-df2bef173be2-m.svg",
    },
    issuer: {
      id: "banco_santander",
      name: "Banco Santander",
    },
    cardholder: {
      name: "JUAN PEREZ",
    },
    date_created: "2024-02-20T14:15:00.000Z",
    expiration_month: 8,
    expiration_year: 2026,
  },
];

// Simulación de usuario de MercadoPago
const mockUser: MercadoPagoUser = {
  id: "user_123456789",
  email: "juan.perez@email.com",
  first_name: "Juan",
  last_name: "Pérez",
  identification: {
    type: "DNI",
    number: "12345678",
  },
};

export class MercadoPagoSDK {
  private publicKey: string;
  private isInitialized = false;

  constructor(publicKey: string) {
    this.publicKey = publicKey;
  }

  // Inicializar el SDK
  async initialize(): Promise<void> {
    // Simular inicialización
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.isInitialized = true;
  }

  // Verificar si el usuario está logueado en MercadoPago
  async isUserLoggedIn(): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error("SDK not initialized");
    }

    // Simular verificación (70% de probabilidad de estar logueado)
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Math.random() > 0.3;
  }

  // Obtener información del usuario
  async getUserInfo(): Promise<MercadoPagoUser | null> {
    if (!this.isInitialized) {
      throw new Error("SDK not initialized");
    }

    const isLoggedIn = await this.isUserLoggedIn();
    if (!isLoggedIn) {
      return null;
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
    return mockUser;
  }

  // Obtener tarjetas guardadas del usuario
  async getSavedCards(): Promise<SavedCard[]> {
    if (!this.isInitialized) {
      throw new Error("SDK not initialized");
    }

    const isLoggedIn = await this.isUserLoggedIn();
    if (!isLoggedIn) {
      return [];
    }

    await new Promise((resolve) => setTimeout(resolve, 600));
    return mockSavedCards;
  }

  // Crear token de tarjeta
  async createCardToken(cardData: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    securityCode: string;
    cardholderName: string;
  }): Promise<string> {
    if (!this.isInitialized) {
      throw new Error("SDK not initialized");
    }

    // Validaciones básicas
    if (
      !cardData.cardNumber ||
      !cardData.expiryMonth ||
      !cardData.expiryYear ||
      !cardData.securityCode
    ) {
      throw new Error("Datos de tarjeta incompletos");
    }

    // Simular creación de token
    await new Promise((resolve) => setTimeout(resolve, 800));
    return `card_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Procesar pago con tarjeta guardada
  async processPaymentWithSavedCard(
    cardId: string,
    amount: number,
    _installments = 1
  ): Promise<{
    id: string;
    status: string;
    status_detail: string;
  }> {
    if (!this.isInitialized) {
      throw new Error("SDK not initialized");
    }

    // Simular procesamiento
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simular diferentes resultados (90% éxito)
    const success = Math.random() > 0.1;

    if (success) {
      return {
        id: `payment_${Date.now()}`,
        status: "approved",
        status_detail: "accredited",
      };
    } else {
      return {
        id: `payment_${Date.now()}`,
        status: "rejected",
        status_detail: "insufficient_funds",
      };
    }
  }

  // Procesar pago con nueva tarjeta
  async processPaymentWithNewCard(
    cardToken: string,
    amount: number,
    _installments = 1,
    _saveCard = false
  ): Promise<{
    id: string;
    status: string;
    status_detail: string;
  }> {
    if (!this.isInitialized) {
      throw new Error("SDK not initialized");
    }

    // Simular procesamiento con diferentes etapas
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simular validación de tarjeta
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Simular autorización bancaria
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Simular diferentes resultados (85% éxito para tarjetas nuevas)
    const success = Math.random() > 0.15;

    if (success) {
      return {
        id: `payment_${Date.now()}`,
        status: "approved",
        status_detail: "accredited",
      };
    } else {
      // Diferentes tipos de errores
      const errorTypes = [
        "invalid_card",
        "insufficient_funds",
        "expired_card",
        "security_code_invalid",
      ];
      const randomError =
        errorTypes[Math.floor(Math.random() * errorTypes.length)];

      return {
        id: `payment_${Date.now()}`,
        status: "rejected",
        status_detail: randomError,
      };
    }
  }
}

// Instancia global del SDK
let sdkInstance: MercadoPagoSDK | null = null;

export const initializeMercadoPagoSDK = async (
  publicKey: string
): Promise<MercadoPagoSDK> => {
  if (!sdkInstance) {
    sdkInstance = new MercadoPagoSDK(publicKey);
    await sdkInstance.initialize();
  }
  return sdkInstance;
};

export const getMercadoPagoSDK = (): MercadoPagoSDK | null => {
  return sdkInstance;
};
