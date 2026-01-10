import { AxiosInstance } from "axios";
import { GetAgenciesParams, Agency, ApiResponse } from "./types";
import { logger } from "@/lib/logger";

export class CorreoArgentinoAgencies {
  private api: AxiosInstance;

  constructor(api: AxiosInstance) {
    this.api = api;
  }

  /**
   * Obtiene las sucursales disponibles en una provincia
   */
  public async getAgencies(
    params: GetAgenciesParams
  ): Promise<ApiResponse<Agency[]>> {
    try {
      logger.info("[CorreoArgentino] Getting agencies", {
        customerId: params.customerId,
        provinceCode: params.provinceCode,
        baseURL: this.api.defaults.baseURL,
        hasAuth: !!this.api.defaults.headers.common["Authorization"],
      });

      const queryParams = new URLSearchParams({
        customerId: params.customerId,
        provinceCode: params.provinceCode,
      });

      if (params.services) {
        queryParams.append("services", params.services);
      }

      const fullUrl = `/agencies?${queryParams.toString()}`;
      logger.info("[CorreoArgentino] Requesting agencies", { fullUrl });

      const response = await this.api.get<Agency[]>(fullUrl);

      logger.info("[CorreoArgentino] Agencies response", {
        status: response.status,
        count: response.data?.length || 0,
        firstAgency: response.data?.[0]?.name || "none",
      });

      return { success: true, data: response.data };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error("[CorreoArgentino] Fetching agencies failed", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: JSON.stringify(error.response?.data).substring(0, 500),
        message: error.message,
        url: error.config?.url,
      });

      return {
        success: false,
        error: {
          code: "AGENCIES_ERROR",
          message: "Error obteniendo sucursales",
          details: error.response?.data,
        },
      };
    }
  }
}
