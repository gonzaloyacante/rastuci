
import {
  CorreoArgentinoAuth
} from "./correo-argentino/auth";
import {
  CorreoArgentinoRates
} from "./correo-argentino/rates";
import {
  CorreoArgentinoAgencies
} from "./correo-argentino/agencies";
import {
  CorreoArgentinoShipping
} from "./correo-argentino/shipping";
import {
  CalculateRatesParams,
  CalculateRatesResponse,
  ImportShipmentParams,
  ImportShipmentResponse,
  GetAgenciesParams,
  Agency,
  ApiResponse,
  ValidateUserParams,
  ValidateUserResponse,
  ProvinceCode,
  RegisterUserParams,
  RegisterUserResponse,
  CorreoArgentinoCredentials,
  GetTrackingParams,
  TrackingInfo,
  TrackingErrorResponse
} from "./correo-argentino/types";
import { logger } from "@/lib/logger";

/**
 * Servicio FACADE para integración con API MiCorreo de Correo Argentino
 * Centraliza la lógica delegando en módulos especializados.
 * 
 * @see src/lib/correo-argentino/
 */
export class CorreoArgentinoService {
  private auth: CorreoArgentinoAuth;
  private ratesService: CorreoArgentinoRates;
  private agenciesService: CorreoArgentinoAgencies;
  private shippingService: CorreoArgentinoShipping;

  private isProduction: boolean;
  private customerId: string | null = null;

  constructor(isProduction: boolean = false) {
    this.isProduction = isProduction;

    // 1. Inicializar Auth
    this.auth = new CorreoArgentinoAuth(isProduction);

    // 2. Inicializar servicios dependientes del cliente HTTP de Auth
    const api = this.auth.getApiInstance();
    this.ratesService = new CorreoArgentinoRates(api);
    this.agenciesService = new CorreoArgentinoAgencies(api);
    this.shippingService = new CorreoArgentinoShipping(api);
  }

  /**
   * Asegura que el servicio esté autenticado antes de realizar operaciones
   */
  private async ensureAuth(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      const username = process.env.CORREO_ARGENTINO_USERNAME;
      const password = process.env.CORREO_ARGENTINO_PASSWORD;

      if (!username || !password) {
        throw new Error("Credenciales de Correo Argentino no configuradas en .env");
      }

      const result = await this.auth.authenticate({ username, password });
      if (!result.success) {
        throw new Error(`Error de autenticación: ${result.error?.message}`);
      }
    }
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS (Delegados a los módulos)
  // ============================================================================

  public async getRates(params: CalculateRatesParams): Promise<ApiResponse<CalculateRatesResponse>> {
    await this.ensureAuth();
    return this.ratesService.getRates(params);
  }

  public async getAgencies(params: GetAgenciesParams): Promise<ApiResponse<Agency[]>> {
    await this.ensureAuth();
    return this.agenciesService.getAgencies(params);
  }

  public async importShipment(params: ImportShipmentParams): Promise<ApiResponse<ImportShipmentResponse>> {
    await this.ensureAuth();
    return this.shippingService.importShipment(params);
  }

  public async validateUser(params: ValidateUserParams): Promise<ApiResponse<ValidateUserResponse>> {
    // validateUser tiene su propio manejo de auth si es necesario
    return this.auth.validateUser(params);
  }

  public async registerUser(params: RegisterUserParams): Promise<ApiResponse<RegisterUserResponse>> {
    return this.auth.registerUser(params);
  }

  public async authenticate(credentials?: CorreoArgentinoCredentials): Promise<ApiResponse<string>> {
    if (credentials) {
      return this.auth.authenticate(credentials);
    }
    // Fallback to env vars if available (Server Side)
    if (process.env.CORREO_ARGENTINO_USERNAME && process.env.CORREO_ARGENTINO_PASSWORD) {
      return this.auth.authenticate({
        username: process.env.CORREO_ARGENTINO_USERNAME,
        password: process.env.CORREO_ARGENTINO_PASSWORD,
        customerId: process.env.CORREO_ARGENTINO_CUSTOMER_ID
      });
    }
    return {
      success: false,
      error: { code: "AUTH_NO_CREDS", message: "Credenciales no proporcionadas" }
    };
  }

  public async getTracking(params: GetTrackingParams): Promise<ApiResponse<TrackingInfo | TrackingInfo[] | TrackingErrorResponse>> {
    await this.ensureAuth();
    return this.shippingService.getTracking(params);
  }

  // Métodos de utilidad y compatibilidad con hooks

  public setCustomerId(id: string): void {
    this.customerId = id;
  }

  public getCustomerId(): string | null {
    return this.customerId;
  }

  public isValidPostalCode(postalCode: string): boolean {
    // Validación básica de CP argentino (4 dígitos o CPA 8 caracteres)
    // Ej: 1414, C1414AAA
    if (!postalCode) return false;
    const numericPattern = /^\d{4}$/;
    const cpaPattern = /^[A-Z]\d{4}[A-Z]{3}$/;
    return numericPattern.test(postalCode) || cpaPattern.test(postalCode);
  }
}

// Instancia singleton para compatibilidad y uso general
export const correoArgentinoService = new CorreoArgentinoService(
  process.env.NODE_ENV === "production"
);

// Re-exportar tipos para uso externo
export type {
  CalculateRatesParams,
  CalculateRatesResponse,
  ImportShipmentParams,
  ImportShipmentResponse,
  GetAgenciesParams,
  Agency,
  ApiResponse,
  ProvinceCode,
  RegisterUserParams,
  RegisterUserResponse,
  ValidateUserParams,
  ValidateUserResponse,
  CorreoArgentinoCredentials,
  GetTrackingParams,
  TrackingInfo,
  TrackingErrorResponse
};
