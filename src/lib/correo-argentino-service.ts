
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
  ProvinceCode
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
}

// Re-exportar tipos para uso externo
export type {
  CalculateRatesParams,
  CalculateRatesResponse,
  ImportShipmentParams,
  ImportShipmentResponse,
  GetAgenciesParams,
  Agency,
  ApiResponse,
  ProvinceCode
};
