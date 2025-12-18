
import { AxiosInstance } from "axios";
import {
    CalculateRatesParams,
    CalculateRatesResponse,
    ApiResponse
} from "./types";
import { logger } from "@/lib/logger";

export class CorreoArgentinoRates {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }

    /**
     * Obtiene la cotización para el envío
     */
    public async getRates(params: CalculateRatesParams): Promise<ApiResponse<CalculateRatesResponse>> {
        try {
            logger.info("[CorreoArgentino] Calculating rates", {
                origin: params.postalCodeOrigin,
                destination: params.postalCodeDestination,
                weight: params.dimensions.weight
            });

            // Asegurar que dimensiones y peso sean enteros (requisito API)
            const requestBody = {
                ...params,
                dimensions: {
                    weight: Math.round(Math.max(1, params.dimensions.weight)),
                    height: Math.round(Math.max(1, params.dimensions.height)),
                    length: Math.round(Math.max(1, params.dimensions.length)),
                    width: Math.round(Math.max(1, params.dimensions.width)),
                }
            };

            const response = await this.api.post<CalculateRatesResponse>("/rates", requestBody);
            return { success: true, data: response.data };

        } catch (error: any) {
            logger.error("[CorreoArgentino] Rate calculation failed", {
                status: error.response?.status,
                data: error.response?.data
            });

            return {
                success: false,
                error: {
                    code: "RATES_ERROR",
                    message: "Error obteniendo cotización",
                    details: error.response?.data
                }
            };
        }
    }
}
