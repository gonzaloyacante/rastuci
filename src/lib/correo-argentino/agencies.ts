import { AxiosInstance, isAxiosError } from "axios";

import { logger } from "@/lib/logger";

import { Agency, ApiResponse, GetAgenciesParams } from "./types";

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
    } catch (error: unknown) {
      let status: number | undefined;
      let statusText: string | undefined;
      let data: unknown;
      let message = "Unknown error";
      let url: string | undefined;

      if (isAxiosError(error)) {
        status = error.response?.status;
        statusText = error.response?.statusText;
        data = error.response?.data;
        message = error.message;
        url = error.config?.url;
      } else if (error instanceof Error) {
        message = error.message;
      }

      logger.error("[CorreoArgentino] Fetching agencies failed", {
        status,
        statusText,
        data: JSON.stringify(data).substring(0, 500),
        message,
        url,
      });

      return {
        success: false,
        error: {
          code: "AGENCIES_ERROR",
          message: "Error obteniendo sucursales",
          details: data,
        },
      };
    }
  }
}
