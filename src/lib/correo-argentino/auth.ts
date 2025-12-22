import axios, { AxiosInstance } from "axios";
import {
  CorreoArgentinoCredentials,
  TokenResponse,
  ApiResponse,
  RegisterUserParams,
  RegisterUserResponse,
  ValidateUserParams,
  ValidateUserResponse,
} from "./types";
import { logger } from "@/lib/logger";

// IMPORTANTE: Siempre usar URL de producción porque la API de test no tiene datos de sucursales
const URL_PROD = "https://api.correoargentino.com.ar/micorreo/v1";
// const URL_TEST = "https://apitest.correoargentino.com.ar/micorreo/v1"; // No usar - sin datos

export class CorreoArgentinoAuth {
  private api: AxiosInstance;
  private token: string | null = null;
  private tokenExpires: Date | null = null;
  private isProduction: boolean;

  constructor(isProduction: boolean = false) {
    this.isProduction = isProduction;
    // SIEMPRE usar URL de producción - la API de test no tiene sucursales
    this.api = axios.create({
      baseURL: URL_PROD,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  public getApiInstance(): AxiosInstance {
    return this.api;
  }

  public isAuthenticated(): boolean {
    return (
      !!this.token && !!this.tokenExpires && this.tokenExpires > new Date()
    );
  }

  /**
   * Genera el token de autenticación
   */
  public async authenticate(
    credentials: CorreoArgentinoCredentials
  ): Promise<ApiResponse<string>> {
    try {
      // 1. Validar que no estemos re-autenticando innecesariamente
      if (this.isAuthenticated()) {
        return { success: true, data: this.token! };
      }

      logger.info("[CorreoArgentino] Authenticating...");

      // 2. Autenticación Basic con usuario y contraseña
      const response = await this.api.post<TokenResponse>(
        "/token",
        {},
        {
          auth: {
            username: credentials.username,
            password: credentials.password,
          },
        }
      );

      if (!response.data.token) {
        throw new Error("No token received from API");
      }

      // 3. Guardar token y expiración
      this.token = response.data.token;
      // Parsear fecha de expiración (formato "YYYY-MM-DD HH:mm:ss") o usar defecto 12h
      // La API devuelve string, asumimos una validez segura si falla el parseo
      try {
        this.tokenExpires = new Date(response.data.expires);
      } catch {
        const now = new Date();
        now.setHours(now.getHours() + 12);
        this.tokenExpires = now;
      }

      // 4. Configurar header Authorization para futuros requests
      this.api.defaults.headers.common["Authorization"] =
        `Bearer ${this.token}`;

      logger.info("[CorreoArgentino] Authentication successful");
      return { success: true, data: this.token };
    } catch (error: any) {
      logger.error("[CorreoArgentino] Authentication failed", {
        message: error.message,
        response: error.response?.data,
      });

      return {
        success: false,
        error: {
          code: "AUTH_FAILED",
          message: "No se pudo autenticar con Correo Argentino",
          details: error.response?.data || error.message,
        },
      };
    }
  }

  /**
   * Valida un usuario para obtener su Customer ID
   */
  public async validateUser(
    params: ValidateUserParams
  ): Promise<ApiResponse<ValidateUserResponse>> {
    try {
      const response = await this.api.post<ValidateUserResponse>(
        "/users/validate",
        params
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: "USER_VALIDATION_FAILED",
          message: "Error validando usuario",
          details: error.response?.data,
        },
      };
    }
  }

  /**
   * Registra un nuevo usuario en MiCorreo
   */
  public async registerUser(
    params: RegisterUserParams
  ): Promise<ApiResponse<RegisterUserResponse>> {
    try {
      const response = await this.api.post<RegisterUserResponse>(
        "/register",
        params
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: "REGISTER_FAILED",
          message: "Error registrando usuario",
          details: error.response?.data,
        },
      };
    }
  }
}
