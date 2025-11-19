/**
 * Servicio completo para integración con API MiCorreo de Correo Argentino
 * Basado en la documentación oficial de la API REST MiCorreo v1
 *
 * Endpoints implementados:
 * - POST /token - Autenticación JWT
 * - POST /register - Registro de usuarios
 * - POST /users/validate - Validación de usuarios
 * - GET /agencies - Obtener sucursales
 * - POST /rates - Cotizar envíos
 * - POST /shipping/import - Importar envíos
 * - GET /shipping/tracking - Tracking de envíos
 *
 * @author Rastuci E-commerce
 * @version 2.0.0
 * @see https://api.correoargentino.com.ar/micorreo/v1
 */

import { logger } from "./logger";

// ============================================================================
// TIPOS Y INTERFACES - BASADOS EN API MICORREO
// ============================================================================

// Credenciales de autenticación
export interface CorreoArgentinoCredentials {
  username: string;
  password: string;
  customerId?: string; // ID de cliente MiCorreo
}

// Respuesta de autenticación (/token)
export interface TokenResponse {
  token: string;
  expires: string;
}

// Códigos de provincia argentinos (según documentación)
export type ProvinceCode =
  | "A" // Salta
  | "B" // Buenos Aires
  | "C" // CABA
  | "D" // San Luis
  | "E" // Entre Ríos
  | "F" // La Rioja
  | "G" // Santiago del Estero
  | "H" // Chaco
  | "J" // San Juan
  | "K" // Catamarca
  | "L" // La Pampa
  | "M" // Mendoza
  | "N" // Misiones
  | "P" // Formosa
  | "Q" // Neuquén
  | "R" // Río Negro
  | "S" // Santa Fe
  | "T" // Tucumán
  | "U" // Chubut
  | "V" // Tierra del Fuego
  | "W" // Corrientes
  | "X" // Córdoba
  | "Y" // Jujuy
  | "Z"; // Santa Cruz

// Dirección según formato API
export interface Address {
  streetName: string;
  streetNumber: string;
  floor?: string;
  apartment?: string;
  locality?: string;
  city: string;
  provinceCode: ProvinceCode;
  postalCode: string;
}

// Registro de usuario (/register)
export interface RegisterUserParams {
  firstName: string;
  lastName?: string; // Obligatorio solo para DNI
  email: string;
  password: string;
  documentType: "DNI" | "CUIT";
  documentId: string;
  phone?: string;
  cellPhone?: string;
  address?: Address; // Obligatorio para DNI
}

export interface RegisterUserResponse {
  customerId: string;
  createdAt: string;
}

// Validación de usuario (/users/validate)
export interface ValidateUserParams {
  email: string;
  password: string;
}

export interface ValidateUserResponse {
  customerId: string;
  createdAt: string;
}

// Sucursal (/agencies)
export interface Agency {
  code: string;
  name: string;
  manager: string;
  email: string;
  phone: string;
  services: {
    packageReception: boolean;
    pickupAvailability: boolean;
  };
  location: {
    address: Address & {
      province: string;
    };
    latitude: string;
    longitude: string;
  };
  hours: {
    sunday: { start: string; end: string } | null;
    monday: { start: string; end: string } | null;
    tuesday: { start: string; end: string } | null;
    wednesday: { start: string; end: string } | null;
    thursday: { start: string; end: string } | null;
    friday: { start: string; end: string } | null;
    saturday: { start: string; end: string } | null;
    holidays: { start: string; end: string } | null;
  };
  status: "ACTIVE" | "INACTIVE";
}

export interface GetAgenciesParams {
  customerId: string;
  provinceCode: ProvinceCode;
  services?: "package_reception" | "pickup_availability";
}

// Dimensiones del paquete
export interface PackageDimensions {
  weight: number; // en gramos (min 1g, max 25000g)
  height: number; // en cm (max 150cm) - integer
  width: number; // en cm (max 150cm) - integer
  length: number; // en cm (max 150cm) - integer
}

// Cotización (/rates)
export interface CalculateRatesParams {
  customerId: string;
  postalCodeOrigin: string;
  postalCodeDestination: string;
  deliveredType?: "D" | "S"; // D = domicilio, S = sucursal
  dimensions: PackageDimensions;
}

export interface RateQuote {
  deliveredType: "D" | "S";
  productType: string; // ej: "CP" = Correo Argentino Clásico
  productName: string;
  price: number;
  deliveryTimeMin: string;
  deliveryTimeMax: string;
}

export interface CalculateRatesResponse {
  customerId: string;
  validTo: string; // ISO 8601 timestamp
  rates: RateQuote[];
}

// Importar envío (/shipping/import)
export interface ImportShipmentParams {
  customerId: string;
  extOrderId: string; // ID externo único de la orden
  orderNumber?: string; // Número de orden visible en MiCorreo
  sender?: {
    name?: string | null;
    phone?: string | null;
    cellPhone?: string | null;
    email?: string | null;
    originAddress?: {
      streetName?: string | null;
      streetNumber?: string | null;
      floor?: string | null;
      apartment?: string | null;
      city?: string | null;
      provinceCode?: ProvinceCode | null;
      postalCode?: string | null;
    };
  };
  recipient: {
    name: string;
    phone?: string;
    cellPhone?: string;
    email: string;
  };
  shipping: {
    deliveryType: "D" | "S"; // D = domicilio, S = sucursal
    productType: string; // Por defecto "CP"
    agency?: string | null; // Código de sucursal (obligatorio si deliveryType = "S")
    address?: {
      streetName?: string; // Obligatorio si deliveryType = "D"
      streetNumber?: string; // Obligatorio si deliveryType = "D"
      floor?: string; // máx 3 caracteres
      apartment?: string; // máx 3 caracteres
      city?: string; // Obligatorio si deliveryType = "D"
      provinceCode?: ProvinceCode; // Obligatorio si deliveryType = "D"
      postalCode?: string; // Obligatorio si deliveryType = "D"
    };
    weight: number; // gramos - integer
    declaredValue: number; // valor declarado
    height: number; // cm - integer
    length: number; // cm - integer
    width: number; // cm - integer
  };
}

export interface ImportShipmentResponse {
  createdAt: string; // ISO 8601 timestamp
  trackingNumber?: string; // Número de seguimiento
  shipmentId?: string; // ID del envío
}

// Tracking (/shipping/tracking)
export type GetTrackingParams = string | { shippingId: string };

export interface TrackingEvent {
  event: string;
  date: string;
  branch: string;
  status: string;
  sign: string;
}

export interface TrackingInfo {
  id: string | null;
  productId: string | null;
  trackingNumber: string;
  events: TrackingEvent[];
}

export interface TrackingErrorResponse {
  date: string;
  error: string;
  code: string;
}

// Respuesta genérica de error de la API
export interface ApiErrorResponse {
  code: string;
  message: string;
}

// Respuesta genérica envuelta
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiErrorResponse;
}

// ============================================================================
// CONSTANTES
// ============================================================================

// URLs base según ambiente
const API_URLS = {
  development:
    "http://app-correoargintercotizador-dev.apps.ocpbarr.correo.local",
  testing_local:
    "http://app-correoargintercotizador-test.apps.ocpbarr.correo.local",
  testing: "https://apitest.correoargentino.com.ar/micorreo/v1",
  production_local:
    "http://app-correoargintercotizador.apps.ocpprod.correo.local",
  production: "https://api.correoargentino.com.ar/micorreo/v1",
};

const API_TIMEOUT = 30000; // 30 segundos
const MAX_RETRIES = 3; // Número máximo de reintentos
const INITIAL_RETRY_DELAY = 1000; // 1 segundo inicial
const MAX_RETRY_DELAY = 8000; // 8 segundos máximo

// Mapeo de códigos de provincia a nombres
export const PROVINCE_NAMES: Record<ProvinceCode, string> = {
  A: "Salta",
  B: "Buenos Aires",
  C: "Ciudad Autónoma de Buenos Aires",
  D: "San Luis",
  E: "Entre Ríos",
  F: "La Rioja",
  G: "Santiago del Estero",
  H: "Chaco",
  J: "San Juan",
  K: "Catamarca",
  L: "La Pampa",
  M: "Mendoza",
  N: "Misiones",
  P: "Formosa",
  Q: "Neuquén",
  R: "Río Negro",
  S: "Santa Fe",
  T: "Tucumán",
  U: "Chubut",
  V: "Tierra del Fuego",
  W: "Corrientes",
  X: "Córdoba",
  Y: "Jujuy",
  Z: "Santa Cruz",
};

// ============================================================================
// CLASE PRINCIPAL DEL SERVICIO
// ============================================================================

export class CorreoArgentinoService {
  private credentials: CorreoArgentinoCredentials;
  private apiUrl: string;
  private authToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private ratesCache: Map<string, { rates: RateQuote[]; validTo: Date }> =
    new Map();

  constructor(isProduction = false) {
    // Seleccionar URL según ambiente
    this.apiUrl = isProduction
      ? API_URLS.production
      : process.env.CORREO_ARGENTINO_API_URL || API_URLS.testing;

    this.credentials = {
      username: process.env.CORREO_ARGENTINO_USERNAME || "",
      password: process.env.CORREO_ARGENTINO_PASSWORD || "",
      customerId: process.env.CORREO_ARGENTINO_CUSTOMER_ID || "",
    };

    if (isProduction && !this.validateCredentials()) {
      logger.warn("[CorreoArgentino] Credenciales incompletas en producción");
    }
  }

  // ==========================================================================
  // MÉTODOS PRIVADOS - UTILIDADES
  // ==========================================================================

  private validateCredentials(): boolean {
    return !!(this.credentials.username && this.credentials.password);
  }

  private isTokenValid(): boolean {
    if (!this.authToken || !this.tokenExpiry) {
      return false;
    }
    // Renovar si expira en menos de 5 minutos
    return this.tokenExpiry.getTime() - Date.now() > 5 * 60 * 1000;
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.isTokenValid()) {
      await this.authenticate();
    }
  }

  /**
   * Helper para calcular delay con exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
    return Math.min(delay, MAX_RETRY_DELAY);
  }

  /**
   * Helper para determinar si un error es reintentar-able
   */
  private isRetryableError(status: number, error?: Error): boolean {
    // Reintentar en errores del servidor (5xx) o timeouts
    if (status >= 500 && status < 600) {
      return true;
    }
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (
        errorMessage.includes("timeout") ||
        errorMessage.includes("aborted")
      ) {
        return true;
      }
      if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        return true;
      }
    }
    return false;
  }

  /**
   * Genera clave de cache para cotizaciones
   */
  private generateRatesCacheKey(params: CalculateRatesParams): string {
    const {
      postalCodeOrigin,
      postalCodeDestination,
      deliveredType,
      dimensions,
    } = params;
    return `${postalCodeOrigin}-${postalCodeDestination}-${deliveredType || "D"}-${dimensions.weight}-${dimensions.height}x${dimensions.width}x${dimensions.length}`;
  }

  /**
   * Busca cotizaciones en cache
   */
  private getCachedRates(cacheKey: string): RateQuote[] | null {
    const cached = this.ratesCache.get(cacheKey);
    if (!cached) {
      return null;
    }

    // Verificar si el cache sigue válido
    if (new Date() > cached.validTo) {
      this.ratesCache.delete(cacheKey);
      return null;
    }

    logger.info(`[CorreoArgentino] Using cached rates for key: ${cacheKey}`);
    return cached.rates;
  }

  /**
   * Guarda cotizaciones en cache
   */
  private setCachedRates(
    cacheKey: string,
    rates: RateQuote[],
    validTo: Date
  ): void {
    this.ratesCache.set(cacheKey, { rates, validTo });
    logger.info(
      `[CorreoArgentino] Cached rates until ${validTo.toISOString()}`
    );
  }

  private async makeRequest<T>(
    endpoint: string,
    method: "GET" | "POST" = "GET",
    body?: unknown,
    requiresAuth = true
  ): Promise<ApiResponse<T>> {
    let lastError: Error | null = null;
    let lastStatus = 0;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Asegurar autenticación si es necesaria
        if (requiresAuth) {
          await this.ensureAuthenticated();
        }

        const url = `${this.apiUrl}${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (requiresAuth && this.authToken) {
          headers["Authorization"] = `Bearer ${this.authToken}`;
        }

        logger.info(
          `[CorreoArgentino] ${method} ${endpoint} (attempt ${attempt + 1}/${MAX_RETRIES + 1})`,
          {
            url,
            hasAuth: !!this.authToken,
          }
        );

        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        lastStatus = response.status;

        const responseData = await response.json();

        // Manejar errores HTTP
        if (!response.ok) {
          logger.error(
            `[CorreoArgentino] HTTP ${response.status} (attempt ${attempt + 1})`,
            {
              status: response.status,
              data: responseData,
              willRetry:
                this.isRetryableError(response.status) && attempt < MAX_RETRIES,
            }
          );

          // Si es error reintentar-able y quedan intentos, reintentar
          if (this.isRetryableError(response.status) && attempt < MAX_RETRIES) {
            const delay = this.calculateRetryDelay(attempt);
            logger.warn(`[CorreoArgentino] Retrying after ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          return {
            success: false,
            error: {
              code: responseData.code || String(response.status),
              message: responseData.message || `HTTP Error ${response.status}`,
            },
          };
        }

        logger.info(
          `[CorreoArgentino] ${method} ${endpoint} - Success (attempt ${attempt + 1})`
        );

        return {
          success: true,
          data: responseData as T,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.error(
          `[CorreoArgentino] Request failed: ${endpoint} (attempt ${attempt + 1})`,
          {
            error: lastError.message,
            willRetry:
              this.isRetryableError(lastStatus, lastError) &&
              attempt < MAX_RETRIES,
          }
        );

        // Si es error reintentar-able y quedan intentos, reintentar
        if (
          this.isRetryableError(lastStatus, lastError) &&
          attempt < MAX_RETRIES
        ) {
          const delay = this.calculateRetryDelay(attempt);
          logger.warn(`[CorreoArgentino] Retrying after ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // Si no es reintentar-able o se acabaron los intentos, fallar
        break;
      }
    }

    // Si llegamos aquí, todos los reintentos fallaron
    logger.error(`[CorreoArgentino] All retries exhausted for ${endpoint}`);
    return {
      success: false,
      error: {
        code: "REQUEST_ERROR",
        message: lastError ? lastError.message : `HTTP Error ${lastStatus}`,
      },
    };
  }

  // ==========================================================================
  // MÉTODOS PÚBLICOS - ENDPOINTS DE LA API
  // ==========================================================================

  /**
   * POST /token
   * Obtiene un JWT token para autenticar las siguientes peticiones
   * Usa HTTP Basic Auth con username:password
   */
  async authenticate(): Promise<ApiResponse<TokenResponse>> {
    try {
      logger.info("[CorreoArgentino] Authenticating...");

      const auth = btoa(
        `${this.credentials.username}:${this.credentials.password}`
      );
      const url = `${this.apiUrl}/token`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            code: String(response.status),
            message: errorData.message || "Authentication failed",
          },
        };
      }

      const data: TokenResponse = await response.json();

      // Guardar token y fecha de expiración
      this.authToken = data.token;
      this.tokenExpiry = new Date(data.expires);

      logger.info("[CorreoArgentino] Authentication successful", {
        expires: data.expires,
      });

      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error("[CorreoArgentino] Authentication error", { error });
      return {
        success: false,
        error: {
          code: "AUTH_ERROR",
          message:
            error instanceof Error ? error.message : "Error de autenticación",
        },
      };
    }
  }

  /**
   * POST /register
   * Registra un nuevo usuario en MiCorreo
   */
  async registerUser(
    params: RegisterUserParams
  ): Promise<ApiResponse<RegisterUserResponse>> {
    logger.info("[CorreoArgentino] Registering user", { email: params.email });
    return this.makeRequest<RegisterUserResponse>("/register", "POST", params);
  }

  /**
   * POST /users/validate
   * Valida credenciales y devuelve el customerId
   */
  async validateUser(
    params: ValidateUserParams
  ): Promise<ApiResponse<ValidateUserResponse>> {
    logger.info("[CorreoArgentino] Validating user", { email: params.email });
    return this.makeRequest<ValidateUserResponse>(
      "/users/validate",
      "POST",
      params
    );
  }

  /**
   * GET /agencies
   * Obtiene las sucursales de una provincia
   */
  async getAgencies(params: GetAgenciesParams): Promise<ApiResponse<Agency[]>> {
    logger.info("[CorreoArgentino] Getting agencies", {
      customerId: params.customerId,
      provinceCode: params.provinceCode,
    });

    const queryParams = new URLSearchParams({
      customerId: params.customerId,
      provinceCode: params.provinceCode,
    });

    if (params.services) {
      queryParams.append("services", params.services);
    }

    return this.makeRequest<Agency[]>(
      `/agencies?${queryParams.toString()}`,
      "GET"
    );
  }

  /**
   * POST /rates
   * Cotiza un envío según origen, destino y dimensiones
   */
  async calculateRates(
    params: CalculateRatesParams
  ): Promise<ApiResponse<CalculateRatesResponse>> {
    logger.info("[CorreoArgentino] Calculating rates", {
      origin: params.postalCodeOrigin,
      destination: params.postalCodeDestination,
      weight: params.dimensions.weight,
    });

    // Validar dimensiones según documentación
    if (params.dimensions.weight < 1 || params.dimensions.weight > 25000) {
      return {
        success: false,
        error: {
          code: "INVALID_WEIGHT",
          message: "El peso debe estar entre 1g y 25000g",
        },
      };
    }

    if (
      params.dimensions.height > 150 ||
      params.dimensions.width > 150 ||
      params.dimensions.length > 150
    ) {
      return {
        success: false,
        error: {
          code: "INVALID_DIMENSIONS",
          message: "Las dimensiones no pueden superar 150cm",
        },
      };
    }

    // Asegurar que las dimensiones sean enteros
    const requestBody = {
      ...params,
      dimensions: {
        weight: Math.round(params.dimensions.weight),
        height: Math.round(params.dimensions.height),
        width: Math.round(params.dimensions.width),
        length: Math.round(params.dimensions.length),
      },
    };

    // Verificar cache antes de hacer request
    const cacheKey = this.generateRatesCacheKey(requestBody);
    const cachedRates = this.getCachedRates(cacheKey);

    if (cachedRates) {
      return {
        success: true,
        data: {
          customerId: params.customerId,
          validTo: this.ratesCache.get(cacheKey)!.validTo.toISOString(),
          rates: cachedRates,
        },
      };
    }

    // Si no hay cache, hacer request a la API
    const response = await this.makeRequest<CalculateRatesResponse>(
      "/rates",
      "POST",
      requestBody
    );

    // Si el request fue exitoso, cachear las cotizaciones
    if (response.success && response.data) {
      const validTo = new Date(response.data.validTo);
      this.setCachedRates(cacheKey, response.data.rates, validTo);
    }

    return response;
  }

  /**
   * POST /shipping/import
   * Importa un envío a MiCorreo
   */
  async importShipment(
    params: ImportShipmentParams
  ): Promise<ApiResponse<ImportShipmentResponse>> {
    logger.info("[CorreoArgentino] Importing shipment", {
      extOrderId: params.extOrderId,
      deliveryType: params.shipping.deliveryType,
    });

    // Validar datos según tipo de envío
    if (params.shipping.deliveryType === "D") {
      // Envío a domicilio requiere dirección completa
      if (
        !params.shipping.address?.streetName ||
        !params.shipping.address?.streetNumber ||
        !params.shipping.address?.city ||
        !params.shipping.address?.provinceCode ||
        !params.shipping.address?.postalCode
      ) {
        return {
          success: false,
          error: {
            code: "MISSING_ADDRESS",
            message: "Envío a domicilio requiere dirección completa",
          },
        };
      }
    } else if (params.shipping.deliveryType === "S") {
      // Envío a sucursal requiere código de sucursal
      if (!params.shipping.agency) {
        return {
          success: false,
          error: {
            code: "MISSING_AGENCY",
            message: "Envío a sucursal requiere código de sucursal",
          },
        };
      }
    }

    // Truncar floor y apartment a 3 caracteres (según documentación)
    const requestBody = { ...params };
    if (requestBody.shipping.address?.floor) {
      requestBody.shipping.address.floor =
        requestBody.shipping.address.floor.substring(0, 3);
    }
    if (requestBody.shipping.address?.apartment) {
      requestBody.shipping.address.apartment =
        requestBody.shipping.address.apartment.substring(0, 3);
    }

    // Asegurar que dimensiones y peso sean enteros
    requestBody.shipping.weight = Math.round(requestBody.shipping.weight);
    requestBody.shipping.height = Math.round(requestBody.shipping.height);
    requestBody.shipping.length = Math.round(requestBody.shipping.length);
    requestBody.shipping.width = Math.round(requestBody.shipping.width);

    return this.makeRequest<ImportShipmentResponse>(
      "/shipping/import",
      "POST",
      requestBody
    );
  }

  /**
   * GET /shipping/tracking
   * Obtiene el seguimiento de un envío
   */
  async getTracking(
    params: GetTrackingParams
  ): Promise<
    ApiResponse<TrackingInfo | TrackingInfo[] | TrackingErrorResponse>
  > {
    const shippingId = typeof params === "string" ? params : params.shippingId;
    logger.info("[CorreoArgentino] Getting tracking", {
      shippingId,
    });

    return this.makeRequest<
      TrackingInfo | TrackingInfo[] | TrackingErrorResponse
    >(
      "/shipping/tracking",
      "GET",
      typeof params === "string" ? { shippingId: params } : params
    );
  }

  // ==========================================================================
  // MÉTODOS DE UTILIDAD
  // ==========================================================================

  /**
   * Valida un código postal argentino
   */
  isValidPostalCode(postalCode: string): boolean {
    return /^\d{4}$/.test(postalCode);
  }

  /**
   * Obtiene el código de provincia desde un código postal
   */
  getProvinceCodeFromPostalCode(_postalCode: string): ProvinceCode | null {
    return null;
  }

  /**
   * Obtiene el customerId actual
   */
  getCustomerId(): string | undefined {
    return this.credentials.customerId;
  }

  /**
   * Establece el customerId
   */
  setCustomerId(customerId: string): void {
    this.credentials.customerId = customerId;
  }
}

// ============================================================================
// INSTANCIA SINGLETON
// ============================================================================

export const correoArgentinoService = new CorreoArgentinoService(
  process.env.NODE_ENV === "production"
);
