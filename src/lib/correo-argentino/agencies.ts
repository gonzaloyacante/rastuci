
import { AxiosInstance } from "axios";
import {
    GetAgenciesParams,
    Agency,
    ApiResponse
} from "./types";
import { logger } from "@/lib/logger";

export class CorreoArgentinoAgencies {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }

    /**
     * Obtiene las sucursales disponibles en una provincia
     */
    public async getAgencies(params: GetAgenciesParams): Promise<ApiResponse<Agency[]>> {
        try {
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

            const response = await this.api.get<Agency[]>(`/agencies?${queryParams.toString()}`);
            return { success: true, data: response.data };

        } catch (error: any) {
            logger.error("[CorreoArgentino] Fetching agencies failed", {
                status: error.response?.status,
                data: error.response?.data
            });

            return {
                success: false,
                error: {
                    code: "AGENCIES_ERROR",
                    message: "Error obteniendo sucursales",
                    details: error.response?.data
                }
            };
        }
    }
}
